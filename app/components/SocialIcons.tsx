import { GithubIcon, LinkedinIcon } from "@/app/components/BrandIcons";
import { SOCIAL_LINKS } from "@/app/data/links";

const ICONS = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
} as const;

export default function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIAL_LINKS.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        return (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="neon-border flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-muted hover:text-cyan"
          >
            <Icon size={18} />
          </a>
        );
      })}
    </div>
  );
}
