"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import statusBarImage from "../../assets/Status bar.png";
import TypewriterText from "../../components/TypewriterText";
import { getCardById } from "../../components/cardContent";

const BackIcon = (
  <svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="block" aria-hidden>
    <path d="M0 8.47656C0 8.23242 0.0878906 8.00781 0.273438 7.83203L8.01758 0.253906C8.18359 0.0878906 8.39844 0 8.65234 0C9.16016 0 9.55078 0.380859 9.55078 0.888672C9.55078 1.13281 9.44336 1.35742 9.28711 1.52344L2.17773 8.47656L9.28711 15.4297C9.44336 15.5957 9.55078 15.8105 9.55078 16.0645C9.55078 16.5723 9.16016 16.9531 8.65234 16.9531C8.39844 16.9531 8.18359 16.8652 8.01758 16.6895L0.273438 9.12109C0.0878906 8.93555 0 8.7207 0 8.47656Z" fill="#423530" />
  </svg>
);

const SaveCalendarIcon = (
  <svg width="14" height="21" viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M1.46484 20.8105C0.576172 20.8105 0 20.1953 0 19.2188V2.99805C0 1.06445 1.05469 0 2.97852 0H10.4883C12.4121 0 13.4668 1.06445 13.4668 2.99805V19.2188C13.4668 20.1953 12.8906 20.8105 12.002 20.8105C11.4355 20.8105 11.0645 20.5566 10.3223 19.8242L6.80664 16.3281C6.76758 16.2891 6.69922 16.2891 6.66016 16.3281L3.1543 19.8242C2.41211 20.5469 2.03125 20.8105 1.46484 20.8105ZM2.5 17.1289L5.97656 13.7695C6.48438 13.2812 6.99219 13.2812 7.49023 13.7695L10.9668 17.1289C11.084 17.2461 11.2207 17.207 11.2207 17.0312V3.21289C11.2207 2.54883 10.918 2.24609 10.2539 2.24609H3.21289C2.54883 2.24609 2.24609 2.54883 2.24609 3.21289V17.0312C2.24609 17.207 2.38281 17.2461 2.5 17.1289Z" fill="#423530" />
  </svg>
);

const EXIT_DURATION_MS = 280;
const THINKING_DELAY_MS = 2600;

const FAKE_REPLIES = [
  "You're really onto something.",
  "I hear you. That matters.",
  "That takes courage to say.",
  "You're doing the work. Keep going.",
  "I believe in you.",
];

function getFakeReply() {
  return FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];
}

