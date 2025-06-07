
import React, { useMemo } from 'react';
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
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ markdownText, theme }) => {
  const currentSyntaxTheme = theme === Theme.DARK ? atomDark : prism;

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
          const language = langMatch?.[1] || '';

          return (
            <SyntaxHighlighter
              style={currentSyntaxTheme}
              language={language}
              PreTag="div" // SyntaxHighlighter will use this as the outer element
            >
              {String(codeString).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        }
      }

      // Handle tables for overflow scrolling
      if (domNode.tagName === 'table') {
         return (
           <div className="overflow-x-auto">
             <table {...attributesToProps(domNode.attribs)} className="min-w-full">
               {domToReact(domNode.children, parserOptions)}
             </table>
           </div>
         );
      }
      
      // For other elements, let html-react-parser handle them by default
      return undefined;
    },
  };

  const reactOutput = useMemo(() => parse(htmlContent, parserOptions), [htmlContent, currentSyntaxTheme]); // Added currentSyntaxTheme to dependencies

  return (
    <div 
      className="w-full h-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 overflow-y-auto scrollbar-thin scrollbar-webkit prose dark:prose-invert max-w-none prose-sm sm:prose-base"
      aria-live="polite"
    >
      {reactOutput}
    </div>
  );
};

export default PreviewPane;
