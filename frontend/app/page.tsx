
import VoxelCard from "./components/VoxelCard";
import ResearchPaperCard from "./components/ResearchPaperCard";

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

interface ResearchPaper {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  journal_or_conference?: string | null;
  publication_date?: string | null;
  pdf_url?: string | null;
  doi?: string | null;
}

async function getProjects(): Promise<Project[]> {
  const apiUrl =
    process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

  const response = await fetch(`${apiUrl}/api/projects/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }

  return response.json();
}

async function getResearchPapers(): Promise<ResearchPaper[] | null> {
  const apiUrl =
    process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

  try {
    const response = await fetch(`${apiUrl}/api/research-papers/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function PortfolioRoot() {
  const [projects, papers] = await Promise.all([
    getProjects(),
    getResearchPapers(),
  ]);

  const skills = Array.from(
    new Map(
      projects.flatMap((project) =>
        project.components.map(
          (component) =>
            [component.name.toLowerCase(), component.name] as const
        )
      )
    ).values()
  ).sort((a, b) => a.localeCompare(b));

  return (
    <main className="archive-page">
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

      <section className="mb-14 lg:mb-16">
        <div className="mb-8 flex items-baseline justify-between border-b border-black pb-3">
          <h2 className="text-xl uppercase tracking-wide">
            Software Projects
          </h2>

          <span className="font-mono text-xs">
            {projects.length.toString().padStart(2, "0")} ENTRIES
          </span>
        </div>

        {projects.length === 0 ? (
          <p className="py-8 text-gray-600">
            No software projects currently indexed.
          </p>
        ) : (
          <div className="horizontal-matrix project-matrix">
            {projects.map((project) => (
              <div className="snap-voxel" key={project.id}>
                <VoxelCard project={project} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-14 lg:mb-16">
        <div className="mb-8 flex items-baseline justify-between border-b border-black pb-3">
          <h2 className="text-xl uppercase tracking-wide">
            Academic Publications
          </h2>

          <span className="font-mono text-xs">
            {papers === null
              ? "UNAVAILABLE"
              : `${papers.length.toString().padStart(2, "0")} ENTRIES`}
          </span>
        </div>

        {papers === null ? (
          <p className="py-8 text-gray-600">
            Publication records could not be retrieved.
          </p>
        ) : papers.length === 0 ? (
          <p className="py-8 text-gray-600">
            No academic publications currently indexed.
          </p>
        ) : (
          <div className="horizontal-matrix publication-matrix">
            {papers.map((paper) => (
              <ResearchPaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-14 lg:mb-16">
        <div className="mb-8 flex items-baseline justify-between border-b border-black pb-3">
          <h2 className="text-xl uppercase tracking-wide">
            Technical Skills
          </h2>

          <span className="font-mono text-xs">
            {skills.length.toString().padStart(2, "0")} TECHNOLOGIES
          </span>
        </div>

        {skills.length === 0 ? (
          <p className="py-8 text-gray-600">
            No technologies currently indexed.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="border border-black bg-white px-4 py-2 font-mono text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-16 border-t-2 border-black pt-5 font-mono text-xs text-gray-500">
        <p>DHARMESH PRIYADARSHI - RESEARCH ARCHIVE</p>
        <p className="mt-2">
          Built with FastAPI | PostgreSQL | Next.js
        </p>
      </footer>
    </main>
  );
}
