"use client";

import { SeoReport } from "@/lib/types";

interface ReportsListProps {
  reports: SeoReport[];
}

export default function ReportsList({ reports }: ReportsListProps) {
  if (reports.length === 0) return null;

  function getScoreBg(score: number) {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 50) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">
        Rapoarte ({reports.length})
      </h2>
      <div className="space-y-2">
        {reports.map((r, i) => (
          <div
            key={`${r.url}-${i}`}
            className="flex items-center justify-between rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-800"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.url}</p>
              <p className="truncate text-xs text-zinc-500">
                {r.title || "Fara titlu"} &middot;{" "}
                {new Date(r.timestamp).toLocaleString("ro-RO")}
              </p>
            </div>
            <span
              className={`ml-3 rounded-full px-2 py-1 text-xs font-bold ${getScoreBg(r.score)}`}
            >
              {r.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
