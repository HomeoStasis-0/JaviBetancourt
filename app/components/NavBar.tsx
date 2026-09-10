"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/app/data/links";
import SocialIcons from "@/app/components/SocialIcons";

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="whitespace-nowrap font-mono text-sm font-medium tracking-tight text-foreground"
          onClick={() => setOpen(false)}
        >
          <span className="text-gradient">javier</span>
          <span className="text-cyan glow-pulse">_</span>
          <span className="text-muted">betancourt</span>
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-sm md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group relative py-1 transition-colors ${
                  active ? "text-cyan" : "text-muted hover:text-foreground"
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gradient-to-r from-cyan to-magenta transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <SocialIcons />
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="-mr-2 p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-4 sm:px-6 md:hidden">
          <nav className="flex flex-col gap-1 font-mono text-sm">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`py-2 ${active ? "text-cyan" : "text-muted"}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <SocialIcons className="mt-4" />
        </div>
      )}
    </header>
  );
}
