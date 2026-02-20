"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import statusBarImage from "../assets/Status bar.png";
import NavBar from "../components/NavBar";

const PROMPT_TEXT = "So, how'd your day go?";
const FOLLOW_UP_TEXT = "Nice work on the stretch and the shift!\n\nWhat made you want to bring up the trip with Michael today?";
const USER_TEXT_2 = "We haven't planned something just for us in a while. Since the surgery it's been all about recovery. Felt nice to think about something fun, maybe Hawaii";
const FOLLOW_UP_2_TEXT = "Weeks of focusing on getting better, and now you're starting to look ahead again. 3 weeks in a row you've shown up for your Wife thread, and this is your first mention of fun since January. Something's changing, Courtney 🖤\n\nI'll put together some ideas for your first trip to Hawaii since the honeymoon. Check your Feed in the morning ☀️\n\nRest up, Courtney!";
const TYPEWRITER_MS = 22;

/** Screen center (main 402×874); card 189×252 → top-left for centered card */
const SCREEN_CENTER_X = 402 / 2 - 189 / 2;
const SCREEN_CENTER_Y = 874 / 2 - 252 / 2;
/** All cards fly to center with vertical offsets; keep rotations (deg) */
const FINAL_POSITIONS = [
  { left: SCREEN_CENTER_X + 10, top: SCREEN_CENTER_Y + 50, rotate: 5.099 },   /* card 1: 10px right, 50px lower */
  { left: SCREEN_CENTER_X, top: SCREEN_CENTER_Y + 90, rotate: -14.158 }, /* card 2: 60px lower, 10° left */
  { left: SCREEN_CENTER_X, top: SCREEN_CENTER_Y - 10, rotate: 0 },      /* card 3: 10px higher */
  { left: SCREEN_CENTER_X, top: SCREEN_CENTER_Y - 50, rotate: 11.82 }, /* card 4: 50px higher, 20° right */
];
const TOGETHER_START_MS = 4000;
const TOGETHER_TRANSITION_MS = 500;
const SNAP_BACK_MS = 280;
const REFLECTION_STATE_KEY = "reflectionState";

const backIcon = (
  <svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="block" aria-hidden>
    <path d="M0 8.47656C0 8.23242 0.0878906 8.00781 0.273438 7.83203L8.01758 0.253906C8.18359 0.0878906 8.39844 0 8.65234 0C9.16016 0 9.55078 0.380859 9.55078 0.888672C9.55078 1.13281 9.44336 1.35742 9.28711 1.52344L2.17773 8.47656L9.28711 15.4297C9.44336 15.5957 9.55078 15.8105 9.55078 16.0645C9.55078 16.5723 9.16016 16.9531 8.65234 16.9531C8.39844 16.9531 8.18359 16.8652 8.01758 16.6895L0.273438 9.12109C0.0878906 8.93555 0 8.7207 0 8.47656Z" fill="#423530" />
  </svg>
);

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

const CARD_LABELS = [
  "Courtney's intention",
  "Courtney's reflection",
  "Courtney's photo",
  "Courtney's photo",
];

const cardLabelStyle = {
  fontFamily: "var(--font-din-rounded), sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: "#423530",
};

function TypewriterText({ text }) {
  return text.split("").map((char, i) =>
    char === "\n" ? <br key={i} /> : <span key={i} className="typewriter-letter">{char}</span>
  );
}

