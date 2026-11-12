import Link from "next/link";

interface TechComponent {
  id: number;
  category: string;
  name: string;
  version?: string;
}

interface ProjectMetric {
  id: number;
  metric_type: string;
  metric_data: Record<string, unknown>;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  repository_url?: string;
  status: string;
  components: TechComponent[];
  metrics: ProjectMetric[];
}

async function getProjects(): Promise<Project[]> {
  const apiUrl =
    process.env.API_URL ?? "http://127.0.0.1:8000";

  const response = await fetch(`${apiUrl}/api/projects/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch projects: ${response.status}`
    );
  }

  return response.json();
}

function MetricValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span>—</span>;
  }

  if (typeof value === "object") {
    return <code>{JSON.stringify(value)}</code>;
  }

  return <span>{String(value)}</span>;
}

export default async function PortfolioRoot() {
  const projects = await getProjects();

  return (
    <main>
      <header className="mb-16 border-b-2 border-black pb-8">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em]">
          Research Archive / 2026
        </p>

        <h1 className="mb-3 text-4xl sm:text-5xl">
          Dharmesh Priyadarshi
        </h1>

        <p className="text-lg text-gray-600">
          M.Sc. Data Science Candidate | Applied Machine Learning
        </p>

        <p className="mt-5 max-w-2xl text-sm text-gray-600">
          A technical archive documenting research,
          computational experiments, machine learning
          systems, and software architectures.
        </p>
      </header>

      <section>
        <div className="mb-8 flex items-baseline justify-between border-b border-black pb-3">
          <h2 className="text-xl uppercase tracking-wide">
            Selected Research & Architectures
          </h2>

          <span className="font-mono text-xs">
            {projects.length.toString().padStart(2, "0")} ENTRIES
          </span>
        </div>

        {projects.length === 0 ? (
          <p className="py-8 text-gray-600">
            No research artifacts currently indexed.
          </p>
        ) : (
          <div className="space-y-12">
            {projects.map((project, index) => (
              <article
                key={project.id}
                className="border-b border-gray-300 pb-10"
              >
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-mono text-xs text-gray-500">
                    PROJECT {String(index + 1).padStart(2, "0")}
                  </p>

                  <span className="border border-gray-400 px-2 py-1 font-mono text-[10px] uppercase">
                    {project.status}
                  </span>
                </div>

                <h3 className="mb-4 text-2xl">
                  <Link
                    href={`/research/${project.slug}`}
                    className="underline decoration-gray-400 underline-offset-4 transition-colors hover:decoration-black"
                  >
                    {project.title}
                  </Link>
                </h3>

                <p className="mb-5 max-w-3xl text-gray-700">
                  {project.abstract}
                </p>

                {project.repository_url && (
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-mono text-xs underline underline-offset-4"
                  >
                    [ Source Code Repository ]
                  </a>
                )}

                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <section>
                    <h4 className="mb-3 border-b border-black pb-2 font-mono text-xs uppercase tracking-wider">
                      Technical Components
                    </h4>

                    <ul className="space-y-2">
                      {project.components.map((component) => (
                        <li
                          key={component.id}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span>{component.name}</span>
                          <span className="font-mono text-xs text-gray-500">
                            {component.version ?? "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="mb-3 border-b border-black pb-2 font-mono text-xs uppercase tracking-wider">
                      Research Metrics
                    </h4>

                    <div className="space-y-5">
                      {project.metrics.map((metric) => (
                        <div key={metric.id}>
                          <p className="mb-2 text-sm font-bold">
                            {metric.metric_type}
                          </p>

                          <table className="my-0">
                            <tbody>
                              {Object.entries(metric.metric_data).map(
                                ([key, value]) => (
                                  <tr key={key}>
                                    <td className="break-all text-gray-600">
                                      {key.replaceAll("_", " ")}
                                    </td>
                                    <td className="text-right font-mono">
                                      <MetricValue value={value} />
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-16 border-t-2 border-black pt-5 font-mono text-xs text-gray-500">
        <p>DHARMESH PRIYADARSHI — RESEARCH ARCHIVE</p>
        <p className="mt-2">Built with FastAPI · PostgreSQL · Next.js</p>
      </footer>
    </main>
  );
}
