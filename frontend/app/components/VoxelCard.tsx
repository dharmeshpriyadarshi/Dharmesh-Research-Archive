
import Link from "next/link";

interface ProjectMetric {
  id: number;
  metric_type: string;
  metric_data: Record<string, unknown>;
}

interface TechComponent {
  id: number;
  name: string;
}

interface Project {
  id: string;
  slug: string;
  title: string;
  status: string;
  metrics?: ProjectMetric[];
  components?: TechComponent[];
}

export default function VoxelCard({ project }: { project: Project }) {
  const metrics = project.metrics ?? [];
  const components = project.components ?? [];

  return (
    <Link
      href={`/research/${project.slug}`}
      aria-label={`View research project: ${project.title}`}
      className="voxel-link"
    >
      <article className="voxel-card">
        <div className="voxel-card-content">
          <div className="voxel-card-heading">
            <span className="voxel-index">
              RESEARCH / {project.slug.toUpperCase()}
            </span>

            <span className="voxel-status">{project.status}</span>
          </div>

          <h3 className="voxel-title">{project.title}</h3>

          <div className="voxel-metrics">
            {metrics.slice(0, 2).map((metric) => (
              <div key={metric.id} className="voxel-metric">
                <span className="voxel-metric-label">
                  {metric.metric_type.replaceAll("_", " ")}
                </span>

                <span className="voxel-metric-value">
                  {Object.entries(metric.metric_data)
                    .map(([key, value]) => `${key}: ${String(value)}`)
                    .join(" · ")}
                </span>
              </div>
            ))}
          </div>

          <div className="voxel-stack">
            <span className="voxel-stack-label">TECHNOLOGY STACK</span>

            <div className="voxel-stack-items">
              {components.slice(0, 4).map((component) => (
                <span key={component.id}>{component.name}</span>
              ))}
            </div>
          </div>

          <span className="voxel-open">OPEN RESEARCH →</span>
        </div>
      </article>
    </Link>
  );
}
