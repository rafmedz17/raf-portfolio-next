import Nav from "./Nav";
import Hero from "./Hero";
import About from "./About";
import Work from "./Work";
import Experience from "./Experience";
import Contact from "./Contact";
import Footer from "./Footer";
import CommandMenu from "./CommandMenu";
import Extras from "./Extras";
import Intro from "./Intro";
import ResumeViewer from "./ResumeViewer";
import ClickFX from "./ClickFX";

// Boot-log lines for the intro, built from the real content.
function bootLines({ projects, experience, stack }) {
  const skills = stack.reduce((n, g) => n + g.items.length, 0);
  return [
    "mounting /dev/coffee",
    `loading ${projects.length} project${projects.length === 1 ? "" : "s"}`,
    `linking experience (${experience.length} commit${experience.length === 1 ? "" : "s"})`,
    `indexing ${skills} skills`,
    "compiling personality… done",
  ];
}

// The whole public site, rendered from a content object. Used by the home
// page (with saved content) and by the admin preview (with draft content).
export default function Site({ content }) {
  const { profile, socials, about, stack, projects, experience, settings } = content;
  return (
    <>
      {settings?.intro !== false && (
        <Intro name={profile.name || "Hello"} role={profile.role} lines={bootLines(content)} />
      )}
      <Nav profile={profile} />
      <main>
        <Hero content={content} />
        <About profile={profile} about={about} stack={stack} projects={projects} />
        <Work projects={projects} />
        <Experience experience={experience} />
        <Contact profile={profile} socials={socials} />
      </main>
      <Footer profile={profile} />
      <CommandMenu profile={profile} socials={socials} />
      <Extras profile={profile} />
      <ClickFX />
      {profile.resume && profile.resume !== "#" && (
        <ResumeViewer url={profile.resume} name={profile.fullName || profile.name} />
      )}
    </>
  );
}
