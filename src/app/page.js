"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import statusBarImage from "./assets/Status bar.png";

const REFLECTION_STATE_KEY = "reflectionState";
const HAS_VIEWED_INSIGHT_KEY = "hasViewedInsight";

export default function HomePage() {
  const [notifications] = useState(7);
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasReflectionInProgress, setHasReflectionInProgress] = useState(false);
  const [hasViewedInsight, setHasViewedInsight] = useState(false);
  const router = useRouter();
  const frameRef = useRef(null);
  const nextRouteRef = useRef("/reflection");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setHasReflectionInProgress(!!localStorage.getItem(REFLECTION_STATE_KEY));
      setHasViewedInsight(!!sessionStorage.getItem(HAS_VIEWED_INSIGHT_KEY));
    } catch (_) {
      /* ignore */
    }
  }, []);

  const handlePrimaryButtonClick = useCallback(
    (e) => {
      e.preventDefault();
      if (isLeaving) return;
      nextRouteRef.current =
        hasViewedInsight && !hasReflectionInProgress ? "/insight" : "/reflection";
      setIsLeaving(true);
    },
    [isLeaving, hasViewedInsight, hasReflectionInProgress]
  );

  const handleFadeOutEnd = useCallback(
    (e) => {
      if (e.target !== frameRef.current || e.animationName !== "fade-out-quick") return;
      router.push(nextRouteRef.current);
    },
    [router]
  );

  const primaryButtonLabel = hasReflectionInProgress
    ? "Continue my reflection"
    : hasViewedInsight
      ? "View my insights"
      : "Start reflection";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E3DED4]">
      {/* Main screen: 402×874 frame, 60px radius – status bar and background never fade */}
      <main
        className="relative overflow-hidden bg-[#EEE1C4] rounded-[60px] flex flex-col"
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
        {/* Status bar – always visible, no fade */}
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
        {/* Content below status bar: fades out when leaving, fades in when returning */}
        <div
          ref={frameRef}
          className={`flex-1 flex flex-col min-h-0 ${isLeaving ? "fade-out-quick" : "fade-in-quick"}`}
          onAnimationEnd={handleFadeOutEnd}
        >
          {/* Top bar: 24px horizontal padding, 32pt top, 20pt bottom */}
          <nav
          className="flex items-center justify-between w-full"
          style={{
            paddingTop: 32,
            paddingBottom: 20,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 65 41"
            fill="none"
            className="flex-shrink-0"
            style={{ width: 65, height: 40.553 }}
            aria-label="tangle"
          >
            <path d="M46.9798 21.5656C44.554 23.9555 43.1978 24.4304 43.1978 24.4304H41.7877C41.1762 27.7696 41.7381 27.0298 43.1978 26.0414C44.2523 25.3273 45.8425 24.4304 46.9798 23.0987L49.1128 22.2858C49.2831 20.7531 49.7152 18.8705 46.9798 21.5656Z" fill="#423530"/>
            <path d="M10.8439 9.24056C13.3795 9.17463 19.558 6.35898 21.8972 8.15188C23.7299 9.55615 22.318 13.371 21.1214 12.2601C19.9281 11.1522 11.751 12.1389 10.0061 12.9446C10.0061 12.9446 7.49861 19.0177 7.16874 22.9878C7.16874 25.5986 9.22298 23.1188 9.58609 22.4903C10.1177 21.5687 10.2341 20.5732 10.5907 19.5898C12.2832 14.9221 15.0188 12.0597 18.6366 12.9446C22.4509 13.8775 19.5819 20.0929 19.3857 22.5562C19.3573 22.9121 19.0104 23.4477 19.3857 23.6114C19.9378 23.6227 20.7435 22.5694 21.1214 21.6047C22.8277 17.2486 21.7743 13.2769 24.3988 12.9446C25.7706 12.7712 26.0691 14.0029 25.8228 14.9221C25.4094 16.4648 24.9161 18.305 24.9161 18.305C25.6274 15.6503 28.8609 11.1878 32.0586 12.7126C35.2823 14.2497 32.2279 19.4131 32.0586 21.8578C32.0104 22.5555 32.1546 23.3329 33.0305 22.8843C33.6273 22.579 34.2263 21.2437 34.3464 20.4491C34.5588 19.0442 34.6786 18.3308 34.9898 16.949C35.8004 13.349 38.6423 9.84115 43.3607 12.5653C44.0527 12.0178 46.1039 11.3766 46.65 12.5653C46.9896 13.3029 46.0392 14.817 45.8902 15.6458C44.5973 22.8275 44.4541 31.8811 38.8228 37.2165C35.8332 40.0488 32.0586 41.0771 27.9699 40.3046C24.4529 39.6403 21.5408 37.0825 23.1014 33.2393C24.2922 30.3057 32.8303 28.5304 41.774 25.0913C46.6255 22.5201 42.6312 26.6532 42.6312 26.6532C42.6312 26.6532 31.165 30.7613 28.2841 32.9983C26.3457 34.5027 26.5704 36.5443 29.205 36.7927C36.4565 37.477 39.3028 31.031 40.6162 23.6114C40.5476 23.5349 37.1403 28.1173 34.6762 23.6114C32.8715 25.0369 31.0574 27.051 28.9532 25.8361C26.4828 23.6837 30.5332 17.0311 29.205 16.1821C26.711 15.4449 25.6513 25.1858 23.7341 26.1707C22.5976 26.7552 21.4393 25.7571 21.1214 24.5506C19.5968 26.522 17.1725 27.2074 16.1309 24.7527C14.2799 26.9177 11.7732 27.5023 10.0061 24.7527C8.41029 27.6652 5.06366 28.336 3.46034 25.559C1.7561 22.6071 5.03918 12.82 5.03918 12.82C2.97647 12.7194 0.348976 13.5253 0.018186 10.8547C-0.169063 9.34705 1.12052 8.67951 2.46546 8.9506C4.21589 9.3034 6.14314 9.23485 6.14314 9.23485C6.72505 7.47568 7.15739 4.86177 8.89001 3.89702C9.72775 3.43056 10.8154 3.58768 11.4146 4.35778C12.4356 5.66974 10.8431 9.24056 10.8431 9.24056H10.8439ZM41.0388 14.0974C39.0004 14.2974 37.4229 19.6535 38.174 21.3164C38.5306 22.1068 39.3895 21.8137 39.8943 21.3367C41.0388 20.8101 42.0979 16.8001 41.9742 15.2509C41.9319 14.7177 41.6966 14.0339 41.0388 14.0982V14.0974ZM17.1771 15.6538C16.919 15.3941 16.209 15.9843 16.0234 16.1821C14.8259 17.4537 13.8424 20.2451 13.6705 21.9644C13.5769 22.9015 13.7308 24.1917 14.7477 22.9878C15.7531 21.7976 16.634 18.801 17.0354 17.2486C17.1159 16.936 17.401 15.8784 17.1771 15.6538Z" fill="#423530"/>
            <path d="M59.1519 21.8204C58.7619 23.6366 60.4545 24.1111 61.7212 22.8444C63.1587 21.407 63.2714 18.8935 64.477 19.9048C65.3945 20.6745 64.9069 22.3462 64.5064 22.9714C62.3798 26.2921 57.5301 27.1916 55.4198 23.3777C54.8638 23.9459 54.3021 24.5199 53.6206 24.9398C51.2727 26.3848 47.8908 26.1479 47.0433 23.1294C45.9277 19.1581 49.6815 -0.0368366 56.0687 0.000114312C62.2416 0.0361393 57.7973 10.4987 54.2595 16.6264C53.3055 18.2789 50.8844 20.491 51.1116 21.9913C51.4096 23.9728 54.1169 22.2253 54.7702 21.4255C55.2775 20.8045 55.0869 20.4552 55.1886 19.7291C55.643 16.4971 57.9787 10.9054 61.9825 11.2839C64.5381 11.5257 64.9949 14.2943 64.3793 16.336C63.6426 18.7774 61.3973 20.7621 59.1519 21.8204ZM55.5824 4.60369C55.6548 3.85229 55.7357 3.2515 55.1756 4.0965C53.1095 7.21269 50.9029 17.2326 50.9029 17.2326C52.3792 15.0522 55.1448 9.15834 55.5824 4.60369ZM59.1901 19.5816C60.946 19.1111 61.9985 16.1296 62.1177 15.4861C62.2718 14.6546 61.9174 13.6553 61.0602 14.5915C60.661 15.0272 59.1893 16.8179 59.1893 19.5816H59.1901Z" fill="#423530"/>
          </svg>
          <div className="flex items-center gap-1">
            {/* Help: question in speech bubble – 46×46, drop-shadow */}
            <button
              className="flex items-center justify-center flex-shrink-0 rounded-[20px] bg-white transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              style={{
                width: 46,
                height: 46,
                filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))",
              }}
              aria-label="Help"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="10 6 46 46"
                width={46}
                height={46}
                fill="none"
                className="block"
                aria-hidden
              >
                <path
                  d="M39.9209 21.0001C40.4072 21.0002 40.8236 21.1733 41.1699 21.5196C41.5163 21.8659 41.6894 22.2823 41.6895 22.7686V33.3829C41.6894 33.8692 41.5163 34.2855 41.1699 34.6319C40.8236 34.9783 40.4072 35.1513 39.9209 35.1514H27.5381L25.5039 37.1856C25.2239 37.4656 24.903 37.5287 24.542 37.3741C24.1809 37.2193 24.0001 36.9428 24 36.545V22.7686C24.0001 22.2823 24.1732 21.8659 24.5195 21.5196C24.8659 21.1733 25.2823 21.0002 25.7686 21.0001H39.9209ZM25.7686 34.378L26.7861 33.3829H39.9209V22.7686H25.7686V34.378ZM32.7852 30.1915C33.0115 30.1915 33.1918 30.2629 33.3262 30.4044C33.4604 30.5458 33.5273 30.7335 33.5273 30.9669C33.5272 31.1931 33.4568 31.3735 33.3154 31.5079C33.181 31.6422 32.9971 31.709 32.7637 31.709C32.5374 31.709 32.3534 31.6422 32.2119 31.5079C32.0775 31.3664 32.0098 31.1788 32.0098 30.9454C32.0098 30.719 32.0812 30.5388 32.2227 30.4044C32.3642 30.2628 32.5517 30.1915 32.7852 30.1915ZM32.8799 24.1944C33.1912 24.1944 33.4858 24.2374 33.7617 24.3223C34.0444 24.4001 34.2882 24.5239 34.4932 24.6934C34.7053 24.8561 34.8719 25.0685 34.9922 25.3301C35.1195 25.5848 35.1836 25.8822 35.1836 26.2217C35.1836 26.4199 35.1552 26.6047 35.0986 26.7745C35.0491 26.9371 34.9749 27.0928 34.876 27.2413C34.777 27.3897 34.6634 27.5308 34.5361 27.6651C34.4159 27.7995 34.2777 27.9377 34.1221 28.0792L33.708 28.462C33.6091 28.5609 33.5348 28.6562 33.4854 28.7481C33.4429 28.84 33.4219 28.9426 33.4219 29.0557V29.1729C33.4218 29.3497 33.3578 29.4916 33.2305 29.5977C33.1103 29.6965 32.9618 29.7461 32.7852 29.7462C32.5872 29.7462 32.4279 29.6892 32.3076 29.5762C32.1873 29.463 32.127 29.3139 32.127 29.1299V28.8751C32.127 28.6488 32.1517 28.4437 32.2012 28.2598C32.2507 28.0688 32.3642 27.8923 32.541 27.7296L33.0186 27.2833C33.1317 27.1843 33.2269 27.0954 33.3047 27.0176C33.3895 26.9328 33.461 26.8522 33.5176 26.7745C33.5741 26.6967 33.6162 26.6115 33.6445 26.5196C33.6799 26.4276 33.6973 26.3242 33.6973 26.211C33.6972 26.0909 33.6762 25.9845 33.6338 25.8926C33.5914 25.7938 33.5345 25.7121 33.4639 25.6485C33.3932 25.5779 33.3079 25.5246 33.209 25.4893C33.1101 25.4541 33 25.4366 32.8799 25.4366C32.6891 25.4367 32.5269 25.4797 32.3926 25.5645C32.2582 25.6494 32.1621 25.762 32.1055 25.9034C32.0489 26.0307 31.9674 26.1332 31.8613 26.211C31.7553 26.2888 31.6316 26.3281 31.4902 26.3282C31.278 26.3282 31.1078 26.2641 30.9805 26.1368C30.8533 26.0024 30.7891 25.8293 30.7891 25.6172C30.7891 25.4121 30.8459 25.2245 30.959 25.0547C31.0722 24.8779 31.225 24.7251 31.416 24.5977C31.6069 24.4706 31.8259 24.3715 32.0732 24.3008C32.3278 24.2301 32.597 24.1944 32.8799 24.1944Z"
                  fill="#423530"
                />
              </svg>
            </button>
            {/* Notifications – bell icon */}
            <button
              className="flex items-center justify-center flex-shrink-0 rounded-[20px] bg-white transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              style={{
                width: 46,
                height: 46,
                filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))",
              }}
              aria-label="Alerts"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 19"
                width={15}
                height={19}
                fill="none"
                className="block"
                aria-hidden
              >
                <path
                  d="M0.95 16.15C0.680833 16.15 0.455208 16.059 0.273125 15.8769C0.0910417 15.6948 0 15.4692 0 15.2C0 14.9308 0.0910417 14.7052 0.273125 14.5231C0.455208 14.341 0.680833 14.25 0.95 14.25H1.9V7.6C1.9 6.28583 2.29583 5.11812 3.0875 4.09687C3.87917 3.07562 4.90833 2.40667 6.175 2.09V1.425C6.175 1.02917 6.31354 0.692708 6.59062 0.415625C6.86771 0.138542 7.20417 0 7.6 0C7.99583 0 8.33229 0.138542 8.60938 0.415625C8.88646 0.692708 9.025 1.02917 9.025 1.425V2.09C10.2917 2.40667 11.3208 3.07562 12.1125 4.09687C12.9042 5.11812 13.3 6.28583 13.3 7.6V14.25H14.25C14.5192 14.25 14.7448 14.341 14.9269 14.5231C15.109 14.7052 15.2 14.9308 15.2 15.2C15.2 15.4692 15.109 15.6948 14.9269 15.8769C14.7448 16.059 14.5192 16.15 14.25 16.15H0.95ZM7.6 19C7.0775 19 6.63021 18.814 6.25812 18.4419C5.88604 18.0698 5.7 17.6225 5.7 17.1H9.5C9.5 17.6225 9.31396 18.0698 8.94187 18.4419C8.56979 18.814 8.1225 19 7.6 19ZM3.8 14.25H11.4V7.6C11.4 6.555 11.0279 5.66042 10.2837 4.91625C9.53958 4.17208 8.645 3.8 7.6 3.8C6.555 3.8 5.66042 4.17208 4.91625 4.91625C4.17208 5.66042 3.8 6.555 3.8 7.6V14.25Z"
                  fill="#423530"
                />
              </svg>
            </button>
            {/* Messages + badge – envelope icon */}
            <div className="relative flex-shrink-0">
              <button
                className="flex items-center justify-center rounded-[20px] bg-white transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                style={{
                  width: 46,
                  height: 46,
                  filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))",
                }}
                aria-label="Inbox"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="10 6 46 46"
                  width={46}
                  height={46}
                  fill="none"
                  className="block"
                  aria-hidden
                >
                  <path
                    d="M26 36C25.5187 36 25.1068 35.8286 24.7641 35.4859C24.4214 35.1432 24.25 34.7312 24.25 34.25V23.75C24.25 23.2687 24.4214 22.8568 24.7641 22.5141C25.1068 22.1714 25.5187 22 26 22H40C40.4812 22 40.8932 22.1714 41.2359 22.5141C41.5786 22.8568 41.75 23.2687 41.75 23.75V34.25C41.75 34.7312 41.5786 35.1432 41.2359 35.4859C40.8932 35.8286 40.4812 36 40 36H26ZM40 25.5L33.4594 29.5906C33.3865 29.6344 33.3099 29.6672 33.2297 29.6891C33.1495 29.7109 33.0729 29.7219 33 29.7219C32.9271 29.7219 32.8505 29.7109 32.7703 29.6891C32.6901 29.6672 32.6135 29.6344 32.5406 29.5906L26 25.5V34.25H40V25.5ZM33 28.125L40 23.75H26L33 28.125ZM26 25.7188V24.4281V24.45V24.4391V25.7188Z"
                    fill="#423530"
                  />
                </svg>
              </button>
              {notifications > 0 && (
                <span
                  className="badge-pop-in absolute flex flex-col items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    top: -8,
                    right: -8,
                    width: 24,
                    height: 24,
                    padding: "0 6px",
                    borderRadius: 10,
                    backgroundColor: "#DA5F3D",
                    fontSize: 12,
                  }}
                >
                  {notifications}
                </span>
              )}
            </div>
          </div>
        </nav>

        {/* Content: 24px horizontal padding */}
        <div
          className="flex flex-col w-full"
          style={{ paddingLeft: 24, paddingRight: 24 }}
        >
          {/* Greeting + moon */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0" style={{ maxWidth: 342 }}>
              <h1
                className="text-[#423530] mb-1"
                style={{
                  width: "100%",
                  maxWidth: 342,
                  fontFamily: "var(--font-din-rounded), sans-serif",
                  fontSize: 32,
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "98%",
                  letterSpacing: -0.64,
                }}
              >
                Good evening,
                <br />
                Courtney
              </h1>
              <p
                className="text-[#423530]"
                style={{
                  width: 342,
                  maxWidth: "100%",
                  marginTop: 10,
                  fontFamily: "var(--font-din-rounded), sans-serif",
                  fontSize: 20,
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "98%",
                  letterSpacing: -0.4,
                }}
              >
                Your day had <span className="font-bold">4 things</span>. Reflect
                and get your daily insight <span className="align-text-top">✨</span>
              </p>
            </div>
            {/* Moon – macOS emoji */}
            <span className="flex-shrink-0 text-[48px] leading-none select-none" aria-hidden>
              🌙
            </span>
          </div>

          {/* Spacing between greeting and button: 22px */}
          <div style={{ height: 22 }} />

          {/* Start reflection / Continue / View my insights – Figma specs: 345×58, radius 20, shadow */}
          <a
            href={hasViewedInsight && !hasReflectionInProgress ? "/insight" : "/reflection"}
            onClick={handlePrimaryButtonClick}
            className="flex items-center justify-center no-underline transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            style={{
              width: "100%",
              maxWidth: 345,
              height: 58,
              gap: 8,
              borderRadius: 20,
              background: "#FFF",
              boxShadow: "0 4px 10px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <svg
              width="19"
              height="23"
              viewBox="0 0 19 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block flex-shrink-0"
              aria-hidden
            >
              <path
                d="M0 19.2676V4.6875C0 2.86133 1.03516 1.94336 2.73438 1.82617C6.08398 1.61133 9.18945 1.10352 11.8652 0.478516C13.8672 0 15.0879 0.976562 15.0879 3.07617V17.334C15.0879 19.082 14.5508 19.9609 13.0273 20.4102C9.61914 21.3867 6.38672 21.8066 3.10547 21.9824C1.12305 22.1094 0 21.084 0 19.2676ZM8.26172 22.8906C9.94141 22.6172 11.6797 22.2559 13.4375 21.7676C15.4297 21.1816 16.5332 19.9805 16.5332 17.334V3.17383C16.5332 2.82227 16.5039 2.49023 16.4453 2.05078C17.8711 2.36328 18.6133 3.42773 18.6133 5.16602V19.5996C18.6133 21.7773 17.5098 22.8906 15.3613 22.8906H8.26172ZM2.03125 18.9355C2.03125 19.6191 2.4707 19.9902 3.18359 19.9512C6.35742 19.7852 9.39453 19.3848 12.168 18.584C12.832 18.3984 13.0566 18.0371 13.0566 17.2656V3.47656C13.0566 2.73438 12.6074 2.34375 11.8652 2.50977C9.17969 3.13477 6.14258 3.64258 3.06641 3.80859C2.46094 3.84766 2.03125 4.14062 2.03125 4.79492V18.9355ZM4.14062 7.31445C3.7793 7.34375 3.52539 7.07031 3.52539 6.73828C3.52539 6.43555 3.7207 6.17188 4.13086 6.13281C6.74805 5.95703 8.82812 5.58594 10.8398 5.12695C11.2988 5.0293 11.5527 5.32227 11.5527 5.64453C11.5527 5.92773 11.4355 6.18164 10.9668 6.28906C8.84766 6.75781 6.75781 7.13867 4.14062 7.31445ZM4.14062 10.2637C3.7793 10.2832 3.52539 10.0293 3.52539 9.6875C3.52539 9.375 3.7207 9.11133 4.13086 9.08203C6.74805 8.90625 8.82812 8.52539 10.8398 8.07617C11.2988 7.97852 11.5527 8.27148 11.5527 8.59375C11.5527 8.87695 11.4355 9.13086 10.9668 9.23828C8.84766 9.70703 6.75781 10.0781 4.14062 10.2637ZM4.14062 13.2129C3.7793 13.2324 3.52539 12.9688 3.52539 12.6367C3.52539 12.3242 3.7207 12.0605 4.13086 12.0312C6.74805 11.8457 8.82812 11.4746 10.8398 11.0254C11.2988 10.9277 11.5527 11.2207 11.5527 11.543C11.5527 11.8262 11.4355 12.0703 10.9668 12.1875C8.84766 12.6562 6.75781 13.0273 4.14062 13.2129ZM4.14062 16.1426C3.7793 16.1621 3.52539 15.9082 3.52539 15.5762C3.52539 15.2539 3.7207 14.9902 4.13086 14.9609C5.625 14.873 6.60156 14.7363 7.46094 14.5996C7.93945 14.5117 8.19336 14.8145 8.19336 15.1367C8.19336 15.4102 8.00781 15.6836 7.66602 15.752C6.68945 15.9082 5.67383 16.0547 4.14062 16.1426Z"
                fill="#423530"
              />
            </svg>
            <span
              style={{
                color: "#423530",
                textAlign: "center",
                fontFamily: "var(--font-din-rounded), \"DIN 2014 Rounded VF\", sans-serif",
                fontSize: 20,
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "normal",
                letterSpacing: -0.4,
              }}
            >
              {primaryButtonLabel}
            </span>
          </a>

          {/* From earlier today: 22px gap above section; heading + 4 boxes enter one at a time every time screen is shown */}
          <section style={{ marginTop: 22 }}>
            <h2
              className="text-[#423530] font-semibold tracking-tight home-first-enter"
              style={{ fontSize: 16.5, marginBottom: 12, animationDelay: "0s" }}
            >
              From earlier today…
            </h2>
            {/* Card grid: 8px margin from screen edge on both sides (content has 24px padding → -16 pulls to 8px) */}
            <div style={{ marginLeft: -16, marginRight: -16 }}>
              <div
                style={{
                  display: "grid",
                  rowGap: 8,
                  columnGap: 8,
                  gridTemplateRows: "repeat(4, 252px)",
                  gridTemplateColumns: "189px 189px",
                }}
              >
              {/* Card 1 – 189×252px */}
              <div
                className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer home-first-enter"
                style={{
                  display: "flex",
                  padding: 24,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 10,
                  width: 189,
                  height: 252,
                  boxSizing: "border-box",
                  borderRadius: 28,
                  border: "1px solid rgba(0, 0, 0, 0.10)",
                  backgroundColor: "#F7F0E1",
                  boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
                  animationDelay: "0.1s",
                }}
              />

              {/* Card 2 */}
              <div
                className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer home-first-enter"
                style={{
                  display: "flex",
                  padding: 24,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 10,
                  width: 189,
                  height: 252,
                  boxSizing: "border-box",
                  borderRadius: 28,
                  border: "1px solid rgba(0, 0, 0, 0.10)",
                  backgroundColor: "#F7F0E1",
                  boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
                  animationDelay: "0.2s",
                }}
              />

              {/* Card 3 */}
              <div
                className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer home-first-enter"
                style={{
                  display: "flex",
                  padding: 24,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 10,
                  width: 189,
                  height: 252,
                  boxSizing: "border-box",
                  borderRadius: 28,
                  border: "1px solid rgba(0, 0, 0, 0.10)",
                  backgroundColor: "#F7F0E1",
                  boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
                  animationDelay: "0.3s",
                }}
              />

              {/* Card 4 */}
              <div
                className="transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] cursor-pointer home-first-enter"
                style={{
                  display: "flex",
                  padding: 24,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 10,
                  width: 189,
                  height: 252,
                  boxSizing: "border-box",
                  borderRadius: 28,
                  border: "1px solid rgba(0, 0, 0, 0.10)",
                  backgroundColor: "#F7F0E1",
                  boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
                  animationDelay: "0.4s",
                }}
              />
              </div>
            </div>
          </section>

          {/* Bottom padding so content doesn't touch edge */}
          <div style={{ height: 32 }} />
        </div>
        </div>
      </main>
    </div>
  );
}
