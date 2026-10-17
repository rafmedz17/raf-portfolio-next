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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

// Runs before first paint: applies the saved theme (no flash), and decides
// whether the cinematic intro plays — home page only, once per session,
// never for people who prefer reduced motion.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;
const introScript = `try{if(${settings?.intro !== false}&&location.pathname==="/"&&!sessionStorage.getItem("intro-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="play"}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + introScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
