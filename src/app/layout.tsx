import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "LUSC Management Portal", description: "Landmark University Student Council membership and document portal" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="watermark">{children}</body></html>;
}
