"use client";

import { useRef, useEffect } from "react";

export default function IosCursorProvider({ children }) {
  const cursorRef = useRef(null);
  const insideRef = useRef(false);
  const pressingRef = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    /* Find the phone frame (main.ios-frame) */
    const getFrame = () => document.querySelector("main.ios-frame");

    const onMove = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      const frame = getFrame();
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (inside && !insideRef.current) {
        insideRef.current = true;
        cursor.classList.add("visible");
      } else if (!inside && insideRef.current) {
        insideRef.current = false;
        cursor.classList.remove("visible");
        cursor.classList.remove("pressing");
        pressingRef.current = false;
      }
    };

    const onDown = (e) => {
      if (!insideRef.current) return;
      pressingRef.current = true;
      cursor.classList.add("pressing");
    };
    const onUp = () => {
      pressingRef.current = false;
      cursor.classList.remove("pressing");
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="ios-cursor" />
      {children}
    </>
  );
}
