export const CARD_CONTENT = [
  {
    id: '0',
    emoji: '🧠',
    threadName: 'Mental health',
    body: 'What does being back to yourself actually mean - runner, explorer, or something else?',
    label: 'Awareness',
    hasContent: true
  },
  {
    id: '1',
    emoji: '💪',
    threadName: 'Recovering athelete',
    body: 'You are already showing up for recovery every day. That is the work.',
    label: 'Encouragement',
    hasContent: true
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 2),
    emoji: '',
    threadName: 'Tangle',
    body: '',
    label: '',
    hasContent: false
  }))
];

export const CARD_IDS = CARD_CONTENT.map((card) => card.id);

export const SCORES = [
  { slug: 'becoming', title: 'Becoming', value: 78 },
  { slug: 'giving', title: 'Supporting', value: 97 },
  { slug: 'aware', title: 'Intentionality', value: 92 }
];

export function getCardById(id) {
  return CARD_CONTENT.find((card) => card.id === String(id)) ?? null;
}
