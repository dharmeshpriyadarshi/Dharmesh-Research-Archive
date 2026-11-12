
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dharmesh Priyadarshi | Research Archive",
  description:
    "Academic portfolio documenting research, applied machine learning, and software architectures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
