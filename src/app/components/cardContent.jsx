"use client";

export const CARD_CONTENT = [
  {
    id: "0",
    emoji: "🧠",
    threadName: "Mental health",
    body: "What does being “back to yourself” actually mean—the runner, the explorer or something else?",
    label: "Awareness",
    hasContent: true,
  },
  {
    id: "1",
    emoji: "💪",
    threadName: "Strength and recovery",
    body: "You’re already showing up for recovery every day. That’s the work—not just the finish line.",
    label: "Encouragement",
    hasContent: true,
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 2),
    emoji: "",
    threadName: "Tangle",
    body: "",
    label: "",
    hasContent: false,
  })),
];

export const CARD_IDS = CARD_CONTENT.map((card) => card.id);

export function getCardById(id) {
  return CARD_CONTENT.find((card) => card.id === String(id)) || null;
}
