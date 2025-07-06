import React, { forwardRef } from 'react';

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  onScroll: () => void;
}

const MarkdownInput = forwardRef<HTMLTextAreaElement, MarkdownInputProps>(
  ({ value, onChange, onScroll }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Tab') {
        event.preventDefault(); // Prevent default Tab behavior
        const textarea = event.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        if (event.shiftKey) {
          // Un-indent logic
          const lineStart = text.lastIndexOf('\n', start - 1) + 1;
          if (text.substring(lineStart, lineStart + 2) === '  ') {
            const newText = text.substring(0, lineStart) + text.substring(lineStart + 2);
            onChange(newText);
            setTimeout(() => textarea.setSelectionRange(Math.max(lineStart, start - 2), Math.max(lineStart, end - 2)), 0);
          }
        } else {
          // Indent logic
          const newText = text.substring(0, start) + '  ' + text.substring(end);
          onChange(newText);
          setTimeout(() => textarea.setSelectionRange(start + 2, start + 2), 0);
        }
      }

      if (event.key === 'Enter') {
        const textarea = event.target as HTMLTextAreaElement;
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const textAfterCursor = value.substring(cursorPosition);
        
        // Find the current line
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        
        // Check if current line is a list item
        const unorderedListMatch = currentLine.match(/^(\s*)([-*+])\s(.*)$/);
        const orderedListMatch = currentLine.match(/^(\s*)(\d+\.)\s(.*)$/);
        
        if (unorderedListMatch) {
          const [, indent, marker, content] = unorderedListMatch;
          if (content.trim() === '') {
            event.preventDefault();
            const newLines = [...lines];
            newLines[lines.length - 1] = indent;
            const newText = newLines.join('\n') + textAfterCursor;
            onChange(newText);
            
            setTimeout(() => {
              const newCursorPos = newLines.join('\n').length;
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
          } else {
            event.preventDefault();
            const newText = textBeforeCursor + '\n' + indent + marker + ' ' + textAfterCursor;
            onChange(newText);
            
            setTimeout(() => {
              const newCursorPos = cursorPosition + 1 + indent.length + marker.length + 1;
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
          }
        } else if (orderedListMatch) {
          const [, indent, , content] = orderedListMatch;
          if (content.trim() === '') {
            event.preventDefault();
            const newLines = [...lines];
            newLines[lines.length - 1] = indent;
            const newText = newLines.join('\n') + textAfterCursor;
            onChange(newText);
            
            setTimeout(() => {
              const newCursorPos = newLines.join('\n').length;
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
          } else {
            event.preventDefault();
            const currentNumber = parseInt(orderedListMatch[2]);
            const nextNumber = currentNumber + 1;
            const newText = textBeforeCursor + '\n' + indent + nextNumber + '. ' + textAfterCursor;
            onChange(newText);
            
            setTimeout(() => {
              const newCursorPos = cursorPosition + 1 + indent.length + (nextNumber + '. ').length;
              textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
          }
        }
      }
    };

    return (
      <textarea
        ref={ref}
        id="markdown-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={onScroll}
        className="w-full h-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none font-mono text-sm leading-relaxed scrollbar-thin scrollbar-webkit"
        placeholder="Enter Markdown here..."
        aria-label="Markdown Input"
      />
    );
  }
);

export default MarkdownInput;
