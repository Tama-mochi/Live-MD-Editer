
import React from 'react';

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      id="markdown-input"
      value={value}
      onChange={handleChange}
      className="w-full h-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none font-mono text-sm leading-relaxed scrollbar-thin scrollbar-webkit"
      placeholder="Enter Markdown here..."
      aria-label="Markdown Input"
    />
  );
};

export default MarkdownInput;
