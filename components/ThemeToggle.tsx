"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem("imgcontrol-theme");

    // No saved preference = DARK mode by default
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setDark(true);

      // Save dark as the default preference
      if (!savedTheme) {
        localStorage.setItem("imgcontrol-theme", "dark");
      }
    }
  }, []);

  function toggleTheme() {
    const nextDark = !dark;

    setDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("imgcontrol-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("imgcontrol-theme", "light");
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggleTheme}
      aria-label={
        dark ? "Switch to light mode" : "Switch to dark mode"
      }
      title={dark ? "Light Mode" : "Dark Mode"}
    >
      <span className="themeIcon">
        {dark ? "☀" : "☾"}
      </span>

      <span className="themeText">
        {dark ? "Light" : "Dark"}
      </span>
    </button>
  );
}