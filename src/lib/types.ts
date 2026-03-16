export interface SeoReport {
  url: string;
  title: string;
  description: string;
  h1Tags: string[];
  h2Tags: string[];
  imagesMissingAlt: number;
  totalImages: number;
  wordCount: number;
  score: number;
  timestamp: string;
}

export interface SyncStatus {
  connected: boolean;
  folderName: string | null;
  lastSync: string | null;
  fileCount: number;
}

export interface ProjectData {
  version: string;
  reports: SeoReport[];
  urls: string[];
  settings: {
    projectName: string;
    createdAt: string;
  };
}
