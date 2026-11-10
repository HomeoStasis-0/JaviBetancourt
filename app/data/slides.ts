import { PROJECTS } from "@/app/data/projects";
import { SKILLS, INTERESTS } from "@/app/data/qualifications";
import { SOCIAL_LINKS } from "@/app/data/links";

export type SlideGroup = "intro" | "about" | "projects" | "skills" | "resume" | "links";

export type SlideLink = {
  label: string;
  href: string;
  external?: boolean;
  download?: boolean;
};

export type Slide = {
  id: string;
  group: SlideGroup;
  title: string[];
  paras: string[];
  tags?: string[];
  links?: SlideLink[];
  image?: string;
  small?: boolean;
};

// All copy below is the site's original wording, unchanged.
export const SLIDES: Slide[] = [
  {
    id: "intro",
    group: "intro",
    title: ["Javier", "Betancourt"],
    paras: [],
  },
  {
    id: "about-1",
    group: "about",
    title: ["About", "me"],
    paras: [
      "Hey! My name is Javier \"Javi\" Betancourt. I'm a Software Engineer working full-time, and currently pursuing a Master of Science in Computer Science at UT Austin. I'm passionate about game development and cybersecurity.",
      "I graduated from Texas A&M University with a degree in Computer Science, minoring in Game Design & Development, and studied abroad in Singapore along the way. While at A&M, I served as tech lead of the Texas A&M Cyber Security Club, maintaining the club's website and the backend behind its day-to-day operations.",
    ],
  },
  {
    id: "about-2",
    group: "about",
    title: ["PSI Lab", "& CSCE 120"],
    small: true,
    paras: [
      "As an undergraduate researcher with the PSI Lab, I developed a stress-management methodology using Unreal Engine and biofeedback sensors, incorporating real-time heart rate data to dynamically adjust gameplay and create a more engaging, immersive alternative to traditional stress interventions.",
      "I also worked as an undergraduate teaching assistant for CSCE 120, which gave me invaluable leadership experience, mentoring students during weekly labs and helping them in office hours build their understanding of core Computer Science concepts like memory management, debugging, and basic data structures, in a course serving over 900 students.",
    ],
  },
  ...PROJECTS.map(
    (p): Slide => ({
      id: p.slug,
      group: "projects",
      title: [p.title],
      small: true,
      paras: [p.description],
      tags: p.tags,
      image: p.image,
      links: [{ label: "View project", href: p.href, external: true }],
    })
  ),
  {
    id: "skills",
    group: "skills",
    title: ["Proficient", "in"],
    paras: [],
    tags: SKILLS,
  },
  {
    id: "interests",
    group: "skills",
    title: ["Interested", "in"],
    paras: [],
    tags: INTERESTS,
  },
  {
    id: "resume",
    group: "resume",
    title: ["Resume"],
    paras: [],
    links: [
      { label: "Open resume.pdf", href: "/JaviBetancourtResume.pdf", external: true },
      { label: "Download", href: "/JaviBetancourtResume.pdf", download: true },
    ],
  },
  {
    id: "links",
    group: "links",
    title: ["GitHub", "& LinkedIn"],
    paras: [],
    links: SOCIAL_LINKS.map((s) => ({ label: s.label, href: s.href, external: true })),
  },
];

export const NAV_GROUPS: { label: string; group: SlideGroup }[] = [
  { label: "Home", group: "intro" },
  { label: "About", group: "about" },
  { label: "Projects", group: "projects" },
  { label: "Skills", group: "skills" },
  { label: "Resume", group: "resume" },
  { label: "Links", group: "links" },
];
