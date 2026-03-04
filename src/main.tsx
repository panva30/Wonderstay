import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

if (import.meta.env.DEV) {
  const _error = console.error;
  console.error = (...args) => {
    const text = args.map((a) => (typeof a === "string" ? a : (a && a.message) || "")).join(" ");
    const suppress = [
      "net::ERR_ABORTED",
      "net::ERR_INTERNET_DISCONNECTED",
      "AuthRetryableFetchError",
      "Failed to fetch",
    ].some((p) => text.includes(p));
    if (suppress) return;
    _error(...args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
