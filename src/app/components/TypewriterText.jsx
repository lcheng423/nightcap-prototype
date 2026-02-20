"use client";

import { useEffect, useMemo, useState } from "react";

export default function TypewriterText({
  text,
  cursor = "•",
  charMs = 20,
  textStyle,
  cursorStyle,
  showEmoji = true,
}) {
  const safeText = useMemo(() => (typeof text === "string" ? text : ""), [text]);
  const [typedLength, setTypedLength] = useState(0);

  useEffect(() => {
    setTypedLength(0);
  }, [safeText]);

  useEffect(() => {
    if (!safeText) return;
    if (typedLength >= safeText.length) return;

    const intervalId = setInterval(() => {
      setTypedLength((n) => {
        if (n >= safeText.length) return n;
        return n + 1;
      });
    }, charMs);

    return () => clearInterval(intervalId);
  }, [safeText, typedLength, charMs]);

  const [emojiSlideReady, setEmojiSlideReady] = useState(false);
  const isComplete = typedLength >= safeText.length;
  const showTypedLine = safeText.length > 0;

  useEffect(() => {
    if (!showTypedLine) {
      setEmojiSlideReady(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEmojiSlideReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, [showTypedLine]);

  const visibleText = safeText.slice(0, typedLength);
  const textLineHeight = 1.2;

  return (
    <span style={{ display: "block", ...textStyle }}>
      {showTypedLine && (
        <>
          <span
            style={{
              display: "block",
              ...textStyle,
              lineHeight: textLineHeight,
              minHeight: "1.2em",
            }}
          >
            {Array.from(visibleText).map((char, i) => (
              <span key={`${i}-${char}`} className="typewriter-char-fade">{char}</span>
            ))}
          </span>
          {showEmoji && (
            <div
              style={{
                marginTop: 16,
                lineHeight: 1,
                minHeight: "1em",
                transform: emojiSlideReady ? "translateY(0)" : "translateY(-12px)",
                transition: "transform 0.28s cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
              aria-hidden
            >
              <span
                style={{
                  ...cursorStyle,
                  opacity: 1,
                  color: "#423530",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                {cursor}
              </span>
            </div>
          )}
        </>
      )}
    </span>
  );
}
