"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS: [string, string][] = [
  ["/", "Home"],
  ["/tools", "All Tools"],
  ["/blog", "Blog"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

/**
 * Phone navigation. It closes when a link is chosen, when the visitor taps
 * anywhere outside it, when Escape is pressed and whenever the page changes.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // The floating theme switch would sit on top of the open menu, so it steps aside.
  useEffect(() => {
    document.documentElement.classList.toggle("menuOpen", open);
    return () => document.documentElement.classList.remove("menuOpen");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="menuWrap" ref={wrap}>
      <button
        type="button"
        className="menuBtn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div id="mobile-menu" className="mobileLinks">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
