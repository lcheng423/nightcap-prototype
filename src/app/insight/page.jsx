"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import statusBarWhite from "../assets/Status bar white.png";
import courtneysCat from "../assets/courtneys-cat.jpeg";
import NavBar from "../components/NavBar";

function getDateLines() {
  const d = new Date();
  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return { dayName, monthDay };
}

const SHARE_ICONS = ["ios", "instagram", "tiktok", "facebook"];

function InstagramIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.065.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="#423530"/>
    </svg>
  );
}

function TikTokIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="#423530"/>
    </svg>
  );
}

function FacebookIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#423530"/>
    </svg>
  );
}

function IosShareIcon({ size = 22 }) {
  const w = (18 / 22) * size;
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8.55469 14.0332C7.98828 14.0332 7.5293 13.5645 7.5293 13.0273V3.91602L7.62695 2.57812L7.17773 3.20312L6.00586 4.45312C5.83008 4.63867 5.58594 4.74609 5.33203 4.74609C4.85352 4.74609 4.44336 4.39453 4.44336 3.88672C4.44336 3.63281 4.54102 3.4375 4.72656 3.26172L7.75391 0.351562C8.01758 0.0878906 8.28125 0 8.55469 0C8.82812 0 9.08203 0.0878906 9.35547 0.351562L12.3828 3.26172C12.5586 3.4375 12.6562 3.63281 12.6562 3.88672C12.6562 4.39453 12.2363 4.74609 11.7676 4.74609C11.5137 4.74609 11.2695 4.63867 11.1035 4.45312L9.93164 3.20312L9.47266 2.57812L9.57031 3.91602V13.0273C9.57031 13.5645 9.12109 14.0332 8.55469 14.0332ZM4.10156 21.748C1.47461 21.748 0 20.2832 0 17.6562V10.5176C0 7.89062 1.47461 6.42578 4.10156 6.42578H5.78125V8.68164H4.20898C2.95898 8.68164 2.25586 9.38477 2.25586 10.6348V17.5391C2.25586 18.7891 2.95898 19.502 4.20898 19.502H12.9004C14.1504 19.502 14.8535 18.7891 14.8535 17.5391V10.6348C14.8535 9.38477 14.1504 8.68164 12.9004 8.68164H11.3281V6.42578H13.0078C15.6348 6.42578 17.0996 7.89062 17.0996 10.5176V17.6562C17.0996 20.2832 15.6348 21.748 13.0078 21.748H4.10156Z" fill="#423530"/>
    </svg>
  );
}

function SaveIcon({ size = 18 }) {
  const w = (14 / 21) * size;
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M1.46484 20.8105C0.576172 20.8105 0 20.1953 0 19.2188V2.99805C0 1.06445 1.05469 0 2.97852 0H10.4883C12.4121 0 13.4668 1.06445 13.4668 2.99805V19.2188C13.4668 20.1953 12.8906 20.8105 12.002 20.8105C11.4355 20.8105 11.0645 20.5566 10.3223 19.8242L6.80664 16.3281C6.76758 16.2891 6.69922 16.2891 6.66016 16.3281L3.1543 19.8242C2.41211 20.5469 2.03125 20.8105 1.46484 20.8105ZM2.5 17.1289L5.97656 13.7695C6.48438 13.2812 6.99219 13.2812 7.49023 13.7695L10.9668 17.1289C11.084 17.2461 11.2207 17.207 11.2207 17.0312V3.21289C11.2207 2.54883 10.918 2.24609 10.2539 2.24609H3.21289C2.54883 2.24609 2.24609 2.54883 2.24609 3.21289V17.0312C2.24609 17.207 2.38281 17.2461 2.5 17.1289Z" fill="#423530"/>
    </svg>
  );
}

