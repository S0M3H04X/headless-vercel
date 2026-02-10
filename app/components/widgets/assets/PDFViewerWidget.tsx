'use client';
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { remark } from 'remark';
import html from 'remark-html';
import { z } from 'zod';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { ContentDescriptor } from '@/lib/types/workspace';
import { WindowLayout } from '@/components/system/window/WindowLayout';
import styles from './PDFViewer.Widget.module.scss';

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
  lastLanguage: z.enum(['en', 'zh']).default('en').optional(),
});

const DEFAULT_PDF_STATE = { pageNumber: 1, scale: 0.7, lastLanguage: 'en' as const };

// =============================================================================
// TYPES
// =============================================================================

type ImageDef = {
  url: string;
  alt?: string;
  caption?: string;    // -> <figcaption>
};

type JSONArticleData = {
  title?: string;        // -> <header><h1>
  subtitle?: string;     // -> <header><p>
  content: string;       // -> <article> (Markdown rendered here)
  sidebar?: string;      // -> <aside>
  footer?: string;       // -> <footer>
  coverImage?: ImageDef; // -> <figure>
  previews?: ImageDef[]; // -> Gallery
  meta?: Record<string, any>; // Metadata not displayed but available
};

type SharedAssets = {
  coverImage?: ImageDef;
  previews?: ImageDef[];
};

