import { ProjectData, SeoReport } from "./types";

const PROJECT_FILE = "seo-max-data.json";

function getDefaultProjectData(): ProjectData {
  return {
    version: "1.0.0",
    reports: [],
    urls: [],
    settings: {
      projectName: "SEO Max Project",
      createdAt: new Date().toISOString(),
    },
  };
}

export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await window.showDirectoryPicker({
      mode: "readwrite",
    });
    return handle;
  } catch {
    return null;
  }
}

export async function readProjectData(
  dirHandle: FileSystemDirectoryHandle
): Promise<ProjectData> {
  try {
    const fileHandle = await dirHandle.getFileHandle(PROJECT_FILE);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as ProjectData;
  } catch {
    return getDefaultProjectData();
  }
}

export async function writeProjectData(
  dirHandle: FileSystemDirectoryHandle,
  data: ProjectData
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(PROJECT_FILE, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

export async function exportReport(
  dirHandle: FileSystemDirectoryHandle,
  report: SeoReport
): Promise<void> {
  const data = await readProjectData(dirHandle);
  const existingIndex = data.reports.findIndex((r) => r.url === report.url);
  if (existingIndex >= 0) {
    data.reports[existingIndex] = report;
  } else {
    data.reports.push(report);
  }
  await writeProjectData(dirHandle, data);
}

export async function listFolderFiles(
  dirHandle: FileSystemDirectoryHandle
): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of dirHandle.values()) {
    files.push(`${entry.kind === "directory" ? "[dir] " : ""}${entry.name}`);
  }
  return files.sort();
}

export async function verifyPermission(
  dirHandle: FileSystemDirectoryHandle
): Promise<boolean> {
  const options = { mode: "readwrite" as const };
  if ((await dirHandle.queryPermission(options)) === "granted") {
    return true;
  }
  if ((await dirHandle.requestPermission(options)) === "granted") {
    return true;
  }
  return false;
}
