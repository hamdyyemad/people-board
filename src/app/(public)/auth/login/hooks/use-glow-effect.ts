import { useRef, useCallback } from "react";

type GlowRefs = {
  [key: string]: HTMLDivElement | null;
};

export function useGlowEffect() {
  const glowRefs = useRef<GlowRefs>({});

  const setGlowRef = useCallback(
    (roleId: string, el: HTMLDivElement | null) => {
      glowRefs.current[roleId] = el;
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>, roleId: string) => {
      const ref = glowRefs.current[roleId];
      if (ref) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ref.style.left = `${x}px`;
        ref.style.top = `${y}px`;
      }
    },
    []
  );

  return {
    glowRefs,
    handleMouseMove,
  };
}
