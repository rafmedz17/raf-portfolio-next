import SectionHeading from "./SectionHeading";
import ProjectList from "./ProjectList";

export default function Work({ projects }) {
  return (
    <section id="work" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 md:py-32">
        <SectionHeading index="02" label="work" note="work" title="Selected projects — things I've designed, built and shipped." />
        <ProjectList projects={projects} />
      </div>
    </section>
  );
}
