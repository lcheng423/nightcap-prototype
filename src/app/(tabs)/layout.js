"use client";

import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import statusBarImage from "../assets/Status bar.png";
import TopBar from "../components/TopBar";
import NavBar from "../components/NavBar";

const TAB_INDEX = { "/": 0, "/today": 1, "/threads": 2 };

export default function TabsLayout({ children }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  let slideClass = "";
  if (prevPathRef.current !== pathname) {
    const prev = TAB_INDEX[prevPathRef.current] ?? 0;
    const curr = TAB_INDEX[pathname] ?? 0;
    slideClass = curr > prev ? "tab-slide-from-right" : "tab-slide-from-left";
  }

  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

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

        <div key={pathname} className={`flex-1 flex flex-col min-h-0 ${slideClass}`}>
          {children}
        </div>

        <NavBar />
      </main>
    </div>
  );
}
