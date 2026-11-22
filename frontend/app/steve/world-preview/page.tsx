import type { Metadata } from "next";
import Link from "next/link";
import WorldPreview from "./WorldPreview";

export const metadata: Metadata = {
  title: "Soulwitch's World | Steve Mode Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorldPreviewPage() {
  return (
    <main className="steve-page min-h-screen text-neutral-100">
      <header className="mb-8 border-b border-neutral-700 pb-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-neutral-400">
          Steve Mode / Environment Preview
        </p>

        <h1 className="text-3xl font-bold text-neutral-100">
          Soulwitch&apos;s World
        </h1>

        <p className="mt-3 text-sm text-neutral-300">
          Isolated environment preview. The playable research
          archive remains unchanged.
        </p>

        <Link
          href="/steve"
          className="mt-5 inline-block text-sm text-neutral-200 underline"
        >
          Return to Steve Mode
        </Link>
      </header>

      <WorldPreview />
    </main>
  );
}
