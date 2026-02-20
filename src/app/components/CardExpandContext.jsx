"use client";

import { createContext, useContext } from "react";

const CardExpandContext = createContext({
  cardExpanded: false,
  setCardExpanded: () => {},
  onCardBackRef: { current: null },
});

export function useCardExpand() {
  return useContext(CardExpandContext);
}

export default CardExpandContext;
