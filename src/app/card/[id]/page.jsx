"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import statusBarImage from "../../assets/Status bar.png";
import TypewriterText from "../../components/TypewriterText";
import { getCardById } from "../../components/cardContent";

const ACTION_BUTTON_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  flex: "1 1 0%",
  height: 46,
  borderRadius: 20,
  background: "rgba(255, 255, 255, 0.8)",
  color: "#423530",
  fontFamily: "var(--font-din-rounded), sans-serif",
  fontSize: 18,
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "98%",
  letterSpacing: -0.36,
  cursor: "pointer",
  border: "none",
};

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

const MicIcon = ({ active = false }) =>
  active ? (
    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M1.04492 8.26172C0.745443 8.26172 0.494792 8.16406 0.292969 7.96875C0.0976562 7.76693 0 7.51302 0 7.20703C0 6.91406 0.113932 6.65039 0.341797 6.41602L6.40625 0.341797C6.51693 0.23112 6.64062 0.146484 6.77734 0.0878906C6.92057 0.0292969 7.06706 0 7.2168 0C7.36654 0 7.51302 0.0292969 7.65625 0.0878906C7.79948 0.146484 7.92318 0.23112 8.02734 0.341797L14.0918 6.41602C14.3262 6.65039 14.4434 6.91406 14.4434 7.20703C14.4434 7.51302 14.3424 7.76693 14.1406 7.96875C13.9388 8.16406 13.6914 8.26172 13.3984 8.26172C13.2357 8.26172 13.0892 8.23242 12.959 8.17383C12.8288 8.11523 12.7148 8.03711 12.6172 7.93945L10.5273 5.86914L7.20703 2.13867L3.90625 5.86914L1.81641 7.93945C1.71875 8.03711 1.60482 8.11523 1.47461 8.17383C1.3444 8.23242 1.20117 8.26172 1.04492 8.26172ZM7.2168 17.5684C6.89128 17.5684 6.6276 17.4674 6.42578 17.2656C6.22396 17.0638 6.12305 16.7969 6.12305 16.4648V5.29297L6.25 2.16797C6.25 1.86849 6.33789 1.6276 6.51367 1.44531C6.69596 1.25651 6.93034 1.16211 7.2168 1.16211C7.50977 1.16211 7.74414 1.25651 7.91992 1.44531C8.10221 1.6276 8.19336 1.86849 8.19336 2.16797L8.31055 5.29297V16.4648C8.31055 16.7969 8.20964 17.0638 8.00781 17.2656C7.80599 17.4674 7.54232 17.5684 7.2168 17.5684Z" fill="currentColor" />
    </svg>
  ) : (
    <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3.0835 7.35352V3.14209C3.0835 1.30371 4.34326 0 6.07178 0C7.79297 0 9.06006 1.30371 9.06006 3.14209V7.35352C9.06006 9.20654 7.79297 10.4956 6.07178 10.4956C4.34326 10.4956 3.0835 9.20654 3.0835 7.35352ZM5.09766 7.43408C5.09766 8.10059 5.44189 8.64258 6.07178 8.64258C6.70166 8.64258 7.0459 8.10059 7.0459 7.43408V3.06152C7.0459 2.40234 6.70166 1.86035 6.07178 1.86035C5.44189 1.86035 5.09766 2.40967 5.09766 3.06152V7.43408ZM2.67334 16.3257C2.13135 16.3257 1.6626 15.8789 1.6626 15.3516C1.6626 14.8096 2.13135 14.3774 2.67334 14.3774H5.1416V13.4619C2.17529 13.103 0 11.001 0 7.80762V6.51855C0 5.98389 0.446777 5.57373 0.98877 5.57373C1.53809 5.57373 1.99219 5.98389 1.99219 6.51855V7.7417C1.99219 10.1001 3.73535 11.6235 6.07178 11.6235C8.4082 11.6235 10.1514 10.1001 10.1514 7.7417V6.51855C10.1514 5.98389 10.6055 5.57373 11.1475 5.57373C11.6968 5.57373 12.1436 5.98389 12.1436 6.51855V7.80762C12.1436 11.001 9.96826 13.103 6.99463 13.4619V14.3774H9.47021C10.0122 14.3774 10.4736 14.8096 10.4736 15.3516C10.4736 15.8789 10.0122 16.3257 9.47021 16.3257H2.67334Z" fill="currentColor" />
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
  const WAVEFORM_BAR_COUNT = 70;
  const WAVEFORM_IDLE = { height: 16, opacity: 0.2 };
  const initialWaveformBars = () =>
    Array.from({ length: WAVEFORM_BAR_COUNT }, () => ({ ...WAVEFORM_IDLE }));

  const [isRecording, setIsRecording] = useState(false);
  const [waveformBars, setWaveformBars] = useState(() => initialWaveformBars());
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
    appendMessage("user", "save it");
    scheduleTimeout(
      () => appendMessage("assistant", "When do you want to save it to?"),
      THINKING_DELAY_MS
    );
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
    if (!isRecording) {
      setWaveformBars(initialWaveformBars());
      return;
    }
    const heights = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    const interval = setInterval(() => {
      setWaveformBars((prev) => {
        const newBar = {
          height: heights[Math.floor(Math.random() * heights.length)],
          opacity: 1,
        };
        return [...prev.slice(1), newBar];
      });
    }, 80);
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

  const buttonsHidden = replyInput.length > 0 || saveFlowActive;

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
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    ...ACTION_BUTTON_STYLE,
                    transition: "transform 0.2s ease-out, opacity 0.25s ease",
                    transitionDelay: buttonsHidden ? "0ms" : "0ms",
                    opacity: buttonsHidden ? 0 : 1,
                    pointerEvents: buttonsHidden ? "none" : "auto",
                  }}
                  onClick={() => {}}
                  aria-label="Share it"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M9.4375 15.8594C8.69531 15.8594 8.375 15.3047 8.14844 14.5312L6.60938 9.25781L1.28125 7.69531C0.53125 7.47656 0 7.16406 0 6.42188C0 5.80469 0.484375 5.375 1.14062 5.125L14.0625 0.179688C14.375 0.0625 14.6562 0 14.9062 0C15.4922 0 15.8672 0.375 15.8672 0.960938C15.8672 1.20312 15.7969 1.48438 15.6797 1.80469L10.7578 14.6797C10.4844 15.3906 10.0547 15.8594 9.4375 15.8594ZM7.14844 7.61719L10.8672 3.91406C11.3672 3.42188 12.0703 2.84375 12.6562 2.375C11.8438 2.74219 11.1719 3.05469 10.4922 3.32812L3.11719 6.17188C3.03906 6.20312 3.01562 6.24219 3.01562 6.28906C3.01562 6.33594 3.04688 6.36719 3.13281 6.39062L7.14844 7.61719ZM9.57812 12.8516C9.625 12.8516 9.66406 12.8203 9.6875 12.7344L12.5391 5.375C12.8047 4.67969 13.125 4.00781 13.4922 3.19531C13.0391 3.77344 12.4219 4.51562 11.9453 5L8.24219 8.71875L9.47656 12.7266C9.5 12.8125 9.53125 12.8516 9.57812 12.8516Z" fill="#423530"/>
                  </svg>
                  Share it
                </button>
                <button
                  type="button"
                  className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    ...ACTION_BUTTON_STYLE,
                    transition: "transform 0.2s ease-out, opacity 0.25s ease",
                    transitionDelay: buttonsHidden ? "80ms" : "0ms",
                    opacity: buttonsHidden ? 0 : 1,
                    pointerEvents: buttonsHidden ? "none" : "auto",
                  }}
                  onClick={() => {}}
                  aria-label="Remix it"
                >
                  <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M6.69531 16.2812C3 16.2812 0 13.2812 0 9.58594C0 5.88281 3 2.89062 6.69531 2.89062C6.94531 2.89062 7.19531 2.90625 7.4375 2.92969L5.92969 1.48438C5.76562 1.33594 5.6875 1.14062 5.6875 0.898438C5.6875 0.398438 6.07031 0 6.55469 0C6.80469 0 7 0.09375 7.16406 0.265625L10.1875 3.33594C10.3672 3.51562 10.4688 3.75 10.4688 3.98438C10.4688 4.23438 10.375 4.45312 10.1875 4.64062L7.16406 7.69531C7.00781 7.85156 6.80469 7.94531 6.55469 7.94531C6.07031 7.94531 5.6875 7.55469 5.6875 7.0625C5.6875 6.82031 5.77344 6.63281 5.92969 6.47656L7.65625 4.77344C7.34375 4.71094 7.02344 4.67969 6.69531 4.67969C3.99219 4.67969 1.80469 6.875 1.80469 9.57812C1.80469 12.2812 3.99219 14.4766 6.69531 14.4766C9.40625 14.4766 11.5938 12.2812 11.5938 9.57812C11.5938 9.08594 12 8.67969 12.5 8.67969C12.9922 8.67969 13.3984 9.08594 13.3984 9.57812C13.3984 13.2812 10.3984 16.2812 6.69531 16.2812Z" fill="#423530"/>
                  </svg>
                  Remix it
                </button>
                <button
                  type="button"
                  className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    ...ACTION_BUTTON_STYLE,
                    transition: "transform 0.2s ease-out, opacity 0.25s ease",
                    transitionDelay: buttonsHidden ? "160ms" : "0ms",
                    opacity: buttonsHidden ? 0 : 1,
                    pointerEvents: buttonsHidden ? "none" : "auto",
                  }}
                  onClick={handleSaveItClick}
                  aria-label="Save it"
                >
                  <svg width="11" height="17" viewBox="0 0 11 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M1.17188 16.6484C0.460938 16.6484 0 16.1562 0 15.375V2.39844C0 0.851562 0.84375 0 2.38281 0H8.39062C9.92969 0 10.7734 0.851562 10.7734 2.39844V15.375C10.7734 16.1562 10.3125 16.6484 9.60156 16.6484C9.14844 16.6484 8.85156 16.4453 8.25781 15.8594L5.44531 13.0625C5.41406 13.0312 5.35938 13.0312 5.32812 13.0625L2.52344 15.8594C1.92969 16.4375 1.625 16.6484 1.17188 16.6484ZM2 13.7031L4.78125 11.0156C5.1875 10.625 5.59375 10.625 5.99219 11.0156L8.77344 13.7031C8.86719 13.7969 8.97656 13.7656 8.97656 13.625V2.57031C8.97656 2.03906 8.73438 1.79688 8.20312 1.79688H2.57031C2.03906 1.79688 1.79688 2.03906 1.79688 2.57031V13.625C1.79688 13.7656 1.90625 13.7969 2 13.7031Z" fill="#423530"/>
                  </svg>
                  Save it
                </button>
              </div>

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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 1.5,
                        height: 28,
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      {waveformBars.map((bar, i) => (
                        <div
                          key={i}
                          style={{
                            width: 2,
                            height: bar.height,
                            borderRadius: 100,
                            background: `rgba(66, 53, 48, ${bar.opacity})`,
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
                    background: isRecording ? "#423530" : "rgba(255, 255, 255, 0.8)",
                    color: isRecording ? "#FFF" : "#423530",
                    cursor: "pointer",
                    border: "none",
                  }}
                  aria-label={isRecording ? "Stop recording" : "Voice input"}
                  onClick={handleVoiceClick}
                >
                  <MicIcon active={isRecording} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
