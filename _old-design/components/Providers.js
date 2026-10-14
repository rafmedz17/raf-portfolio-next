"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import Preloader from "./Preloader";
import Cursor from "./Cursor";

const SiteContext = createContext({ loaded: false, lenis: null });

export const useSite = () => useContext(SiteContext);

export default function Providers({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [lenis, setLenis] = useState(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      anchors: { offset: 0 },
    });
    lenisRef.current = instance;
    setLenis(instance);
    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lock scrolling while the preloader is on screen.
  useEffect(() => {
    if (!lenis) return;
    if (loaded) lenis.start();
    else lenis.stop();
  }, [lenis, loaded]);

  return (
    <MotionConfig reducedMotion="user">
      <SiteContext.Provider value={{ loaded, lenis }}>
        <Preloader onComplete={() => setLoaded(true)} />
        <Cursor />
        <div className="grain" aria-hidden />
        {children}
      </SiteContext.Provider>
    </MotionConfig>
  );
}
