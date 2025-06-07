
import React, { useState, useEffect, useCallback } from 'react';
import MarkdownInput from './components/MarkdownInput';
import PreviewPane from './components/PreviewPane';
import ThemeToggle from './components/ThemeToggle';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Theme } from './types';
import { DEFAULT_MARKDOWN, MARKDOWN_STORAGE_KEY, THEME_STORAGE_KEY } from './constants';

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

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <header className="flex-shrink-0 p-3 sm:p-4 shadow-lg bg-white dark:bg-slate-800 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 z-10">
        <h1 className="text-base sm:text-xl font-semibold text-slate-800 dark:text-slate-200 truncate">
          Markdown Live Editor
        </h1>
        <ThemeToggle theme={currentTheme} onToggle={handleThemeToggle} />
      </header>
      <main className="flex-grow flex flex-col md:flex-row gap-2 sm:gap-4 p-2 sm:p-4 overflow-hidden">
        <section className="flex flex-col md:w-1/2 h-1/2 md:h-full min-h-0" aria-labelledby="markdown-input-heading">
          <h2 id="markdown-input-heading" className="sr-only">Markdown Input Area</h2>
          <div className="flex-grow relative">
            <MarkdownInput value={editorMarkdown} onChange={handleMarkdownChange} />
          </div>
        </section>
        <section className="flex flex-col md:w-1/2 h-1/2 md:h-full min-h-0" aria-labelledby="live-preview-heading">
           <h2 id="live-preview-heading" className="sr-only">Live Preview Area</h2>
          <div className="flex-grow relative">
            <PreviewPane markdownText={editorMarkdown} theme={currentTheme} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
