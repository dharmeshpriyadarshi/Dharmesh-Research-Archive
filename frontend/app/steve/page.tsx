import Link from "next/link";
import HouseExperience from "./components/HouseExperience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steve in & as Dharmesh Priyadarshi | Research Archive",
  description:
    "An optional interactive voxel research portfolio.",
};

export default function StevePage() {
  return (
    <main className="steve-page min-h-screen bg-neutral-950 text-neutral-100">
      <div className="w-full">
        <header className="mb-16 border-b-2 border-neutral-500 pb-8">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
            The Inventory / 2026
          </p>

          <h1 className="mb-3 text-4xl font-bold text-neutral-100 sm:text-5xl">
            Steve in &amp; as Dharmesh Priyadarshi
          </h1>

          <p className="text-lg text-neutral-300">
            Mining Data | Crafting Models | Building Backend Systems
          </p>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <p className="max-w-2xl text-sm text-neutral-300">
              A different route through the same work: uncover
              research, inspect systems, and discover ideas
              still on the crafting table.
            </p>

            <nav
              aria-label="Alternate portfolio experience"
              className="shrink-0 self-end sm:self-auto"
            >
              <Link
                href="/"
                aria-label="Return to the standard academic portfolio"
                className="archive-mode-switch inline-flex min-h-11 items-center gap-3 border border-neutral-500 px-4 py-2 font-mono text-xs text-neutral-200 transition-colors duration-200 hover:border-neutral-200 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span aria-hidden="true">?</span>
                The Non-Steve Way
              </Link>
            </nav>
          </div>
        </header>

        <section
          aria-labelledby="world-heading"
          className="mt-10"
        >
          <div className="mb-6 border-b border-neutral-700 pb-3">
            <h2
              id="world-heading"
              className="text-xl font-bold text-neutral-100"
            >
              The Overworld
            </h2>
          </div>

          <HouseExperience />
        </section>
      </div>
    </main>
  );
}
