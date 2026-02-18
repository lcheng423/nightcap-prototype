"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const REFLECTION_STATE_KEY = "reflectionState";
const HAS_VIEWED_INSIGHT_KEY = "hasViewedInsight";
const FIRST_LOAD_COMPLETE_KEY = "nightcap_hasCompletedFirstLoad";

const WELCOME_TEXT = "Morning, Courtney!";
const CARD_ENTER_STAGGER_S = 0.0875;
const FIRST_LOAD_TYPED_MESSAGE = "Here are some ideas for who you're becoming. Save one to start your day";
const TYPEWRITER_MS = 11;

const LONG_PRESS_MS = 400;
const CELL_W = 189 + 8;
const CELL_H = 252 + 8;
const CARD_W = 189;
const CARD_H = 252;
const SWAP_HOVER_W = 50;
const SWAP_HOVER_H = 70;
const EXPAND_MS = 300;
const EXPAND_EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";
const EXPAND_TRANSITION = ["top", "left", "width", "height", "border-radius", "padding", "transform"]
  .map((p) => `${p} ${EXPAND_MS}ms ${EXPAND_EASE}`)
  .join(", ");

const backIcon = (
  <svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="block" aria-hidden>
    <path d="M0 8.47656C0 8.23242 0.0878906 8.00781 0.273438 7.83203L8.01758 0.253906C8.18359 0.0878906 8.39844 0 8.65234 0C9.16016 0 9.55078 0.380859 9.55078 0.888672C9.55078 1.13281 9.44336 1.35742 9.28711 1.52344L2.17773 8.47656L9.28711 15.4297C9.44336 15.5957 9.55078 15.8105 9.55078 16.0645C9.55078 16.5723 9.16016 16.9531 8.65234 16.9531C8.39844 16.9531 8.18359 16.8652 8.01758 16.6895L0.273438 9.12109C0.0878906 8.93555 0 8.7207 0 8.47656Z" fill="#423530" />
  </svg>
);

function TypewriterText({ text }) {
  return text.split("").map((char, i) =>
    char === "\n" ? <br key={i} /> : <span key={i} className="typewriter-letter">{char}</span>
  );
}


