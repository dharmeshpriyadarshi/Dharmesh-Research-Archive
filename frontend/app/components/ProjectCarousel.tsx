"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const EDGE_TOLERANCE = 2;

export default function ProjectCarousel({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const viewportId = useId();
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const left = viewport.scrollLeft > EDGE_TOLERANCE;
    const right = viewport.scrollLeft < maximum - EDGE_TOLERANCE;

    // Preserve keyboard focus when the activated control disappears.
    if (
      (!left && document.activeElement === previousRef.current) ||
      (!right && document.activeElement === nextRef.current)
    ) {
      viewport.focus({ preventScroll: true });
    }

    setEdges((current) =>
      current.left === left && current.right === right
        ? current
        : { left, right }
    );
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const frame = requestAnimationFrame(updateEdges);
    const observer = new ResizeObserver(updateEdges);
    observer.observe(viewport);
    Array.from(viewport.children).forEach((child) => observer.observe(child));

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [children, updateEdges]);

  function navigate(direction: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport || !viewport.firstElementChild) return;

    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const current = Math.max(0, Math.min(maximum, viewport.scrollLeft));
    const firstLeft = viewport.firstElementChild.getBoundingClientRect().left;
    const positions = [
      0,
      ...Array.from(viewport.children).map((child) =>
        Math.max(0, Math.min(maximum, child.getBoundingClientRect().left - firstLeft))
      ),
      maximum,
    ].sort((a, b) => a - b);

    const target = direction === 1
      ? positions.find((position) => position > current + EDGE_TOLERANCE)
      : positions.reverse().find((position) => position < current - EDGE_TOLERANCE);

    if (target === undefined) return;

    viewport.scrollTo({
      left: target,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Keep the keyboard behavior of links inside project cards intact.
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      navigate(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  return (
    <div className="archive-project-carousel">
      <button
        ref={previousRef}
        type="button"
        className="archive-project-nav archive-project-nav-prev"
        hidden={!edges.left}
        aria-label="Previous project"
        aria-controls={viewportId}
        onClick={() => navigate(-1)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <path d="m15 5-7 7 7 7" />
        </svg>
      </button>

      <div
        ref={viewportRef}
        id={viewportId}
        className="horizontal-matrix project-matrix"
        role="region"
        aria-label="Software projects; use arrow keys to browse"
        tabIndex={0}
        onScroll={updateEdges}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>

      <button
        ref={nextRef}
        type="button"
        className="archive-project-nav archive-project-nav-next"
        hidden={!edges.right}
        aria-label="Next project"
        aria-controls={viewportId}
        onClick={() => navigate(1)}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
