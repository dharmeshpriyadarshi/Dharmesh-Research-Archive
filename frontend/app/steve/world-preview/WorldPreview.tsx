"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { SurfaceSample } from "./WorldCanvas";

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
  const [orientation, setOrientation] = useState<
    "source" | "upright"
  >("source");
  const [surfaceSample, setSurfaceSample] =
    useState<SurfaceSample | null>(null);

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
          <WorldCanvas
            onReady={onReady}
            orientation={orientation}
            onSurfaceSample={setSurfaceSample}
            selected={surfaceSample}
          />

          <div
            role="group"
            aria-label="World orientation comparison"
            className="absolute left-3 top-3 z-10 flex gap-2 border border-neutral-500 bg-black/90 p-2"
          >
            <button
              type="button"
              aria-pressed={orientation === "source"}
              onClick={() => {
                setOrientation("source");
                setSurfaceSample(null);
              }}
              className={
                orientation === "source"
                  ? "min-h-11 border border-white bg-white px-3 font-mono text-xs text-black"
                  : "min-h-11 border border-neutral-500 px-3 font-mono text-xs text-white hover:bg-neutral-700 focus-visible:bg-neutral-700"
              }
            >
              Source Axes
            </button>

            <button
              type="button"
              aria-pressed={orientation === "upright"}
              onClick={() => {
                setOrientation("upright");
                setSurfaceSample(null);
              }}
              className={
                orientation === "upright"
                  ? "min-h-11 border border-white bg-white px-3 font-mono text-xs text-black"
                  : "min-h-11 border border-neutral-500 px-3 font-mono text-xs text-white hover:bg-neutral-700 focus-visible:bg-neutral-700"
              }
            >
              Upright Test
            </button>
          </div>

          {!ready && (
            <div
              role="status"
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-950/75 text-sm text-white"
            >
              Loading world geometry and textures...
            </div>
          )}

          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute bottom-3 right-3 max-w-[min(90%,360px)] border border-neutral-600 bg-black/90 p-3 font-mono text-xs leading-relaxed text-white"
          >
            <p className="mb-1 font-bold">
              Surface Inspector
            </p>

            {orientation !== "source" ? (
              <p>Switch to Source Axes to sample.</p>
            ) : surfaceSample ? (
              <>
                <p>
                  Preview XYZ:{" "}
                  {surfaceSample.world
                    .map((value) => value.toFixed(2))
                    .join(", ")}
                </p>
                <p>
                  GLB-local XYZ:{" "}
                  {surfaceSample.source
                    .map((value) => value.toFixed(2))
                    .join(", ")}
                </p>
                <p>Mesh: {surfaceSample.mesh}</p>
              </>
            ) : (
              <p>Shift + click a flat patch of ground.</p>
            )}
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 bg-black/80 px-3 py-2 font-mono text-xs text-white">
            <span className="block">
              Drag: rotate | Scroll: zoom | Right-drag: pan
            </span>
            <span className="mt-1 block text-neutral-300">
              {orientation === "source"
                ? "GLB source orientation"
                : "Experimental +90 degree X-axis rotation"}
            </span>
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
