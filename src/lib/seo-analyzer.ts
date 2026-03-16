import { SeoReport } from "./types";

export function analyzeHtml(url: string, html: string): SeoReport {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const title = doc.querySelector("title")?.textContent?.trim() || "";
  const description =
    doc
      .querySelector('meta[name="description"]')
      ?.getAttribute("content")
      ?.trim() || "";

  const h1Tags = Array.from(doc.querySelectorAll("h1")).map(
    (el) => el.textContent?.trim() || ""
  );
  const h2Tags = Array.from(doc.querySelectorAll("h2")).map(
    (el) => el.textContent?.trim() || ""
  );

  const images = doc.querySelectorAll("img");
  const totalImages = images.length;
  const imagesMissingAlt = Array.from(images).filter(
    (img) => !img.getAttribute("alt")?.trim()
  ).length;

  const bodyText = doc.body?.textContent || "";
  const wordCount = bodyText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  let score = 100;
  if (!title) score -= 20;
  else if (title.length < 30 || title.length > 60) score -= 10;
  if (!description) score -= 15;
  else if (description.length < 120 || description.length > 160) score -= 5;
  if (h1Tags.length === 0) score -= 15;
  if (h1Tags.length > 1) score -= 10;
  if (imagesMissingAlt > 0) score -= Math.min(20, imagesMissingAlt * 5);
  if (wordCount < 300) score -= 10;

  return {
    url,
    title,
    description,
    h1Tags,
    h2Tags,
    imagesMissingAlt,
    totalImages,
    wordCount,
    score: Math.max(0, score),
    timestamp: new Date().toISOString(),
  };
}
