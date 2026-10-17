"use client";

import { focusContact } from "@/lib/theme";

// Jumps to the contact form and puts the cursor in it. Still a real
// #contact link, so it works before JavaScript loads too.
export default function ContactButton({ className = "", children }) {
  return (
    <a
      href="#contact"
      onClick={(e) => {
        e.preventDefault();
        focusContact();
      }}
      className={className}
    >
      {children}
    </a>
  );
}
