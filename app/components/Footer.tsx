import SocialIcons from "@/app/components/SocialIcons";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/80">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-8 text-center font-mono text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
        <p>
          <span className="text-cyan">&gt;</span> © {new Date().getFullYear()} Javier Betancourt
        </p>
        <SocialIcons />
      </div>
    </footer>
  );
}
