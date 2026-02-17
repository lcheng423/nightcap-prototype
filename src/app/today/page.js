"use client";

import Image from "next/image";
import statusBarImage from "../assets/Status bar.png";
import NavBar from "../components/NavBar";

export default function TodayPage() {
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

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <h1
            className="text-[#423530]"
            style={{
              fontFamily: 'var(--font-din-rounded), "DIN 2014 Rounded VF", sans-serif',
              fontSize: 32,
              fontWeight: 600,
              lineHeight: "98%",
              letterSpacing: -0.64,
              textAlign: "center",
            }}
          >
            Today
          </h1>
          <p
            className="text-[#423530] mt-3"
            style={{
              fontFamily: 'var(--font-din-rounded), "DIN 2014 Rounded VF", sans-serif',
              fontSize: 16,
              fontWeight: 600,
              lineHeight: "98%",
              letterSpacing: -0.32,
              textAlign: "center",
              opacity: 0.5,
            }}
          >
            Coming soon
          </p>
        </div>

        {/* Bottom nav bar */}
        <NavBar activePage="today" />
      </main>
    </div>
  );
}
