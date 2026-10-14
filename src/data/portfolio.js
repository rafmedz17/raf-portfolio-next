// ─────────────────────────────────────────────────────────────
//  Edit everything about the site from this one file.
//  Projects, companies and numbers are placeholders — swap in
//  your real details.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Raf",
  fullName: "Raf",
  handle: "rafmedz17",
  role: "Software Developer",
  // The hero cycles through these words after "I build software that's…"
  headlinePrefix: "I build software that's",
  headlineWords: ["fast.", "reliable.", "well-tested.", "easy to maintain.", "actually shipped."],
  intro:
    "Full-stack developer working across the stack — from database schema and APIs to the last pixel of the UI. I like boring infrastructure, clear code, and products that just work.",
  email: "hello@raf.dev",
  location: "Your City, Country",
  timeZone: "Asia/Manila",
  available: true,
  availability: "Open to new opportunities",
  resume: "#",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/rafmedz17" },
  { label: "LinkedIn", href: "#" },
  { label: "X / Twitter", href: "#" },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const about = {
  paragraphs: [
    "I'm a software developer who enjoys turning messy requirements into simple, well-structured systems. Most of my work lives on the web: React and Next.js on the front, Node, Python and Postgres behind it.",
    "I care about the things that keep a codebase healthy over time — sensible abstractions, good tests, readable pull requests, and shipping in small, safe steps.",
  ],
  now: [
    { label: "Building", value: "this portfolio, again" },
    { label: "Learning", value: "Go & distributed systems" },
    { label: "Reading", value: "Designing Data-Intensive Applications" },
    { label: "Fueled by", value: "black coffee" },
  ],
};

export const stack = [
  {
    group: "languages",
    items: ["TypeScript", "JavaScript", "Python", "SQL", "Go"],
  },
  {
    group: "frontend",
    items: ["React", "Next.js", "Tailwind CSS", "React Native"],
  },
  {
    group: "backend",
    items: ["Node.js", "Express", "FastAPI", "PostgreSQL", "Redis"],
  },
  {
    group: "tooling",
    items: ["Git", "Docker", "AWS", "Vercel", "GitHub Actions"],
  },
];

export const projects = [
  {
    title: "Ledgerly",
    description:
      "Multi-tenant invoicing platform with role-based access, Stripe billing and PDF generation. Handles thousands of invoices a month.",
    stack: ["Next.js", "PostgreSQL", "Prisma", "Stripe"],
    year: "2026",
    repo: "#",
    live: "#",
  },
  {
    title: "Pulse Monitor",
    description:
      "Uptime and latency monitoring service with a real-time dashboard, alert routing to Slack/email and 90-day history.",
    stack: ["Node.js", "Redis", "WebSockets", "React"],
    year: "2025",
    repo: "#",
    live: "#",
  },
  {
    title: "Shelf API",
    description:
      "REST + GraphQL API for a library management system. Full test coverage, OpenAPI docs and containerized deploys.",
    stack: ["FastAPI", "PostgreSQL", "Docker"],
    year: "2025",
    repo: "#",
  },
  {
    title: "dotcli",
    description:
      "Tiny CLI for syncing dotfiles across machines with git. Written over a weekend, used every day since.",
    stack: ["Go", "Cobra"],
    year: "2024",
    repo: "#",
  },
];

export const experience = [
  {
    period: "2024 — Present",
    role: "Software Developer",
    company: "Company Name",
    text: "Building and maintaining customer-facing web apps and internal tools. Led a migration to Next.js that cut page load times by ~40%.",
    current: true,
  },
  {
    period: "2022 — 2024",
    role: "Junior Full-Stack Developer",
    company: "Company Name",
    text: "Shipped features end-to-end across a React frontend and Node/Postgres backend. Introduced CI checks and automated tests.",
  },
  {
    period: "2021 — 2022",
    role: "Developer Intern",
    company: "Company Name",
    text: "Fixed bugs, wrote my first production code, and learned how real teams ship software.",
  },
];
