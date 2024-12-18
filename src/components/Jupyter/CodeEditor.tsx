import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder
}) => {
  const highlight = (code: string) => {
    return Prism.highlight(
      code,
      Prism.languages[language] || Prism.languages.plaintext,
      language
    );
  };

  return (
    <Editor
      value={value}
      onValueChange={onChange}
      highlight={highlight}
      padding={12}
      placeholder={placeholder}
      className="code-editor"
      style={{
        fontFamily: '"Fira Code", "Fira Mono", monospace',
        fontSize: 14,
        lineHeight: 1.6,
        minHeight: 100,
      }}
    />
  );
};

export default CodeEditor; 