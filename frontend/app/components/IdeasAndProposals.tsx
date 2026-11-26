import ProjectCarousel from "./ProjectCarousel";

interface Proposal {
  slug: string;
  title: string;
  tagline: string;
  problem: string;
  approach: string;
}

// Intentionally empty until proposals have been reviewed.
// These are editorial concepts, not completed software projects.
const PROPOSALS: Proposal[] = [
  {
    slug: "blame-game",
    title: "BlameGame",
    tagline: "Stop passing blame. Start tracing responsibility.",
    problem:
      "Public infrastructure priorities can be difficult to reconcile " +
      "with verified local needs. Citizens may lack a clear way to trace " +
      "how reported problems, funding decisions, responsible authorities " +
      "and completed public works are connected.",
    approach:
      "A proposed government-integrated accountability platform linking " +
      "geotagged citizen reports, infrastructure need assessments, " +
      "documented public expenditure and project outcomes. A district-level " +
      "Civic Accountability Liaison would route grievances to responsible " +
      "authorities and track their responses without replacing official " +
      "budgetary or administrative powers.",
  },
];

export default function IdeasAndProposals() {
  return (
    <section className="mb-14 lg:mb-16" aria-label="Ideas and proposals">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-black pb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
          <span className="text-xl uppercase tracking-wide">
            Ideas &amp; Proposals
          </span>

          <span className="flex shrink-0 items-center gap-3">
            <span className="font-mono text-xs">
              {PROPOSALS.length.toString().padStart(2, "0")} PROPOSALS
            </span>
            <svg
              className="h-5 w-5 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </summary>

        <div className="pt-6">
          <p className="mb-6 max-w-3xl text-sm text-gray-600">
            Open problem statements and possible solutions. Entries in this
            section are proposals, not implemented or scientifically
            validated results. Some may be developed collaboratively.
          </p>

          <ProjectCarousel label="Ideas, proposals, and contact">
            {PROPOSALS.map((proposal) => (
              <div className="snap-voxel" key={proposal.slug}>
                <article className="voxel-card voxel-card-planned">
                  <div className="voxel-card-content">
                    <span className="voxel-index">
                      IDEA / {proposal.slug.toUpperCase()}
                    </span>
                    <h3 className="voxel-title">{proposal.title}</h3>
                    <p className="mt-2 font-mono text-xs text-gray-600">
                      {proposal.tagline}
                    </p>
                    <p className="mt-4 text-sm text-gray-700">
                      <strong>Problem:</strong> {proposal.problem}
                    </p>
                    <p className="mt-3 text-sm text-gray-700">
                      <strong>Possible approach:</strong> {proposal.approach}
                    </p>
                    <p className="mt-5 font-mono text-xs text-gray-500">
                      CONCEPT ONLY / NOT IMPLEMENTED
                    </p>
                  </div>
                </article>
              </div>
            ))}

            {PROPOSALS.length === 0 && (
              <div className="snap-voxel">
                <article className="voxel-card voxel-card-planned">
                  <div className="voxel-card-content">
                    <span className="voxel-index">
                      IDEAS / UNDER PREPARATION
                    </span>
                    <h3 className="voxel-title">
                      A space for open proposals
                    </h3>
                    <p className="mt-5 text-sm text-gray-600">
                      Detailed problem statements and proposed approaches
                      will appear here as they are documented.
                    </p>
                    <p className="mt-5 font-mono text-xs text-gray-500">
                      NO PROPOSALS PUBLISHED YET
                    </p>
                  </div>
                </article>
              </div>
            )}

            <div className="snap-voxel">
              <article className="voxel-card">
                <div className="voxel-card-content">
                  <span className="voxel-index">
                    CONTACT / COLLABORATION
                  </span>
                  <h3 className="voxel-title">
                    Write Something to Me
                  </h3>
                  <p className="mt-4 text-sm text-gray-700">
                    Interested in a project, a research idea, or a
                    possible collaboration? This is where visitors
                    will be able to reach me.
                  </p>

                  <a
                    href="https://github.com/dharmeshpriyadarshi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block border-b-2 border-black font-mono text-sm font-semibold hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    GitHub profile {"\u2197"}
                  </a>

                  <p className="mt-5 text-xs text-gray-500">
                    Direct messaging, email and LinkedIn will be
                    configured before public release of this section.
                  </p>
                </div>
              </article>
            </div>
          </ProjectCarousel>
        </div>
      </details>
    </section>
  );
}
