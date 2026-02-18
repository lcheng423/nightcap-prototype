"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import avatarImage from "../assets/courtneys-cat.jpeg";

const NAV_PREV_KEY = "nav_active_page";

function pathToPage(pathname) {
  if (pathname === "/today") return "today";
  if (pathname === "/threads") return "threads";
  if (pathname === "/insight") return "today";
  return "ideas";
}

const IdeasIcon = () => (
  <div style={{ display: "flex", width: 24, height: 24, flexDirection: "column", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
    <svg width="11" height="19" viewBox="0 0 11 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M0 4.96875C0 2.14844 2.39844 0 5.38281 0C8.36719 0 10.7734 2.15625 10.7734 4.96875C10.7734 7.92188 9.03125 8.83594 8.57812 13.8359C8.54688 14.2734 8.27344 14.5391 7.82812 14.5391H2.9375C2.49219 14.5391 2.22656 14.2734 2.1875 13.8359C1.73438 8.83594 0 7.91406 0 4.96875ZM1.50781 4.96875C1.50781 7.01562 2.91406 7.60156 3.57031 13.0312H7.19531C7.85156 7.60156 9.26562 7.01562 9.26562 4.96875C9.26562 2.9375 7.48438 1.50781 5.38281 1.5C3.28906 1.5 1.50781 2.9375 1.50781 4.96875ZM2.85156 16.4453C2.54688 16.4453 2.3125 16.1953 2.3125 15.9062C2.3125 15.6172 2.54688 15.375 2.85156 15.375H7.91406C8.21875 15.375 8.45312 15.6172 8.45312 15.9062C8.45312 16.1953 8.21875 16.4453 7.91406 16.4453H2.85156ZM5.38281 18.8047C4.125 18.8047 3.10938 18.1953 3.03906 17.2812H7.71094C7.63281 18.1953 6.64062 18.8047 5.38281 18.8047Z" fill="#423530" />
    </svg>
  </div>
);

const TodayIcon = () => (
  <div style={{ display: "flex", width: 24, height: 24, flexDirection: "column", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M10.8594 3.98438C10.332 3.98438 9.88281 3.53516 9.88281 3.00781V0.976562C9.88281 0.439453 10.332 0 10.8594 0C11.3867 0 11.8359 0.439453 11.8359 0.976562V3.00781C11.8359 3.53516 11.3867 3.98438 10.8594 3.98438ZM15.7227 6.02539C15.3516 5.64453 15.3516 5.01953 15.7227 4.64844L17.168 3.19336C17.5488 2.82227 18.1738 2.82227 18.5449 3.19336C18.916 3.56445 18.916 4.19922 18.5547 4.57031L17.1094 6.01562C16.7285 6.39648 16.1035 6.38672 15.7227 6.02539ZM5.97656 6.02539C5.60547 6.38672 4.98047 6.38672 4.60938 6.01562L3.16406 4.56055C2.80273 4.19922 2.8125 3.56445 3.18359 3.19336C3.55469 2.82227 4.18945 2.83203 4.55078 3.19336L5.99609 4.64844C6.35742 5.00977 6.35742 5.6543 5.97656 6.02539ZM10.8594 15.9766C8.04688 15.9766 5.75195 13.6914 5.75195 10.8789C5.75195 8.06641 8.04688 5.77148 10.8594 5.77148C13.6719 5.77148 15.957 8.06641 15.957 10.8789C15.957 13.6914 13.6719 15.9766 10.8594 15.9766ZM10.8594 14.1797C12.6855 14.1797 14.1602 12.7051 14.1602 10.8789C14.1602 9.05273 12.6855 7.57812 10.8594 7.57812C9.0332 7.57812 7.55859 9.05273 7.55859 10.8789C7.55859 12.7051 9.0332 14.1797 10.8594 14.1797ZM17.7441 10.8789C17.7441 10.3418 18.1836 9.90234 18.7207 9.90234H20.7422C21.2793 9.90234 21.7188 10.3418 21.7188 10.8789C21.7188 11.4062 21.2793 11.8457 20.7422 11.8457H18.7207C18.1836 11.8457 17.7441 11.4062 17.7441 10.8789ZM3.97461 10.8789C3.97461 11.4062 3.53516 11.8457 2.99805 11.8457H0.976562C0.439453 11.8457 0 11.4062 0 10.8789C0 10.3418 0.439453 9.90234 0.976562 9.90234H2.99805C3.53516 9.90234 3.97461 10.3418 3.97461 10.8789ZM5.99609 15.752C6.35742 16.123 6.35742 16.748 5.97656 17.1191L4.54102 18.5645C4.16992 18.9355 3.53516 18.9258 3.1543 18.5449C2.79297 18.1738 2.79297 17.5488 3.16406 17.1777L4.60938 15.7422C4.98047 15.3711 5.61523 15.3809 5.99609 15.752ZM15.7227 15.752C16.0938 15.3809 16.7285 15.3711 17.0996 15.7422L18.5449 17.1875C18.9258 17.5586 18.9258 18.1836 18.5547 18.5547C18.1738 18.9258 17.5488 18.9453 17.1777 18.5742L15.7227 17.1191C15.3516 16.748 15.3516 16.123 15.7227 15.752ZM10.8594 17.7734C11.3867 17.7734 11.8359 18.2129 11.8359 18.75V20.7812C11.8359 21.3086 11.3867 21.7578 10.8594 21.7578C10.332 21.7578 9.88281 21.3086 9.88281 20.7812V18.75C9.88281 18.2129 10.332 17.7734 10.8594 17.7734Z" fill="#423530" />
    </svg>
  </div>
);

const PlusIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M1.39062 14.2812C0.640625 14.2812 0 13.6562 0 12.8906C0 12.125 0.640625 11.4844 1.39062 11.4844H11.5V1.39062C11.5 0.640625 12.125 0 12.8906 0C13.6562 0 14.2969 0.640625 14.2969 1.39062V11.4844H24.3906C25.1406 11.4844 25.7812 12.125 25.7812 12.8906C25.7812 13.6562 25.1406 14.2812 24.3906 14.2812H14.2969V24.3906C14.2969 25.1406 13.6562 25.7812 12.8906 25.7812C12.125 25.7812 11.5 25.1406 11.5 24.3906V14.2812H1.39062Z" fill="#423530" />
  </svg>
);

const INDICATOR_OFFSETS = { ideas: 0, today: 66, threads: 132 };

const navButtonStyle = {
  display: "flex",
  width: 64,
  height: 64,
  padding: "0 27px",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 4,
  borderRadius: 24,
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  background: "transparent",
  position: "relative",
  zIndex: 1,
};

const labelStyle = {
  color: "#423530",
  textAlign: "center",
  fontFamily: '"DIN 2014 Rounded VF", var(--font-din-rounded), sans-serif',
  fontSize: 12,
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "90%",
  letterSpacing: -0.24,
  whiteSpace: "nowrap",
};

export default function NavBar({ activePage: activePageProp }) {
  const pathname = usePathname();
  const activePage = activePageProp ?? pathToPage(pathname);
  const targetOffset = INDICATOR_OFFSETS[activePage] ?? 0;

  const needsMountAnimation = useRef(false);
  const [offset, setOffset] = useState(() => {
    if (typeof window === "undefined") return targetOffset;
    try {
      const prev = sessionStorage.getItem(NAV_PREV_KEY);
      if (prev && prev !== activePage && INDICATOR_OFFSETS[prev] !== undefined) {
        needsMountAnimation.current = true;
        return INDICATOR_OFFSETS[prev];
      }
    } catch (_) {}
    return targetOffset;
  });
  const [animate, setAnimate] = useState(false);
  const currentPageRef = useRef(activePage);

  // Mount animation (remount case — e.g. returning from /reflection)
  useEffect(() => {
    if (needsMountAnimation.current) {
      needsMountAnimation.current = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
          setOffset(targetOffset);
        });
      });
    }
    try { sessionStorage.setItem(NAV_PREV_KEY, activePage); } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Page change while mounted (persistent layout case)
  useEffect(() => {
    if (currentPageRef.current !== activePage) {
      setAnimate(true);
      setOffset(targetOffset);
      currentPageRef.current = activePage;
      try { sessionStorage.setItem(NAV_PREV_KEY, activePage); } catch (_) {}
    }
  }, [activePage, targetOffset]);

  return (
    <nav
      style={{
        position: "absolute",
        bottom: 40,
        left: 24,
        right: 24,
        zIndex: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {/* Left pill: navigational buttons */}
      <div
        style={{
          display: "inline-flex",
          height: 72,
          padding: "0 4px",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          borderRadius: 28,
          border: "1px solid rgba(0, 0, 0, 0.10)",
          background: "#F7F0E1",
          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
          pointerEvents: "auto",
          position: "relative",
        }}
      >
        {/* Sliding white indicator */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 4,
            width: 64,
            height: 64,
            marginTop: -32,
            borderRadius: 24,
            background: "#FFF",
            transition: animate ? "transform 300ms cubic-bezier(0.34, 1.28, 0.64, 1)" : "none",
            transform: `translateX(${offset}px)`,
            zIndex: 0,
          }}
        />

        {/* For you */}
        <Link
          href="/"
          style={navButtonStyle}
          aria-label="For you"
          aria-current={activePage === "ideas" ? "page" : undefined}
        >
          <IdeasIcon />
          <span style={labelStyle}>For you</span>
        </Link>

        {/* Today */}
        <Link
          href="/today"
          style={navButtonStyle}
          aria-label="Today"
          aria-current={activePage === "today" ? "page" : undefined}
        >
          <TodayIcon />
          <span style={labelStyle}>Today</span>
        </Link>

        {/* Threads */}
        <Link
          href="/threads"
          style={navButtonStyle}
          aria-label="Threads"
          aria-current={activePage === "threads" ? "page" : undefined}
        >
          <div
            style={{
              width: 24,
              height: 24,
              flexShrink: 0,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <Image
              src={avatarImage}
              alt=""
              width={24}
              height={24}
              style={{ width: 24, height: 24, objectFit: "cover" }}
            />
          </div>
          <span style={labelStyle}>Threads</span>
        </Link>
      </div>

      {/* Plus button */}
      <button
        style={{
          display: "flex",
          width: 72,
          height: 72,
          padding: 18,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          borderRadius: 28,
          border: "1px solid rgba(0, 0, 0, 0.10)",
          background: "#F7F0E1",
          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
          cursor: "pointer",
          pointerEvents: "auto",
        }}
        aria-label="Create new"
      >
        <PlusIcon />
      </button>
    </nav>
  );
}
