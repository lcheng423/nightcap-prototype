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

const EXIT_DURATION_MS = 280;
const THINKING_DELAY_MS = 2600;

const FAKE_REPLIES = [
  "That's a great question. I'd sit with it a bit.",
  "I hear you. What would it look like if you gave yourself permission to explore that?",
  "Tell me more about that.",
  "It sounds like you're onto something. Keep going.",
  "What if the opposite were true?",
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
  const messagesEndRef = useRef(null);
  const lastMessageRef = useRef(null);
  const messagesSectionRef = useRef(null);
  const replyFieldRef = useRef(null);

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
    setMessages((prev) => [...prev, { role: "user", text }]);
    const reply = getFakeReply();
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    }, THINKING_DELAY_MS);
  };

  const handleReplyKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendReply();
    }
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
                    key={`user-${i}`}
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
                    key={`assistant-${i}`}
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
              <div ref={messagesEndRef} />
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
                    transitionDelay: replyInput.length > 0 ? "0ms" : "0ms",
                    opacity: replyInput.length > 0 ? 0 : 1,
                    pointerEvents: replyInput.length > 0 ? "none" : "auto",
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
                    transitionDelay: replyInput.length > 0 ? "80ms" : "0ms",
                    opacity: replyInput.length > 0 ? 0 : 1,
                    pointerEvents: replyInput.length > 0 ? "none" : "auto",
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
                    transitionDelay: replyInput.length > 0 ? "160ms" : "0ms",
                    opacity: replyInput.length > 0 ? 0 : 1,
                    pointerEvents: replyInput.length > 0 ? "none" : "auto",
                  }}
                  onClick={() => {}}
                  aria-label="Save it"
                >
                  <svg width="11" height="17" viewBox="0 0 11 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M1.17188 16.6484C0.460938 16.6484 0 16.1562 0 15.375V2.39844C0 0.851562 0.84375 0 2.38281 0H8.39062C9.92969 0 10.7734 0.851562 10.7734 2.39844V15.375C10.7734 16.1562 10.3125 16.6484 9.60156 16.6484C9.14844 16.6484 8.85156 16.4453 8.25781 15.8594L5.44531 13.0625C5.41406 13.0312 5.35938 13.0312 5.32812 13.0625L2.52344 15.8594C1.92969 16.4375 1.625 16.6484 1.17188 16.6484ZM2 13.7031L4.78125 11.0156C5.1875 10.625 5.59375 10.625 5.99219 11.0156L8.77344 13.7031C8.86719 13.7969 8.97656 13.7656 8.97656 13.625V2.57031C8.97656 2.03906 8.73438 1.79688 8.20312 1.79688H2.57031C2.03906 1.79688 1.79688 2.03906 1.79688 2.57031V13.625C1.79688 13.7656 1.90625 13.7969 2 13.7031Z" fill="#423530"/>
                  </svg>
                  Save it
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "flex-end" }}>
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
                    background: "rgba(255, 255, 255, 0.8)",
                    cursor: "pointer",
                    border: "none",
                  }}
                  aria-label="Voice input"
                  onClick={() => {}}
                >
                  <svg width="26" height="29" viewBox="0 0 26 29" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M10.3385 28.1768C9.64838 28.1768 9.11453 27.6299 9.11453 26.9528V1.23665C9.11453 0.559569 9.64838 -0.000326641 10.3385 -0.000326641C11.0416 -0.000326641 11.5755 0.559569 11.5755 1.23665V26.9528C11.5755 27.6299 11.0416 28.1768 10.3385 28.1768ZM19.4661 25.3252C18.763 25.3252 18.2291 24.7653 18.2291 24.0882V4.10124C18.2291 3.42415 18.763 2.85124 19.4661 2.85124C20.1562 2.85124 20.7031 3.42415 20.7031 4.10124V24.0882C20.7031 24.7653 20.1562 25.3252 19.4661 25.3252ZM5.78119 23.2549C5.09109 23.2549 4.55724 22.708 4.55724 22.0179V6.15853C4.55724 5.48144 5.09109 4.92155 5.78119 4.92155C6.48432 4.92155 7.01817 5.48144 7.01817 6.15853V22.0179C7.01817 22.708 6.48432 23.2549 5.78119 23.2549ZM14.9088 21.484C14.2057 21.484 13.6718 20.9502 13.6718 20.2601V7.91634C13.6718 7.23926 14.2057 6.67936 14.9088 6.67936C15.5989 6.67936 16.1458 7.23926 16.1458 7.91634V20.2601C16.1458 20.9502 15.5989 21.484 14.9088 21.484ZM24.0234 19.0101C23.3203 19.0101 22.7994 18.4632 22.7994 17.7731V10.4033C22.7994 9.72624 23.3203 9.16634 24.0234 9.16634C24.7135 9.16634 25.2604 9.72624 25.2604 10.4033V17.7731C25.2604 18.4632 24.7135 19.0101 24.0234 19.0101ZM1.2239 17.7731C0.533798 17.7731 -5.61085e-05 17.2132 -5.61085e-05 16.5361V11.6533C-5.61085e-05 10.9632 0.533798 10.4033 1.2239 10.4033C1.91401 10.4033 2.46088 10.9632 2.46088 11.6533V16.5361C2.46088 17.2132 1.91401 17.7731 1.2239 17.7731Z" fill="#423530"/>
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
