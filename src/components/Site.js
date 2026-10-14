import Nav from "./Nav";
import Hero from "./Hero";
import About from "./About";
import Work from "./Work";
import Experience from "./Experience";
import Contact from "./Contact";
import Footer from "./Footer";
import CommandMenu from "./CommandMenu";
import Extras from "./Extras";

// The whole public site, rendered from a content object. Used by the home
// page (with saved content) and by the admin preview (with draft content).
export default function Site({ content }) {
  const { profile, socials, about, stack, projects, experience } = content;
  return (
    <>
      <Nav profile={profile} />
      <main>
        <Hero content={content} />
        <About about={about} stack={stack} projects={projects} />
        <Work projects={projects} />
        <Experience experience={experience} />
        <Contact profile={profile} socials={socials} />
      </main>
      <Footer profile={profile} />
      <CommandMenu profile={profile} socials={socials} />
      <Extras profile={profile} />
    </>
  );
}
