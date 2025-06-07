
export const MARKDOWN_STORAGE_KEY = 'markdownEditorContent_v1';
export const THEME_STORAGE_KEY = 'markdownEditorTheme_v1';

export const DEFAULT_MARKDOWN = `# Welcome to Markdown Live Editor!

## Features
- Real-time preview
- GitHub Flavored Markdown (GFM) support
  - Tables, task lists, strikethrough, etc.
- Syntax highlighting for code blocks
- Light / Dark theme toggle
- Auto-saving to local storage (debounced)

## Example Code Block (JavaScript)
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('Developer');
\`\`\`

## Example Table
| Feature    | Status      | Notes                     |
| :--------- | :---------: | :------------------------ |
| Markdown   | ✅ Done     | Using \`react-markdown\`  |
| GFM        | ✅ Done     | Via \`remark-gfm\`        |
| Themes     | ✅ Done     | Light/Dark toggle         |
| Auto-Save  | ✅ Done     | Uses LocalStorage         |

## Task List
- [x] Design layout
- [x] Implement Markdown parsing
- [ ] Add more syntax highlighting themes (optional)
- [ ] Allow file import/export (optional)

For more about Markdown, check out [GitHub Flavored Markdown](https://github.github.com/gfm/).
`;
