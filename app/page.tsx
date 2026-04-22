'use client';

import { useState, useCallback, useRef, DragEvent } from 'react';
import { PDFDocument } from 'pdf-lib';

type PdfFile = {
  id: number;
  name: string;
  data: ArrayBuffer;
};

export default function Home() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const idRef = useRef(0);

  const addFiles = useCallback(async (selected: File[]) => {
    const pdfFiles = selected.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) return;
    const loaded: PdfFile[] = await Promise.all(
      pdfFiles.map(async (file) => ({
        id: idRef.current++,
        name: file.name,
        data: await file.arrayBuffer(),
      }))
    );
    setFiles(prev => [...prev, ...loaded]);
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    await addFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  }, [addFiles]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (dragIndex !== null) return; // リスト内並び替え中はファイル追加しない
    await addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles, dragIndex]);

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

  // --- ドラッグ&ドロップ並び替え ---
  const handleDragStart = (e: DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDropReorder = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFiles(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(dropIndex, 0, moved);
      return arr;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // --- ソート ---
  const sortByName = (asc: boolean) => {
    setFiles(prev => [...prev].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, 'ja');
      return asc ? cmp : -cmp;
    }));
  };

  const reverseOrder = () => {
    setFiles(prev => [...prev].reverse());
  };

  const clearAll = () => {
    setFiles([]);
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
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
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
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <div className="text-center">
            <p className="text-gray-500">
              {isDragging ? 'ここにドロップ' : 'クリックまたはドラッグ&ドロップでPDFを選択'}
            </p>
            <p className="text-xs text-gray-400 mt-1">複数選択可</p>
          </div>
          <input type="file" accept=".pdf" multiple onChange={handleFileChange} className="hidden" />
        </label>

        {/* ファイル一覧 */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">
                結合順序（上から順に結合されます）
              </p>
              <div className="flex gap-1">
                <button onClick={() => sortByName(true)} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer">名前昇順</button>
                <button onClick={() => sortByName(false)} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer">名前降順</button>
                <button onClick={reverseOrder} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer">逆順</button>
                <button onClick={clearAll} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-red-400 hover:bg-red-50 cursor-pointer">全削除</button>
              </div>
            </div>
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDropReorder(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 p-3 bg-gray-50 rounded-xl transition-opacity ${
                  dragIndex === index ? 'opacity-50' : ''
                } ${dragOverIndex === index && dragIndex !== null && dragIndex !== index ? 'border-t-2 border-blue-400' : ''}`}
              >
                <span className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 select-none" title="ドラッグで並び替え">⠿</span>
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
