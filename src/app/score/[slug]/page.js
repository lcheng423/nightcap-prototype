"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import statusBarImage from "../../assets/Status bar.png";
import NavBar from "../../components/NavBar";

const EXIT_DURATION_MS = 280;

const SLUG_TITLE = {
  becoming: "Becoming",
  giving: "Giving",
  aware: "Aware",
};

const SLUG_PLACEHOLDER = {
  becoming: "How might we show people they're growing — even when it doesn't feel like it?",
  giving: "How might we show people that showing up for others is making a difference?",
  aware: "How might we help people notice what already matters in their day?",
};

const BackIcon = (
  <svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="block" aria-hidden>
    <path d="M0 8.47656C0 8.23242 0.0878906 8.00781 0.273438 7.83203L8.01758 0.253906C8.18359 0.0878906 8.39844 0 8.65234 0C9.16016 0 9.55078 0.380859 9.55078 0.888672C9.55078 1.13281 9.44336 1.35742 9.28711 1.52344L2.17773 8.47656L9.28711 15.4297C9.44336 15.5957 9.55078 15.8105 9.55078 16.0645C9.55078 16.5723 9.16016 16.9531 8.65234 16.9531C8.39844 16.9531 8.18359 16.8652 8.01758 16.6895L0.273438 9.12109C0.0878906 8.93555 0 8.7207 0 8.47656Z" fill="#423530" />
  </svg>
);

export default function ScorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug ?? "becoming";
  const title = SLUG_TITLE[slug] ?? slug;
  const placeholder = SLUG_PLACEHOLDER[slug] ?? "";
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setIsEntering(false);
      setNavVisible(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isExiting) return;
    const t = setTimeout(() => router.push("/"), EXIT_DURATION_MS);
    return () => clearTimeout(t);
  }, [isExiting, router]);

  const handleBack = (e) => {
    e.preventDefault();
    if (isExiting) return;
    setIsExiting(true);
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
          className="flex-1 min-h-0 overflow-hidden relative flex flex-col"
          style={{
            opacity: isExiting ? 0 : isEntering ? 0 : 1,
            transform: isExiting ? "translateX(24px)" : isEntering ? "translateX(24px)" : "translateX(0)",
            transition: `opacity ${EXIT_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1), transform ${EXIT_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
          }}
        >
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
                aspectRatio: "1/1",
                background: "rgba(255, 255, 255, 0.80)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                borderRadius: 20,
              }}
              aria-label="Back"
            >
              {BackIcon}
            </Link>
            <h1
              className="text-[#423530] absolute left-1/2 -translate-x-1/2"
              style={{
                fontFamily: 'var(--font-din-rounded), "DIN 2014 Rounded VF", sans-serif',
                fontSize: 20,
                fontWeight: 600,
                lineHeight: "98%",
                letterSpacing: -0.4,
              }}
            >
              {title}
            </h1>
            <div style={{ width: 48, flexShrink: 0 }} aria-hidden />
          </header>

          <p
            style={{
              color: "#423530",
              fontFamily: "var(--font-din-rounded), sans-serif",
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: -0.48,
              textAlign: "center",
              marginLeft: 36,
              marginRight: 36,
              marginTop: 0,
              flexShrink: 0,
            }}
          >
            {placeholder}
          </p>
        </div>

        <div
          style={{
            opacity: navVisible ? 1 : 0,
            transform: navVisible ? "translateY(0)" : "translateY(80px)",
            transition: `opacity ${EXIT_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1), transform ${EXIT_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
          }}
        >
          <NavBar activePage="ideas" />
        </div>
      </main>
    </div>
  );
}
