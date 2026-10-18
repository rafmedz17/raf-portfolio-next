import { Geist, Geist_Mono } from "next/font/google";
import { profile, settings } from "@/data/portfolio";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: `${profile.fullName} — ${profile.role}`,
  description: profile.intro,
};

export const viewport = {
  themeColor: "#0b0b0c",
};

// The site is dark by default for everyone (set on <html> below), whatever
// their system setting. A visitor who switches to light keeps that choice.
//
// Runs before first paint: applies the saved theme (no flash), and decides
// whether the cinematic intro plays — home page only, once per session,
// never for people who prefer reduced motion.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;
const introScript = `try{if(${settings?.intro !== false}&&location.pathname==="/"&&!sessionStorage.getItem("intro-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="play"}catch(e){}`;
// Keeps god mode (Konami cheat) on across reloads during the same visit.
const godScript = `try{if(location.pathname==="/"&&sessionStorage.getItem("god")==="1")document.documentElement.setAttribute("data-god","")}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + introScript + godScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
