"use client";

import { useEffect, useState } from "react";

export default function TerminalLine({ command }: { command: string }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // One-time sync of a browser-only capability check, not available during SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTyped(command);
      return;
    }

    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(command.slice(0, i));
      if (i >= command.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [command]);

  return (
    <p className="font-mono text-sm text-cyan">
      <span className="text-magenta">$</span> {typed}
      <span className="cursor-blink text-cyan">_</span>
    </p>
  );
}
