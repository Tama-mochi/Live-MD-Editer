import React, { useMemo, forwardRef } from 'react';
import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import parse, { domToReact, attributesToProps, HTMLReactParserOptions, DOMNode } from 'html-react-parser';
import { Element } from 'domhandler';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Theme } from '../types';

interface PreviewPaneProps {
  markdownText: string;
  theme: Theme;
  onScroll: () => void;
}

const PreviewPane = forwardRef<HTMLDivElement, PreviewPaneProps>(
  ({ markdownText, theme, onScroll }, ref) => {
    // Theming logic for syntax highlighter is now passed via props
    // const currentSyntaxTheme = theme === Theme.DARK ? atomDark : prism;

    const md = useMemo(() => {
      return new MarkdownIt({
        html: true,        // Enable HTML tags in source
        linkify: true,     // Autoconvert URL-like text to links
        typographer: true, // Enable some language-neutral replacement + quotes beautification
        breaks: true,      // Convert '\n' in paragraphs into <br>
      }).use(taskLists);
    }, []);

    const htmlContent = useMemo(() => md.render(markdownText), [md, markdownText]);

    const parserOptions: HTMLReactParserOptions = {
      replace: (domNode: DOMNode) => {
        if (!(domNode instanceof Element)) {
          return;
        }

        // Handle code blocks for syntax highlighting
        if (domNode.tagName === 'pre') {
          const codeElement = domNode.children.find(
            (child): child is Element => child instanceof Element && child.tagName === 'code'
          );

          if (codeElement && codeElement.children.length > 0 && codeElement.children[0].type === 'text') {
            const codeString = codeElement.children[0].data;
            const langMatch = codeElement.attribs?.class?.match(/language-(\w+)/);
            const language = langMatch?.[1] || 'text';

            return (
              <div className="code-block-wrapper my-4">
                <SyntaxHighlighter
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    border: theme === Theme.DARK ? '1px solid #374151' : '1px solid #d1d5db',
                    backgroundColor: theme === Theme.DARK ? '#1f2937' : '#f9fafb',
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                    }
                  }}
                >
                  {String(codeString).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          }
        }

        // Handle inline code for better visibility
        if (domNode.tagName === 'code' && domNode.parent && domNode.parent instanceof Element && domNode.parent.tagName !== 'pre') {
          const codeText = domNode.children[0]?.type === 'text' ? domNode.children[0].data : '';
          return (
            <code 
              className={`px-1.5 py-0.5 rounded text-sm font-medium ${
                theme === Theme.DARK 
                  ? 'bg-gray-700 text-pink-300 border border-gray-600' 
                  : 'bg-gray-100 text-pink-600 border border-gray-200'
              }`}
            >
              {codeText}
            </code>
          );
        }

        // Handle tables for overflow scrolling
        if (domNode.tagName === 'table') {
           return (
             <div className="overflow-x-auto my-4">
               <table {...attributesToProps(domNode.attribs)} className="min-w-full border-collapse">
                 {domToReact(domNode.children as DOMNode[], parserOptions)}
               </table>
             </div>
           );
        }
        
        // For other elements, let html-react-parser handle them by default
        return undefined;
      },
    };

    const reactOutput = useMemo(() => parse(htmlContent, parserOptions), [htmlContent, theme]);

    return (
      <div 
        ref={ref}
        onScroll={onScroll}
        className="w-full h-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 overflow-y-auto scrollbar-thin scrollbar-webkit prose dark:prose-invert max-w-none prose-sm sm:prose-base"
        aria-live="polite"
      >
        {reactOutput}
      </div>
    );
  }
);

export default PreviewPane;
