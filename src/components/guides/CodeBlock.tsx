
import React from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <div className="relative rounded-md bg-gray-100 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm">
          <code>{code}</code>
        </pre>
      </div>
      <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
        {language}
      </div>
    </div>
  );
};

export default CodeBlock;