export default function HomePage() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasReflectionInProgress, setHasReflectionInProgress] = useState(false);
  const [hasViewedInsight, setHasViewedInsight] = useState(false);
  const [order, setOrder] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const [longPressedCardIndex, setLongPressedCardIndex] = useState(null);
  const [draggingSlot, setDraggingSlot] = useState(null);
  const [heldCardId, setHeldCardId] = useState(null);
  const [hoverSlot, setHoverSlot] = useState(null);
  const [underCardOffset, setUnderCardOffset] = useState({ x: 0, y: 0 });
  const [underCardScale, setUnderCardScale] = useState(1);
  const [underCardRotate, setUnderCardRotate] = useState(0);
  const [arrivalSlot, setArrivalSlot] = useState(null);
  const [arrivalFromSlot, setArrivalFromSlot] = useState(null);
  const [arrivalOffset, setArrivalOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [expandingCard, setExpandingCard] = useState(null);
  const [isFirstTimeLoading, setIsFirstTimeLoading] = useState(true);
  const [firstLoadPhase, setFirstLoadPhase] = useState("welcome");
  const [welcomeTypedLength, setWelcomeTypedLength] = useState(0);
  const [instructionTypedLength, setInstructionTypedLength] = useState(0);
  const longPressTimerRef = useRef(null);
  const router = useRouter();
  const frameRef = useRef(null);
  const nextRouteRef = useRef("/reflection");
  const gridRef = useRef(null);
  const cardDragActiveRef = useRef(false);
  const tapStartRef = useRef(null);
  const expandCardRef = useRef(null);
  const expandNavTimerRef = useRef(null);
  const pullStartRef = useRef(null);
  const [pullOffset, setPullOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setHasReflectionInProgress(!!localStorage.getItem(REFLECTION_STATE_KEY));
      setHasViewedInsight(!!sessionStorage.getItem(HAS_VIEWED_INSIGHT_KEY));
      setIsFirstTimeLoading(!sessionStorage.getItem(FIRST_LOAD_COMPLETE_KEY));
    } catch (_) {
      /* ignore */
    }
  }, []);

  /* Phase: welcome – type out "Welcome, Courtney" */
  useEffect(() => {
    if (!isFirstTimeLoading || firstLoadPhase !== "welcome") return;
    let intervalId = null;
    intervalId = setInterval(() => {
      setWelcomeTypedLength((n) => {
        if (n >= WELCOME_TEXT.length) {
          if (intervalId) clearInterval(intervalId);
          return n;
        }
        return n + 1;
      });
    }, TYPEWRITER_MS);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isFirstTimeLoading, firstLoadPhase]);

  useEffect(() => {
    if (!isFirstTimeLoading || firstLoadPhase !== "welcome" || welcomeTypedLength < WELCOME_TEXT.length) return;
    setFirstLoadPhase("instruction");
  }, [isFirstTimeLoading, firstLoadPhase, welcomeTypedLength]);

  /* Phase: instruction – type out save instruction */
  useEffect(() => {
    if (!isFirstTimeLoading || firstLoadPhase !== "instruction") return;
    let intervalId = null;
    intervalId = setInterval(() => {
      setInstructionTypedLength((n) => {
        if (n >= FIRST_LOAD_TYPED_MESSAGE.length) {
          if (intervalId) clearInterval(intervalId);
          return n;
        }
        return n + 1;
      });
    }, TYPEWRITER_MS);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isFirstTimeLoading, firstLoadPhase]);

  useEffect(() => {
    if (!isFirstTimeLoading || firstLoadPhase !== "instruction" || instructionTypedLength < FIRST_LOAD_TYPED_MESSAGE.length) return;
    setFirstLoadPhase("cardsEnter");
    try { sessionStorage.setItem(FIRST_LOAD_COMPLETE_KEY, "1"); } catch (_) { /* ignore */ }
  }, [isFirstTimeLoading, firstLoadPhase, instructionTypedLength]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (expandNavTimerRef.current) clearTimeout(expandNavTimerRef.current);
    };
  }, []);

  /* Drag-to-scroll: touch the screen and drag to scroll like on iOS */
  const scrollDragRef = useRef({ active: false, started: false, startY: 0, startScrollTop: 0, pointerId: null, velY: 0, lastY: 0, lastT: 0, raf: null });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const sd = scrollDragRef.current;

    const DRAG_THRESHOLD = 8;
    const FRICTION = 0.95;
    const MIN_VEL = 0.5;

    const stopMomentum = () => { if (sd.raf) { cancelAnimationFrame(sd.raf); sd.raf = null; } };

    const runMomentum = () => {
      stopMomentum();
      const step = () => {
        sd.velY *= FRICTION;
        if (Math.abs(sd.velY) < MIN_VEL) { sd.raf = null; return; }
        el.scrollTop -= sd.velY;
        if (el.scrollTop <= 0 || el.scrollTop >= el.scrollHeight - el.clientHeight) sd.velY *= 0.5;
        sd.raf = requestAnimationFrame(step);
      };
      sd.raf = requestAnimationFrame(step);
    };

    const onDown = (e) => {
      /* Skip buttons, links, interactive elements, and card drag-and-drop */
      if (e.target.closest("button, a")) return;
      if (cardDragActiveRef.current) return;
      stopMomentum();
      sd.active = true;
      sd.started = false;
      sd.startY = e.clientY;
      sd.startScrollTop = el.scrollTop;
      sd.lastY = e.clientY;
      sd.lastT = Date.now();
      sd.velY = 0;
      sd.pointerId = e.pointerId;
    };

    const onMove = (e) => {
      if (!sd.active) return;
      /* Bail if card drag-and-drop activated while we were tracking */
      if (cardDragActiveRef.current) { sd.active = false; sd.started = false; return; }
      const dy = e.clientY - sd.startY;
      if (!sd.started) {
        if (Math.abs(dy) < DRAG_THRESHOLD) return;
        sd.started = true;
        /* Cancel any pending card long-press since this is a scroll */
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        tapStartRef.current = null;
        /* Capture pointer once we commit to scrolling */
        try { el.setPointerCapture(sd.pointerId); } catch (_) {}
      }
      el.scrollTop = sd.startScrollTop - dy;
      const now = Date.now();
      const dt = now - sd.lastT;
      if (dt > 0) {
        sd.velY = (e.clientY - sd.lastY) / dt * 16;
        sd.lastY = e.clientY;
        sd.lastT = now;
      }
    };

    const onUp = () => {
      if (!sd.active) return;
      const wasScrolling = sd.started;
      sd.active = false;
      sd.started = false;
      if (sd.pointerId != null) {
        try { el.releasePointerCapture(sd.pointerId); } catch (_) {}
        sd.pointerId = null;
      }
      if (wasScrolling && Math.abs(sd.velY) > MIN_VEL) runMomentum();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      stopMomentum();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  /* Trigger card expansion after first paint */
  useEffect(() => {
    if (!expandingCard || expandingCard.phase !== "mounting") return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpandingCard((prev) => prev ? { ...prev, phase: "expanding" } : null);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [expandingCard]);

  /* Two-frame close from pull: parks at pull position first, then animates to origin */
  useEffect(() => {
    if (!expandingCard || expandingCard.phase !== "closing-start") return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpandingCard((prev) => prev ? { ...prev, phase: "closing" } : null);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [expandingCard]);

  /* Handle card overlay transition end (expand complete or close complete) */
  const handleExpandTransitionEnd = useCallback(
    (e) => {
      if (e.target !== expandCardRef.current) return;
      if (!expandingCard) return;
      if (expandingCard.phase === "expanding") {
        if (expandNavTimerRef.current) clearTimeout(expandNavTimerRef.current);
        setExpandingCard((prev) => prev ? { ...prev, phase: "open" } : null);
      } else if (expandingCard.phase === "closing") {
        if (expandNavTimerRef.current) clearTimeout(expandNavTimerRef.current);
        setExpandingCard(null);
      }
    },
    [expandingCard]
  );

  /* Back from expanded card view — pullXY is {x,y} where the user released (null if back button) */
  const dismissCard = useCallback((pullXY = null) => {
    if (!expandingCard || expandingCard.phase === "closing" || expandingCard.phase === "closing-start") return;
    setPullOffset({ x: 0, y: 0 });
    pullStartRef.current = null;
    if (pullXY) {
      const dist = Math.sqrt(pullXY.x * pullXY.x + pullXY.y * pullXY.y);
      const pullScale = Math.max(0.85, 1 - dist / 1200);
      setExpandingCard((prev) => prev ? { ...prev, phase: "closing-start", pullDismissXY: pullXY, pullDismissScale: pullScale } : null);
    } else {
      setExpandingCard((prev) => prev ? { ...prev, phase: "closing" } : null);
    }
    expandNavTimerRef.current = setTimeout(() => setExpandingCard(null), EXPAND_MS + 100);
  }, [expandingCard]);

  const handleCardBack = useCallback(
    (e) => {
      e.preventDefault();
      dismissCard();
    },
    [dismissCard]
  );

  /* Drag-to-dismiss on the expanded card (free movement in any direction) */
  const DISMISS_THRESHOLD = 100;

  const handlePullDown = useCallback((e) => {
    if (!expandingCard || expandingCard.phase !== "open") return;
    pullStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, [expandingCard]);

  const handlePullMove = useCallback((e) => {
    if (!pullStartRef.current) return;
    const dx = e.clientX - pullStartRef.current.x;
    const dy = e.clientY - pullStartRef.current.y;
    setPullOffset({ x: dx, y: dy });
  }, []);

  const handlePullUp = useCallback((e) => {
    if (!pullStartRef.current) return;
    e.currentTarget.releasePointerCapture?.(pullStartRef.current.pointerId);
    const dx = e.clientX - pullStartRef.current.x;
    const dy = e.clientY - pullStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    pullStartRef.current = null;
    if (dist > DISMISS_THRESHOLD) {
      dismissCard({ x: dx, y: dy });
    } else {
      setPullOffset({ x: 0, y: 0 }); // snap back
    }
  }, [dismissCard]);

  const TOTAL_CARDS = order.length;
  const TOTAL_ROWS = Math.ceil(TOTAL_CARDS / 2);

  const getSlotAtClient = useCallback((clientX, clientY) => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const col = Math.floor(relX / CELL_W);
    const row = Math.floor(relY / CELL_H);
    if (col < 0 || col > 1 || row < 0 || row >= TOTAL_ROWS) return null;
    const slot = row * 2 + col;
    return slot < TOTAL_CARDS ? slot : null;
  }, [TOTAL_CARDS, TOTAL_ROWS]);

  const getSlotAtClientCenter = useCallback((clientX, clientY) => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const col = Math.floor(relX / CELL_W);
    const row = Math.floor(relY / CELL_H);
    if (col < 0 || col > 1 || row < 0 || row >= TOTAL_ROWS) return null;
    const slot = row * 2 + col;
    if (slot >= TOTAL_CARDS) return null;
    const centerX = col * CELL_W + CARD_W / 2;
    const centerY = row * CELL_H + CARD_H / 2;
    const halfW = SWAP_HOVER_W / 2;
    const halfH = SWAP_HOVER_H / 2;
    if (Math.abs(relX - centerX) > halfW || Math.abs(relY - centerY) > halfH) return null;
    return slot;
  }, [TOTAL_CARDS, TOTAL_ROWS]);

  useEffect(() => {
    if (draggingSlot === null || hoverSlot === null || hoverSlot === draggingSlot) return;
    const id = requestAnimationFrame(() => {
      const dx = ((draggingSlot % 2) - (hoverSlot % 2)) * CELL_W;
      const dy = (Math.floor(draggingSlot / 2) - Math.floor(hoverSlot / 2)) * CELL_H;
      setUnderCardOffset({ x: dx * 0.1, y: dy * 0.1 });
      setUnderCardScale(0.8);
      setUnderCardRotate(8);
    });
    return () => cancelAnimationFrame(id);
  }, [draggingSlot, hoverSlot]);

  useEffect(() => {
    if (arrivalSlot === null || arrivalFromSlot === null) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setArrivalOffset({ x: 0, y: 0 }));
    });
    return () => cancelAnimationFrame(id);
  }, [arrivalSlot, arrivalFromSlot]);

  const handleCardPointerDown = useCallback((e, slotIndex) => {
    if (longPressTimerRef.current) return;
    if (expandingCard) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    tapStartRef.current = { x: e.clientX, y: e.clientY, slot: slotIndex };
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null;
      cardDragActiveRef.current = true;
      setLongPressedCardIndex(slotIndex);
      setDragPosition({ x: e.clientX, y: e.clientY });
    }, LONG_PRESS_MS);
  }, [expandingCard]);

  const handleCardPointerMove = useCallback(
    (e) => {
      if (longPressedCardIndex !== null && draggingSlot === null) {
        setDraggingSlot(longPressedCardIndex);
        setHeldCardId(order[longPressedCardIndex]);
      }
      if (draggingSlot !== null || longPressedCardIndex !== null) {
        setDragPosition({ x: e.clientX, y: e.clientY });
      }
      if (draggingSlot !== null) {
        const slot = getSlotAtClientCenter(e.clientX, e.clientY);
        if (slot !== null && slot !== draggingSlot) {
          const fromSlot = draggingSlot;
          const dx = ((slot % 2) - (fromSlot % 2)) * CELL_W;
          const dy = (Math.floor(slot / 2) - Math.floor(fromSlot / 2)) * CELL_H;
          setOrder((prev) => {
            const next = [...prev];
            next[fromSlot] = prev[slot];
            next[slot] = prev[fromSlot];
            return next;
          });
          setArrivalSlot(fromSlot);
          setArrivalFromSlot(slot);
          setArrivalOffset({ x: dx, y: dy });
          setDraggingSlot(slot);
          setHoverSlot(slot);
          setUnderCardOffset({ x: 0, y: 0 });
          setUnderCardScale(1);
          setUnderCardRotate(0);
        } else {
          const slotAny = getSlotAtClient(e.clientX, e.clientY);
          if (slotAny !== hoverSlot) setHoverSlot(slotAny);
        }
      }
    },
    [longPressedCardIndex, draggingSlot, hoverSlot, order, getSlotAtClient, getSlotAtClientCenter]
  );

  const handleCardPointerUp = useCallback(
    (e) => {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      // Detect tap: timer still pending (no long press fired), minimal pointer movement
      if (longPressTimerRef.current && tapStartRef.current) {
        const dx = Math.abs(e.clientX - tapStartRef.current.x);
        const dy = Math.abs(e.clientY - tapStartRef.current.y);
        if (dx < 10 && dy < 10) {
          const mainEl = e.currentTarget.closest("main");
          const cardId = order[tapStartRef.current.slot];
          if (mainEl) {
            const cr = e.currentTarget.getBoundingClientRect();
            const mr = mainEl.getBoundingClientRect();
            const rect = {
              top: Math.round(cr.top - mr.top),
              left: Math.round(cr.left - mr.left),
              width: Math.round(cr.width),
              height: Math.round(cr.height),
            };
            setExpandingCard({ cardId, rect, phase: "mounting" });
            /* Fallback: force open if transitionend doesn't fire */
            expandNavTimerRef.current = setTimeout(() => {
              setExpandingCard((prev) => prev && prev.phase === "expanding" ? { ...prev, phase: "open" } : prev);
            }, EXPAND_MS + 100);
          }
        }
      }
      tapStartRef.current = null;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      cardDragActiveRef.current = false;
      setDraggingSlot(null);
      setHeldCardId(null);
      setLongPressedCardIndex(null);
      setHoverSlot(null);
      setArrivalSlot(null);
      setArrivalFromSlot(null);
      setUnderCardOffset({ x: 0, y: 0 });
      setUnderCardScale(1);
      setUnderCardRotate(0);
    },
    [order]
  );

  const handleCardPointerLeave = useCallback((e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (draggingSlot === null) {
      setLongPressedCardIndex(null);
    } else {
      setHoverSlot(null);
    }
  }, [draggingSlot]);

  const handlePrimaryButtonClick = useCallback(
    (e) => {
      e.preventDefault();
      if (isLeaving) return;
      nextRouteRef.current =
        hasViewedInsight && !hasReflectionInProgress ? "/insight" : "/reflection";
      setIsLeaving(true);
    },
    [isLeaving, hasViewedInsight, hasReflectionInProgress]
  );

  const handleFadeOutEnd = useCallback(
    (e) => {
      if (e.target !== frameRef.current || e.animationName !== "fade-out-quick") return;
      router.push(nextRouteRef.current);
    },
    [router]
  );

  const primaryButtonLabel = hasReflectionInProgress
    ? "Continue my reflection"
    : hasViewedInsight
      ? "View my insights"
      : "Start reflection";

  return (
    <>
      {/* Scrollable content — fades out when leaving for reflection/insight */}
      <div
        ref={frameRef}
        className={`flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-hide ${isLeaving ? "fade-out-quick" : ""}`}
        onAnimationEnd={handleFadeOutEnd}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Content: 24px horizontal padding */}
        <div
          className="flex flex-col w-full"
          style={{ paddingLeft: 24, paddingRight: 24 }}
        >
          {/* Greeting: type out "Morning, Courtney!" then static */}
          <h1
            className="text-[#423530] mb-1"
            style={{
              width: "100%",
              maxWidth: 342,
              fontFamily: "var(--font-din-rounded), sans-serif",
              fontSize: 32,
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "98%",
              letterSpacing: -0.64,
              minHeight: isFirstTimeLoading && firstLoadPhase === "welcome" ? "2.5em" : undefined,
            }}
          >
            {isFirstTimeLoading && firstLoadPhase === "welcome" ? (
              <TypewriterText text={WELCOME_TEXT.slice(0, welcomeTypedLength)} />
            ) : (
              <>Morning, Courtney!</>
            )}
          </h1>

          {/* Subtitle: empty during welcome; loading strings; then type instruction; then static */}
          <p
            className="text-[#423530]"
            style={{
              width: "100%",
              maxWidth: 342,
              marginTop: 10,
              fontFamily: "var(--font-din-rounded), sans-serif",
              fontSize: 20,
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "98%",
              letterSpacing: -0.4,
              minHeight: isFirstTimeLoading && firstLoadPhase !== "welcome" ? "1.96em" : undefined,
              overflow: isFirstTimeLoading ? "hidden" : undefined,
            }}
          >
            {isFirstTimeLoading && firstLoadPhase === "instruction" ? (
              <span className="block">
                <TypewriterText text={FIRST_LOAD_TYPED_MESSAGE.slice(0, instructionTypedLength)} />
              </span>
            ) : isFirstTimeLoading && firstLoadPhase === "cardsEnter" ? (
              <span className="block">{FIRST_LOAD_TYPED_MESSAGE}</span>
            ) : (
              <span className="block">{FIRST_LOAD_TYPED_MESSAGE}</span>
            )}
          </p>

          {/* Card grid */}
          <div
            style={{
              marginTop: (!isFirstTimeLoading || firstLoadPhase === "cardsEnter") ? 32 : 16,
              marginLeft: -16,
              marginRight: -16,
              marginBottom: 36,
              opacity: isFirstTimeLoading && (firstLoadPhase === "welcome" || firstLoadPhase === "instruction") ? 0 : 1,
            }}
          >
              <div
                ref={gridRef}
                style={{
                  display: "grid",
                  rowGap: 8,
                  columnGap: 8,
                  gridTemplateRows: `repeat(${TOTAL_ROWS}, 252px)`,
                  gridTemplateColumns: "189px 189px",
                }}
              >
              {isFirstTimeLoading && (firstLoadPhase === "welcome" || firstLoadPhase === "instruction") ? (
                Array.from({ length: TOTAL_CARDS }, (_, i) => i).map((slotIndex) => (
                  <div key={slotIndex} style={{ width: 189, height: 252 }} aria-hidden />
                ))
              ) : (
              Array.from({ length: TOTAL_CARDS }, (_, i) => i).map((slotIndex) => {
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
                  ...(firstLoadPhase === "cardsEnter" ? { "--card-enter-delay": `${slotIndex * CARD_ENTER_STAGGER_S}s` } : { animationDelay: `${0.1 + slotIndex * 0.1}s` }),
                };
                const isHoverTarget = hoverSlot !== null && hoverSlot !== draggingSlot && slotIndex === hoverSlot;
                const isPlaceholder = draggingSlot !== null && order[slotIndex] === heldCardId;
                const isArrivingSlot = slotIndex === arrivalSlot;
                const isExpandingThis = expandingCard && expandingCard.cardId === order[slotIndex];

                return (
                  <div
                    key={slotIndex}
                    style={{ touchAction: "none" }}
                    onPointerDown={(e) => handleCardPointerDown(e, slotIndex)}
                    onPointerMove={handleCardPointerMove}
                    onPointerUp={handleCardPointerUp}
                    onPointerLeave={handleCardPointerLeave}
                    onPointerCancel={handleCardPointerUp}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {isArrivingSlot ? (
                      <div
                        className="home-card-fly-snap"
                        style={{
                          ...cardStyle,
                          transform: `translate(${arrivalOffset.x}px, ${arrivalOffset.y}px)`,
                        }}
                      />
                    ) : isHoverTarget ? (
                      <div
                        className={`home-card-fly-snap ${firstLoadPhase === "cardsEnter" ? "home-first-enter" : ""}`}
                        style={{
                          ...cardStyle,
                          transform: `scale(${underCardScale}) rotate(${underCardRotate}deg) translate(${underCardOffset.x}px, ${underCardOffset.y}px)`,
                        }}
                      />
                    ) : isPlaceholder ? (
                      <div style={{ ...cardStyle, opacity: 0 }} aria-hidden />
                    ) : (
                      <div
                        className={`cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-transform duration-200 ease-out ${firstLoadPhase === "cardsEnter" ? "home-first-enter" : ""}`}
                        style={{ ...cardStyle, ...(isExpandingThis ? { opacity: 0 } : {}) }}
                      />
                    )}
                  </div>
                );
              })
              )}
              </div>
              {draggingSlot !== null && (
                <div
                  className="pointer-events-none fixed z-50 home-held-wiggle"
                  style={{
                    left: dragPosition.x,
                    top: dragPosition.y,
                    width: 189,
                    height: 252,
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    padding: 24,
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 10,
                    boxSizing: "border-box",
                    borderRadius: 28,
                    border: "1px solid rgba(0, 0, 0, 0.10)",
                    backgroundColor: "#F7F0E1",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                  }}
                />
              )}
            </div>
          </div>

          {/* Bottom padding so content clears the nav bar */}
          <div style={{ height: 130 }} />
        </div>

        {/* Blanket: fades in on expand, fades out on close — reveals home content */}
        {expandingCard && (() => {
          const pullDist = Math.sqrt(pullOffset.x * pullOffset.x + pullOffset.y * pullOffset.y);
          const pulling = pullDist > 0 && expandingCard.phase === "open";
          const dismissXY = expandingCard.pullDismissXY;
          const dismissDist = dismissXY ? Math.sqrt(dismissXY.x * dismissXY.x + dismissXY.y * dismissXY.y) : 0;
          const closingFromPull = (expandingCard.phase === "closing" || expandingCard.phase === "closing-start") && dismissDist > 0;
          const pullDismissOpacity = Math.max(0, 1 - dismissDist / 300);
          const blanketOpacity = pulling ? Math.max(0, 1 - pullDist / 300) : undefined;

          let blanketClass = "absolute inset-0 z-20";
          let blanketStyle = { backgroundColor: "#EEE1C4" };

          if (closingFromPull) {
            if (expandingCard.phase === "closing-start") {
              blanketStyle.opacity = pullDismissOpacity;
            } else {
              blanketStyle.opacity = 0;
              blanketStyle.transition = `opacity ${EXPAND_MS}ms ${EXPAND_EASE}`;
            }
          } else if (pulling) {
            blanketStyle.opacity = blanketOpacity;
          } else if (expandingCard.phase === "closing") {
            blanketClass += " card-blanket-out";
          } else {
            blanketClass += " card-blanket-in";
          }

          return <div className={blanketClass} style={blanketStyle} />;
        })()}

        {/* Back button – appears once card is expanding, fades out on close or pull */}
        {expandingCard && expandingCard.phase !== "mounting" && (() => {
          const pullDist = Math.sqrt(pullOffset.x * pullOffset.x + pullOffset.y * pullOffset.y);
          const pulling = pullDist > 0 && expandingCard.phase === "open";
          const dismissXY = expandingCard.pullDismissXY;
          const dismissDist = dismissXY ? Math.sqrt(dismissXY.x * dismissXY.x + dismissXY.y * dismissXY.y) : 0;
          const closingFromPull = (expandingCard.phase === "closing" || expandingCard.phase === "closing-start") && dismissDist > 0;
          const pullDismissOpacity = Math.max(0, 1 - dismissDist / 150);

          let backClass = "absolute z-40";
          let backStyle = { top: 54 + 24, left: 24 };

          if (closingFromPull) {
            if (expandingCard.phase === "closing-start") {
              backStyle.opacity = pullDismissOpacity;
              backStyle.transition = "none";
            } else {
              backStyle.opacity = 0;
              backStyle.transition = `opacity ${EXPAND_MS}ms ${EXPAND_EASE}`;
            }
          } else if (pulling) {
            backStyle.opacity = Math.max(0, 1 - pullDist / 150);
            backStyle.transition = "none";
          } else if (expandingCard.phase === "closing") {
            backClass += " card-back-fade-out";
          } else {
            backClass += " card-back-fade-in";
          }

          return (
          <div className={backClass} style={backStyle}>

            <Link
              href="/"
              onClick={handleCardBack}
              className="flex justify-center items-center transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              style={{
                width: 48,
                height: 48,
                padding: "11.5px 13.8px",
                aspectRatio: "1/1",
                background: "rgba(255, 255, 255, 0.80)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                borderRadius: 20,
              }}
              aria-label="Back"
            >
              {backIcon}
            </Link>
          </div>
          );
        })()}

        {/* Card overlay: transitions between small card and expanded card */}
        {expandingCard && (() => {
          const atFinal = expandingCard.phase === "expanding" || expandingCard.phase === "open";
          const pullDist = Math.sqrt(pullOffset.x * pullOffset.x + pullOffset.y * pullOffset.y);
          const pulling = pullDist > 0 && expandingCard.phase === "open";
          const pullScale = pulling ? Math.max(0.85, 1 - pullDist / 1200) : 1;
          const pullRotate = pulling ? pullOffset.x * 0.03 : 0;
          const isClosingStart = expandingCard.phase === "closing-start";
          const dismissXY = expandingCard.pullDismissXY;
          const dismissRotate = dismissXY ? dismissXY.x * 0.03 : 0;
          return (
            <div
              ref={expandCardRef}
              onTransitionEnd={handleExpandTransitionEnd}
              onPointerDown={expandingCard.phase === "open" ? handlePullDown : undefined}
              onPointerMove={handlePullMove}
              onPointerUp={handlePullUp}
              onPointerCancel={handlePullUp}
              style={{
                position: "absolute",
                zIndex: 30,
                top: atFinal || isClosingStart ? 149 : expandingCard.rect.top,
                left: atFinal || isClosingStart ? 8 : expandingCard.rect.left,
                width: atFinal || isClosingStart ? 386 : expandingCard.rect.width,
                height: atFinal || isClosingStart ? 514.667 : expandingCard.rect.height,
                borderRadius: atFinal || isClosingStart ? 40 : 28,
                padding: atFinal || isClosingStart ? 36 : 24,
                transition: (pulling || expandingCard.phase === "mounting") ? "none" : EXPAND_TRANSITION,
                transform: pulling
                  ? `translate(${pullOffset.x}px, ${pullOffset.y}px) scale(${pullScale}) rotate(${pullRotate}deg)`
                  : isClosingStart
                    ? `translate(${dismissXY?.x || 0}px, ${dismissXY?.y || 0}px) scale(${expandingCard.pullDismissScale || 1}) rotate(${dismissRotate}deg)`
                    : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 20,
                boxSizing: "border-box",
                border: "1px solid rgba(0, 0, 0, 0.10)",
                backgroundColor: "#F7F0E1",
                boxShadow: "0 8.124px 40.618px 0 rgba(0, 0, 0, 0.05)",
                touchAction: expandingCard.phase === "open" ? "none" : undefined,
              }}
            />
          );
        })()}
    </>
  );
}
