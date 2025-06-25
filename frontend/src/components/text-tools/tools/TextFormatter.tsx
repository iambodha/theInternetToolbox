'use client';

import { useState } from 'react';

export default function TextFormatter() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const formatText = (operation: string) => {
    let formatted = text;
    
    switch (operation) {
      case 'uppercase':
        formatted = text.toUpperCase();
        break;
      case 'lowercase':
        formatted = text.toLowerCase();
        break;
      case 'titlecase':
        formatted = text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case 'sentencecase':
        formatted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        break;
      case 'camelcase':
        formatted = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
        break;
      case 'snakecase':
        formatted = text.toLowerCase().replace(/\s+/g, '_');
        break;
      case 'kebabcase':
        formatted = text.toLowerCase().replace(/\s+/g, '-');
        break;
      case 'reverse':
        formatted = text.split('').reverse().join('');
        break;
      case 'removeextraspaces':
        formatted = text.replace(/\s+/g, ' ').trim();
        break;
      case 'removelinebreaks':
        formatted = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        break;
      case 'addlinebreaks':
        formatted = text.replace(/\. /g, '.\n');
        break;
      case 'duplicatelines':
        formatted = text.split('\n').map(line => line + '\n' + line).join('\n');
        break;
    }
    
    setResult(formatted);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const operations = [
    { id: 'uppercase', label: 'UPPERCASE', description: 'Convert to uppercase' },
    { id: 'lowercase', label: 'lowercase', description: 'Convert to lowercase' },
    { id: 'titlecase', label: 'Title Case', description: 'Capitalize each word' },
    { id: 'sentencecase', label: 'Sentence case', description: 'Capitalize first letter only' },
    { id: 'camelcase', label: 'camelCase', description: 'Convert to camelCase' },
    { id: 'snakecase', label: 'snake_case', description: 'Convert to snake_case' },
    { id: 'kebabcase', label: 'kebab-case', description: 'Convert to kebab-case' },
    { id: 'reverse', label: 'esreveR', description: 'Reverse text' },
    { id: 'removeextraspaces', label: 'Remove Extra Spaces', description: 'Remove extra whitespace' },
    { id: 'removelinebreaks', label: 'Remove Line Breaks', description: 'Join lines with spaces' },
    { id: 'addlinebreaks', label: 'Add Line Breaks', description: 'Break at sentences' },
    { id: 'duplicatelines', label: 'Duplicate Lines', description: 'Duplicate each line' },
  ];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="input-text" className="block text-sm font-medium mb-2">
            Input Text
          </label>
          <textarea
            id="input-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-32 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background"
          />
        </div>
      </div>

      {/* Format Operations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Format Options</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {operations.map((op) => (
            <button
              key={op.id}
              onClick={() => formatText(op.id)}
              disabled={!text.trim()}
              className="p-3 text-left border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="font-medium text-sm">{op.label}</div>
              <div className="text-xs text-foreground/60 mt-1">{op.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="result-text" className="block text-sm font-medium">
              Formatted Text
            </label>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
            >
              Copy
            </button>
          </div>
          <textarea
            id="result-text"
            value={result}
            readOnly
            className="w-full h-32 p-3 border border-foreground/20 rounded-lg resize-none bg-background"
          />
        </div>
      )}

      {/* Stats */}
      {text && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-foreground/5 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold">{text.length}</div>
            <div className="text-sm text-foreground/60">Characters</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{text.replace(/\s/g, '').length}</div>
            <div className="text-sm text-foreground/60">No Spaces</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{text.trim().split(/\s+/).filter(w => w).length}</div>
            <div className="text-sm text-foreground/60">Words</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{text.split('\n').length}</div>
            <div className="text-sm text-foreground/60">Lines</div>
          </div>
        </div>
      )}
    </div>
  );
}