type MultilingualContent = {
  en: JSONArticleData;
  zh: JSONArticleData;
} & SharedAssets;

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// Simple Markdown Parser Component
// [Fix] Updated to react to `text` prop changes
const SimpleMarkdown = ({ text, source, className }: { text?: string; source?: string; className?: string }) => {
  const [content, setContent] = useState<string | null>(text || null);

  useEffect(() => {
    if (source) {
      fetch(source)
        .then(res => res.text())
        .then(text => setContent(text))
        .catch(err => console.error('Failed to load markdown:', err));
    }
  }, [source]);

  useEffect(() => {
    if (text !== undefined) {
      setContent(text);
    }
  }, [text]);

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
      elements.push(<p key={i} className="my-1 leading-relaxed text-gray-800">{parseInline(line)}</p>);
    }
  }

  return (
    <div className={`${styles.markdownContainer} ${className || ''} overflow-y-auto overflow-x-hidden w-full font-sans`}>
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

const JSONContentRenderer = ({ data }: { data: JSONArticleData }) => {
  return (
    <section className="semantic-article w-full h-full flex flex-col overflow-auto">
      {/* Cover Image */}
      {data.coverImage && (
        <figure className="mb-6 px-2">
          <img
            src={data.coverImage.url}
            alt={data.coverImage.alt || data.title}
            className="w-full h-auto max-h-[400px] object-contain md:object-cover"
          />
          {data.coverImage.caption && (
            <figcaption className="text-sm text-left text-gray-500 mt-2 italic">
              {data.coverImage.caption}
            </figcaption>
          )}
        </figure>
      )}
      {/* Header Area */}
      {(data.title || data.subtitle) && (
        <header className="pb-4 px-4 text-left border-gray-100">
          {data.title && <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.title}</h1>}
          {data.subtitle && <p className="text-xl text-gray-900 leading-relaxed">{data.subtitle}</p>}
        </header>
      )}

      {/* Main Content Area */}
      <div className="px-4 flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        <article className="flex-1 min-w-0 pb-12">


          {/* Markdown Content */}
          {data.content?.endsWith('.md') ? (
            <SimpleMarkdown source={data.content} className="p-0" />
          ) : (
            <SimpleMarkdown text={data.content} className="p-0" />
          )}

          {/* Previews Gallery */}
          {data.previews && data.previews.length > 0 && (
            <section className="mt-12">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4">Previews</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.previews.map((img, idx) => (
                  <figure key={idx} className="flex flex-col gap-2">
                    <img
                      src={img.url}
                      alt={img.alt || `Preview ${idx + 1}`}
                      className="w-full h-auto rounded border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    />
                    {img.caption && (
                      <figcaption className="text-xs text-gray-500 text-left">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        {data.sidebar && (
          <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50 p-6 shrink-0">
            <SimpleMarkdown text={data.sidebar} className="p-0 bg-transparent" />
          </aside>
        )}
      </div>

      {/* Footer */}
      {data.footer && (
        <footer className="mt-auto border-t border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          <SimpleMarkdown text={data.footer} className="p-0 bg-transparent flex justify-center text-center" />
        </footer>
      )}
    </section>
  );
};

// Terminal Typewriter Component
const TerminalTypewriter = ({ text, speed = 50 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!text) return;
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className="w-full h-full text-gray-900 p-6 overflow-auto whitespace-pre-wrap text-md md:text-base leading-relaxed">
      {displayedText}
      <span className="animate-pulse inline-block w-2 h-4 bg-gray-900 ml-1 align-left"></span>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PDFViewerWidget({ id, content, internalState }: WidgetProps) {
  const updateInternalState = useWorkspaceStore(s => s.updateInternalState);
  const state = useWidgetState(internalState, PDFStateSchema, DEFAULT_PDF_STATE);

  const updateWindowGeometry = useWorkspaceStore(s => s.updateWindowGeometry); // [新增] 取得 updateWindowGeometry
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isError, setIsError] = useState<string | null>(null);

  // [新增] Default Window Height 80vh
  useEffect(() => {
    // 只有在第一次掛載時執行 (或可檢查 geometry.height 是否為預設值)
    if (typeof window !== 'undefined') {
      const vh80 = window.innerHeight * 0.8;
      const centeredY = (window.innerHeight - vh80) / 2;
      updateWindowGeometry(id, { height: vh80, y: Math.max(0, centeredY) });
    }
  }, []); // Empty dependency array = run once on mount

  // JSON/Markdown Content
  const [rawMarkdown, setRawMarkdown] = useState<string | null>(null);
  const [markdownHtml, setMarkdownHtml] = useState<string | null>(null); // For raw .md files rendered via remark-html
  const [jsonContent, setJsonContent] = useState<MultilingualContent | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh'>(state.lastLanguage || 'en');

  // File type detection
  const isJson = content.sourceId?.toLowerCase().endsWith('.json');
  const isMd = content.sourceId?.toLowerCase().endsWith('.md');
  const isPdf = !isJson && !isMd && (content.sourceId?.toLowerCase().endsWith('.pdf') || true); // Default to PDF for now

  // Effect: Load Content
  useEffect(() => {
    const loadContent = async () => {
      if (!content.sourceId) return;

      try {
        if (isJson) {
          const res = await fetch(content.sourceId);
          if (!res.ok) throw new Error('Failed to fetch JSON file');
          const data = await res.json();
          setJsonContent(data);
          setIsError(null);
        } else if (isMd) {
          const res = await fetch(content.sourceId);
          if (!res.ok) throw new Error('Failed to fetch Markdown file');
          const text = await res.text();
          setRawMarkdown(text);
          const processedContent = await remark().use(html).process(text);
          setMarkdownHtml(processedContent.toString());
          setIsError(null);
        } else {
          // PDF is handled by react-pdf component directly via props
          setIsError(null);
        }
      } catch (err: any) {
        console.error('[PDFWidget] Load Error:', err);
        setIsError(err.message || 'Failed to load content');
      }
    };

    loadContent();
  }, [content.sourceId, isJson, isMd]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
    updateInternalState(id, { lastLanguage: newLang });
  };

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

  // PDF Controls
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

  // Helper to get active data with merged shared assets
  const getActiveJSONData = (): JSONArticleData | null => {
    if (!jsonContent) return null;
    const baseData = jsonContent[language] || jsonContent['en'];
    if (!baseData) return null;

    return {
      ...baseData,
      // Shared assets fallback/override logic: Use shared if local is missing.
      // Or if user says they are "identical", maybe we should force shared.
      // Here we prioritize local if specific overrides exist, otherwise fallback to shared root.
      coverImage: baseData.coverImage || jsonContent.coverImage,
      previews: baseData.previews || jsonContent.previews,
    };
  };

  const activeJsonData = getActiveJSONData();

  return (
    <WindowLayout className={`h-full w-full ${styles.pdfViewerWindow}`}>
      {/* TOOLBAR: Show by default unless explicitly disabled */}
      {content.initialMeta?.showToolbar !== false && (
        <WindowLayout.Toolbar className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50 h-12 shrink-0">
          {/* Left Controls (PDF Only) */}
          <div className="flex gap-2 items-center">
            {isPdf && (
              <>
                <button onClick={() => changePage(-1)} disabled={state.pageNumber <= 1} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm">←</button>
                <span className="text-sm min-w-[60px] text-center font-mono">
                  {state.pageNumber} / {numPages || '--'}
                </span>
                <button onClick={() => changePage(1)} disabled={numPages !== null && state.pageNumber >= numPages} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm">→</button>
              </>
            )}

            {(isJson && activeJsonData) && (
              <div className="text-sm font-semibold text-gray-600">
                {language === 'en' ? 'English' : '中文'}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex gap-2 items-center">
            {/* Language Switch for JSON */}
            {isJson && activeJsonData && (
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-colors shadow-sm"
              >
                {language === 'en' ? '中文翻譯' : 'English Version'}
              </button>
            )}

            {/* Scale Controls for PDF */}
            {isPdf && (
              <>
                <button onClick={() => changeScale(-0.1)} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">-</button>
                <span className="text-xs min-w-[40px] text-center">{Math.round(state.scale * 100)}%</span>
                <button onClick={() => changeScale(0.1)} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">+</button>
              </>
            )}
          </div>
        </WindowLayout.Toolbar>
      )}

      {/* CONTENT */}
      <WindowLayout.Content className="flex-1 relative">

        {/* Error State */}
        {isError && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-50 text-red-600 p-4 text-center">
            <div>
              <h4 className="font-bold">Load Failed</h4>
              <p className="text-sm mt-1">{isError}</p>
            </div>
          </div>
        )}

        {/* Mode: JSON */}
        {isJson && activeJsonData && (
          <JSONContentRenderer data={activeJsonData} />
        )}

        {/* Mode: Markdown File */}
        {isMd && content.initialMeta?.typingEffect ? (
          <TerminalTypewriter text={rawMarkdown || ''} />
        ) : (
          isMd && markdownHtml && (
            <div
              className={`p-8 shadow-sm min-h-full w-full max-w-4xl mx-auto ${styles['markdown-body']}`}
              dangerouslySetInnerHTML={{ __html: markdownHtml }}
            />
          )
        )}
        {isMd && !markdownHtml && !isError && !content.initialMeta?.typingEffect && (
          <SimpleMarkdown text={content.initialMeta?.description as string} source={content.initialMeta?.markdownSource as string} />
        )}

        {/* Mode: PDF */}
        {isPdf && (
          <div className="flex justify-center p-4 bg-gray-400/50 min-h-full">
            <Document
              file={content.sourceId}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="shadow-2xl"
              loading={<div className="text-white mt-10">Loading PDF...</div>}
              options={PDF_OPTIONS}
            >
              <Page
                pageNumber={state.pageNumber}
                scale={state.scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="bg-white"
                width={500}
              />
            </Document>
          </div>
        )}
      </WindowLayout.Content>
    </WindowLayout>
  );
}