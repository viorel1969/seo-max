"use client";

import { useState } from "react";
import {
  pickFolder,
  readProjectData,
  listFolderFiles,
  verifyPermission,
} from "@/lib/folder-sync";
import { ProjectData, SyncStatus } from "@/lib/types";

interface FolderConnectionProps {
  onConnect: (
    handle: FileSystemDirectoryHandle,
    data: ProjectData
  ) => void;
  onDisconnect: () => void;
  syncStatus: SyncStatus;
}

export default function FolderConnection({
  onConnect,
  onDisconnect,
  syncStatus,
}: FolderConnectionProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const handle = await pickFolder();
      if (!handle) {
        setLoading(false);
        return;
      }

      const hasPermission = await verifyPermission(handle);
      if (!hasPermission) {
        setError("Permisiune refuzata. Te rog sa permiti accesul la folder.");
        setLoading(false);
        return;
      }

      const data = await readProjectData(handle);
      const folderFiles = await listFolderFiles(handle);
      setFiles(folderFiles);
      onConnect(handle, data);
    } catch (err) {
      setError(
        `Eroare la conectare: ${err instanceof Error ? err.message : "Eroare necunoscuta"}`
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    setFiles([]);
    onDisconnect();
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">Conexiune Folder Local</h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {!syncStatus.connected ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Conecteaza un folder local pentru a sincroniza rapoartele SEO,
            configurarile si datele proiectului.
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Se conecteaza..." : "Selecteaza Folder"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Conectat
            </span>
          </div>

          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <span className="font-medium">Folder:</span>{" "}
              {syncStatus.folderName}
            </p>
            <p>
              <span className="font-medium">Ultima sincronizare:</span>{" "}
              {syncStatus.lastSync
                ? new Date(syncStatus.lastSync).toLocaleString("ro-RO")
                : "Niciodata"}
            </p>
            <p>
              <span className="font-medium">Fisiere:</span>{" "}
              {syncStatus.fileCount}
            </p>
          </div>

          {files.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                Continut folder ({files.length} elemente)
              </summary>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded bg-zinc-50 p-2 font-mono text-xs dark:bg-zinc-800">
                {files.map((f) => (
                  <li key={f} className="text-zinc-600 dark:text-zinc-400">
                    {f}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <button
            onClick={handleDisconnect}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Deconecteaza
          </button>
        </div>
      )}
    </div>
  );
}
