"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toolName } from "@/lib/tools";

const KEY = "imgcontrol:recent-tools";
const MAX = 6;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage can be blocked; the feature is optional */
  }
}

/**
 * Remembers the tools this visitor opened (in their own browser only) and
 * links back to them. Renders nothing until there is something to show.
 */
export default function RecentTools({
  current,
  heading = "Recently used",
}: {
  current?: string;
  heading?: string;
}) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    let list = read();

    if (current) {
      list = [current, ...list.filter((s) => s !== current)].slice(0, MAX);
      write(list);
    }

    setItems(list.filter((s) => s !== current));
  }, [current]);

  if (items.length === 0) return null;

  return (
    <>
      <h3>{heading}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
        {items.map((s) => (
          <Link key={s} href={`/${s}`} className="chip" style={{ textDecoration: "none" }}>
            {toolName(s)}
          </Link>
        ))}
      </div>
    </>
  );
}
