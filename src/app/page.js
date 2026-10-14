import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Work from "@/components/Work";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CommandMenu from "@/components/CommandMenu";
import Extras from "@/components/Extras";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Work />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <CommandMenu />
      <Extras />
    </>
  );
}
