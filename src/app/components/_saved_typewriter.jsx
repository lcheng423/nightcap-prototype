/**
 * Saved typewriter / first-load animation code from the Ideas page.
 * Not currently used — kept for reuse elsewhere.
 */

// --- Constants ---
const FIRST_LOAD_COMPLETE_KEY = "nightcap_hasCompletedFirstLoad";
const WELCOME_TEXT = "Morning, Courtney!";
const FIRST_LOAD_TYPED_MESSAGE = "Here are some ideas for who you're becoming. Save one to start your day";
const TYPEWRITER_MS = 11;
const CARD_ENTER_STAGGER_S = 0.0875;

// --- TypewriterText component ---
function TypewriterText({ text }) {
  return text.split("").map((char, i) =>
    char === "\n" ? <br key={i} /> : <span key={i} className="typewriter-letter">{char}</span>
  );
}

// --- State declarations (inside component) ---
// const [isFirstTimeLoading, setIsFirstTimeLoading] = useState(true);
// const [firstLoadPhase, setFirstLoadPhase] = useState("welcome");
// const [welcomeTypedLength, setWelcomeTypedLength] = useState(0);
// const [instructionTypedLength, setInstructionTypedLength] = useState(0);

// --- Effects ---

// Check if first load
// useEffect(() => {
//   if (typeof window === "undefined") return;
//   try {
//     setIsFirstTimeLoading(!sessionStorage.getItem(FIRST_LOAD_COMPLETE_KEY));
//   } catch (_) {}
// }, []);

// Phase: welcome – type out "Welcome, Courtney"
// useEffect(() => {
//   if (!isFirstTimeLoading || firstLoadPhase !== "welcome") return;
//   let intervalId = setInterval(() => {
//     setWelcomeTypedLength((n) => {
//       if (n >= WELCOME_TEXT.length) {
//         if (intervalId) clearInterval(intervalId);
//         return n;
//       }
//       return n + 1;
//     });
//   }, TYPEWRITER_MS);
//   return () => { if (intervalId) clearInterval(intervalId); };
// }, [isFirstTimeLoading, firstLoadPhase]);

// Transition welcome → instruction
// useEffect(() => {
//   if (!isFirstTimeLoading || firstLoadPhase !== "welcome" || welcomeTypedLength < WELCOME_TEXT.length) return;
//   setFirstLoadPhase("instruction");
// }, [isFirstTimeLoading, firstLoadPhase, welcomeTypedLength]);

// Phase: instruction – type out save instruction
// useEffect(() => {
//   if (!isFirstTimeLoading || firstLoadPhase !== "instruction") return;
//   let intervalId = setInterval(() => {
//     setInstructionTypedLength((n) => {
//       if (n >= FIRST_LOAD_TYPED_MESSAGE.length) {
//         if (intervalId) clearInterval(intervalId);
//         return n;
//       }
//       return n + 1;
//     });
//   }, TYPEWRITER_MS);
//   return () => { if (intervalId) clearInterval(intervalId); };
// }, [isFirstTimeLoading, firstLoadPhase]);

// Transition instruction → cardsEnter
// useEffect(() => {
//   if (!isFirstTimeLoading || firstLoadPhase !== "instruction" || instructionTypedLength < FIRST_LOAD_TYPED_MESSAGE.length) return;
//   setFirstLoadPhase("cardsEnter");
//   try { sessionStorage.setItem(FIRST_LOAD_COMPLETE_KEY, "1"); } catch (_) {}
// }, [isFirstTimeLoading, firstLoadPhase, instructionTypedLength]);

// --- JSX: Greeting with typewriter ---
// <h1>
//   {isFirstTimeLoading && firstLoadPhase === "welcome" ? (
//     <TypewriterText text={WELCOME_TEXT.slice(0, welcomeTypedLength)} />
//   ) : (
//     <>Morning, Courtney!</>
//   )}
// </h1>

// --- JSX: Subtitle with typewriter ---
// <p>
//   {isFirstTimeLoading && firstLoadPhase === "instruction" ? (
//     <span className="block">
//       <TypewriterText text={FIRST_LOAD_TYPED_MESSAGE.slice(0, instructionTypedLength)} />
//     </span>
//   ) : isFirstTimeLoading && firstLoadPhase === "cardsEnter" ? (
//     <span className="block">{FIRST_LOAD_TYPED_MESSAGE}</span>
//   ) : (
//     <span className="block">{FIRST_LOAD_TYPED_MESSAGE}</span>
//   )}
// </p>

// --- JSX: Card grid conditional (first-load stagger enter) ---
// Cards use className "home-first-enter" with:
//   { "--card-enter-delay": `${slotIndex * CARD_ENTER_STAGGER_S}s` }
// When firstLoadPhase === "cardsEnter"
// During welcome/instruction phases, cards are hidden (opacity: 0) with empty placeholders
