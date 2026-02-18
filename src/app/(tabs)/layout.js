"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import statusBarImage from "../assets/Status bar.png";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";

const PAGE_TRANSITION_MS = 300;

const TAB_ORDER = {
  "/": 0,
  "/today": 1,
  "/threads": 2,
};

function normalizePath(pathname) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function getDirection(fromPath, toPath) {
  const fromIndex = TAB_ORDER[normalizePath(fromPath)];
  const toIndex = TAB_ORDER[normalizePath(toPath)];
  if (fromIndex == null || toIndex == null || fromIndex === toIndex) return 0;
  return toIndex > fromIndex ? 1 : -1;
}

export default function TabsLayout({ children }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const contentRef = useRef(null);
  const snapshotRef = useRef("");
  const timerRef = useRef(null);
  const [exit, setExit] = useState(null);
  const [enterKey, setEnterKey] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      snapshotRef.current = contentRef.current.innerHTML;
    }
  });

  useLayoutEffect(() => {
    if (pathname === prevPathRef.current) return;

    const dir = getDirection(prevPathRef.current, pathname);
    prevPathRef.current = pathname;

    if (timerRef.current) clearTimeout(timerRef.current);

    const id = Date.now();

    if (snapshotRef.current) {
      setExit({ html: snapshotRef.current, direction: dir, id });
    }
    setEnterKey(id);

    timerRef.current = setTimeout(() => {
      setExit((cur) => (cur && cur.id === id ? null : cur));
      timerRef.current = null;
    }, PAGE_TRANSITION_MS + 50);
  }, [pathname]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const exitAnimName = exit
    ? exit.direction >= 0 ? "tab-fade-slide-out-to-left" : "tab-fade-slide-out-to-right"
    : null;
  const enterAnimName = exit
    ? exit.direction >= 0 ? "tab-fade-slide-in-from-right" : "tab-fade-slide-in-from-left"
    : null;

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

        <TopBar />

        <div className="flex-1 relative min-h-0 overflow-hidden">
          {exit && (
            <div
              key={`exit-${exit.id}`}
              className="absolute inset-0 flex flex-col min-h-0"
              style={{
                animation: `${exitAnimName} ${PAGE_TRANSITION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1) both`,
                pointerEvents: "none",
              }}
              dangerouslySetInnerHTML={{ __html: exit.html }}
            />
          )}

          <div
            ref={contentRef}
            key={enterKey}
            className="absolute inset-0 flex flex-col min-h-0"
            style={
              exit
                ? { animation: `${enterAnimName} ${PAGE_TRANSITION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1) both` }
                : undefined
            }
          >
            {children}
          </div>
        </div>

        <NavBar />
      </main>
    </div>
  );
}
