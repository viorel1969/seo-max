"use client";

import { useState } from "react";
import { analyzeHtml } from "@/lib/seo-analyzer";
import { exportReport } from "@/lib/folder-sync";
import { SeoReport } from "@/lib/types";

interface SeoAnalyzerProps {
  dirHandle: FileSystemDirectoryHandle | null;
  onReportGenerated: (report: SeoReport) => void;
}

export default function SeoAnalyzer({
  dirHandle,
  onReportGenerated,
}: SeoAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<SeoReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setSaved(false);

    try {
      const response = await fetch(
        `/api/sync?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        throw new Error(`Eroare la preluarea paginii: ${response.status}`);
      }
      const { html } = await response.json();
      const result = analyzeHtml(url, html);
      setReport(result);
      onReportGenerated(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Eroare la analiza"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToFolder() {
    if (!dirHandle || !report) return;
    try {
      await exportReport(dirHandle, report);
      setSaved(true);
    } catch (err) {
      setError(
        `Eroare la salvare: ${err instanceof Error ? err.message : "Eroare necunoscuta"}`
      );
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">Analiza SEO</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://exemplu.com"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Se analizeaza..." : "Analizeaza"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Rezultate</h3>
            <span
              className={`text-2xl font-bold ${getScoreColor(report.score)}`}
            >
              {report.score}/100
            </span>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="rounded bg-zinc-50 p-3 dark:bg-zinc-800">
              <span className="font-medium">Titlu:</span>{" "}
              <span className={!report.title ? "text-red-500" : ""}>
                {report.title || "Lipsa!"}
              </span>
              {report.title && (
                <span className="ml-2 text-xs text-zinc-500">
                  ({report.title.length} caractere)
                </span>
              )}
            </div>

            <div className="rounded bg-zinc-50 p-3 dark:bg-zinc-800">
              <span className="font-medium">Descriere meta:</span>{" "}
              <span className={!report.description ? "text-red-500" : ""}>
                {report.description || "Lipsa!"}
              </span>
              {report.description && (
                <span className="ml-2 text-xs text-zinc-500">
                  ({report.description.length} caractere)
                </span>
              )}
            </div>

            <div className="rounded bg-zinc-50 p-3 dark:bg-zinc-800">
              <span className="font-medium">H1:</span>{" "}
              {report.h1Tags.length === 0 ? (
                <span className="text-red-500">Lipsa!</span>
              ) : (
                report.h1Tags.join(", ")
              )}
              {report.h1Tags.length > 1 && (
                <span className="ml-2 text-xs text-yellow-600">
                  (multiple H1 - recomandat doar 1)
                </span>
              )}
            </div>

            <div className="rounded bg-zinc-50 p-3 dark:bg-zinc-800">
              <span className="font-medium">Imagini:</span>{" "}
              {report.totalImages} total,{" "}
              <span
                className={
                  report.imagesMissingAlt > 0 ? "text-red-500" : ""
                }
              >
                {report.imagesMissingAlt} fara alt
              </span>
            </div>

            <div className="rounded bg-zinc-50 p-3 dark:bg-zinc-800">
              <span className="font-medium">Numar cuvinte:</span>{" "}
              <span
                className={report.wordCount < 300 ? "text-yellow-600" : ""}
              >
                {report.wordCount}
              </span>
              {report.wordCount < 300 && (
                <span className="ml-2 text-xs text-yellow-600">
                  (recomandat minim 300)
                </span>
              )}
            </div>
          </div>

          {dirHandle && (
            <button
              onClick={handleSaveToFolder}
              disabled={saved}
              className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-900/20"
            >
              {saved
                ? "Salvat in folder!"
                : "Salveaza in folder local"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
