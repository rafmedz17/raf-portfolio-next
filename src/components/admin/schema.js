// Describes the admin forms. Each section is a page in the sidebar; each block
// is a group of fields, a list of items, or a list of plain text.
//
// Field types: text (default), textarea, email, url, toggle, tags, timezone.
// `path` points into the content object, e.g. "profile.name".

export const SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    icon: "user",
    anchor: "top",
    description: "The first thing visitors see — your name, headline and status.",
    blocks: [
      {
        type: "fields",
        title: "Basics",
        fields: [
          { path: "profile.name", label: "First name", required: true, placeholder: "Raf", help: "Used in the greeting, the nav and the terminal prompt." },
          { path: "profile.fullName", label: "Full name", placeholder: "Raf Medina", help: "Shown in the footer and browser tab." },
          { path: "profile.role", label: "Job title", placeholder: "Software Developer" },
          { path: "profile.intro", label: "Short intro", type: "textarea", rows: 3, help: "One or two sentences under the headline." },
        ],
      },
      {
        type: "fields",
        title: "Headline",
        fields: [
          { path: "profile.headlinePrefix", label: "Headline start", placeholder: "I build software that's", help: "The part that stays the same." },
          { path: "profile.headlineWords", label: "Rotating words", type: "tags", placeholder: "Type a word and press Enter", help: "These swap in one by one with a scramble effect." },
        ],
      },
      {
        type: "fields",
        title: "Availability & location",
        fields: [
          { path: "profile.available", label: "Show the green “available” badge", type: "toggle" },
          { path: "profile.availability", label: "Badge text", placeholder: "Open to new opportunities", showIf: (c) => c.profile.available },
          { path: "profile.location", label: "Location", placeholder: "Manila, Philippines" },
          { path: "profile.timeZone", label: "Time zone", type: "timezone", placeholder: "Asia/Manila", help: "Powers the live clock in the hero. Start typing a city." },
        ],
      },
    ],
  },
  {
    id: "contact",
    label: "Contact & links",
    icon: "mail",
    anchor: "contact",
    description: "How people reach you. Used in the contact section, terminal and command menu.",
    blocks: [
      {
        type: "fields",
        title: "Contact",
        fields: [
          { path: "profile.email", label: "Email address", type: "email", required: true, placeholder: "you@example.com" },
          { path: "profile.resume", label: "Résumé link", type: "url", placeholder: "https://…/resume.pdf", help: "Optional. Leave empty to hide the link." },
        ],
      },
      {
        type: "list",
        title: "Social links",
        path: "socials",
        itemName: "link",
        newItem: { label: "", href: "" },
        itemTitle: (s) => s.label || "Untitled link",
        itemSubtitle: (s) => s.href,
        fields: [
          { key: "label", label: "Name", placeholder: "GitHub" },
          { key: "href", label: "URL", type: "url", placeholder: "https://github.com/you" },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: "info",
    anchor: "about",
    description: "A little more about you, plus a “right now” list.",
    blocks: [
      { type: "strings", title: "Paragraphs", path: "about.paragraphs", itemName: "paragraph", placeholder: "Write a few sentences…" },
      {
        type: "list",
        title: "Right now",
        path: "about.now",
        itemName: "item",
        newItem: { label: "", value: "" },
        itemTitle: (n) => n.label || "New item",
        itemSubtitle: (n) => n.value,
        fields: [
          { key: "label", label: "Label", placeholder: "Learning" },
          { key: "value", label: "Value", placeholder: "Rust" },
        ],
      },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    icon: "layers",
    anchor: "about",
    description: "Your tech stack, grouped. Skills that match a project's tags become clickable filters.",
    blocks: [
      {
        type: "list",
        title: "Skill groups",
        path: "stack",
        itemName: "group",
        newItem: { group: "", items: [] },
        itemTitle: (g) => g.group || "New group",
        itemSubtitle: (g) => g.items.join(", "),
        fields: [
          { key: "group", label: "Group name", placeholder: "frontend" },
          { key: "items", label: "Skills", type: "tags", placeholder: "Type a skill and press Enter" },
        ],
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: "folder",
    anchor: "work",
    description: "Your best work. The tech tags double as filter buttons on the site.",
    blocks: [
      {
        type: "list",
        title: "Projects",
        path: "projects",
        itemName: "project",
        newItem: { title: "", year: String(new Date().getFullYear()), description: "", stack: [], repo: "", live: "" },
        itemTitle: (p) => p.title || "Untitled project",
        itemSubtitle: (p) => [p.year, p.stack.join(", ")].filter(Boolean).join(" · "),
        fields: [
          { key: "title", label: "Project name", required: true, placeholder: "My awesome app" },
          { key: "year", label: "Year", placeholder: "2026" },
          { key: "description", label: "Description", type: "textarea", rows: 3, placeholder: "What it does and why it's interesting." },
          { key: "stack", label: "Tech used", type: "tags", placeholder: "Type a technology and press Enter" },
          { key: "repo", label: "Source code link", type: "url", placeholder: "https://github.com/…", help: "Optional." },
          { key: "live", label: "Live site link", type: "url", placeholder: "https://…", help: "Optional." },
        ],
      },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    icon: "briefcase",
    anchor: "experience",
    description: "Shown as a git log — newest first.",
    blocks: [
      {
        type: "list",
        title: "Jobs",
        path: "experience",
        itemName: "job",
        newItem: { role: "", company: "", period: "", current: false, text: "" },
        itemTitle: (e) => (e.role ? `${e.role}${e.company ? ` @ ${e.company}` : ""}` : "New job"),
        itemSubtitle: (e) => e.period,
        fields: [
          { key: "role", label: "Job title", required: true, placeholder: "Software Developer" },
          { key: "company", label: "Company", placeholder: "Acme Inc." },
          { key: "period", label: "Dates", placeholder: "2024 — Present" },
          { key: "current", label: "This is my current job (marked HEAD)", type: "toggle" },
          { key: "text", label: "What you did", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
];

// ── Path helpers ──────────────────────────────────────────────
export function getIn(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

export function setIn(obj, path, value) {
  const [key, ...rest] = path.split(".");
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[key] = rest.length ? setIn(obj[key], rest.join("."), value) : value;
  return copy;
}

// ── Validation ────────────────────────────────────────────────
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_OK = (v) => !v || v === "#" || /^(https?:\/\/|mailto:|\/)/.test(v);

// Returns { "profile.name": "message", "projects.0.title": "message", … }
export function validate(content) {
  const errors = {};
  const check = (path, field, value) => {
    if (field.required && !String(value ?? "").trim()) errors[path] = `${field.label} is required.`;
    else if (field.type === "email" && value && !EMAIL.test(value)) errors[path] = "That doesn't look like an email address.";
    else if (field.type === "url" && !URL_OK(value)) errors[path] = "Links should start with https://";
  };

  for (const section of SECTIONS) {
    for (const block of section.blocks) {
      if (block.type === "fields") {
        block.fields.forEach((f) => check(f.path, f, getIn(content, f.path)));
      } else if (block.type === "list") {
        (getIn(content, block.path) ?? []).forEach((item, i) =>
          block.fields.forEach((f) => check(`${block.path}.${i}.${f.key}`, f, item[f.key]))
        );
      }
    }
  }
  return errors;
}

export function sectionForPath(path) {
  return SECTIONS.find((s) =>
    s.blocks.some((b) =>
      b.type === "fields" ? b.fields.some((f) => f.path === path) : path.startsWith(`${b.path}.`)
    )
  );
}
