import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Max - Local Folder Sync",
  description: "SEO analysis tool with local folder synchronization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
