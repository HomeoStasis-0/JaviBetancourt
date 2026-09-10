# javibetancourt.com

Personal site, built with Next.js (App Router) and Tailwind CSS, statically exported for hosting on GitHub Pages.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Produces a static site in `out/`, including `CNAME`, `.nojekyll`, and `.well-known/discord.txt` (copied from `public/`) for GitHub Pages + the custom domain. Deploy by publishing the contents of `out/`.

## Structure

- `app/`: pages (`/`, `/about`, `/projects`, `/qualifications`) and shared components (`NavBar`, `Footer`).
- `app/data/`: content (nav/social links, project list, skills) kept separate from markup.
- `public/`: static assets, resume PDF, and the domain/verification files.
