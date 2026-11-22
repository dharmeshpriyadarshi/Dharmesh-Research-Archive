"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

const WorldCanvas = dynamic(() => import("./WorldCanvas"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="flex h-full items-center justify-center text-sm text-neutral-300"
    >
      Preparing 3D renderer...
    </div>
  ),
});

export default function WorldPreview() {
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const onReady = useCallback(() => {
    setReady(true);
  }, []);

  function openPreview() {
    try {
      const canvas = document.createElement("canvas");
      if (!canvas.getContext("webgl2")) {
        setError("This device does not support WebGL 2.");
        return;
      }

      setError("");
      setReady(false);
      setEntered(true);
    } catch {
      setError("Unable to initialize WebGL.");
    }
  }

  return (
    <section
      aria-label="Soulwitch's World preview"
      className="overflow-hidden border border-neutral-700 bg-neutral-900"
    >
      {!entered ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center gap-5 p-8 text-center">
          <h2 className="text-xl font-bold text-neutral-100">
            Inspect the new environment
          </h2>

          <p className="max-w-lg text-sm text-neutral-300">
            Load the converted world, inspect its buildings,
            terrain and interiors, and test the camera view.
          </p>

          <button
            type="button"
            onClick={openPreview}
            className="min-h-11 cursor-pointer border border-neutral-400 px-5 py-3 font-mono text-sm text-white hover:bg-neutral-700"
          >
            Load Soulwitch&apos;s World
          </button>

          {error && (
            <p role="alert" className="text-sm text-amber-300">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="relative h-[65vh] min-h-[460px] w-full">
          <WorldCanvas onReady={onReady} />

          {!ready && (
            <div
              role="status"
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-950/75 text-sm text-white"
            >
              Loading world geometry and textures...
            </div>
          )}

          <div className="pointer-events-none absolute bottom-3 left-3 bg-black/80 px-3 py-2 font-mono text-xs text-white">
            Drag: rotate | Scroll: zoom | Right-drag: pan
          </div>

          <button
            type="button"
            onClick={() => {
              setEntered(false);
              setReady(false);
            }}
            className="absolute right-3 top-3 min-h-11 cursor-pointer border border-neutral-500 bg-black/85 px-4 font-mono text-xs text-white hover:bg-neutral-800"
          >
            Close Preview
          </button>
        </div>
      )}
    </section>
  );
}
