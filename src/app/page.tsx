"use client";

import { useState, useCallback } from "react";
import FolderConnection from "@/components/FolderConnection";
import SeoAnalyzer from "@/components/SeoAnalyzer";
import ReportsList from "@/components/ReportsList";
import { writeProjectData, readProjectData } from "@/lib/folder-sync";
import { ProjectData, SeoReport, SyncStatus } from "@/lib/types";

export default function Home() {
  const [dirHandle, setDirHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [reports, setReports] = useState<SeoReport[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: false,
    folderName: null,
    lastSync: null,
    fileCount: 0,
  });

  const handleConnect = useCallback(
    async (handle: FileSystemDirectoryHandle, data: ProjectData) => {
      setDirHandle(handle);
      setReports(data.reports);
      setSyncStatus({
        connected: true,
        folderName: handle.name,
        lastSync: new Date().toISOString(),
        fileCount: data.reports.length,
      });
    },
    []
  );

  const handleDisconnect = useCallback(() => {
    setDirHandle(null);
    setSyncStatus({
      connected: false,
      folderName: null,
      lastSync: null,
      fileCount: 0,
    });
  }, []);

  const handleReportGenerated = useCallback(
    async (report: SeoReport) => {
      setReports((prev) => {
        const existing = prev.findIndex((r) => r.url === report.url);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = report;
          return updated;
        }
        return [report, ...prev];
      });

      if (dirHandle) {
        try {
          const data = await readProjectData(dirHandle);
          const existingIndex = data.reports.findIndex(
            (r) => r.url === report.url
          );
          if (existingIndex >= 0) {
            data.reports[existingIndex] = report;
          } else {
            data.reports.push(report);
          }
          await writeProjectData(dirHandle, data);
          setSyncStatus((prev) => ({
            ...prev,
            lastSync: new Date().toISOString(),
            fileCount: data.reports.length,
          }));
        } catch {
          // Sync error - report is still in local state
        }
      }
    },
    [dirHandle]
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">SEO Max</h1>
          <span className="text-xs text-zinc-500">
            Analiza SEO + Sync Local
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <FolderConnection
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          syncStatus={syncStatus}
        />

        <SeoAnalyzer
          dirHandle={dirHandle}
          onReportGenerated={handleReportGenerated}
        />

        <ReportsList reports={reports} />
      </main>
    </div>
  );
}
