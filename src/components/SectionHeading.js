import Reveal from "./Reveal";
import DevNote from "./DevNote";

export default function SectionHeading({ index, label, title, note }) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <p className="font-mono text-xs text-muted">
        <span className="text-accent">{index}</span> / {label}
        {note && <DevNote id={note} className="ml-3" />}
      </p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {title}
      </h2>
    </Reveal>
  );
}
