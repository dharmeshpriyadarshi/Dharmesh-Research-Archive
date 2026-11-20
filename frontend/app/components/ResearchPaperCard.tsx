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

export default function ResearchPaperCard({
  paper,
}: {
  paper: ResearchPaper;
}) {
  const doiUrl = paper.doi
    ? `https://doi.org/${paper.doi}`
    : null;

  const accessUrl = paper.pdf_url || doiUrl;

  const publicationDate = paper.publication_date
    ? new Date(paper.publication_date).toLocaleDateString(
        "en",
        {
          year: "numeric",
          month: "short",
        }
      )
    : "DATE UNAVAILABLE";

  return (
    <article className="voxel-card snap-voxel">
      <div className="voxel-card-content">
        <div className="voxel-card-heading">
          <span className="voxel-index">
            PUBLICATION / {paper.slug.toUpperCase()}
          </span>

          <span className="voxel-status">
            {publicationDate}
          </span>
        </div>

        <h3 className="voxel-title">{paper.title}</h3>

        <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-gray-600">
          {paper.abstract}
        </p>

        <div className="voxel-stack">
          <span className="voxel-stack-label">
            PUBLICATION DETAILS
          </span>

          <div className="mt-3 space-y-2 font-mono text-xs">
            {paper.journal_or_conference && (
              <p>{paper.journal_or_conference}</p>
            )}

            {doiUrl && (
              <p className="break-all">
                DOI:{" "}
                <a
                  href={doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:opacity-75 transition-opacity"
                >
                  {paper.doi}
                </a>
              </p>
            )}
          </div>
        </div>

        {accessUrl ? (
          <a
            href={accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="voxel-open"
          >
            {paper.pdf_url ? "ACCESS PAPER" : "VIEW PUBLICATION"}
          </a>
        ) : (
          <span className="voxel-open">
            PUBLICATION RECORD
          </span>
        )}
      </div>
    </article>
  );
}
