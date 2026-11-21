export interface ResearchPaper {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  journal_or_conference?: string | null;
  publication_date?: string | null;
  pdf_url?: string | null;
  doi?: string | null;
  authors: string[];
  publication_status: "Published" | "Publication in progress" | "Unspecified";
}

export interface PublicationDetail extends ResearchPaper {
  content: string | null;
}

export function formatPublicationDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function publicationAccess(paper: ResearchPaper): string | null {
  if (paper.publication_status !== "Published") return null;
  if (paper.doi) return `https://doi.org/${paper.doi}`;
  if (!paper.pdf_url) return null;
  try {
    const url = new URL(paper.pdf_url);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
