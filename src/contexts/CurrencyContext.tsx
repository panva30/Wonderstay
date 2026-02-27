import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Currency, CURRENCY_RATES, CURRENCY_SYMBOLS } from "@/lib/types";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (priceINR: number) => number;
  symbol: string;
  format: (priceINR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem("ws-currency");
    return (stored as Currency) || "INR";
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("ws-currency", c);
  };

  const convert = (priceINR: number) => {
    return Math.round(priceINR * CURRENCY_RATES[currency] * 100) / 100;
  };

  const symbol = CURRENCY_SYMBOLS[currency];

  const format = (priceINR: number) => {
    const converted = convert(priceINR);
    if (currency === "INR") {
      return `₹${converted.toLocaleString("en-IN")}`;
    }
    return `${symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, symbol, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
