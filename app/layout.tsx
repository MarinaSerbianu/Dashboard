import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marina — Production Dashboard",
  description: "A simple visual production board for daily priorities.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
