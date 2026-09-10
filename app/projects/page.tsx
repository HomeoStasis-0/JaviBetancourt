import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PROJECTS } from "@/app/data/projects";
import TerminalLine from "@/app/components/TerminalLine";
import Reveal from "@/app/components/Reveal";

export const metadata: Metadata = {
  title: "Projects | Javier Betancourt",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20 sm:py-28">
      <div className="flex flex-col gap-4">
        <TerminalLine command="ls projects/" />
        <h1 className="animate-glitch-in text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-gradient">Projects</span>
        </h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project, i) => (
          <Reveal key={project.slug} delay={i * 80}>
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="neon-border group flex h-full flex-col overflow-hidden rounded-xl bg-surface"
            >
              <div className="relative h-44 w-full overflow-hidden border-b border-border/60 bg-background">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-base text-foreground">
                    {project.title}
                  </h2>
                  <ArrowUpRight
                    size={16}
                    className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-magenta"
                  />
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {project.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-border/60 px-2 py-1 font-mono text-xs text-cyan"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
