import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import {
  formatPublicationDate,
  publicationAccess,
  type PublicationDetail,
} from "../../types/publication";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPublication(slug: string): Promise<PublicationDetail | null> {
  const apiUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  const response = await fetch(
    `${apiUrl}/api/research-papers/${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch publication: ${response.status}`);
  return response.json();
}

export default async function PublicationPage({ params }: PageProps) {
  const { slug } = await params;
  const paper = await getPublication(slug);
  if (!paper) notFound();

  const access = publicationAccess(paper);
  const date = formatPublicationDate(paper.publication_date);
  const authors = paper.authors ?? [];
  const pending = paper.publication_status === "Publication in progress";

  return (
    <main className="research-page archive-publication-page">
      <header className="mb-10 border-b-2 border-black pb-6">
        <Link href="/" className="font-mono text-sm text-gray-700 hover:underline">
          {"\u2190"} Return to Archive
        </Link>
        <p className="mt-6 font-mono text-xs uppercase tracking-widest">Academic Publication</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{paper.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="bg-gray-100 px-3 py-1 uppercase text-gray-800">
            {paper.publication_status}
          </span>
          {date && <span>{date}</span>}
        </div>
        {authors.length > 0 && <p className="mt-4 text-gray-700">{authors.join(", ")}</p>}
        {paper.journal_or_conference && <p className="mt-2 text-sm text-gray-700">{paper.journal_or_conference}</p>}
        {access && (
          <a href={access} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block border border-black px-4 py-3 font-mono text-xs hover:bg-black hover:text-white">
            {paper.doi ? "VIEW OFFICIAL PUBLICATION" : "ACCESS PAPER"} {"\u2197"}
          </a>
        )}
        {access && paper.doi && <p className="mt-3 break-all font-mono text-xs">DOI: {paper.doi}</p>}
        {pending && <p className="mt-4 text-sm text-gray-700">Research manuscript summary. Peer-reviewed publication has not yet been established.</p>}
      </header>
      <section className="research-content mb-10">
        <h2>Abstract</h2>
        <p>{paper.abstract}</p>
      </section>
      <article className="research-content max-w-none">
        {paper.content ? (
          <MDXRemote source={paper.content} options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [rehypeKatex],
            },
          }} />
        ) : (
          <p>Detailed research content is not currently available for this record.</p>
        )}
      </article>
      <footer className="mt-16 border-t border-gray-300 pt-6 font-mono text-xs">
        {access && <a href={access} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{paper.doi ? "Official publication record" : "Access paper"}</a>}
      </footer>
    </main>
  );
}
