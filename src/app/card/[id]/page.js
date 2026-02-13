"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import statusBarImage from "../../assets/Status bar.png";

const STATUS_BAR_H = 54;
const FINAL_TOP = 149 - STATUS_BAR_H; // 95px from content-area top
const FINAL_LEFT = 8;
const FINAL_W = 386;
const FINAL_H = 514.667;
const FINAL_RADIUS = 40;
const ORIGIN_RADIUS = 28;

const TRANSITION_MS = 300;
const EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";
const TRANSITION = [
  `top ${TRANSITION_MS}ms ${EASE}`,
  `left ${TRANSITION_MS}ms ${EASE}`,
  `width ${TRANSITION_MS}ms ${EASE}`,
  `height ${TRANSITION_MS}ms ${EASE}`,
  `border-radius ${TRANSITION_MS}ms ${EASE}`,
  `padding ${TRANSITION_MS}ms ${EASE}`,
].join(", ");

const backIcon = (
  <svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="block" aria-hidden>
    <path d="M0 8.47656C0 8.23242 0.0878906 8.00781 0.273438 7.83203L8.01758 0.253906C8.18359 0.0878906 8.39844 0 8.65234 0C9.16016 0 9.55078 0.380859 9.55078 0.888672C9.55078 1.13281 9.44336 1.35742 9.28711 1.52344L2.17773 8.47656L9.28711 15.4297C9.44336 15.5957 9.55078 15.8105 9.55078 16.0645C9.55078 16.5723 9.16016 16.9531 8.65234 16.9531C8.39844 16.9531 8.18359 16.8652 8.01758 16.6895L0.273438 9.12109C0.0878906 8.93555 0 8.7207 0 8.47656Z" fill="#423530" />
  </svg>
);

export default function CardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* Read origin from URL params (for back animation) */
  const hasOrigin = searchParams.has("ot");
  const originTop = hasOrigin ? Number(searchParams.get("ot")) - STATUS_BAR_H : FINAL_TOP;
  const originLeft = hasOrigin ? Number(searchParams.get("ol")) : FINAL_LEFT;
  const originW = hasOrigin ? Number(searchParams.get("ow")) : FINAL_W;
  const originH = hasOrigin ? Number(searchParams.get("oh")) : FINAL_H;

  const [isExiting, setIsExiting] = useState(false);
  const cardRef = useRef(null);
  const exitTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleBack = useCallback(
    (e) => {
      e.preventDefault();
      if (isExiting) return;
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => router.push("/"), TRANSITION_MS + 50);
    },
    [isExiting, router]
  );

  const handleCardTransitionEnd = useCallback(
    (e) => {
      if (e.target !== cardRef.current || !isExiting) return;
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      router.push("/");
    },
    [isExiting, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E3DED4]">
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
        {/* Status bar */}
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

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <div className="w-full h-full absolute inset-0" style={{ paddingBottom: 8 }}>
            {/* Back button */}
            <header
              className={`relative z-10 ${isExiting ? "card-back-fade-out" : ""}`}
              style={{
                paddingTop: 24,
                paddingBottom: 20,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            >
              <a
                href="/"
                onClick={handleBack}
                className="flex justify-center items-center transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex-shrink-0"
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
            </header>

            {/* Card – starts expanded, shrinks to origin on back */}
            <div
              ref={cardRef}
              onTransitionEnd={handleCardTransitionEnd}
              style={{
                position: "absolute",
                top: isExiting ? originTop : FINAL_TOP,
                left: isExiting ? originLeft : FINAL_LEFT,
                width: isExiting ? originW : FINAL_W,
                height: isExiting ? originH : FINAL_H,
                borderRadius: isExiting ? ORIGIN_RADIUS : FINAL_RADIUS,
                padding: isExiting ? 24 : 36,
                transition: TRANSITION,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 20,
                boxSizing: "border-box",
                border: "1px solid rgba(0, 0, 0, 0.10)",
                backgroundColor: "#F7F0E1",
                boxShadow: "0 8.124px 40.618px 0 rgba(0, 0, 0, 0.05)",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
