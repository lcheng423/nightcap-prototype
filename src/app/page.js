"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import statusBarImage from "./assets/Status bar.png";

const REFLECTION_STATE_KEY = "reflectionState";
const HAS_VIEWED_INSIGHT_KEY = "hasViewedInsight";
const FIRST_LOAD_COMPLETE_KEY = "nightcap_hasCompletedFirstLoad";

const WELCOME_TEXT = "Welcome, Courtney";
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
  const [notifications] = useState(7);
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
  const recentlySettledSlotsRef = useRef([]);
  const lastDragStateRef = useRef({ draggingSlot: null, arrivalSlot: null });
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
      /* Two-frame close: first frame parks at pull position with transition on,
         second frame moves to origin so the browser actually animates. */
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
      const { draggingSlot: ds, arrivalSlot: as } = lastDragStateRef.current;
      recentlySettledSlotsRef.current = [ds, as].filter((s) => s != null);
      setTimeout(() => {
        recentlySettledSlotsRef.current = [];
      }, 500);
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
    [router, order]
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
    <div className="min-h-screen flex items-center justify-center bg-[#E3DED4]">
      {/* Main screen: 402×874 frame, 60px radius – status bar and background never fade */}
      <main
        className="ios-frame relative overflow-hidden bg-[#EEE1C4] rounded-[60px] flex flex-col"
        style={{
          width: 402,
          maxWidth: "100%",
          height: 874,
          minHeight: 874,
          boxShadow:
            "0px 4px 24px rgba(0, 0, 0, 0.06), 0px 0 0 1px rgba(0, 0, 0, 0.03)",
          border: "1px solid #E7DCC9",
        }}
      >
        {/* Status bar – always visible, no fade */}
        <div className="w-full flex items-center justify-center flex-shrink-0" role="presentation" aria-hidden>
          <Image
            src={statusBarImage}
            alt=""
            width={402}
            height={54}
            className="w-full h-auto block"
            style={{ maxWidth: "100%" }}
            priority
          />
        </div>
        {/* Content below status bar: fades out when leaving, fades in when returning */}
        <div
          ref={frameRef}
          className={`flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-hide ${isLeaving ? "fade-out-quick" : "fade-in-quick"}`}
          onAnimationEnd={handleFadeOutEnd}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Top bar: 24px horizontal padding, 32pt top, 20pt bottom */}
          <nav
          className="flex items-center justify-between w-full"
          style={{
            paddingTop: 32,
            paddingBottom: 20,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 65 41"
            fill="none"
            className="flex-shrink-0"
            style={{ width: 65, height: 40.553 }}
            aria-label="tangle"
          >
            <path d="M46.9798 21.5656C44.554 23.9555 43.1978 24.4304 43.1978 24.4304H41.7877C41.1762 27.7696 41.7381 27.0298 43.1978 26.0414C44.2523 25.3273 45.8425 24.4304 46.9798 23.0987L49.1128 22.2858C49.2831 20.7531 49.7152 18.8705 46.9798 21.5656Z" fill="#423530"/>
            <path d="M10.8439 9.24056C13.3795 9.17463 19.558 6.35898 21.8972 8.15188C23.7299 9.55615 22.318 13.371 21.1214 12.2601C19.9281 11.1522 11.751 12.1389 10.0061 12.9446C10.0061 12.9446 7.49861 19.0177 7.16874 22.9878C7.16874 25.5986 9.22298 23.1188 9.58609 22.4903C10.1177 21.5687 10.2341 20.5732 10.5907 19.5898C12.2832 14.9221 15.0188 12.0597 18.6366 12.9446C22.4509 13.8775 19.5819 20.0929 19.3857 22.5562C19.3573 22.9121 19.0104 23.4477 19.3857 23.6114C19.9378 23.6227 20.7435 22.5694 21.1214 21.6047C22.8277 17.2486 21.7743 13.2769 24.3988 12.9446C25.7706 12.7712 26.0691 14.0029 25.8228 14.9221C25.4094 16.4648 24.9161 18.305 24.9161 18.305C25.6274 15.6503 28.8609 11.1878 32.0586 12.7126C35.2823 14.2497 32.2279 19.4131 32.0586 21.8578C32.0104 22.5555 32.1546 23.3329 33.0305 22.8843C33.6273 22.579 34.2263 21.2437 34.3464 20.4491C34.5588 19.0442 34.6786 18.3308 34.9898 16.949C35.8004 13.349 38.6423 9.84115 43.3607 12.5653C44.0527 12.0178 46.1039 11.3766 46.65 12.5653C46.9896 13.3029 46.0392 14.817 45.8902 15.6458C44.5973 22.8275 44.4541 31.8811 38.8228 37.2165C35.8332 40.0488 32.0586 41.0771 27.9699 40.3046C24.4529 39.6403 21.5408 37.0825 23.1014 33.2393C24.2922 30.3057 32.8303 28.5304 41.774 25.0913C46.6255 22.5201 42.6312 26.6532 42.6312 26.6532C42.6312 26.6532 31.165 30.7613 28.2841 32.9983C26.3457 34.5027 26.5704 36.5443 29.205 36.7927C36.4565 37.477 39.3028 31.031 40.6162 23.6114C40.5476 23.5349 37.1403 28.1173 34.6762 23.6114C32.8715 25.0369 31.0574 27.051 28.9532 25.8361C26.4828 23.6837 30.5332 17.0311 29.205 16.1821C26.711 15.4449 25.6513 25.1858 23.7341 26.1707C22.5976 26.7552 21.4393 25.7571 21.1214 24.5506C19.5968 26.522 17.1725 27.2074 16.1309 24.7527C14.2799 26.9177 11.7732 27.5023 10.0061 24.7527C8.41029 27.6652 5.06366 28.336 3.46034 25.559C1.7561 22.6071 5.03918 12.82 5.03918 12.82C2.97647 12.7194 0.348976 13.5253 0.018186 10.8547C-0.169063 9.34705 1.12052 8.67951 2.46546 8.9506C4.21589 9.3034 6.14314 9.23485 6.14314 9.23485C6.72505 7.47568 7.15739 4.86177 8.89001 3.89702C9.72775 3.43056 10.8154 3.58768 11.4146 4.35778C12.4356 5.66974 10.8431 9.24056 10.8431 9.24056H10.8439ZM41.0388 14.0974C39.0004 14.2974 37.4229 19.6535 38.174 21.3164C38.5306 22.1068 39.3895 21.8137 39.8943 21.3367C41.0388 20.8101 42.0979 16.8001 41.9742 15.2509C41.9319 14.7177 41.6966 14.0339 41.0388 14.0982V14.0974ZM17.1771 15.6538C16.919 15.3941 16.209 15.9843 16.0234 16.1821C14.8259 17.4537 13.8424 20.2451 13.6705 21.9644C13.5769 22.9015 13.7308 24.1917 14.7477 22.9878C15.7531 21.7976 16.634 18.801 17.0354 17.2486C17.1159 16.936 17.401 15.8784 17.1771 15.6538Z" fill="#423530"/>
            <path d="M59.1519 21.8204C58.7619 23.6366 60.4545 24.1111 61.7212 22.8444C63.1587 21.407 63.2714 18.8935 64.477 19.9048C65.3945 20.6745 64.9069 22.3462 64.5064 22.9714C62.3798 26.2921 57.5301 27.1916 55.4198 23.3777C54.8638 23.9459 54.3021 24.5199 53.6206 24.9398C51.2727 26.3848 47.8908 26.1479 47.0433 23.1294C45.9277 19.1581 49.6815 -0.0368366 56.0687 0.000114312C62.2416 0.0361393 57.7973 10.4987 54.2595 16.6264C53.3055 18.2789 50.8844 20.491 51.1116 21.9913C51.4096 23.9728 54.1169 22.2253 54.7702 21.4255C55.2775 20.8045 55.0869 20.4552 55.1886 19.7291C55.643 16.4971 57.9787 10.9054 61.9825 11.2839C64.5381 11.5257 64.9949 14.2943 64.3793 16.336C63.6426 18.7774 61.3973 20.7621 59.1519 21.8204ZM55.5824 4.60369C55.6548 3.85229 55.7357 3.2515 55.1756 4.0965C53.1095 7.21269 50.9029 17.2326 50.9029 17.2326C52.3792 15.0522 55.1448 9.15834 55.5824 4.60369ZM59.1901 19.5816C60.946 19.1111 61.9985 16.1296 62.1177 15.4861C62.2718 14.6546 61.9174 13.6553 61.0602 14.5915C60.661 15.0272 59.1893 16.8179 59.1893 19.5816H59.1901Z" fill="#423530"/>
          </svg>
          <div className="flex items-center gap-1">
            {/* Help: question in speech bubble – 46×46, drop-shadow */}
            <button
              className="flex items-center justify-center flex-shrink-0 rounded-[20px] bg-white transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              style={{
                width: 46,
                height: 46,
                filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))",
              }}
              aria-label="Help"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="10 6 46 46"
                width={46}
                height={46}
                fill="none"
                className="block"
                aria-hidden
              >
                <path
                  d="M39.9209 21.0001C40.4072 21.0002 40.8236 21.1733 41.1699 21.5196C41.5163 21.8659 41.6894 22.2823 41.6895 22.7686V33.3829C41.6894 33.8692 41.5163 34.2855 41.1699 34.6319C40.8236 34.9783 40.4072 35.1513 39.9209 35.1514H27.5381L25.5039 37.1856C25.2239 37.4656 24.903 37.5287 24.542 37.3741C24.1809 37.2193 24.0001 36.9428 24 36.545V22.7686C24.0001 22.2823 24.1732 21.8659 24.5195 21.5196C24.8659 21.1733 25.2823 21.0002 25.7686 21.0001H39.9209ZM25.7686 34.378L26.7861 33.3829H39.9209V22.7686H25.7686V34.378ZM32.7852 30.1915C33.0115 30.1915 33.1918 30.2629 33.3262 30.4044C33.4604 30.5458 33.5273 30.7335 33.5273 30.9669C33.5272 31.1931 33.4568 31.3735 33.3154 31.5079C33.181 31.6422 32.9971 31.709 32.7637 31.709C32.5374 31.709 32.3534 31.6422 32.2119 31.5079C32.0775 31.3664 32.0098 31.1788 32.0098 30.9454C32.0098 30.719 32.0812 30.5388 32.2227 30.4044C32.3642 30.2628 32.5517 30.1915 32.7852 30.1915ZM32.8799 24.1944C33.1912 24.1944 33.4858 24.2374 33.7617 24.3223C34.0444 24.4001 34.2882 24.5239 34.4932 24.6934C34.7053 24.8561 34.8719 25.0685 34.9922 25.3301C35.1195 25.5848 35.1836 25.8822 35.1836 26.2217C35.1836 26.4199 35.1552 26.6047 35.0986 26.7745C35.0491 26.9371 34.9749 27.0928 34.876 27.2413C34.777 27.3897 34.6634 27.5308 34.5361 27.6651C34.4159 27.7995 34.2777 27.9377 34.1221 28.0792L33.708 28.462C33.6091 28.5609 33.5348 28.6562 33.4854 28.7481C33.4429 28.84 33.4219 28.9426 33.4219 29.0557V29.1729C33.4218 29.3497 33.3578 29.4916 33.2305 29.5977C33.1103 29.6965 32.9618 29.7461 32.7852 29.7462C32.5872 29.7462 32.4279 29.6892 32.3076 29.5762C32.1873 29.463 32.127 29.3139 32.127 29.1299V28.8751C32.127 28.6488 32.1517 28.4437 32.2012 28.2598C32.2507 28.0688 32.3642 27.8923 32.541 27.7296L33.0186 27.2833C33.1317 27.1843 33.2269 27.0954 33.3047 27.0176C33.3895 26.9328 33.461 26.8522 33.5176 26.7745C33.5741 26.6967 33.6162 26.6115 33.6445 26.5196C33.6799 26.4276 33.6973 26.3242 33.6973 26.211C33.6972 26.0909 33.6762 25.9845 33.6338 25.8926C33.5914 25.7938 33.5345 25.7121 33.4639 25.6485C33.3932 25.5779 33.3079 25.5246 33.209 25.4893C33.1101 25.4541 33 25.4366 32.8799 25.4366C32.6891 25.4367 32.5269 25.4797 32.3926 25.5645C32.2582 25.6494 32.1621 25.762 32.1055 25.9034C32.0489 26.0307 31.9674 26.1332 31.8613 26.211C31.7553 26.2888 31.6316 26.3281 31.4902 26.3282C31.278 26.3282 31.1078 26.2641 30.9805 26.1368C30.8533 26.0024 30.7891 25.8293 30.7891 25.6172C30.7891 25.4121 30.8459 25.2245 30.959 25.0547C31.0722 24.8779 31.225 24.7251 31.416 24.5977C31.6069 24.4706 31.8259 24.3715 32.0732 24.3008C32.3278 24.2301 32.597 24.1944 32.8799 24.1944Z"
                  fill="#423530"
                />
              </svg>
            </button>
            {/* Notifications – bell icon */}
            <button
              className="flex items-center justify-center flex-shrink-0 rounded-[20px] bg-white transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              style={{
                width: 46,
                height: 46,
                filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))",
              }}
              aria-label="Alerts"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 19"
                width={15}
                height={19}
                fill="none"
                className="block"
                aria-hidden
              >
                <path
                  d="M0.95 16.15C0.680833 16.15 0.455208 16.059 0.273125 15.8769C0.0910417 15.6948 0 15.4692 0 15.2C0 14.9308 0.0910417 14.7052 0.273125 14.5231C0.455208 14.341 0.680833 14.25 0.95 14.25H1.9V7.6C1.9 6.28583 2.29583 5.11812 3.0875 4.09687C3.87917 3.07562 4.90833 2.40667 6.175 2.09V1.425C6.175 1.02917 6.31354 0.692708 6.59062 0.415625C6.86771 0.138542 7.20417 0 7.6 0C7.99583 0 8.33229 0.138542 8.60938 0.415625C8.88646 0.692708 9.025 1.02917 9.025 1.425V2.09C10.2917 2.40667 11.3208 3.07562 12.1125 4.09687C12.9042 5.11812 13.3 6.28583 13.3 7.6V14.25H14.25C14.5192 14.25 14.7448 14.341 14.9269 14.5231C15.109 14.7052 15.2 14.9308 15.2 15.2C15.2 15.4692 15.109 15.6948 14.9269 15.8769C14.7448 16.059 14.5192 16.15 14.25 16.15H0.95ZM7.6 19C7.0775 19 6.63021 18.814 6.25812 18.4419C5.88604 18.0698 5.7 17.6225 5.7 17.1H9.5C9.5 17.6225 9.31396 18.0698 8.94187 18.4419C8.56979 18.814 8.1225 19 7.6 19ZM3.8 14.25H11.4V7.6C11.4 6.555 11.0279 5.66042 10.2837 4.91625C9.53958 4.17208 8.645 3.8 7.6 3.8C6.555 3.8 5.66042 4.17208 4.91625 4.91625C4.17208 5.66042 3.8 6.555 3.8 7.6V14.25Z"
                  fill="#423530"
                />
              </svg>
            </button>
            {/* Messages + badge – envelope icon */}
            <div className="relative flex-shrink-0">
              <button
                className="flex items-center justify-center rounded-[20px] bg-white transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                style={{
                  width: 46,
                  height: 46,
                  filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))",
                }}
                aria-label="Inbox"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="10 6 46 46"
                  width={46}
                  height={46}
                  fill="none"
                  className="block"
                  aria-hidden
                >
                  <path
                    d="M26 36C25.5187 36 25.1068 35.8286 24.7641 35.4859C24.4214 35.1432 24.25 34.7312 24.25 34.25V23.75C24.25 23.2687 24.4214 22.8568 24.7641 22.5141C25.1068 22.1714 25.5187 22 26 22H40C40.4812 22 40.8932 22.1714 41.2359 22.5141C41.5786 22.8568 41.75 23.2687 41.75 23.75V34.25C41.75 34.7312 41.5786 35.1432 41.2359 35.4859C40.8932 35.8286 40.4812 36 40 36H26ZM40 25.5L33.4594 29.5906C33.3865 29.6344 33.3099 29.6672 33.2297 29.6891C33.1495 29.7109 33.0729 29.7219 33 29.7219C32.9271 29.7219 32.8505 29.7109 32.7703 29.6891C32.6901 29.6672 32.6135 29.6344 32.5406 29.5906L26 25.5V34.25H40V25.5ZM33 28.125L40 23.75H26L33 28.125ZM26 25.7188V24.4281V24.45V24.4391V25.7188Z"
                    fill="#423530"
                  />
                </svg>
              </button>
              {notifications > 0 && (
                <span
                  className="badge-pop-in absolute flex flex-col items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    top: -8,
                    right: -8,
                    width: 24,
                    height: 24,
                    padding: "0 6px",
                    borderRadius: 10,
                    backgroundColor: "#DA5F3D",
                    fontSize: 12,
                  }}
                >
                  {notifications}
                </span>
              )}
            </div>
          </div>
        </nav>

        {/* Content: 24px horizontal padding */}
        <div
          className="flex flex-col w-full"
          style={{ paddingLeft: 24, paddingRight: 24 }}
        >
          {/* Greeting: type out "Welcome, Courtney" then static */}
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
              <>Welcome, Courtney</>
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
            ) : !isFirstTimeLoading ? (
              <>
                Your day had <span className="font-bold">4 things</span>. Reflect
                and get your daily insight <span className="align-text-top">✨</span>
              </>
            ) : null}
          </p>

          {/* Card grid: only show cards during loading (pulse) or cardsEnter (stagger). Unmount during instruction so cards mount fresh for stagger. */}
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
                /* Placeholder: no cards during welcome or instruction so cards mount fresh for loading (pulse) and cardsEnter (stagger) */
                Array.from({ length: TOTAL_CARDS }, (_, i) => i).map((slotIndex) => (
                  <div key={slotIndex} style={{ width: 189, height: 252 }} aria-hidden />
                ))
              ) : (
              Array.from({ length: TOTAL_CARDS }, (_, i) => i).map((slotIndex) => {
                lastDragStateRef.current = { draggingSlot, arrivalSlot };
                const isRecentlySettled = recentlySettledSlotsRef.current.includes(slotIndex);
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
                /* Hide the original card when it's being expanded/dragged as overlay */
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

          {/* Bottom padding so content doesn't touch edge */}
          <div style={{ height: 32 }} />
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

          /* When closing from a pull, skip CSS keyframe (it starts at opacity:1 causing a flash)
             and use inline opacity + transition instead */
          let blanketClass = "absolute inset-0 z-20";
          let blanketStyle = { backgroundColor: "#EEE1C4" };

          if (closingFromPull) {
            if (expandingCard.phase === "closing-start") {
              blanketStyle.opacity = pullDismissOpacity;
            } else {
              /* closing phase: transition opacity to 0 from wherever it was */
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

            <a
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
            </a>
          </div>
          );
        })()}

        {/* Card overlay: transitions between small card and expanded card */}
        {expandingCard && (() => {
          const atFinal = expandingCard.phase === "expanding" || expandingCard.phase === "open";
          const pullDist = Math.sqrt(pullOffset.x * pullOffset.x + pullOffset.y * pullOffset.y);
          const pulling = pullDist > 0 && expandingCard.phase === "open";
          const pullScale = pulling ? Math.max(0.85, 1 - pullDist / 1200) : 1;
          /* Subtle rotation based on horizontal drag — feels more physical */
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
      </main>
    </div>
  );
}
