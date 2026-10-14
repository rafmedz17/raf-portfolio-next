"use client";

import { useEffect, useState } from "react";
import Site from "@/components/Site";

// Lives inside the editor's iframe and re-renders the real site with
// whatever draft the editor sends over postMessage.
export default function PreviewClient({ initialContent }) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const msg = e.data ?? {};
      if (msg.type === "draft" && msg.content) setContent(msg.content);
      if (msg.type === "scroll" && msg.id) {
        document.getElementById(msg.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (msg.type === "theme") document.documentElement.dataset.theme = msg.theme;
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <Site content={content} />;
}
