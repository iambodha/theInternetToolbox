'use client';

import { useState } from 'react';

export default function TextConverter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [inputFormat, setInputFormat] = useState('plain');
  const [outputFormat, setOutputFormat] = useState('json');

  const formats = [
    { id: 'plain', name: 'Plain Text', description: 'Regular text' },
    { id: 'json', name: 'JSON Array', description: 'Array of lines' },
    { id: 'csv', name: 'CSV', description: 'Comma separated values' },
    { id: 'html', name: 'HTML List', description: 'HTML unordered list' },
    { id: 'markdown', name: 'Markdown List', description: 'Markdown bullet points' },
    { id: 'sql', name: 'SQL INSERT', description: 'SQL insert statements' },
    { id: 'xml', name: 'XML', description: 'XML elements' },
    { id: 'yaml', name: 'YAML', description: 'YAML list format' },
  ];

  const convertText = () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    const lines = inputText.split('\n').filter(line => line.trim());
    let result = '';

    switch (outputFormat) {
      case 'plain':
        result = lines.join('\n');
        break;
      
      case 'json':
        result = JSON.stringify(lines, null, 2);
        break;
      
      case 'csv':
        result = lines.map(line => `"${line.replace(/"/g, '""')}"`).join(',\n');
        break;
      
      case 'html':
        result = '<ul>\n' + lines.map(line => `  <li>${line}</li>`).join('\n') + '\n</ul>';
        break;
      
      case 'markdown':
        result = lines.map(line => `- ${line}`).join('\n');
        break;
      
      case 'sql':
        result = lines.map((line, index) => 
          `INSERT INTO items (id, value) VALUES (${index + 1}, '${line.replace(/'/g, "''")}');`
        ).join('\n');
        break;
      
      case 'xml':
        result = '<items>\n' + lines.map(line => `  <item>${line}</item>`).join('\n') + '\n</items>';
        break;
      
      case 'yaml':
        result = 'items:\n' + lines.map(line => `  - "${line}"`).join('\n');
        break;
      
      default:
        result = inputText;
    }

    setOutputText(result);
  };

  const parseInput = () => {
    if (!inputText.trim()) return;

    let lines: string[] = [];

    try {
      switch (inputFormat) {
        case 'plain':
          lines = inputText.split('\n').filter(line => line.trim());
          break;
        
        case 'json':
          const parsed = JSON.parse(inputText);
          if (Array.isArray(parsed)) {
            lines = parsed.map(item => String(item));
          }
          break;
        
        case 'csv':
          lines = inputText.split(/,\s*\n/).map(item => 
            item.replace(/^"/, '').replace(/"$/, '').replace(/""/g, '"')
          );
          break;
        
        case 'html':
          lines = inputText.match(/<li[^>]*>(.*?)<\/li>/gi)?.map(match => 
            match.replace(/<[^>]*>/g, '').trim()
          ) || [];
          break;
        
        case 'markdown':
          lines = inputText.split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map(line => line.replace(/^[\s\-\*]+/, '').trim());
          break;
        
        default:
          lines = inputText.split('\n').filter(line => line.trim());
      }
      
      setInputText(lines.join('\n'));
      convertText();
    } catch (error) {
      console.error('Parse error:', error);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText);
  };

  const swapFormats = () => {
    const temp = inputFormat;
    setInputFormat(outputFormat);
    setOutputFormat(temp);
    setInputText(outputText);
    setOutputText('');
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium">Input Format</label>
          <select
            value={inputFormat}
            onChange={(e) => setInputFormat(e.target.value)}
            className="w-full p-2 border border-foreground/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            {formats.map(format => (
              <option key={format.id} value={format.id}>
                {format.name} - {format.description}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium">Output Format</label>
          <div className="flex gap-2">
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="flex-1 p-2 border border-foreground/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {formats.map(format => (
                <option key={format.id} value={format.id}>
                  {format.name} - {format.description}
                </option>
              ))}
            </select>
            <button
              onClick={swapFormats}
              className="px-3 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
              title="Swap input and output formats"
            >
              ⇄
            </button>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="input-text" className="block text-sm font-medium">
            Input Text ({formats.find(f => f.id === inputFormat)?.name})
          </label>
          <button
            onClick={parseInput}
            className="px-3 py-1 text-sm bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
          >
            Parse Input
          </button>
        </div>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onBlur={convertText}
          placeholder={`Enter ${formats.find(f => f.id === inputFormat)?.name.toLowerCase()} here...`}
          className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background font-mono text-sm"
        />
      </div>

      {/* Convert Button */}
      <div className="flex justify-center">
        <button
          onClick={convertText}
          disabled={!inputText.trim()}
          className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Convert to {formats.find(f => f.id === outputFormat)?.name}
        </button>
      </div>

      {/* Output Section */}
      {outputText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="output-text" className="block text-sm font-medium">
              Output ({formats.find(f => f.id === outputFormat)?.name})
            </label>
            <button
              onClick={copyOutput}
              className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
            >
              Copy
            </button>
          </div>
          <textarea
            id="output-text"
            value={outputText}
            readOnly
            className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none bg-background font-mono text-sm"
          />
        </div>
      )}

      {/* Format Examples */}
      <div className="bg-foreground/5 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Format Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-1">JSON Array:</div>
            <code className="text-xs text-foreground/60">[&quot;item1&quot;, &quot;item2&quot;, &quot;item3&quot;]</code>
          </div>
          <div>
            <div className="font-medium mb-1">CSV:</div>
            <code className="text-xs text-foreground/60">&quot;item1&quot;,<br/>&quot;item2&quot;,<br/>&quot;item3&quot;</code>
          </div>
          <div>
            <div className="font-medium mb-1">HTML List:</div>
            <code className="text-xs text-foreground/60">&lt;ul&gt;&lt;li&gt;item1&lt;/li&gt;&lt;/ul&gt;</code>
          </div>
          <div>
            <div className="font-medium mb-1">Markdown:</div>
            <code className="text-xs text-foreground/60">- item1<br/>- item2<br/>- item3</code>
          </div>
        </div>
      </div>
    </div>
  );
}