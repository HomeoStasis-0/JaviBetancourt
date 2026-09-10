import type { Metadata } from "next";
import TerminalLine from "@/app/components/TerminalLine";
import Reveal from "@/app/components/Reveal";

export const metadata: Metadata = {
  title: "About | Javier Betancourt",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-20 sm:py-28">
      <TerminalLine command="cat about.md" />
      <h1 className="animate-glitch-in text-3xl font-semibold tracking-tight sm:text-4xl">
        About <span className="text-gradient">me</span>
      </h1>
      <Reveal>
        <div className="neon-border flex flex-col gap-5 rounded-xl bg-surface p-8 text-base leading-relaxed text-muted">
          <p>
            Hey! My name is Javier &ldquo;Javi&rdquo; Betancourt. I&apos;m a
            Software Engineer working full-time, and currently pursuing a
            Master of Science in Computer Science at UT Austin. I&apos;m
            passionate about game development and cybersecurity.
          </p>
          <p>
            I graduated from{" "}
            <span className="text-foreground">Texas A&amp;M University</span>{" "}
            with a degree in Computer Science, minoring in Game Design &amp;
            Development, and studied abroad in Singapore along the way. While
            at A&amp;M, I served as tech lead of the{" "}
            <span className="text-foreground">
              Texas A&amp;M Cyber Security Club
            </span>
            , maintaining the club&apos;s website and the backend behind its
            day-to-day operations.
          </p>
          <p>
            As an undergraduate researcher with the{" "}
            <span className="text-foreground">PSI Lab</span>, I developed a
            stress-management methodology using Unreal Engine and biofeedback
            sensors, incorporating real-time heart rate data to dynamically
            adjust gameplay and create a more engaging, immersive alternative
            to traditional stress interventions.
          </p>
          <p>
            I also worked as an undergraduate teaching assistant for{" "}
            <span className="text-foreground">CSCE 120</span>, which gave me
            invaluable leadership experience, mentoring students during
            weekly labs and helping them in office hours build their
            understanding of core Computer Science concepts like memory
            management, debugging, and basic data structures, in a course
            serving over 900 students.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
