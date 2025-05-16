import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface PeriodUserData {
  periodStartDate: Date | null;
  periodEndDate: Date | null;
  cycleLength: number;
  periodLength: number;
  setPeriodUserData: (data: Partial<PeriodUserData>) => void;
}

const defaultContext: PeriodUserData = {
  periodStartDate: null,
  periodEndDate: null,
  cycleLength: 28,
  periodLength: 5,
  setPeriodUserData: () => {},
};

const PeriodUserContext = createContext<PeriodUserData>(defaultContext);

export const usePeriodUser = () => useContext(PeriodUserContext);

export const PeriodUserProvider = ({ children }: { children: ReactNode }) => {
  const [periodStartDate, setPeriodStartDate] = useState<Date | null>(null);
  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  // Load from localStorage on mount
  useEffect(() => {
    const start = localStorage.getItem("periodStartDate");
    const end = localStorage.getItem("periodEndDate");
    const cycle = localStorage.getItem("cycleLength");
    const length = localStorage.getItem("periodLength");
    if (start) setPeriodStartDate(new Date(start));
    if (end) setPeriodEndDate(new Date(end));
    if (cycle) setCycleLength(Number(cycle));
    if (length) setPeriodLength(Number(length));
  }, []);

  // Update context and localStorage
  const setPeriodUserData = (data: Partial<PeriodUserData>) => {
    if (data.periodStartDate !== undefined) {
      setPeriodStartDate(data.periodStartDate);
      if (data.periodStartDate)
        localStorage.setItem("periodStartDate", data.periodStartDate.toISOString());
    }
    if (data.periodEndDate !== undefined) {
      setPeriodEndDate(data.periodEndDate);
      if (data.periodEndDate)
        localStorage.setItem("periodEndDate", data.periodEndDate.toISOString());
    }
    if (data.cycleLength !== undefined) {
      setCycleLength(data.cycleLength);
      localStorage.setItem("cycleLength", String(data.cycleLength));
    }
    if (data.periodLength !== undefined) {
      setPeriodLength(data.periodLength);
      localStorage.setItem("periodLength", String(data.periodLength));
    }
  };

  return (
    <PeriodUserContext.Provider
      value={{
        periodStartDate,
        periodEndDate,
        cycleLength,
        periodLength,
        setPeriodUserData,
      }}
    >
      {children}
    </PeriodUserContext.Provider>
  );
};
