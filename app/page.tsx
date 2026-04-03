'use client';

import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';

type PdfFile = {
  id: number;
  name: string;
  data: ArrayBuffer;
};

export default function Home() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const idRef = { current: 0 };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const loaded: PdfFile[] = await Promise.all(
      selected.map(async (file) => ({
        id: idRef.current++,
        name: file.name,
        data: await file.arrayBuffer(),
      }))
    );
    setFiles(prev => [...prev, ...loaded]);
    e.target.value = '';
  }, []);

  const removeFile = (id: number) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    setFiles(prev => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const merge = async () => {
    if (files.length < 2) return;
    setMerging(true);
    const merged = await PDFDocument.create();
    for (const file of files) {
      const doc = await PDFDocument.load(file.data);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    a.click();
    URL.revokeObjectURL(url);
    setMerging(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center p-8">
      <div className="w-full max-w-xl space-y-5">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">PDF結合</h1>
          <p className="text-sm text-gray-400 mt-1">
            複数のPDFを選択して1つに結合します。ファイルはサーバーに送信されません。
          </p>
        </div>

        {/* ファイル選択 */}
        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <div className="text-center">
            <p className="text-gray-500">クリックしてPDFを選択</p>
            <p className="text-xs text-gray-400 mt-1">複数選択可</p>
          </div>
          <input type="file" accept=".pdf" multiple onChange={handleFileChange} className="hidden" />
        </label>

        {/* ファイル一覧 */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4 space-y-2">
            <p className="text-sm font-medium text-gray-600 mb-3">
              結合順序（上から順に結合されます）
            </p>
            {files.map((file, index) => (
              <div key={file.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                  >▲</button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1}
                    className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                  >▼</button>
                </div>
                <span className="text-sm text-gray-500 w-5">{index + 1}</span>
                <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer text-lg leading-none"
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* 結合ボタン */}
        <button
          onClick={merge}
          disabled={files.length < 2 || merging}
          className="w-full py-4 rounded-2xl font-semibold text-lg transition-colors cursor-pointer
            bg-blue-600 text-white hover:bg-blue-700
            disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {merging ? '処理中...' : `${files.length}件のPDFを結合してダウンロード`}
        </button>

        {files.length < 2 && files.length > 0 && (
          <p className="text-center text-sm text-gray-400">あと{2 - files.length}件以上追加してください</p>
        )}

      </div>
    </main>
  );
}
