"use client";

import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";

const HouseScene = dynamic(() => import("./HouseScene"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="flex h-full items-center justify-center font-mono text-sm text-neutral-300"
    >
      Preparing the world...
    </div>
  ),
});

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          role="alert"
          className="flex h-full items-center justify-center px-6 text-center text-sm text-neutral-300"
        >
          The house model could not be loaded.
          Exit the viewer and check the model file.
        </div>
      );
    }

    return this.props.children;
  }
}

export default function HouseExperience() {
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState("");

  function enterWorld() {
    try {
      const canvas = document.createElement("canvas");

      if (!canvas.getContext("webgl2")) {
        setError(
          "WebGL 2 is unavailable on this device. The standard research archive remains accessible."
        );
        return;
      }

      setError("");
      setEntered(true);
    } catch {
      setError("Unable to initialize the 3D viewer.");
    }
  }

  return (
    <div className="overflow-hidden border border-neutral-700 bg-neutral-900">
      {!entered ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div
            aria-hidden="true"
            className="grid grid-cols-3 gap-2"
          >
            {Array.from({ length: 9 }, (_, index) => (
              <span
                key={index}
                className="h-11 w-11 border border-neutral-500 bg-neutral-700 shadow-[4px_4px_0_#414a3e]"
              />
            ))}
          </div>

          <h3 className="text-xl font-bold text-neutral-100">
            Your world is ready
          </h3>

          <p className="max-w-lg text-sm text-neutral-300">
            Explore the voxel house that will become the
            interactive entrance to this research archive.
          </p>

          <button
            type="button"
            onClick={enterWorld}
            className="min-h-11 cursor-pointer border border-neutral-400 px-5 py-3 font-mono text-xs text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Enter the World
          </button>

          {error && (
            <p role="alert" className="max-w-lg text-sm text-amber-300">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="relative h-[420px] w-full sm:h-[560px]">
          <SceneErrorBoundary>
            <HouseScene />
          </SceneErrorBoundary>

          <div className="pointer-events-none absolute bottom-3 left-3 bg-black/75 px-3 py-2 font-mono text-[11px] text-neutral-200">
            WASD: walk | Drag: camera | Space: jump | E: chest
          </div>

          <button
            type="button"
            onClick={() => setEntered(false)}
            className="absolute right-3 top-3 min-h-11 cursor-pointer border border-neutral-500 bg-black/80 px-3 font-mono text-xs text-white hover:bg-neutral-800 focus-visible:outline-2"
          >
            Exit 3D View
          </button>
        </div>
      )}
    </div>
  );
}