export default function InsightPage() {
  const router = useRouter();
  const { dayName, monthDay } = getDateLines();
  const [shareIconIndex, setShareIconIndex] = useState(0);
  const [isExitingToHome, setIsExitingToHome] = useState(false);
  const cardWrapperRef = useRef(null);
  const cycleShareIcon = () => setShareIconIndex((i) => (i + 1) % SHARE_ICONS.length);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("hasViewedInsight", "true");
      } catch (_) {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    const id = setInterval(cycleShareIcon, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSaveInsight = () => {
    if (isExitingToHome) return;
    setIsExitingToHome(true);
  };

  const handleExitAnimationEnd = (e) => {
    if (e.target !== cardWrapperRef.current || e.animationName !== "insight-exit-to-home") return;
    router.push("/");
  };

  return (
    <div className="insight-bg-to-black min-h-screen flex items-center justify-center">
      <div
        ref={cardWrapperRef}
        className={`insight-card-zoom-in flex items-center justify-center ${isExitingToHome ? "insight-exit-to-home" : ""}`}
        style={{ width: 402, maxWidth: "100%" }}
        onAnimationEnd={handleExitAnimationEnd}
      >
      <main
        className="ios-frame relative overflow-hidden bg-black rounded-[60px]"
        style={{
          width: 402,
          maxWidth: "100%",
          height: 874,
          minHeight: 874,
          boxShadow:
            "0px 4px 24px rgba(0, 0, 0, 0.3), 0px 0 0 1px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Cat photo: fades in and zooms in +3%; then zooms another 10% when overlay comes in */}
        <div className="insight-cat-zoom-more absolute inset-0 z-0">
          <Image
            src={courtneysCat}
            alt=""
            fill
            className="object-cover object-center insight-cat-enter"
            sizes="402px"
            priority
          />
        </div>

        {/* Black overlay 20% on top of cat – fades in with text */}
        <div
          className="insight-overlay-text-fade-in absolute inset-0 z-[1] pointer-events-none"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          aria-hidden
        />

        {/* Tangle logo at top */}
        <div
          className="insight-overlay-text-fade-in absolute left-1/2 -translate-x-1/2 z-[2] pointer-events-none flex justify-center"
          style={{ top: 106 }}
          aria-hidden
        >
          <svg width="68" height="43" viewBox="0 0 65 41" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M56.0688 0C62.2417 0.0360332 57.7971 10.4993 54.2593 16.627C53.3051 18.2793 50.8848 20.4911 51.1118 21.9912C51.4099 23.9726 54.1164 22.2256 54.77 21.4258C55.2773 20.8048 55.0874 20.4554 55.189 19.7295C55.6433 16.4976 57.9791 10.9056 61.9829 11.2842C64.5382 11.5261 64.9948 14.2944 64.3794 16.3359C63.6427 18.7773 61.3972 20.762 59.1519 21.8203C58.7619 23.6364 60.4545 24.1112 61.7212 22.8447C63.1587 21.4073 63.2715 18.894 64.4771 19.9053C65.3944 20.675 64.9069 22.3465 64.5063 22.9717C62.3798 26.2922 57.5297 27.1918 55.4194 23.3779C54.8635 23.9461 54.3018 24.5196 53.6206 24.9395C51.2728 26.3844 47.8911 26.1481 47.0435 23.1299C47.0388 23.1134 47.0352 23.0961 47.0308 23.0791L46.98 23.0986C46.2169 23.9922 45.2488 24.6885 44.3765 25.2666C43.5076 29.7736 42.0899 34.1213 38.8228 37.2168C35.8333 40.0489 32.0587 41.0771 27.9702 40.3047C24.4533 39.6404 21.5405 37.0824 23.1011 33.2393C24.2218 30.4783 31.8508 28.7424 40.2007 25.6807C40.3543 25.003 40.4928 24.3115 40.6167 23.6113C40.5481 23.5348 37.1404 28.1173 34.6763 23.6113C32.8716 25.0368 31.0578 27.0507 28.9536 25.8359C26.4832 23.6835 30.5328 17.0316 29.2046 16.1826C26.7108 15.4464 25.651 25.1861 23.7339 26.1709C22.5975 26.7551 21.4395 25.7571 21.1216 24.5508C19.597 26.5221 17.173 27.2073 16.1313 24.7529C14.2804 26.9179 11.7735 27.5023 10.0063 24.7529C8.41049 27.6654 5.06375 28.3356 3.46045 25.5586C1.76031 22.6128 5.0254 12.8625 5.03955 12.8203C2.97684 12.7196 0.348856 13.5251 0.0180664 10.8545C-0.168974 9.34716 1.12059 8.67928 2.46533 8.9502C4.20577 9.30098 6.12125 9.23611 6.14307 9.23535C6.72496 7.47622 7.15764 4.86227 8.89014 3.89746C9.72775 3.43106 10.8153 3.58762 11.4146 4.35742C12.4298 5.66202 10.8609 9.20056 10.8433 9.24023H10.8442C13.38 9.17413 19.5579 6.35951 21.897 8.15234C23.7297 9.55661 22.3181 13.3706 21.1216 12.2598C19.9278 11.1522 11.7516 12.1387 10.0063 12.9443C10.0063 12.9443 7.49833 19.0182 7.16846 22.9883C7.16869 25.5984 9.22335 23.1187 9.58643 22.4902C10.118 21.5687 10.2347 20.5732 10.5913 19.5898C12.2838 14.9223 15.0194 12.0595 18.6372 12.9443C22.4509 13.8776 19.5824 20.0934 19.3862 22.5566C19.3576 22.9125 19.011 23.4477 19.3862 23.6113C19.9382 23.6222 20.7438 22.569 21.1216 21.6045C22.8277 17.2485 21.7744 13.2767 24.3989 12.9443C25.7705 12.771 26.0689 14.0027 25.8228 14.9219C25.4131 16.4506 24.9253 18.2718 24.9165 18.3047C25.6281 15.6499 28.8616 11.1882 32.0591 12.7129C35.2819 14.2502 32.2288 19.4127 32.0591 21.8574C32.0109 22.5551 32.1548 23.3333 33.0308 22.8848C33.6275 22.5795 34.226 21.2438 34.3462 20.4492C34.5586 19.0443 34.6786 18.3309 34.9897 16.9492C35.8004 13.3492 38.6425 9.84127 43.3608 12.5654C44.0528 12.0179 46.1038 11.3768 46.6499 12.5654C46.9895 13.3029 46.0392 14.8166 45.8901 15.6455C45.4424 18.1323 45.1287 20.8433 44.6812 23.5469C45.2538 23.1315 45.9838 22.5335 46.8579 21.6826C46.6373 15.805 50.2663 -0.0335683 56.0688 0ZM39.6597 27.7627C36.0565 29.1402 30.2247 31.4919 28.2847 32.998C26.3464 34.5024 26.5704 36.5444 29.2046 36.793C35.0534 37.345 38.0353 33.2575 39.6597 27.7627ZM17.1772 15.6543C16.9192 15.3946 16.2095 15.9848 16.0239 16.1826C14.8264 17.4542 13.8423 20.2456 13.6704 21.9648C13.5769 22.9018 13.731 24.1913 14.7476 22.9883C15.7528 21.7982 16.6341 18.8016 17.0356 17.249C17.1161 16.9365 17.4006 15.8796 17.1772 15.6543ZM41.0386 14.0986V14.0977C39.0004 14.2982 37.4232 19.6536 38.1743 21.3164C38.5308 22.1066 39.3892 21.8138 39.894 21.3369C41.0385 20.8104 42.0979 16.8002 41.9741 15.251C41.9318 14.7178 41.6964 14.0343 41.0386 14.0986ZM62.1177 15.4863C62.2718 14.6549 61.9172 13.6556 61.0601 14.5918C60.6606 15.0279 59.189 16.8188 59.189 19.582H59.1899C60.9458 19.1116 61.9983 16.1301 62.1177 15.4863ZM55.5825 4.60352C55.655 3.85225 55.7353 3.25179 55.1753 4.09668C53.1152 7.20403 50.9157 17.1741 50.9028 17.2324C52.3791 15.0519 55.145 9.15808 55.5825 4.60352Z" fill="#DA5F3D"/>
          </svg>
        </div>

        {/* Date: fixed position near top */}
        <div
          className="insight-overlay-text-fade-in absolute left-1/2 -translate-x-1/2 z-[2] pointer-events-none flex flex-col items-center"
          style={{ top: 155, width: 280 }}
        >
          <p
            style={{
              color: "#FFF",
              textAlign: "center",
              textShadow: "0 0 20px #000",
              fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
              fontSize: 20,
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "98%",
              letterSpacing: -0.4,
              margin: 0,
            }}
          >
            {dayName}
            <br />
            {monthDay}
          </p>
        </div>

        {/* Three blocks: vertically centered on screen */}
        <div
          className="insight-overlay-text-fade-in absolute left-1/2 top-1/2 z-[2] pointer-events-none flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
          style={{ width: 280 }}
        >
          {/* Block 1: In your voice / "Feeling more like myself lately" */}
          <div className="flex flex-col items-center" style={{ marginTop: 24 }}>
            <p
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                fontSize: 16,
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "98%",
                letterSpacing: -0.32,
                margin: 0,
              }}
            >
              In your voice
            </p>
            <p
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                fontSize: 32,
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "98%",
                letterSpacing: -0.64,
                margin: 0,
                marginTop: 6,
              }}
            >
              &ldquo;Feeling more like myself lately&rdquo;
            </p>
          </div>

          {/* Block 2: Words / Healing, joy, snuggle */}
          <div className="flex flex-col items-center" style={{ marginTop: 32 }}>
            <p
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                fontSize: 16,
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "98%",
                letterSpacing: -0.32,
                margin: 0,
              }}
            >
              Words
            </p>
            <p
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                fontSize: 32,
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "98%",
                letterSpacing: -0.64,
                margin: 0,
                marginTop: 6,
              }}
            >
              Healing, joy, snuggle
            </p>
          </div>

          {/* Block 3: Threads / Recovery, wife, patience */}
          <div className="flex flex-col items-center" style={{ marginTop: 32 }}>
            <p
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                fontSize: 16,
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "98%",
                letterSpacing: -0.32,
                margin: 0,
              }}
            >
              Threads
            </p>
            <p
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                fontSize: 32,
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "98%",
                letterSpacing: -0.64,
                margin: 0,
                marginTop: 6,
              }}
            >
              Recovery, wife, patience
            </p>
          </div>
        </div>

        {/* Bottom buttons: Share (square, rotating icon) + Save insight (fills width) */}
        <div
          className="insight-overlay-text-fade-in absolute left-1/2 -translate-x-1/2 bottom-0 z-[2] flex justify-center"
          style={{ paddingBottom: 40, paddingTop: 16 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              width: 360,
              maxWidth: "calc(100% - 32px)",
            }}
          >
            <button
              type="button"
              onClick={cycleShareIcon}
              style={{
                display: "flex",
                width: 54,
                height: 54,
                flexShrink: 0,
                padding: 0,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 20,
                background: "#FFF",
                border: "none",
                cursor: "pointer",
              }}
              className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
              aria-label={`Share to ${SHARE_ICONS[shareIconIndex]}`}
            >
              {SHARE_ICONS[shareIconIndex] === "instagram" && <InstagramIcon size={22} />}
              {SHARE_ICONS[shareIconIndex] === "tiktok" && <TikTokIcon size={22} />}
              {SHARE_ICONS[shareIconIndex] === "facebook" && <FacebookIcon size={22} />}
              {SHARE_ICONS[shareIconIndex] === "ios" && <IosShareIcon size={18} />}
            </button>
            <button
              type="button"
              onClick={handleSaveInsight}
              style={{
                display: "flex",
                flex: 1,
                minWidth: 0,
                height: 54,
                padding: "0 16px",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                borderRadius: 20,
                background: "#FFF",
                border: "none",
                cursor: "pointer",
              }}
              className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
              aria-label="Save insight and go home"
            >
              <SaveIcon size={16} />
              <span
                style={{
                  color: "#423530",
                  fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: -0.4,
                }}
              >
                Save insight
              </span>
            </button>
          </div>
        </div>

        {/* Bottom nav bar */}
        <NavBar activePage="today" />

        {/* Status bar on top; visible from start; background is black until cat fades in */}
        <div
          className="relative z-10 w-full flex justify-center flex-shrink-0 pointer-events-none"
          role="presentation"
          aria-hidden
        >
          <Image
            src={statusBarWhite}
            alt=""
            width={402}
            height={54}
            className="w-full h-auto block"
            style={{ maxWidth: "100%" }}
            priority
          />
        </div>
      </main>
      </div>
    </div>
  );
}
