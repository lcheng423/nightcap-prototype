"use client";

import Image from "next/image";
import catImage from "../../assets/courtneys-cat.jpeg";

export default function ThreadsPage() {
  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-hide"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex flex-col w-full" style={{ paddingLeft: 24, paddingRight: 24 }}>
        {/* Title row with avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              position: "relative",
              width: 56,
              height: 56,
              minWidth: 56,
              minHeight: 56,
              borderRadius: 22,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Image
              src={catImage}
              alt="Profile"
              fill
              sizes="56px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <h1
            className="text-[#423530]"
            style={{
              fontFamily: 'var(--font-din-rounded), sans-serif',
              fontSize: 48,
              fontWeight: 600,
              letterSpacing: -0.96,
              textTransform: "capitalize",
              lineHeight: "100%",
            }}
          >
            Threads
          </h1>
        </div>
      </div>
    </div>
  );
}
