import React, { useState, useEffect, useCallback, useRef } from 'react';
import MarkdownInput from './components/MarkdownInput';
import PreviewPane from './components/PreviewPane';
import ThemeToggle from './components/ThemeToggle';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Theme } from './types';
import { DEFAULT_MARKDOWN, MARKDOWN_STORAGE_KEY, THEME_STORAGE_KEY } from './constants';
import { Download, Upload } from 'lucide-react';

const App: React.FC = () => {
  const [persistedTheme, setPersistedTheme] = useLocalStorage<Theme>(THEME_STORAGE_KEY, 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? Theme.DARK : Theme.LIGHT
  );
  const [currentTheme, setCurrentTheme] = useState<Theme>(persistedTheme);

  const [persistedMarkdown, setPersistedMarkdown] = useLocalStorage<string>(MARKDOWN_STORAGE_KEY, DEFAULT_MARKDOWN);
  const [editorMarkdown, setEditorMarkdown] = useState<string>(persistedMarkdown);

  useEffect(() => {
    if (currentTheme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Only persist if the current theme is different from what's in local storage
    if (currentTheme !== persistedTheme) {
        setPersistedTheme(currentTheme);
    }
  }, [currentTheme, persistedTheme, setPersistedTheme]);
  
  useEffect(() => {
    // Initialize editor with persisted markdown only once on mount if different
    if (editorMarkdown !== persistedMarkdown) {
        setEditorMarkdown(persistedMarkdown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedMarkdown]); // Only run when persistedMarkdown changes from local storage sync

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (editorMarkdown !== persistedMarkdown) {
         setPersistedMarkdown(editorMarkdown);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [editorMarkdown, persistedMarkdown, setPersistedMarkdown]);


  const handleThemeToggle = useCallback(() => {
    setCurrentTheme(prevTheme => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  }, []);

  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setEditorMarkdown(newMarkdown);
  }, []);

  const handleExport = () => {
    const blob = new Blob([editorMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'markdown-export.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  const handleScroll = (source: 'editor' | 'preview') => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    if (source === 'editor' && editorRef.current && previewRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = editorRef.current;
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);
      previewRef.current.scrollTop = (previewRef.current.scrollHeight - previewRef.current.clientHeight) * scrollRatio;
    } else if (source === 'preview' && editorRef.current && previewRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = previewRef.current;
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);
      editorRef.current.scrollTop = (editorRef.current.scrollHeight - editorRef.current.clientHeight) * scrollRatio;
    }

    setTimeout(() => {
      isSyncing.current = false;
    }, 100); // Debounce to prevent infinite loop
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setEditorMarkdown(text);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input to allow importing the same file again
    event.target.value = '';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <header className="flex-shrink-0 p-2 sm:p-4 shadow-lg bg-white dark:bg-slate-800 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 z-10">
        <h1 className="text-md sm:text-xl font-semibold text-slate-800 dark:text-slate-200 truncate">
          Markdown Live Editor
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handleImportClick}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Import Markdown"
          >
            <Upload className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
            accept=".md, .markdown, text/markdown"
          />

          <button
            onClick={handleExport}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Export Markdown"
          >
            <Download className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>

          <ThemeToggle theme={currentTheme} onToggle={handleThemeToggle} />
        </div>
      </header>
      <main className="flex-grow flex flex-col md:flex-row gap-2 sm:gap-4 p-2 sm:p-4 min-h-0">
        <section className="flex flex-col md:w-1/2 h-1/2 md:h-full min-h-0" aria-labelledby="markdown-input-heading">
          <h2 id="markdown-input-heading" className="sr-only">Markdown Input Area</h2>
          <div className="flex-grow min-h-0">
            <MarkdownInput 
              ref={editorRef}
              value={editorMarkdown} 
              onChange={handleMarkdownChange}
              onScroll={() => handleScroll('editor')}
            />
          </div>
        </section>
        <section className="flex flex-col md:w-1/2 h-1/2 md:h-full min-h-0" aria-labelledby="live-preview-heading">
           <h2 id="live-preview-heading" className="sr-only">Live Preview Area</h2>
          <div className="flex-grow min-h-0">
            <PreviewPane 
              ref={previewRef}
              markdownText={editorMarkdown} 
              theme={currentTheme}
              onScroll={() => handleScroll('preview')}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
