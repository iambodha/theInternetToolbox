'use client';

import { useState } from 'react';

export default function TextExtractor() {
  const [inputText, setInputText] = useState('');
  const [extractionType, setExtractionType] = useState('emails');
  const [results, setResults] = useState<string[]>([]);
  const [customPattern, setCustomPattern] = useState('');

  const extractPatterns = {
    emails: {
      name: 'Email Addresses',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      description: 'Extract all email addresses'
    },
    urls: {
      name: 'URLs',
      regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      description: 'Extract all HTTP/HTTPS URLs'
    },
    phones: {
      name: 'Phone Numbers',
      regex: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      description: 'Extract phone numbers (US format)'
    },
    numbers: {
      name: 'Numbers',
      regex: /\b\d+(?:\.\d+)?\b/g,
      description: 'Extract all numbers (integers and decimals)'
    },
    dates: {
      name: 'Dates',
      regex: /\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/g,
      description: 'Extract dates in various formats'
    },
    ipaddresses: {
      name: 'IP Addresses',
      regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
      description: 'Extract IPv4 addresses'
    },
    hashtags: {
      name: 'Hashtags',
      regex: /#[a-zA-Z0-9_]+/g,
      description: 'Extract hashtags (#tag)'
    },
    mentions: {
      name: 'Mentions',
      regex: /@[a-zA-Z0-9_]+/g,
      description: 'Extract mentions (@username)'
    },
    words: {
      name: 'Words Only',
      regex: /\b[a-zA-Z]+\b/g,
      description: 'Extract alphabetic words only'
    },
    lines: {
      name: 'Non-empty Lines',
      regex: /.+/g,
      description: 'Extract all non-empty lines'
    }
  };

  const extractText = () => {
    if (!inputText.trim()) {
      setResults([]);
      return;
    }

    let matches: string[] = [];
    
    if (extractionType === 'custom' && customPattern) {
      try {
        const regex = new RegExp(customPattern, 'g');
        matches = inputText.match(regex) || [];
      } catch (error) {
        console.error('Invalid regex pattern:', error);
        matches = [];
      }
    } else {
      const pattern = extractPatterns[extractionType as keyof typeof extractPatterns];
      if (pattern) {
        matches = inputText.match(pattern.regex) || [];
      }
    }

    // Remove duplicates and filter empty matches
    const uniqueMatches = [...new Set(matches)].filter(match => match.trim());
    setResults(uniqueMatches);
  };

  const copyResults = () => {
    const resultText = results.join('\n');
    navigator.clipboard.writeText(resultText);
  };

  const downloadResults = () => {
    const resultText = results.join('\n');
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_${extractionType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const patternKeys = Object.keys(extractPatterns) as Array<keyof typeof extractPatterns>;

  return (
    <div className="space-y-6">
      {/* Extraction Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">What to Extract</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {patternKeys.map((key) => (
            <button
              key={key}
              onClick={() => setExtractionType(key)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                extractionType === key
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="font-medium text-sm">{extractPatterns[key].name}</div>
              <div className="text-xs opacity-70 mt-1">{extractPatterns[key].description}</div>
            </button>
          ))}
          <button
            onClick={() => setExtractionType('custom')}
            className={`p-3 text-left border rounded-lg transition-colors ${
              extractionType === 'custom'
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 hover:bg-foreground/5'
            }`}
          >
            <div className="font-medium text-sm">Custom Pattern</div>
            <div className="text-xs opacity-70 mt-1">Use your own regex</div>
          </button>
        </div>
      </div>

      {/* Custom Pattern Input */}
      {extractionType === 'custom' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Custom Regex Pattern</label>
          <input
            type="text"
            value={customPattern}
            onChange={(e) => setCustomPattern(e.target.value)}
            placeholder="Enter regex pattern (e.g., \d{3}-\d{3}-\d{4} for phone numbers)"
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <div className="text-xs text-foreground/60">
            Enter a JavaScript regular expression pattern. The &apos;g&apos; flag will be added automatically.
          </div>
        </div>
      )}

      {/* Input Text */}
      <div className="space-y-3">
        <label htmlFor="input-text" className="block text-sm font-medium">
          Input Text
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text here to extract patterns..."
          className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background"
        />
      </div>

      {/* Extract Button */}
      <div className="flex justify-center">
        <button
          onClick={extractText}
          disabled={!inputText.trim() || (extractionType === 'custom' && !customPattern)}
          className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Extract {extractionType === 'custom' ? 'Custom Pattern' : extractPatterns[extractionType as keyof typeof extractPatterns]?.name}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Extracted Results ({results.length} found)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyResults}
                className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
              >
                Copy All
              </button>
              <button
                onClick={downloadResults}
                className="px-3 py-1 text-sm bg-foreground/10 border border-foreground/20 rounded hover:bg-foreground/20 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto border border-foreground/20 rounded-lg">
            <div className="divide-y divide-foreground/10">
              {results.map((result, index) => (
                <div key={index} className="p-3 hover:bg-foreground/5 flex items-center justify-between group">
                  <span className="font-mono text-sm">{result}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-all"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="p-4 bg-foreground/5 rounded-lg">
            <h4 className="font-semibold mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-foreground/60">Total matches:</span>
                <span className="ml-2 font-medium">{results.length}</span>
              </div>
              <div>
                <span className="text-foreground/60">Unique matches:</span>
                <span className="ml-2 font-medium">{new Set(results).size}</span>
              </div>
              <div>
                <span className="text-foreground/60">Shortest:</span>
                <span className="ml-2 font-medium">{Math.min(...results.map(r => r.length))} chars</span>
              </div>
              <div>
                <span className="text-foreground/60">Longest:</span>
                <span className="ml-2 font-medium">{Math.max(...results.map(r => r.length))} chars</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {inputText && results.length === 0 && (
        <div className="text-center p-8 text-foreground/60 bg-foreground/5 rounded-lg">
          <div className="text-4xl mb-4">🔍</div>
          <p>No matches found for the selected pattern</p>
          <p className="text-sm mt-2">Try a different extraction type or check your input text</p>
        </div>
      )}

      {/* Pattern Examples */}
      <div className="bg-foreground/5 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Pattern Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-1">Email:</div>
            <code className="text-xs text-foreground/60">user@example.com</code>
          </div>
          <div>
            <div className="font-medium mb-1">URL:</div>
            <code className="text-xs text-foreground/60">https://www.example.com</code>
          </div>
          <div>
            <div className="font-medium mb-1">Phone:</div>
            <code className="text-xs text-foreground/60">(555) 123-4567</code>
          </div>
          <div>
            <div className="font-medium mb-1">IP Address:</div>
            <code className="text-xs text-foreground/60">192.168.1.1</code>
          </div>
        </div>
      </div>
    </div>
  );
}