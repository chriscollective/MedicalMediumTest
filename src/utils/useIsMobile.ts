import { useEffect, useState } from "react";

export function useIsMobile(maxWidth = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const query = `(max-width: ${maxWidth}px)`;
    const mm = window.matchMedia(query);
    const update = () => setIsMobile(mm.matches);
    update();
    mm.addEventListener("change", update);
    return () => {
      mm.removeEventListener("change", update);
    };
  }, [maxWidth]);

  return { isMobile };
}

