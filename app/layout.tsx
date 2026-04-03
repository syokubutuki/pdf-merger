import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF結合",
  description: "複数のPDFを1つに結合するツール。ファイルはサーバーに送信されません。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
