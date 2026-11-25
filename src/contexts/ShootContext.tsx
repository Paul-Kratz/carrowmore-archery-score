"use client";
import { createContext, use, useState } from "react";

type ShootContextValue = {
  showScores: boolean;
  setShowScores: (value: boolean) => void;
};
const ShootContext = createContext<ShootContextValue>({
  showScores: false,
  setShowScores: () => {},
});

export const ShootProvider = ({ children }: { children: React.ReactNode }) => {
  const [showScores, setShowScores] = useState(false);

  return (
    <ShootContext value={{ showScores, setShowScores }}>
      {children}
    </ShootContext>
  );
};

export const useShootContext = () => use(ShootContext);
