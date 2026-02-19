"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CARD_CONTENT, CARD_IDS, getCardById } from "../../components/cardContent";

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day);

  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const days = [];
  let todayIndex = -1;
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) todayIndex = i;
    days.push({ label: labels[i], date: d.getDate(), isToday });
  }
  return { days, todayIndex };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const LONG_PRESS_MS = 280;
const DAY_COUNT = 7;
const WEEK_SCROLLER_GAP = 4;
const SWIPE_LOCK_DISTANCE = 8;

const cardStyle = {
  display: "flex",
  padding: 24,
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 10,
  width: 189,
  height: 252,
  boxSizing: "border-box",
  borderRadius: 28,
  border: "1px solid rgba(0, 0, 0, 0.10)",
  backgroundColor: "#F7F0E1",
  boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
};

export default function TodayPage() {
  const router = useRouter();
  const { days: week, todayIndex } = getWeekDates();
  const [activeIndex, setActiveIndex] = useState(todayIndex);
  const [dayCardOrders, setDayCardOrders] = useState(
    Array.from({ length: DAY_COUNT }, () => [...CARD_IDS])
  );
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragHoverIndex, setDragHoverIndex] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef(null);
  const carouselRef = useRef(null);
  const scrollDragRef = useRef({
    active: false,
    started: false,
    pointerId: null,
    startY: 0,
    startScrollTop: 0,
    velY: 0,
    lastY: 0,
    lastT: 0,
    raf: null,
  });
  const swipeRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    lockedAxis: null,
    hasChangedDay: false,
    lastClientY: 0,
    velY: 0,
    lastT: 0,
  });
  const cardLongPressRef = useRef(null);
  const cardPointerStartRef = useRef(null);
  const dragRef = useRef({
    active: false,
    sourceDay: null,
    sourceIndex: null,
    targetDay: null,
    targetIndex: null,
  });
  const crossDayTimerRef = useRef(null);

  const dayDiff = activeIndex - todayIndex;
  const dayTitle = dayDiff === 0 ? "Today" : dayDiff === -1 ? "Yesterday" : dayDiff === 1 ? "Tomorrow" : DAY_NAMES[activeIndex];
  const indicatorBg = week[activeIndex]?.isToday ? "#DA5F3D" : "#423530";
  const titleFadeDistance = 56;
  const titleOpacity = Math.max(0, 1 - scrollY / titleFadeDistance);
  const titleTranslateY = Math.min(scrollY * 0.2, 12);
  const SCROLL_DRAG_THRESHOLD = 8;
  const MOMENTUM_FRICTION = 0.95;
  const MOMENTUM_MIN_VELOCITY = 0.3;

  const stopScrollMomentum = () => {
    const drag = scrollDragRef.current;
    if (drag.raf) {
      cancelAnimationFrame(drag.raf);
      drag.raf = null;
    }
  };

  const startScrollMomentum = () => {
    const el = scrollRef.current;
    const drag = scrollDragRef.current;
    if (!el) return;
    stopScrollMomentum();

    const step = () => {
      drag.velY *= MOMENTUM_FRICTION;
      if (Math.abs(drag.velY) < MOMENTUM_MIN_VELOCITY) {
        drag.raf = null;
        return;
      }

      const prev = el.scrollTop;
      el.scrollTop -= drag.velY;
      const hitBoundary = el.scrollTop === prev;
      if (hitBoundary) {
        drag.velY *= 0.5;
      }

      drag.raf = requestAnimationFrame(step);
    };

    drag.raf = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      stopScrollMomentum();
      if (cardLongPressRef.current) clearTimeout(cardLongPressRef.current);
      if (crossDayTimerRef.current) clearTimeout(crossDayTimerRef.current);
    };
  }, []);

  const handleScrollDragPointerDown = (e) => {
    if (e.target.closest("button")) return;
    if (e.target.closest("[data-carousel-swipe]")) return;
    const el = scrollRef.current;
    if (!el) return;
    stopScrollMomentum();
    scrollDragRef.current = {
      active: true,
      started: false,
      pointerId: e.pointerId,
      startY: e.clientY,
      startScrollTop: el.scrollTop,
      velY: 0,
      lastY: e.clientY,
      lastT: Date.now(),
      raf: null,
    };
  };

  const handleScrollDragPointerMove = (e) => {
    const drag = scrollDragRef.current;
    const el = scrollRef.current;
    if (!drag.active || !el || drag.pointerId !== e.pointerId) return;
    const dy = e.clientY - drag.startY;

    if (!drag.started) {
      if (Math.abs(dy) < SCROLL_DRAG_THRESHOLD) return;
      drag.started = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      drag.lastY = e.clientY;
      drag.lastT = Date.now();
    }

    e.preventDefault();
    el.scrollTop = drag.startScrollTop - dy;
    const now = Date.now();
    const dt = now - drag.lastT;
    if (dt > 0) {
      drag.velY = ((e.clientY - drag.lastY) / dt) * 16;
      drag.lastY = e.clientY;
      drag.lastT = now;
    }
  };

  const handleScrollDragPointerEnd = (e) => {
    const drag = scrollDragRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch (_) {
      /* ignore */
    }
    if (drag.started && Math.abs(drag.velY) > MOMENTUM_MIN_VELOCITY) {
      startScrollMomentum();
    }
    drag.active = false;
    drag.started = false;
    drag.pointerId = null;
    drag.startY = 0;
    drag.startScrollTop = 0;
    drag.lastY = 0;
    drag.lastT = 0;
  };

  const handleCarouselPointerDown = (e) => {
    if (dragRef.current.active) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    swipeRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      deltaX: 0,
      deltaY: 0,
      lockedAxis: null,
      hasChangedDay: false,
      lastClientY: e.clientY,
      velY: 0,
      lastT: Date.now(),
    };
    stopScrollMomentum();
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleCarouselPointerMove = (e) => {
    if (dragRef.current.active) return;
    const swipe = swipeRef.current;
    if (!swipe.active || swipe.pointerId !== e.pointerId) return;

    swipe.deltaX = e.clientX - swipe.startX;
    swipe.deltaY = e.clientY - swipe.startY;

    if (!swipe.lockedAxis) {
      const absX = Math.abs(swipe.deltaX);
      const absY = Math.abs(swipe.deltaY);
      if (Math.max(absX, absY) < SWIPE_LOCK_DISTANCE) return;
      swipe.lockedAxis = absX > absY ? "x" : "y";
    }

    if (swipe.lockedAxis === "x") {
      e.preventDefault();
      setIsDragging(true);
      const atStart = activeIndex === 0 && swipe.deltaX > 0;
      const atEnd = activeIndex === DAY_COUNT - 1 && swipe.deltaX < 0;
      const resistedDelta = atStart || atEnd ? swipe.deltaX * 0.35 : swipe.deltaX;
      setDragOffset(resistedDelta);
    } else if (swipe.lockedAxis === "y") {
      const el = scrollRef.current;
      if (el) {
        el.scrollTop -= e.clientY - swipe.lastClientY;
      }
      const now = Date.now();
      const dt = now - swipe.lastT;
      if (dt > 0) {
        swipe.velY = ((e.clientY - swipe.lastClientY) / dt) * 16;
      }
      swipe.lastClientY = e.clientY;
      swipe.lastT = now;
    }
  };

  const handleCarouselPointerEnd = (e) => {
    if (dragRef.current.active) return;
    const swipe = swipeRef.current;
    if (!swipe.active || swipe.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);

    if (swipe.lockedAxis === "y" && Math.abs(swipe.velY) > MOMENTUM_MIN_VELOCITY) {
      scrollDragRef.current.velY = swipe.velY;
      startScrollMomentum();
    }

    const absX = Math.abs(swipe.deltaX);
    const absY = Math.abs(swipe.deltaY);
    const panelWidth = carouselRef.current?.clientWidth ?? 0;
    const snapThreshold = panelWidth > 0 ? panelWidth / 2 : Number.POSITIVE_INFINITY;
    let nextIndex = activeIndex;

    if (
      swipe.lockedAxis === "x" &&
      !swipe.hasChangedDay &&
      absX > absY
    ) {
      if (absX >= snapThreshold) {
        swipe.hasChangedDay = true;
        const direction = swipe.deltaX > 0 ? -1 : 1;
        nextIndex = Math.max(0, Math.min(DAY_COUNT - 1, activeIndex + direction));
      }
    }
    setActiveIndex(nextIndex);
    setDragOffset(0);
    setIsDragging(false);

    swipeRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
      lockedAxis: null,
      hasChangedDay: false,
      lastClientY: 0,
      velY: 0,
      lastT: 0,
    };
  };

  const stopCrossDayTimer = () => {
    if (crossDayTimerRef.current) {
      clearTimeout(crossDayTimerRef.current);
      crossDayTimerRef.current = null;
    }
  };

  const scheduleCrossDayShift = (direction) => {
    if (crossDayTimerRef.current) return;
    crossDayTimerRef.current = setTimeout(() => {
      setActiveIndex((prev) => {
        const next = Math.max(0, Math.min(DAY_COUNT - 1, prev + direction));
        dragRef.current.targetDay = next;
        return next;
      });
      crossDayTimerRef.current = null;
    }, 260);
  };

  const handleCardPointerDown = (e, dayIndex, cardIndex, cardId) => {
    if (cardLongPressRef.current) clearTimeout(cardLongPressRef.current);
    cardPointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      dayIndex,
      cardIndex,
      cardId,
      pointerId: e.pointerId,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.stopPropagation();
    cardLongPressRef.current = setTimeout(() => {
      dragRef.current = {
        active: true,
        sourceDay: dayIndex,
        sourceIndex: cardIndex,
        targetDay: dayIndex,
        targetIndex: cardIndex,
      };
      setDraggingCard({ id: cardId, dayIndex, cardIndex });
      setDragHoverIndex(cardIndex);
      setDragPosition({ x: e.clientX, y: e.clientY });
    }, LONG_PRESS_MS);
  };

  const handleCardPointerMove = (e) => {
    if (cardPointerStartRef.current && !dragRef.current.active) {
      const dx = Math.abs(e.clientX - cardPointerStartRef.current.x);
      const dy = Math.abs(e.clientY - cardPointerStartRef.current.y);
      if (dx > 8 || dy > 8) {
        if (cardLongPressRef.current) {
          clearTimeout(cardLongPressRef.current);
          cardLongPressRef.current = null;
        }
      }
    }
    if (!dragRef.current.active) return;

    e.preventDefault();
    e.stopPropagation();
    setDragPosition({ x: e.clientX, y: e.clientY });

    const cardEl = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-today-card-index]");
    if (cardEl) {
      const hoverIndex = Number(cardEl.getAttribute("data-today-card-index"));
      if (!Number.isNaN(hoverIndex)) {
        setDragHoverIndex(hoverIndex);
        dragRef.current.targetIndex = hoverIndex;
      }
    }

    const carouselRect = carouselRef.current?.getBoundingClientRect();
    if (carouselRect) {
      const edgeZone = 36;
      if (e.clientX < carouselRect.left + edgeZone && activeIndex > 0) {
        scheduleCrossDayShift(-1);
      } else if (e.clientX > carouselRect.right - edgeZone && activeIndex < DAY_COUNT - 1) {
        scheduleCrossDayShift(1);
      } else {
        stopCrossDayTimer();
      }
    }
  };

  const handleCardPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    stopCrossDayTimer();

    if (cardLongPressRef.current) {
      clearTimeout(cardLongPressRef.current);
      cardLongPressRef.current = null;
    }

    const start = cardPointerStartRef.current;
    if (start && !dragRef.current.active) {
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx < 10 && dy < 10) {
        router.push(`/card/${start.cardId}`);
      }
      cardPointerStartRef.current = null;
      return;
    }

    if (!dragRef.current.active || !draggingCard) {
      cardPointerStartRef.current = null;
      return;
    }

    setDayCardOrders((prev) => {
      const next = prev.map((list) => [...list]);
      const sourceDay = dragRef.current.sourceDay;
      const sourceIndex = dragRef.current.sourceIndex;
      const targetDay = dragRef.current.targetDay ?? activeIndex;
      const sourceList = Number.isInteger(sourceDay) && sourceDay >= 0 && sourceDay < next.length ? next[sourceDay] : null;
      const targetList = Number.isInteger(targetDay) && targetDay >= 0 && targetDay < next.length ? next[targetDay] : null;
      if (!sourceList || !targetList || !Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= sourceList.length) {
        return prev;
      }
      const [moved] = sourceList.splice(sourceIndex, 1);
      let targetIndex = dragRef.current.targetIndex;
      if (targetDay !== sourceDay) {
        targetIndex = Number.isInteger(targetIndex) && targetIndex >= 0 ? targetIndex : targetList.length;
      } else if (Number.isInteger(targetIndex) && targetIndex > sourceIndex) {
        targetIndex -= 1;
      }
      const safeIndex = Math.max(0, Math.min(targetList.length, Number.isInteger(targetIndex) && targetIndex >= 0 ? targetIndex : targetList.length));
      targetList.splice(safeIndex, 0, moved);
      return next;
    });

    dragRef.current = {
      active: false,
      sourceDay: null,
      sourceIndex: null,
      targetDay: null,
      targetIndex: null,
    };
    cardPointerStartRef.current = null;
    setDraggingCard(null);
    setDragHoverIndex(null);
  };

  const handleCardPointerCancel = (e) => {
    if (cardLongPressRef.current) {
      clearTimeout(cardLongPressRef.current);
      cardLongPressRef.current = null;
    }
    stopCrossDayTimer();
    dragRef.current = {
      active: false,
      sourceDay: null,
      sourceIndex: null,
      targetDay: null,
      targetIndex: null,
    };
    cardPointerStartRef.current = null;
    setDraggingCard(null);
    setDragHoverIndex(null);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto scrollbar-hide"
      style={{ WebkitOverflowScrolling: "touch" }}
      onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}
      onPointerDown={handleScrollDragPointerDown}
      onPointerMove={handleScrollDragPointerMove}
      onPointerUp={handleScrollDragPointerEnd}
      onPointerCancel={handleScrollDragPointerEnd}
    >
      <div className="flex flex-col w-full" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <h1
          className="text-[#423530]"
          style={{
            fontFamily: 'var(--font-din-rounded), sans-serif',
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: -0.96,
            textTransform: "capitalize",
            lineHeight: "100%",
            opacity: titleOpacity,
            transform: `translateY(-${titleTranslateY}px)`,
            transition: "opacity 140ms linear, transform 140ms linear",
          }}
        >
          {dayTitle}
        </h1>

        <div
          style={{
            marginTop: 16,
            position: "sticky",
            top: 0,
            zIndex: 20,
            marginLeft: -24,
            marginRight: -24,
          }}
        >
          {/* Week scroller pinned under header */}
          <div
            style={{
              background: "#EEE1C4",
              paddingLeft: 24,
              paddingRight: 24,
              paddingBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: WEEK_SCROLLER_GAP,
                marginLeft: -12,
                marginRight: -12,
                position: "relative",
              }}
            >
              {/* Sliding indicator */}
              <div
                style={{
                  position: "absolute",
                  width: 36,
                  height: 36,
                  borderRadius: 14,
                  background: indicatorBg,
                  bottom: 8,
                  left: `calc(${activeIndex} * (((100% - ${(DAY_COUNT - 1) * WEEK_SCROLLER_GAP}px) / ${DAY_COUNT}) + ${WEEK_SCROLLER_GAP}px) + (((100% - ${(DAY_COUNT - 1) * WEEK_SCROLLER_GAP}px) / ${DAY_COUNT} - 36px) / 2))`,
                  transition: "left 250ms cubic-bezier(0.34, 1.28, 0.64, 1), background-color 250ms ease",
                  zIndex: 0,
                }}
              />

              {week.map((d, i) => {
                const isActive = i === activeIndex;
                const isToday = d.isToday;

                let numberColor = "#423530";
                if (isActive) {
                  numberColor = "#FFF";
                } else if (isToday) {
                  numberColor = "#DA5F3D";
                }

                return (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      paddingTop: 8,
                      paddingBottom: 8,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 600,
                        lineHeight: "17px",
                        textTransform: "uppercase",
                        textAlign: "center",
                        color: "#423530",
                        fontFamily: 'var(--font-din-rounded), sans-serif',
                      }}
                    >
                      {d.label}
                    </span>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: "17px",
                        textAlign: "center",
                        color: numberColor,
                        fontFamily: 'var(--font-din-rounded), sans-serif',
                        transition: "color 200ms ease",
                      }}
                    >
                      {d.date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fade mask so scrolling cards blend behind pinned week scroller */}
          <div
            aria-hidden
            style={{
              height: 7,
              marginTop: -1,
              background: "linear-gradient(180deg, #EEE1C4 0%, rgba(238, 225, 196, 0) 70%)",
            }}
          />
        </div>

        {/* Card carousel */}
        <div
          ref={carouselRef}
          data-carousel-swipe="true"
          style={{
            marginTop: 0,
            marginLeft: -24,
            marginRight: -24,
            overflow: "hidden",
            paddingTop: 2,
            touchAction: "none",
          }}
          onPointerDown={handleCarouselPointerDown}
          onPointerMove={handleCarouselPointerMove}
          onPointerUp={handleCarouselPointerEnd}
          onPointerCancel={handleCarouselPointerEnd}
          onPointerLeave={handleCarouselPointerEnd}
        >
          <div
            style={{
              display: "flex",
              width: `${DAY_COUNT * 100}%`,
              transform: `translateX(calc(-${activeIndex * (100 / DAY_COUNT)}% + ${dragOffset}px))`,
              transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {Array.from({ length: DAY_COUNT }, (_, dayIdx) => (
              <div
                key={dayIdx}
                style={{
                  width: `${100 / DAY_COUNT}%`,
                  flexShrink: 0,
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "189px 189px",
                    rowGap: 8,
                    columnGap: 8,
                  }}
                >
                  {dayCardOrders[dayIdx].map((cardId, i) => {
                    const card = getCardById(cardId) || CARD_CONTENT[0];
                    const isDraggedCard = draggingCard && draggingCard.id === cardId;
                    const isDropTarget = dragRef.current.active && dayIdx === activeIndex && dragHoverIndex === i;
                    return (
                      <div
                        key={`${dayIdx}-${cardId}-${i}`}
                        data-today-card-index={i}
                        style={{ ...cardStyle, touchAction: "none", opacity: isDraggedCard ? 0.25 : 1, outline: isDropTarget ? "2px solid rgba(66,53,48,0.25)" : "none", cursor: "pointer" }}
                        onPointerDown={(e) => handleCardPointerDown(e, dayIdx, i, cardId)}
                        onPointerMove={handleCardPointerMove}
                        onPointerUp={handleCardPointerUp}
                        onPointerCancel={handleCardPointerCancel}
                        onPointerLeave={handleCardPointerMove}
                      >
                        {/* No content in Today cards for now; cards are blank placeholders */}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {draggingCard && (
          <div
            className="pointer-events-none fixed z-50"
            style={{
              left: dragPosition.x,
              top: dragPosition.y,
              width: 189,
              height: 252,
              transform: "translate(-50%, -50%) scale(1.02)",
              ...cardStyle,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.14)",
            }}
          />
        )}

        <div style={{ height: 130 }} />
      </div>
    </div>
  );
}
