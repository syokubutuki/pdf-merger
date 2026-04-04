import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pdf-merger-rouge.vercel.app"),
  verification: {
    google: "ofoMx5OtnknPc6zhkrBc9iHZOWR69gj9HdjcPOf0B0o",
  },
  title: "PDF結合ツール | 複数のPDFを無料でオンライン結合",
  description:
    "複数のPDFファイルを1つに結合する無料オンラインツール。ファイルはブラウザ上で処理するためサーバーに送信されず安全。ドラッグ&ドロップで順番を入れ替えて結合できます。登録不要・広告なし。",
  keywords: [
    "PDF結合", "PDF合体", "PDF統合", "PDF結合ツール", "オンライン", "無料",
    "ブラウザ", "安全", "登録不要", "複数PDF", "PDF結合フリー",
  ],
  openGraph: {
    title: "PDF結合ツール | 複数のPDFを無料でオンライン結合",
    description:
      "複数PDFを1つに結合する無料ツール。ブラウザ上で処理するので安全。ドラッグ&ドロップで順番変更可能。登録不要。",
    type: "website",
    locale: "ja_JP",
    url: "https://pdf-merger-rouge.vercel.app",
  },
  twitter: {
    card: "summary",
    title: "PDF結合ツール",
    description: "複数のPDFを1つに無料結合。ブラウザ処理で安全・登録不要。",
  },
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
