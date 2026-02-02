'use client';
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { remark } from 'remark';
import html from 'remark-html';
import { z } from 'zod';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ContentDescriptor } from '@/lib/types/workspace';

// 引入樣式 (這是 react-pdf 必要的，否則會排版錯亂)
// import 'react-pdf/dist/Page/AnnotationLayer.css';
// import 'react-pdf/dist/Page/TextLayer.css';

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
  scale: z.number().default(0.7),
});

const DEFAULT_PDF_STATE = { pageNumber: 1, scale: 0.7 };

// Simple Markdown Parser Component
const SimpleMarkdown = ({ text, source }: { text?: string; source?: string }) => {
  const [content, setContent] = useState<string | null>(text || null);

  useEffect(() => {
    if (source) {
      fetch(source)
        .then(res => res.text())
        .then(text => setContent(text))
        .catch(err => console.error('Failed to load markdown:', err));
    }
  }, [source]);

  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table Handling
    if (line.trim().startsWith('|')) {
      inTable = true;
      const row = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      // Skip separator lines (e.g. |---|---|)
      if (!row.some(c => c.match(/^[-:]+$/))) {
        tableRows.push(row);
      }
      continue;
    } else if (inTable) {
      // End of table
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4 border border-gray-300 rounded">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 font-bold border-b">
              <tr>
                {tableRows[0]?.map((head, hi) => <th key={hi} className="px-4 py-2 border-r last:border-r-0">{parseInline(head)}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b last:border-b-0 hover:bg-gray-50">
                  {row.map((cell, ci) => <td key={ci} className="px-4 py-2 border-r last:border-r-0">{parseInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableRows = [];
    }

    // Blockquotes
    if (line.trim().startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-gray-300 pl-4 py-1 my-2 text-gray-600 italic bg-gray-50 rounded-r">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Images: ![alt](url)
    const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imageMatch) {
      elements.push(
        <div key={i} className="my-4">
          <img src={imageMatch[2]} alt={imageMatch[1]} className="max-w-full h-auto rounded shadow-sm" />
        </div>
      );
      continue;
    }

    // Headers
    if (line.startsWith('# ')) { elements.push(<h1 key={i} className="text-2xl font-bold my-4 pb-2 border-b">{parseInline(line.slice(2))}</h1>); continue; }
    if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-xl font-bold my-3">{parseInline(line.slice(3))}</h2>); continue; }
    if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-lg font-bold my-2">{parseInline(line.slice(4))}</h3>); continue; }
    if (line.startsWith('#### ')) { elements.push(<h4 key={i} className="text-base font-bold my-2">{parseInline(line.slice(5))}</h4>); continue; }

    // List items
    if (line.trim().startsWith('- ')) {
      elements.push(
        <div key={i} className="ml-4 flex items-start">
          <span className="mr-2 text-gray-400">•</span>
          <span>{parseInline(line.trim().slice(2))}</span>
        </div>
      );
      continue;
    }

    // Paragraphs (default)
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="my-1 text-sm leading-relaxed text-gray-800">{parseInline(line)}</p>);
    }
  }

  return (
    <div className="bg-white p-6 border-b border-gray-200 overflow-y-auto max-h-[300px] shrink-0 font-sans">
      {elements}
    </div>
  );
};

// Helper for inline styles
function parseInline(text: string): React.ReactNode {
  // Links: [text](url)
  // We split by standard markdown inline tokens
  const parts = text.split(/(\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">{linkMatch[1]}</a>;

    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) return <strong key={i} className="font-semibold text-gray-900">{boldMatch[1]}</strong>;

    const codeMatch = part.match(/^`(.*?)`$/);
    if (codeMatch) return <code key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-red-500 border border-gray-200">{codeMatch[1]}</code>;

    return part;
  });
}

export default function PDFViewerWidget({ id, content, internalState }: WidgetProps) {
  const updateInternalState = useWorkspaceStore(s => s.updateInternalState);
  const state = useWidgetState(internalState, PDFStateSchema, DEFAULT_PDF_STATE);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [isError, setIsError] = useState<string | null>(null);
  const [markdownHtml, setMarkdownHtml] = useState<string | null>(null);

  useEffect(() => {
    const checkAndLoadMarkdown = async () => {
      if (content.sourceId?.toLowerCase().endsWith('.md')) {
        try {
          const res = await fetch(content.sourceId);
          if (!res.ok) throw new Error('Failed to fetch markdown file');
          const text = await res.text();
          const processedContent = await remark().use(html).process(text);
          setMarkdownHtml(processedContent.toString());
          setIsError(null);
        } catch (err: any) {
          console.error('[PDFWidget] Markdown Load Error:', err);
          setIsError(err.message || 'Failed to load markdown');
          setMarkdownHtml(null);
        }
      } else {
        setMarkdownHtml(null);
      }
    };

    checkAndLoadMarkdown();
  }, [content.sourceId]);

  // Extract description or markdownSource
  const description = content.initialMeta?.description as string;
  const markdownSource = content.initialMeta?.markdownSource as string;

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
    <div className="h-full w-full bg-gray-500 flex flex-col overflow-hidden relative">
      {/* Markdown Reader (Text or Source) */}
      {(description || markdownSource) && <SimpleMarkdown text={description} source={markdownSource} />}

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

      {/* PDF Canvas or Markdown Content */}
      <div className="flex-grow overflow-auto flex justify-center p-4 bg-gray-400/50">
        {markdownHtml ? (
          <div
            className="bg-white p-8 shadow-2xl min-h-full w-full max-w-4xl prose prose-slate"
            dangerouslySetInnerHTML={{ __html: markdownHtml }}
          />
        ) : (
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
              width={500}
            />
          </Document>
        )}
      </div>
    </div>
  );
}