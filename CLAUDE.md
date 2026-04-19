# PDF結合ツール

## プロジェクト概要
複数のPDFを1つに結合するWebアプリ。
登録不要・広告なし・シンプルな1ページ構成。

## 技術構成
- Next.js（App Router）
- TypeScript
- Tailwind CSS
- pdf-lib（PDF結合処理）

## 特徴
- ブラウザ上だけで処理が完結（サーバーにファイルを送信しない）
- ファイルの順番を並び替え可能
- 複数ファイルを一括選択可能

## 現在の状態
- app/page.tsx：実装・動作確認済み
- app/layout.tsx：SEO対応済み
- app/robots.ts：robots.txt 自動生成
- app/sitemap.ts：sitemap.xml 自動生成
- GitHub：https://github.com/syokubutuki/pdf-merger
- Vercel：公開済み　https://pdf-merger-rouge.vercel.app

## SEO対応（実施済み）
- title・description・keywords・OGP・Twitter Card を layout.tsx に設定
- robots.txt・sitemap.xml を Next.js の Route Handler で自動生成
- Google Search Console にサイト登録済み・所有権確認済み
  - verification code は layout.tsx の `verification.google` に記載

## デプロイ手順
```
git add .
git commit -m "変更内容のメモ"
git push
```
GitHubにpushするとVercelに自動反映される。