export default function ReflectionPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [together, setTogether] = useState(false);
  const [togetherPositions, setTogetherPositions] = useState(null);
  const [finalPositionsApplied, setFinalPositionsApplied] = useState(false);
  const [stackHovered, setStackHovered] = useState(false);
  const [isSnappingBack, setIsSnappingBack] = useState(false);
  const [dimmedCards, setDimmedCards] = useState([]);
  const [hasSnappedBack, setHasSnappedBack] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [showSecondExchange, setShowSecondExchange] = useState(false);
  const [promptSlidingAway, setPromptSlidingAway] = useState(false);
  const [firstExchangeSlidingAway, setFirstExchangeSlidingAway] = useState(false);
  const [micButtonHidden, setMicButtonHidden] = useState(false);
  const [micPressed, setMicPressed] = useState(false);
  const [exitingToInsight, setExitingToInsight] = useState(false);
  const [followUpTyped, setFollowUpTyped] = useState("");
  const [followUp2Typed, setFollowUp2Typed] = useState("");
  const slideRef = useRef(null);
  const slideAwayDuration = 350;
  const delayBeforeWhiteBoxMs = 500;
  const mainRef = useRef(null);
  const cardsSectionRef = useRef(null);
  const cardRef0 = useRef(null);
  const cardRef1 = useRef(null);
  const cardRef2 = useRef(null);
  const cardRef3 = useRef(null);
  const stackLeaveTimeoutRef = useRef(null);
  const hasRestoredRef = useRef(false);
  const followUp2TypewriterStartedRef = useRef(false);

  /* Restore reflection state when returning via "Continue my reflection" */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(REFLECTION_STATE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      localStorage.removeItem(REFLECTION_STATE_KEY);
      hasRestoredRef.current = true;
      setTypedPrompt(s.typedPrompt ?? "");
      setShowTranscription(s.showTranscription ?? false);
      setShowSecondExchange(s.showSecondExchange ?? false);
      setMicButtonHidden(s.micButtonHidden ?? false);
      setFollowUpTyped(s.followUpTyped ?? "");
      setFollowUp2Typed(s.followUp2Typed ?? "");
      if (s.hasSnappedBack) setHasSnappedBack(true);
      setTogether(true);
      setTogetherPositions(FINAL_POSITIONS);
      setFinalPositionsApplied(true);
    } catch (_) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (hasRestoredRef.current) return;
    let intervalId = null;
    const startId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        if (i <= PROMPT_TEXT.length) {
          setTypedPrompt(PROMPT_TEXT.slice(0, i));
          i++;
        } else if (intervalId) clearInterval(intervalId);
      }, TYPEWRITER_MS);
    }, 1500);
    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (hasRestoredRef.current) return;
    const startTogether = () => {
      const main = mainRef.current;
      const refs = [cardRef0, cardRef1, cardRef2, cardRef3];
      if (!main || refs.some((r) => !r.current)) return;
      const mainRect = main.getBoundingClientRect();
      const initial = refs.map((r) => {
        const rect = r.current.getBoundingClientRect();
        return { left: rect.left - mainRect.left, top: rect.top - mainRect.top };
      });
      setTogether(true);
      setTogetherPositions(initial);
    };
    const id = setTimeout(startTogether, TOGETHER_START_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!together || togetherPositions == null) return;
    const id = setTimeout(() => setFinalPositionsApplied(true), 50);
    return () => clearTimeout(id);
  }, [together, togetherPositions]);

  /* Clear dimmed state when cards come together again */
  useEffect(() => {
    if (together) setDimmedCards([]);
  }, [together]);

  /* Follow-up typewriter: starts after transcription is shown */
  useEffect(() => {
    if (!showTranscription || hasRestoredRef.current) return;
    let intervalId = null;
    const startId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        if (i <= FOLLOW_UP_TEXT.length) {
          setFollowUpTyped(FOLLOW_UP_TEXT.slice(0, i));
          i++;
        } else if (intervalId) clearInterval(intervalId);
      }, TYPEWRITER_MS);
    }, 1000);
    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [showTranscription]);

  /* Second exchange typewriter: starts 1s after second user box appears (only once per showSecondExchange) */
  useEffect(() => {
    if (!showSecondExchange || hasRestoredRef.current) return;
    if (followUp2TypewriterStartedRef.current) return;
    followUp2TypewriterStartedRef.current = true;
    let intervalId = null;
    const startId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        if (i <= FOLLOW_UP_2_TEXT.length) {
          setFollowUp2Typed(FOLLOW_UP_2_TEXT.slice(0, i));
          i++;
        } else if (intervalId) clearInterval(intervalId);
      }, TYPEWRITER_MS);
    }, 1000);
    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [showSecondExchange]);

  const handleBack = useCallback(
    (e) => {
      e.preventDefault();
      if (isExiting) return;
      const hasProgress =
        showTranscription ||
        followUpTyped.length > 0 ||
        showSecondExchange ||
        followUp2Typed.length > 0 ||
        micButtonHidden;
      if (hasProgress && typeof window !== "undefined") {
        try {
          localStorage.setItem(
            REFLECTION_STATE_KEY,
            JSON.stringify({
              typedPrompt,
              showTranscription,
              showSecondExchange,
              micButtonHidden,
              followUpTyped,
              followUp2Typed,
              hasSnappedBack,
            })
          );
        } catch (_) {
          /* ignore */
        }
      }
      setIsExiting(true);
    },
    [
      isExiting,
      showTranscription,
      followUpTyped,
      showSecondExchange,
      followUp2Typed,
      micButtonHidden,
      typedPrompt,
      hasSnappedBack,
    ]
  );

  const handleAnimationEnd = useCallback(
    (e) => {
      if (e.target !== slideRef.current) return;
      if (e.animationName === "slide-out-to-right") {
        router.push("/");
        return;
      }
    },
    [router]
  );

  const handleStackMouseEnter = useCallback(() => {
    if (stackLeaveTimeoutRef.current) clearTimeout(stackLeaveTimeoutRef.current);
    setStackHovered(true);
  }, []);

  const handleStackMouseLeave = useCallback(() => {
    stackLeaveTimeoutRef.current = setTimeout(() => setStackHovered(false), 50);
  }, []);

  const handleStackClick = useCallback(() => {
    if (isSnappingBack || !finalPositionsApplied) return;
    setIsSnappingBack(true);
    setFinalPositionsApplied(false);
    setTimeout(() => {
      setTogether(false);
      setHasSnappedBack(true);
      setIsSnappingBack(false);
    }, SNAP_BACK_MS + 50);
  }, [isSnappingBack, finalPositionsApplied]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E3DED4]">
      {/* Phone frame – fixed; only content inside slides */}
      <main
        ref={mainRef}
        className={`ios-frame relative overflow-hidden rounded-[60px] flex flex-col transition-colors duration-1000 ease-out ${exitingToInsight ? "bg-black" : "bg-[#EEE1C4]"}`}
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
        {/* All content (status bar + slide) fades to 0% together over 1s when going to insight */}
        <div
          className={`flex flex-col flex-1 min-h-0 transition-opacity duration-1000 ease-out ${exitingToInsight ? "opacity-0" : "opacity-100"}`}
        >
          <div className="w-full flex justify-center flex-shrink-0" role="presentation" aria-hidden>
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

          {/* Content area: clip so slide happens inside frame */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {/* iOS-style: slide in from right; on back, slide out to right then navigate */}
            <div
              ref={slideRef}
              className={`w-full h-full flex flex-col absolute inset-0 ${
                isExiting ? "slide-out-to-right" : "slide-in-from-right"
              }`}
            onAnimationEnd={handleAnimationEnd}
          >
            {/* Header: back button (48×48, padding 11.5 13.8) + title */}
            <header
              className="flex items-center justify-between w-full flex-shrink-0 relative"
              style={{
                paddingTop: 24,
                paddingBottom: 20,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            >
              <Link
                href="/"
                onClick={handleBack}
                className="flex justify-center items-center transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex-shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  padding: "11.5px 13.8px",
                  gap: 13.8,
                  aspectRatio: "1/1",
                  background: "rgba(255, 255, 255, 0.80)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  borderRadius: 20,
                }}
                aria-label="Back"
              >
                {backIcon}
              </Link>
              <h1
                className="text-[#423530] absolute left-1/2 -translate-x-1/2"
                style={{
                  color: "#423530",
                  textAlign: "center",
                  fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                  fontSize: 20,
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "98%",
                  letterSpacing: -0.4,
                }}
              >
                Evening reflection
              </h1>
              <div style={{ width: 48, flexShrink: 0 }} aria-hidden />
            </header>

          {/* Content – no outer padding so cards can sit 8px from screen edge */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {showTranscription ? (
              /* Newest exchange at top; previous slides away then sits below. Scrollable. Chat container moved up 10px. */
              <div className="flex flex-col flex-1 min-h-0 pt-6 overflow-y-auto" style={{ marginTop: -10 }}>
                {firstExchangeSlidingAway ? (
                  /* Only first exchange visible, sliding down and fading out */
                  <div className="slide-up-out flex flex-col flex-shrink-0">
                    <div className="flex justify-end flex-shrink-0" style={{ paddingRight: 20, paddingLeft: 24 }}>
                      <div
                        style={{
                          display: "flex",
                          width: 275,
                          padding: 16,
                          justifyContent: "flex-end",
                          alignItems: "flex-start",
                          gap: 16,
                          borderRadius: 22,
                          background: "rgba(255, 255, 255, 0.80)",
                        }}
                      >
                        <p
                          style={{
                            color: "#423530",
                            fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                            fontSize: 16,
                            fontStyle: "normal",
                            fontWeight: 600,
                            lineHeight: "98%",
                            letterSpacing: -0.32,
                            flex: "1 0 0",
                            alignSelf: "stretch",
                            margin: 0,
                          }}
                        >
                          Talked to Michael about the trip — he&apos;s excited. Skipped the stretch but that&apos;s okay. Long shift but a good one. Feeling more like myself lately.
                        </p>
                      </div>
                    </div>
                    <p
                      className="flex-shrink-0 min-h-[52px]"
                      style={{
                        color: "#423530",
                        fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                        fontSize: 24,
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "110%",
                        letterSpacing: -0.48,
                        width: 305,
                        marginTop: 24,
                        marginBottom: 0,
                        marginLeft: 30,
                        paddingLeft: 10,
                        paddingRight: 24,
                        whiteSpace: "pre-line",
                      }}
                      aria-live="polite"
                    >
                      <TypewriterText text={followUpTyped} />
                    </p>
                  </div>
                ) : showSecondExchange ? (
                  /* Second exchange only (previous content cleared); new user box at top; moved up 10px */
                  <div className="transcription-enter flex flex-col flex-shrink-0" style={{ marginTop: -10 }}>
                    <div className="flex justify-end flex-shrink-0" style={{ paddingRight: 20, paddingLeft: 24 }}>
                      <div
                        style={{
                          display: "flex",
                          width: 275,
                          padding: 16,
                          justifyContent: "flex-end",
                          alignItems: "flex-start",
                          gap: 16,
                          borderRadius: 22,
                          background: "rgba(255, 255, 255, 0.80)",
                        }}
                      >
                        <p
                          style={{
                            color: "#423530",
                            fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                            fontSize: 16,
                            fontStyle: "normal",
                            fontWeight: 600,
                            lineHeight: "98%",
                            letterSpacing: -0.32,
                            flex: "1 0 0",
                            alignSelf: "stretch",
                            margin: 0,
                          }}
                        >
                          {USER_TEXT_2}
                        </p>
                      </div>
                    </div>
                    <p
                      className="flex-shrink-0 min-h-[52px]"
                      style={{
                        color: "#423530",
                        fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                        fontSize: 24,
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "110%",
                        letterSpacing: -0.48,
                        width: 305,
                        marginTop: 24,
                        marginBottom: 0,
                        marginLeft: 30,
                        paddingLeft: 10,
                        paddingRight: 24,
                        whiteSpace: "pre-line",
                      }}
                      aria-live="polite"
                    >
                      <TypewriterText text={followUp2Typed} />
                      {followUp2Typed.length === 0 && (
                        <span className="cursor-blink" style={{ opacity: 0.9 }}>|</span>
                      )}
                    </p>
                  </div>
                ) : (
                  /* First exchange only; user box at top with transcription-enter; moved up 10px */
                  <div className="transcription-enter flex flex-col flex-shrink-0" style={{ marginTop: -10 }}>
                    <div className="flex justify-end flex-shrink-0" style={{ paddingRight: 20, paddingLeft: 24 }}>
                      <div
                        style={{
                          display: "flex",
                          width: 275,
                          padding: 16,
                          justifyContent: "flex-end",
                          alignItems: "flex-start",
                          gap: 16,
                          borderRadius: 22,
                          background: "rgba(255, 255, 255, 0.80)",
                        }}
                      >
                        <p
                          style={{
                            color: "#423530",
                            fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                            fontSize: 16,
                            fontStyle: "normal",
                            fontWeight: 600,
                            lineHeight: "98%",
                            letterSpacing: -0.32,
                            flex: "1 0 0",
                            alignSelf: "stretch",
                            margin: 0,
                          }}
                        >
                          Talked to Michael about the trip — he&apos;s excited. Skipped the stretch but that&apos;s okay. Long shift but a good one. Feeling more like myself lately.
                        </p>
                      </div>
                    </div>
                    <p
                      className="flex-shrink-0 min-h-[52px]"
                      style={{
                        color: "#423530",
                        fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                        fontSize: 24,
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "110%",
                        letterSpacing: -0.48,
                        width: 305,
                        marginTop: 24,
                        marginBottom: 0,
                        marginLeft: 30,
                        paddingLeft: 10,
                        paddingRight: 24,
                        whiteSpace: "pre-line",
                      }}
                      aria-live="polite"
                    >
                      <TypewriterText text={followUpTyped} />
                      {followUpTyped.length === 0 && (
                        <span className="cursor-blink" style={{ opacity: 0.9 }}>|</span>
                      )}
                    </p>
                  </div>
                )}

                <div style={{ minHeight: 24 }} />
              </div>
            ) : (
              <div className={promptSlidingAway ? "slide-up-out flex flex-col flex-1 min-h-0" : "flex flex-col flex-1 min-h-0"}>
                {/* So, how'd your day go? – typewriter; 10px lower, 5px right */}
                <p
                  className="text-[#423530] flex-shrink-0 min-h-[28px]"
                  style={{
                    color: "#423530",
                    fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                    fontSize: 24,
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "98%",
                    letterSpacing: -0.48,
                    marginBottom: 22,
                    marginTop: 10,
                    marginLeft: 30,
                    paddingLeft: 10,
                    paddingRight: 24,
                  }}
                  aria-live="polite"
                >
                  <TypewriterText text={typedPrompt} />
                  {typedPrompt.length === 0 && (
                    <span className="cursor-blink" style={{ opacity: 0.9 }}>|</span>
                  )}
                </p>

                {/* Cards: grid then "come together" to stacked positions */}
                <section
                  ref={cardsSectionRef}
                  className="flex-1 min-h-0 relative"
                  style={{ paddingLeft: 8, paddingRight: 8 }}
                >
                  <div
                    style={{
                      display: "grid",
                      rowGap: 8,
                      columnGap: 8,
                      gridTemplateRows: "repeat(4, 252px)",
                      gridTemplateColumns: "189px 189px",
                      visibility: together && togetherPositions ? "hidden" : "visible",
                      pointerEvents: together && togetherPositions ? "none" : "auto",
                    }}
                  >
                    {[1, 2, 3, 4].map((i) => {
                      const cardIndex = i - 1;
                      const isDimmed = dimmedCards.includes(cardIndex);
                      return (
                        <div
                          key={i}
                          ref={[cardRef0, cardRef1, cardRef2, cardRef3][cardIndex]}
                          role="button"
                          tabIndex={0}
                          className="card-enter transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer transition-opacity duration-200"
                          style={{
                            ...cardStyle,
                            animationDelay: `${3 + cardIndex * 0.12}s`,
                            animationFillMode: "backwards",
                            opacity: isDimmed ? 0.5 : 1,
                          }}
                          onClick={() => {
                            if (!together && hasSnappedBack) {
                              setDimmedCards((prev) =>
                                prev.includes(cardIndex) ? prev.filter((x) => x !== cardIndex) : [...prev, cardIndex]
                              );
                            }
                          }}
                          onKeyDown={(e) => {
                            if (!together && hasSnappedBack && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault();
                              setDimmedCards((prev) =>
                                prev.includes(cardIndex) ? prev.filter((x) => x !== cardIndex) : [...prev, cardIndex]
                              );
                            }
                          }}
                          aria-label={`Card ${i}`}
                        >
                          <span style={cardLabelStyle}>{CARD_LABELS[cardIndex]}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Bottom: mic button, or "See you daily insight" when typing is done (same slot) */}
          {!micButtonHidden && (
            <div
              className={`flex justify-center flex-shrink-0 ${showSecondExchange ? "fade-out-quick" : ""}`}
              style={{ paddingBottom: 40, paddingTop: 16 }}
            >
              <div className="relative flex items-center justify-center" style={{ width: 84, height: 84 }}>
                {/* Colorful glare behind mic when pressed */}
                <div
                  className={`mic-glare ${micPressed ? "mic-glare-active" : ""}`}
                  aria-hidden
                />
                <button
                  type="button"
                  className="relative z-10 flex items-center justify-center rounded-full transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                  style={{
                    width: 84,
                    height: 84,
                    backgroundColor: "#FFF",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                  aria-label="Voice input"
                  onPointerDown={() => setMicPressed(true)}
                  onPointerUp={() => {
                    setMicPressed(false);
                    if (!showTranscription) {
                      setPromptSlidingAway(true);
                      setTimeout(() => {
                        setTimeout(() => {
                          setShowTranscription(true);
                          setPromptSlidingAway(false);
                        }, delayBeforeWhiteBoxMs);
                      }, slideAwayDuration);
                    } else if (!showSecondExchange) {
                      setFirstExchangeSlidingAway(true);
                      setTimeout(() => {
                        setTimeout(() => {
                          setShowSecondExchange(true);
                          setFirstExchangeSlidingAway(false);
                          setTimeout(() => setMicButtonHidden(true), 250);
                        }, delayBeforeWhiteBoxMs);
                      }, slideAwayDuration);
                    }
                  }}
                  onPointerLeave={() => setMicPressed(false)}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#423530"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
                </button>
              </div>
            </div>
          )}
          {micButtonHidden && followUp2Typed.length === FOLLOW_UP_2_TEXT.length && (
            <div className="insight-btn-enter flex justify-center flex-shrink-0" style={{ paddingBottom: 40, paddingTop: 16 }}>
              <button
                type="button"
                className="insight-btn-breathe inline-flex justify-center items-center gap-2 transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                style={{
                  width: 340,
                  padding: 16,
                  borderRadius: 20,
                  background: "#FFF",
                  border: "none",
                }}
                aria-label="See you daily insight"
                onClick={() => {
                setExitingToInsight(true);
                setTimeout(() => {
                  router.push("/insight");
                  setExitingToInsight(false);
                }, 1000);
              }}
              >
                <span
                  style={{
                    color: "#423530",
                    textAlign: "center",
                    fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                    fontSize: 20,
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "normal",
                    letterSpacing: -0.4,
                  }}
                >
                  See you daily insight →
                </span>
              </button>
            </div>
          )}
          </div>
        </div>
        </div>
        {/* Bottom nav bar */}
        <NavBar activePage="ideas" />

        {/* "Come together" overlay: slides out with screen when back is tapped; hidden when transcription is shown */}
        {together && togetherPositions && !showTranscription && (
          <div
            className={`absolute inset-0 pointer-events-none ${isExiting ? "slide-out-to-right" : ""}`}
            aria-hidden
          >
            {[0, 1, 2, 3].map((i) => {
              const pos = finalPositionsApplied && !isSnappingBack ? FINAL_POSITIONS[i] : togetherPositions[i];
              const isFinal = finalPositionsApplied && !isSnappingBack;
              const stackScale = isFinal && stackHovered ? 1.05 : 1;
              const rotate = isFinal ? FINAL_POSITIONS[i].rotate : 0;
              return (
                <div
                  key={i}
                  className="pointer-events-auto cursor-pointer"
                  style={{
                      ...cardStyle,
                      position: "absolute",
                      left: pos.left,
                      top: pos.top,
                      zIndex: 4 - i,
                      transform: `scale(${stackScale}) rotate(${rotate}deg)`,
                      transition: isSnappingBack
                    ? `left ${SNAP_BACK_MS}ms ease-out, top ${SNAP_BACK_MS}ms ease-out, transform ${SNAP_BACK_MS}ms ease-out`
                    : `left ${TOGETHER_TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1), top ${TOGETHER_TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${TOGETHER_TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  }}
                  onMouseEnter={handleStackMouseEnter}
                  onMouseLeave={handleStackMouseLeave}
                  onClick={handleStackClick}
                  onKeyDown={(e) => e.key === "Enter" && handleStackClick()}
                  role="button"
                  tabIndex={0}
                  aria-label={`Card ${i + 1}`}
                >
                  <span style={cardLabelStyle}>{CARD_LABELS[i]}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
