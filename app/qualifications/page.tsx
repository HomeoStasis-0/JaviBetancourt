import type { Metadata } from "next";
import { Download } from "lucide-react";
import { SKILLS, INTERESTS } from "@/app/data/qualifications";
import TerminalLine from "@/app/components/TerminalLine";
import Reveal from "@/app/components/Reveal";

export const metadata: Metadata = {
  title: "Qualifications | Javier Betancourt",
};

export default function QualificationsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16 px-6 py-20 sm:py-28">
      <div className="flex flex-col gap-8">
        <TerminalLine command="cat skills.json" />
        <h1 className="animate-glitch-in text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-gradient">Qualifications</span>
        </h1>

        <Reveal>
          <div className="neon-border rounded-xl bg-surface p-8">
            <h2 className="mb-4 font-mono text-sm text-cyan">proficient_in</h2>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-sm text-foreground transition-colors hover:border-cyan/60 hover:text-cyan"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="neon-border rounded-xl bg-surface p-8">
            <h2 className="mb-4 font-mono text-sm text-cyan">interested_in</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <span
                  key={interest}
                  className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-sm text-foreground transition-colors hover:border-magenta/60 hover:text-magenta"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <div id="resume" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TerminalLine command="open JaviBetancourtResume.pdf" />
            <a
              href="/JaviBetancourtResume.pdf"
              download
              className="neon-border flex items-center justify-center gap-2 rounded-lg bg-surface px-4 py-2 font-mono text-sm text-foreground"
            >
              <Download size={15} />
              download
            </a>
          </div>

          {/* Inline PDF preview: unreliable on mobile browsers, so desktop-only */}
          <div className="neon-border hidden overflow-hidden rounded-xl bg-surface sm:block">
            <object
              data="/JaviBetancourtResume.pdf"
              type="application/pdf"
              className="h-[70vh] w-full"
            >
              <p className="p-8 text-sm text-muted">
                Your browser can&apos;t preview PDFs inline.{" "}
                <a href="/JaviBetancourtResume.pdf" className="text-cyan underline">
                  Open the resume directly
                </a>
                .
              </p>
            </object>
          </div>

          <a
            href="/JaviBetancourtResume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="neon-border flex flex-col items-center gap-2 rounded-xl bg-surface p-10 text-center sm:hidden"
          >
            <Download size={22} className="text-cyan" />
            <span className="font-mono text-sm text-foreground">
              Open resume.pdf
            </span>
            <span className="text-xs text-muted">
              Inline preview isn&apos;t supported on mobile, tap to open it.
            </span>
          </a>
        </div>
      </Reveal>
    </div>
  );
}
