import Link from "next/link";
import { formatPublicationDate, type ResearchPaper } from "../types/publication";

export default function ResearchPaperCard({ paper }: { paper: ResearchPaper }) {
  const pending = paper.publication_status === "Publication in progress";
  const date = formatPublicationDate(paper.publication_date);
  const authors = paper.authors ?? [];

  return (
    <article className={`voxel-card snap-voxel${pending ? " voxel-card-planned" : ""}`}>
      <div className="voxel-card-content">
        <div className="voxel-card-heading">
          <span className="voxel-index">PUBLICATION / {paper.slug.toUpperCase()}</span>
          <span className="voxel-status">
            {pending ? "IN PROGRESS" : date || paper.publication_status || "RECORD"}
          </span>
        </div>
        <h3 className="voxel-title">{paper.title}</h3>
        <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-gray-600">
          {paper.abstract}
        </p>
        <div className="voxel-stack">
          <span className="voxel-stack-label">PUBLICATION DETAILS</span>
          <div className="mt-3 space-y-2 font-mono text-xs">
            {authors.length > 0 && <p>{authors.join(", ")}</p>}
            {pending ? (
              <p>Publication in progress. Not a published paper.</p>
            ) : (
              <>
                {paper.journal_or_conference && <p>{paper.journal_or_conference}</p>}
                {paper.doi && <p className="break-all">DOI: {paper.doi}</p>}
              </>
            )}
          </div>
        </div>
        <Link href={`/publications/${encodeURIComponent(paper.slug)}`} className="voxel-open">
          {pending ? "VIEW MANUSCRIPT SUMMARY" : "OPEN PUBLICATION"} {"\u2192"}
        </Link>
      </div>
    </article>
  );
}
