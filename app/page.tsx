import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TerminalLine from "@/app/components/TerminalLine";
import Reveal from "@/app/components/Reveal";

const QUICK_LINKS = [
  {
    href: "/about",
    title: "about",
    description: "Who I am, what I do now, and where I studied.",
  },
  {
    href: "/projects",
    title: "projects",
    description: "Games, tools, and other things I've built, from game jams to a Discord bot.",
  },
  {
    href: "/qualifications",
    title: "qualifications",
    description: "Languages, tools, interests, and my resume.",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-24 px-6 py-20 sm:py-28">
      <section className="flex flex-col gap-6">
        <TerminalLine command="whoami" />
        <h1 className="animate-glitch-in text-4xl font-semibold tracking-tight sm:text-6xl">
          Hi, I&apos;m{" "}
          <span className="text-gradient">Javier Betancourt</span>.
        </h1>
        <p
          className="animate-fade-up max-w-2xl text-lg leading-relaxed text-muted [animation-delay:150ms]"
        >
          Software Engineer working full-time, currently pursuing a Master of
          Science in Computer Science at UT Austin. I studied Computer Science
          (minoring in Game Design &amp; Development) at Texas
          A&amp;M University, with a focus on game development and
          cybersecurity.
        </p>
        <div className="animate-fade-up flex flex-wrap gap-4 pt-2 font-mono text-sm [animation-delay:300ms]">
          <Link
            href="/projects"
            className="neon-border rounded-lg bg-surface px-5 py-2.5 text-foreground"
          >
            view projects
          </Link>
          <Link
            href="/qualifications#resume"
            className="neon-border rounded-lg bg-surface px-5 py-2.5 text-muted hover:text-foreground"
          >
            resume
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, title, description }, i) => (
          <Reveal key={href} delay={i * 100}>
            <Link
              href={href}
              className="neon-border group flex h-full flex-col justify-between gap-4 rounded-xl bg-surface p-6"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-sm text-cyan">{title}</h2>
                  <ArrowUpRight
                    size={16}
                    className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-magenta"
                  />
                </div>
                <p className="text-sm leading-relaxed text-muted">{description}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
