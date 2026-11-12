
import VoxelCard from "./components/VoxelCard";

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
          <section className="max-w-6xl mx-auto isometric-grid">
            {projects.map((project) => (
              <VoxelCard
                key={project.id}
                project={project}
              />
            ))}
          </section>
        )}
      </section>

      <footer className="mt-16 border-t-2 border-black pt-5 font-mono text-xs text-gray-500">
        <p>DHARMESH PRIYADARSHI — RESEARCH ARCHIVE</p>
        <p className="mt-2">
          Built with FastAPI · PostgreSQL · Next.js
        </p>
      </footer>
    </main>
  );
}
