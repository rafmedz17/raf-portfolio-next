// Shared by the server (before saving) and the admin (when importing a backup).
// Keeps only the known shape so a bad payload can't break the site.
export function cleanContent(input) {
  const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const arr = (v) => (Array.isArray(v) ? v : []);
  const str = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
  const strs = (v) => arr(v).map(str);

  const c = obj(input);
  const p = obj(c.profile);
  const a = obj(c.about);

  return {
    profile: {
      name: str(p.name),
      fullName: str(p.fullName),
      handle: str(p.handle),
      role: str(p.role),
      headlinePrefix: str(p.headlinePrefix),
      headlineWords: strs(p.headlineWords),
      intro: str(p.intro),
      email: str(p.email),
      location: str(p.location),
      timeZone: str(p.timeZone),
      available: Boolean(p.available),
      availability: str(p.availability),
      resume: str(p.resume),
    },
    socials: arr(c.socials).map((s) => ({ label: str(s?.label), href: str(s?.href) })),
    about: {
      paragraphs: strs(a.paragraphs),
      now: arr(a.now).map((n) => ({ label: str(n?.label), value: str(n?.value) })),
    },
    stack: arr(c.stack).map((g) => ({ group: str(g?.group), items: strs(g?.items) })),
    projects: arr(c.projects).map((p) => ({
      title: str(p?.title),
      year: str(p?.year),
      description: str(p?.description),
      stack: strs(p?.stack),
      repo: str(p?.repo),
      live: str(p?.live),
    })),
    experience: arr(c.experience).map((e) => ({
      role: str(e?.role),
      company: str(e?.company),
      period: str(e?.period),
      current: Boolean(e?.current),
      text: str(e?.text),
    })),
    settings: {
      intro: obj(c.settings).intro !== false, // on unless switched off
    },
  };
}
