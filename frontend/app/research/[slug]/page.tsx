
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface TechComponent {
  id: number;
  name: string;
  version?: string | null;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  content: string;
  status: string;
  repository_url?: string | null;
  components: TechComponent[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProjectBySlug(slug: string): Promise<Project | null> {
  const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8000";

  const response = await fetch(
    `${apiUrl}/api/projects/${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.status}`);
  }

  return response.json();
}

export default async function ResearchProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main>
      <header className="mb-10 border-b-2 border-black pb-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {project.title}
          </h1>

          <span className="bg-gray-100 px-3 py-1 font-mono text-sm uppercase text-gray-800">
            {project.status}
          </span>
        </div>

        <p className="mt-4 font-mono text-sm text-gray-700">
          <Link href="/" className="hover:underline">
            ← Return to Archive
          </Link>
        </p>

        <p className="mt-5 max-w-3xl text-gray-700">
          {project.abstract}
        </p>

        {project.repository_url && (
          <a
            href={project.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-mono text-xs underline underline-offset-4"
          >
            [ Source Code Repository ]
          </a>
        )}
      </header>

      <article className="research-content max-w-none">
        <MDXRemote
          source={project.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
            },
          }}
        />
      </article>

      <footer className="mt-16 border-t border-gray-300 pt-6">
        <h2 className="mb-4 text-lg font-bold uppercase">
          System Architecture / Components
        </h2>

        <div className="flex flex-wrap gap-2 font-mono text-sm">
          {project.components.map((component) => (
            <span
              key={component.id}
              className="bg-black px-2 py-1 text-white"
            >
              {component.name}
              {component.version ? ` v${component.version}` : ""}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
}
