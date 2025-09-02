// src/main.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.scss";

// Resolve initial theme once, before React renders
const stored = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;
const initialTheme = stored || (prefersDark ? "g90" : "g10");

// Apply to <html data-theme="…">
document.documentElement.setAttribute("data-theme", initialTheme);

function Root() {
  const [theme, setTheme] = useState(initialTheme);

  const toggleTheme = () => {
    const next = theme === "g90" ? "g10" : "g90";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore if localStorage unavailable
    }
  };

  return <App theme={theme} toggleTheme={toggleTheme} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);