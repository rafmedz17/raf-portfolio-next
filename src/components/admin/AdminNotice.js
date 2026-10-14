import Link from "next/link";

export default function AdminNotice({ title, children }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-7">
        <p className="font-mono text-xs text-accent">~/admin</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted [&_code]:rounded [&_code]:bg-bg [&_code]:px-1 [&_code]:font-mono [&_code]:text-fg">
          {children}
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-muted hover:text-fg">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
