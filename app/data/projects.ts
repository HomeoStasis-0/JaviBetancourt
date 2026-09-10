export type Project = {
  slug: string;
  title: string;
  description: string;
  image: string;
  href: string;
  tags: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "stellar-harvest",
    title: "Stellar Harvest",
    description:
      "A 6-person team project built in Unity. Players take on the role of a space farmer who cultivates and sells crops across multiple planets while battling 'munchers,' alien pests unique to each world. They work under the Agricultural Space Society to pay off their debt and win. I worked on programming alongside the team.",
    image: "/images/stellar-harvest-cover.jpg",
    href: "https://official-itchio.itch.io/stellar-harvest",
    tags: ["Unity", "C#", "Team Project"],
  },
  {
    slug: "cyberham",
    title: "CyberHam",
    description:
      "Built with other members of the Texas A&M Cyber Security Club's Tech Committee. Converted our SQL database into self-managed Elasticsearch instances using Python, Elasticsearch queries, and AWS, giving club officers far more effective visibility into club data.",
    image: "/images/CyberHam.png",
    href: "https://github.com/tamucybersec/CyberHam",
    tags: ["Python", "Elasticsearch", "AWS"],
  },
  {
    slug: "wordle",
    title: "Wordle",
    description:
      "Final project for my Programming Languages course. I designed the UI and wrote the full game logic in Java and JavaFX, a great entry point into game development and building a genuinely user-friendly interface.",
    image: "/images/Wordle_logo.png",
    href: "https://github.com/HomeoStasis-0/Wordle",
    tags: ["Java", "JavaFX"],
  },
  {
    slug: "flappy-bird",
    title: "Flappy Bird",
    description:
      "A personal project to dig deeper into C# and Unity. A fun way to learn game physics and what makes a game engaging, which fed directly back into projects like Wordle.",
    image: "/images/Flappy.png",
    href: "https://github.com/HomeoStasis-0/flappy-bird",
    tags: ["C#", "Unity"],
  },
  {
    slug: "aafun-discord-bot",
    title: "AAFUN Discord Bot",
    description:
      "An ongoing side project: a Discord bot built for friends with Node.js and Discord.js. It handles LLM-powered chat (via Groq), Spotify integration, GIF search through Giphy/Tenor, and automated birthday shoutouts with chat memory management.",
    image: "/images/aafun-bot-cover.png",
    href: "https://github.com/HomeoStasis-0/aafun-discord-bot",
    tags: ["Node.js", "Discord.js", "LLM"],
  },
];
