'use client';
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { z } from 'zod';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ContentDescriptor } from '@/lib/types/workspace';
import styles from './PDFViewerWidget.module.scss';

// 引入樣式 (這是 react-pdf 必要的，否則會排版錯亂)
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
interface WidgetProps {
  id: string;
  content: ContentDescriptor;
  internalState: unknown;
}

const PDF_OPTIONS = {
  cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.296/cmaps/',
  cMapPacked: true,
};

const PDFStateSchema = z.object({
  pageNumber: z.number().min(1).default(1),
  scale: z.number().default(1.0),
});

const DEFAULT_PDF_STATE = { pageNumber: 1, scale: 1.0 };

export default function PDFViewerWidget({ id, content, internalState }: WidgetProps) {
  const updateInternalState = useWorkspaceStore(s => s.updateInternalState);
  const state = useWidgetState(internalState, PDFStateSchema, DEFAULT_PDF_STATE);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [isError, setIsError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('[PDFWidget] Load Error:', error);
    if (error.name === 'MissingPDFException') {
      setIsError("找不到 PDF 檔案，請檢查連結。");
    } else if (error.message.includes('undefined is not a non-null object')) {
      setIsError("瀏覽器相容性問題 (Worker API)。請嘗試更新瀏覽器或使用 Legacy Worker。");
    } else {
      setIsError(error.message);
    }
  }

  const changePage = (offset: number) => {
    const newPage = state.pageNumber + offset;
    if (newPage >= 1 && (numPages === null || newPage <= numPages)) {
      updateInternalState(id, { pageNumber: newPage });
    }
  };

  const changeScale = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3.0, state.scale + delta));
    updateInternalState(id, { scale: newScale });
  };

  return (
    <div className="h-full w-full bg-gray-500 flex flex-col-reverse overflow-hidden relative">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center z-10 shadow-md shrink-0">
        <div className="flex gap-2 items-center">
          <button onClick={() => changePage(-1)} disabled={state.pageNumber <= 1} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm">←</button>
          <span className="text-sm min-w-[80px] text-center">
            {state.pageNumber} / {numPages || '--'}
          </span>
          <button onClick={() => changePage(1)} disabled={numPages !== null && state.pageNumber >= numPages} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-sm">→</button>
        </div>

        <div className="flex gap-2 items-center">
          <button onClick={() => changeScale(-0.1)} className="px-2 py-1 bg-gray-700 rounded text-sm">-</button>
          <span className="text-xs">{Math.round(state.scale * 100)}%</span>
          <button onClick={() => changeScale(0.1)} className="px-2 py-1 bg-gray-700 rounded text-sm">+</button>
        </div>
      </div>

      {/* Error Message */}
      {isError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-100/90 text-red-600 p-4 text-center">
          <div>
            <h4 className="font-bold">PDF 載入失敗</h4>
            <p className="text-sm mt-1">{isError}</p>
            <p className="text-xs mt-2 text-gray-500">請檢查網路連線或是 Worker 版本</p>
          </div>
        </div>
      )}

      {/* PDF Canvas */}
      <div className="flex-grow overflow-auto flex justify-center p-4 bg-gray-400/50">
        <Document
          file={content.sourceId}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="shadow-2xl"
          loading={<div className="text-white">載入文件中...</div>}
          options={PDF_OPTIONS}
        >
          <Page
            pageNumber={state.pageNumber}
            scale={state.scale}
            renderTextLayer={false} // 關閉文字選取層以提升效能
            renderAnnotationLayer={false} // 關閉註釋層
            className="bg-white"
            width={200}
          />
        </Document>
      </div>

      <div className={`${styles.articleContainer} p-2 bg-gray-800 text-white text-center text-xs shrink-0`}>
        <div className="h-1 w-full bg-gray-700">
          <h3>PDF Viewer Widget</h3>
          <p>
            This is a PDF Viewer Widget.
          </p>
        </div>

      </div>
    </div>
  );
}