export default function CardPage() {
  const router = useRouter();
  const params = useParams();
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [replyInput, setReplyInput] = useState("");
  const [saveFlowActive, setSaveFlowActive] = useState(false);
  const [saveOptionsVisible, setSaveOptionsVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState(() => [8]);
  const nextMessageIdRef = useRef(1);
  const pendingTimeoutsRef = useRef([]);
  const lastMessageRef = useRef(null);
  const messagesSectionRef = useRef(null);
  const replyFieldRef = useRef(null);

  const createMessage = (role, text) => ({
    id: nextMessageIdRef.current++,
    role,
    text,
  });

  const appendMessage = (role, text) => {
    setMessages((prev) => [...prev, createMessage(role, text)]);
  };

  const scheduleTimeout = (cb, ms) => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter((t) => t !== id);
      cb();
    }, ms);
    pendingTimeoutsRef.current.push(id);
    return id;
  };

  const resizeReplyField = () => {
    const el = replyFieldRef.current;
    if (!el) return;
    if (!replyInput.trim()) {
      el.style.height = "56px";
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.max(56, Math.min(el.scrollHeight, 160))}px`;
  };

  useEffect(() => {
    resizeReplyField();
  }, [replyInput]);

  useEffect(
    () => () => {
      pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
      pendingTimeoutsRef.current = [];
    },
    []
  );

  const card = useMemo(() => getCardById(params?.id), [params?.id]);
  const hasContent = !!card?.hasContent;
  const threadName = card?.threadName || "Tangle";
  const label = card?.label || "";

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsEntering(false));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isExiting) return;
    const t = setTimeout(() => router.push("/"), EXIT_DURATION_MS);
    return () => clearTimeout(t);
  }, [isExiting, router]);

  useEffect(() => {
    if (messages.length === 0) return;
    const section = messagesSectionRef.current;
    const msg = lastMessageRef.current;
    if (!section || !msg) return;
    const scrollSoLastIsAtTop = () => {
      const sectionRect = section.getBoundingClientRect();
      const msgRect = msg.getBoundingClientRect();
      const targetScrollTop = Math.max(
        0,
        section.scrollTop + (msgRect.top - sectionRect.top)
      );
      section.scrollTop = targetScrollTop;
    };
    const t = setTimeout(scrollSoLastIsAtTop, 80);
    return () => clearTimeout(t);
  }, [messages]);

  const handleSendReply = () => {
    const text = replyInput.trim();
    if (!text) return;
    setReplyInput("");
    appendMessage("user", text);
    const reply = getFakeReply();
    scheduleTimeout(() => appendMessage("assistant", reply), THINKING_DELAY_MS);
  };

  const handleReplyKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendReply();
    }
  };

  const SAVE_BUTTONS_FADE_MS = 280;
  const handleSaveItClick = () => {
    setSaveFlowActive(true);
    setSaveOptionsVisible(false);
    appendMessage("assistant", "When do you want to save it to?");
  };

  useEffect(() => {
    if (!saveFlowActive) {
      setSaveOptionsVisible(false);
      return;
    }
    const t = setTimeout(() => setSaveOptionsVisible(true), SAVE_BUTTONS_FADE_MS);
    return () => clearTimeout(t);
  }, [saveFlowActive]);

  useEffect(() => {
    if (!isRecording) return;
    setWaveformHeights([8]);
    const heights = [4, 8, 12, 16, 20, 24, 28];
    const maxBars = 24;
    const interval = setInterval(() => {
      setWaveformHeights((prev) => {
        const newBar = heights[Math.floor(Math.random() * heights.length)];
        if (prev.length >= maxBars) return [...prev.slice(1), newBar];
        return [...prev, newBar];
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleVoiceClick = () => {
    if (isRecording) {
      setIsRecording(false);
      appendMessage("user", "I said this with my voice.");
      const reply = getFakeReply();
      scheduleTimeout(() => appendMessage("assistant", reply), THINKING_DELAY_MS);
    } else {
      setIsRecording(true);
    }
  };

  const SAVE_OPTIONS = [
    { label: "Today", replyText: "today" },
    { label: "This week", replyText: "this week" },
    { label: "Next week", replyText: "next week" },
  ];

  const handleSaveOptionClick = (option) => {
    appendMessage("user", option.label);
    setSaveFlowActive(false);
    setSaveOptionsVisible(false);
    scheduleTimeout(
      () => appendMessage("assistant", `Saved it for you to ${option.replyText}.`),
      THINKING_DELAY_MS
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
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

        <div
          className="flex-1 min-h-0 overflow-hidden relative"
          style={{
            opacity: isExiting ? 0 : isEntering ? 0 : 1,
            transform: isExiting ? "translateX(24px)" : isEntering ? "translateX(24px)" : "translateX(0)",
            transition: `opacity ${EXIT_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1), transform ${EXIT_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
          }}
        >
          <div className="w-full h-full absolute inset-0 flex flex-col" style={{ paddingBottom: 120 }}>
            <header
              className="relative z-10"
              style={{
                paddingTop: 24,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            >
              <button
                onClick={() => setIsExiting(true)}
                className="absolute left-6 top-6 flex items-center justify-center rounded-[20px] bg-white transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                style={{
                  width: 46,
                  height: 46,
                  filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))",
                }}
                aria-label="Back"
              >
                {BackIcon}
              </button>

              <button
                onClick={handleSaveItClick}
                className="absolute right-6 top-6 flex items-center justify-center rounded-[20px] bg-white transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                style={{
                  width: 46,
                  height: 46,
                  filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))",
                }}
                aria-label="Save it"
              >
                <svg width="11" height="17" viewBox="0 0 11 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M1.17188 16.6484C0.460938 16.6484 0 16.1562 0 15.375V2.39844C0 0.851562 0.84375 0 2.38281 0H8.39062C9.92969 0 10.7734 0.851562 10.7734 2.39844V15.375C10.7734 16.1562 10.3125 16.6484 9.60156 16.6484C9.14844 16.6484 8.85156 16.4453 8.25781 15.8594L5.44531 13.0625C5.41406 13.0312 5.35938 13.0312 5.32812 13.0625L2.52344 15.8594C1.92969 16.4375 1.625 16.6484 1.17188 16.6484ZM2 13.7031L4.78125 11.0156C5.1875 10.625 5.59375 10.625 5.99219 11.0156L8.77344 13.7031C8.86719 13.7969 8.97656 13.7656 8.97656 13.625V2.57031C8.97656 2.03906 8.73438 1.79688 8.20312 1.79688H2.57031C2.03906 1.79688 1.79688 2.03906 1.79688 2.57031V13.625C1.79688 13.7656 1.90625 13.7969 2 13.7031Z" fill="#423530"/>
                </svg>
              </button>

              <div className="w-full flex flex-col items-center justify-center pt-2">
                <div
                  style={{
                    color: "#423530",
                    textAlign: "center",
                    fontFamily: "var(--font-din-rounded), sans-serif",
                    fontSize: 16,
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "normal",
                    letterSpacing: -0.32,
                    textTransform: "uppercase",
                  }}
                >
                  {threadName}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#423530",
                    fontFamily: "var(--font-din-rounded), sans-serif",
                    fontSize: 12,
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "98%",
                    letterSpacing: -0.24,
                  }}
                >
                  {label}
                </div>
              </div>
            </header>

            <section
              ref={messagesSectionRef}
              style={{
                paddingLeft: 36,
                paddingRight: 36,
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                gap: 16,
              }}
            >
              {hasContent && (
                <TypewriterText
                  text={card.body}
                  cursor={card?.emoji || "•"}
                  charMs={36}
                  showEmoji={messages.length === 0}
                  textStyle={{
                    color: "#423530",
                    fontFamily: "var(--font-din-rounded), sans-serif",
                    fontSize: 24,
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "98%",
                    letterSpacing: -0.48,
                  }}
                  cursorStyle={{
                    marginLeft: 6,
                    color: "rgba(0, 0, 0, 0.20)",
                    fontFamily: '"SF Pro Rounded", sans-serif',
                    fontSize: 32,
                    fontWeight: 600,
                  }}
                />
              )}
              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div
                    key={msg.id}
                    ref={i === messages.length - 1 ? lastMessageRef : undefined}
                    style={{
                      alignSelf: "flex-end",
                      marginRight: 0,
                      maxWidth: "calc(100% - 36px)",
                    }}
                  >
                    <div
                      className="user-msg-enter"
                      style={{
                        display: "inline-flex",
                        minHeight: 46,
                        padding: "0 21.225px",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 13.225,
                        borderRadius: 20,
                        background: "#FFF",
                        boxShadow: "0 0 13.79px 0 rgba(255, 255, 255, 0.90) inset",
                      }}
                    >
                      <span
                        style={{
                          color: "#423530",
                          fontFamily: "var(--font-din-rounded), sans-serif",
                          fontSize: 18,
                          fontStyle: "normal",
                          fontWeight: 600,
                          lineHeight: "98%",
                          letterSpacing: -0.36,
                        }}
                      >
                        {msg.text}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    ref={i === messages.length - 1 ? lastMessageRef : undefined}
                    style={{ alignSelf: "flex-start", width: "100%" }}
                  >
                    <TypewriterText
                      text={msg.text}
                      cursor={card?.emoji || "•"}
                      charMs={36}
                      showEmoji={i === messages.length - 1}
                      textStyle={{
                        color: "#423530",
                        fontFamily: "var(--font-din-rounded), sans-serif",
                        fontSize: 24,
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "98%",
                        letterSpacing: -0.48,
                      }}
                      cursorStyle={{
                        marginLeft: 6,
                        color: "rgba(0, 0, 0, 0.20)",
                        fontFamily: '"SF Pro Rounded", sans-serif',
                        fontSize: 32,
                        fontWeight: 600,
                      }}
                    />
                  </div>
                )
              )}
              {messages.length > 0 && messages[messages.length - 1].role === "user" && (
                <div style={{ alignSelf: "flex-start", width: "100%", marginTop: 4 }} aria-hidden>
                  <span
                    className="thinking-emoji-pulse"
                    style={{
                      fontFamily: '"SF Pro Rounded", sans-serif',
                      fontSize: 32,
                      fontWeight: 600,
                      color: "#423530",
                      lineHeight: 1,
                      display: "block",
                    }}
                  >
                    {card?.emoji || "•"}
                  </span>
                </div>
              )}
            </section>

            <div
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                bottom: 48,
              }}
            >
              {saveFlowActive && saveOptionsVisible && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {SAVE_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
                      style={{
                        display: "flex",
                        width: "100%",
                        maxWidth: 350,
                        height: 55,
                        padding: "15.333px 18.4px",
                        alignItems: "center",
                        gap: 18.4,
                        borderRadius: 22,
                        background: "#F7F0E1",
                        border: "none",
                        cursor: "pointer",
                        color: "#423530",
                        fontFamily: "var(--font-din-rounded), sans-serif",
                        fontSize: 18,
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: "98%",
                        letterSpacing: -0.36,
                      }}
                      onClick={() => handleSaveOptionClick(option)}
                      aria-label={`Save to ${option.label}`}
                    >
                      {SaveCalendarIcon}
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "flex-end" }}>
                {isRecording ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      height: 56,
                      minHeight: 56,
                      width: "100%",
                      flex: "1 1 0",
                      paddingTop: 17.2,
                      paddingBottom: 17.2,
                      paddingLeft: 26.4,
                      paddingRight: 26.4,
                      borderRadius: 22,
                      background: "#FFF",
                      border: "none",
                      boxSizing: "border-box",
                    }}
                    aria-live="polite"
                    aria-label="Recording"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, height: 28, width: "100%" }}>
                      {waveformHeights.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: 2,
                            height: h,
                            background: "#423530",
                            borderRadius: 2,
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <textarea
                    ref={replyFieldRef}
                    placeholder="Reply to Tangle"
                    aria-label="Reply to Tangle"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={handleReplyKeyDown}
                    rows={1}
                    style={{
                      display: "block",
                      height: 56,
                      minHeight: 56,
                      maxHeight: 160,
                      width: "100%",
                      flex: "1 1 0",
                      paddingTop: 17.2,
                      paddingBottom: 17.2,
                      paddingLeft: 26.4,
                      paddingRight: 26.4,
                      borderRadius: 22,
                      background: "#F7F0E1",
                      border: "none",
                      outline: "none",
                      color: "#423530",
                      fontFamily: "var(--font-din-rounded), sans-serif",
                      fontSize: 18,
                      fontStyle: "normal",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      letterSpacing: -0.36,
                      resize: "none",
                      overflowY: "auto",
                      boxSizing: "border-box",
                    }}
                    className="reply-input-placeholder"
                  />
                )}

                <button
                  type="button"
                  className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    display: "flex",
                    width: 56,
                    height: 56,
                    padding: "15.333px 18.4px",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 18.4,
                    flexShrink: 0,
                    borderRadius: 22,
                    background: isRecording ? "#2a2a2a" : "rgba(255, 255, 255, 0.8)",
                    cursor: "pointer",
                    border: "none",
                  }}
                  aria-label={isRecording ? "Stop recording" : "Voice input"}
                  onClick={handleVoiceClick}
                >
                  <svg width="26" height="29" viewBox="0 0 26 29" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M10.3385 28.1768C9.64838 28.1768 9.11453 27.6299 9.11453 26.9528V1.23665C9.11453 0.559569 9.64838 -0.000326641 10.3385 -0.000326641C11.0416 -0.000326641 11.5755 0.559569 11.5755 1.23665V26.9528C11.5755 27.6299 11.0416 28.1768 10.3385 28.1768ZM19.4661 25.3252C18.763 25.3252 18.2291 24.7653 18.2291 24.0882V4.10124C18.2291 3.42415 18.763 2.85124 19.4661 2.85124C20.1562 2.85124 20.7031 3.42415 20.7031 4.10124V24.0882C20.7031 24.7653 20.1562 25.3252 19.4661 25.3252ZM5.78119 23.2549C5.09109 23.2549 4.55724 22.708 4.55724 22.0179V6.15853C4.55724 5.48144 5.09109 4.92155 5.78119 4.92155C6.48432 4.92155 7.01817 5.48144 7.01817 6.15853V22.0179C7.01817 22.708 6.48432 23.2549 5.78119 23.2549ZM14.9088 21.484C14.2057 21.484 13.6718 20.9502 13.6718 20.2601V7.91634C13.6718 7.23926 14.2057 6.67936 14.9088 6.67936C15.5989 6.67936 16.1458 7.23926 16.1458 7.91634V20.2601C16.1458 20.9502 15.5989 21.484 14.9088 21.484ZM24.0234 19.0101C23.3203 19.0101 22.7994 18.4632 22.7994 17.7731V10.4033C22.7994 9.72624 23.3203 9.16634 24.0234 9.16634C24.7135 9.16634 25.2604 9.72624 25.2604 10.4033V17.7731C25.2604 18.4632 24.7135 19.0101 24.0234 19.0101ZM1.2239 17.7731C0.533798 17.7731 -5.61085e-05 17.2132 -5.61085e-05 16.5361V11.6533C-5.61085e-05 10.9632 0.533798 10.4033 1.2239 10.4033C1.91401 10.4033 2.46088 10.9632 2.46088 11.6533V16.5361C2.46088 17.2132 1.91401 17.7731 1.2239 17.7731Z" fill={isRecording ? "#fff" : "#423530"}/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
