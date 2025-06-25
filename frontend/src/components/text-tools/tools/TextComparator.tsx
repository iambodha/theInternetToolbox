'use client';

import { useState, useMemo } from 'react';

interface DiffResult {
  type: 'equal' | 'added' | 'deleted';
  content: string;
  lineNumber?: number;
}

export default function TextComparator() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [compareMode, setCompareMode] = useState<'character' | 'word' | 'line'>('line');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const diffResults = useMemo(() => {
    if (!text1.trim() && !text2.trim()) return [];

    const processText = (text: string) => {
      let processed = text;
      if (ignoreCase) processed = processed.toLowerCase();
      if (ignoreWhitespace) processed = processed.replace(/\s+/g, ' ').trim();
      return processed;
    };

    const t1 = processText(text1);
    const t2 = processText(text2);

    let items1: string[], items2: string[];

    switch (compareMode) {
      case 'character':
        items1 = t1.split('');
        items2 = t2.split('');
        break;
      case 'word':
        items1 = t1.split(/\s+/).filter(w => w);
        items2 = t2.split(/\s+/).filter(w => w);
        break;
      case 'line':
      default:
        items1 = t1.split('\n');
        items2 = t2.split('\n');
        break;
    }

    // Simple diff algorithm (Myers' algorithm simplified)
    const diff: DiffResult[] = [];
    let i = 0, j = 0;

    while (i < items1.length || j < items2.length) {
      if (i >= items1.length) {
        // Only items2 left - all additions
        diff.push({ type: 'added', content: items2[j] });
        j++;
      } else if (j >= items2.length) {
        // Only items1 left - all deletions
        diff.push({ type: 'deleted', content: items1[i] });
        i++;
      } else if (items1[i] === items2[j]) {
        // Items are equal
        diff.push({ type: 'equal', content: items1[i] });
        i++;
        j++;
      } else {
        // Items are different - check ahead to see which direction to go
        let foundInText2 = false;
        let foundInText1 = false;

        // Look ahead in text2 for items1[i]
        for (let k = j + 1; k < Math.min(j + 5, items2.length); k++) {
          if (items1[i] === items2[k]) {
            foundInText2 = true;
            break;
          }
        }

        // Look ahead in text1 for items2[j]
        for (let k = i + 1; k < Math.min(i + 5, items1.length); k++) {
          if (items2[j] === items1[k]) {
            foundInText1 = true;
            break;
          }
        }

        if (foundInText2 && !foundInText1) {
          // items2[j] was added
          diff.push({ type: 'added', content: items2[j] });
          j++;
        } else if (foundInText1 && !foundInText2) {
          // items1[i] was deleted
          diff.push({ type: 'deleted', content: items1[i] });
          i++;
        } else {
          // Both or neither found, treat as replacement
          diff.push({ type: 'deleted', content: items1[i] });
          diff.push({ type: 'added', content: items2[j] });
          i++;
          j++;
        }
      }
    }

    return diff;
  }, [text1, text2, compareMode, ignoreCase, ignoreWhitespace]);

  const stats = useMemo(() => {
    const added = diffResults.filter(d => d.type === 'added').length;
    const deleted = diffResults.filter(d => d.type === 'deleted').length;
    const equal = diffResults.filter(d => d.type === 'equal').length;
    const total = diffResults.length;
    
    return { added, deleted, equal, total };
  }, [diffResults]);

  const swapTexts = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
  };

  const clearTexts = () => {
    setText1('');
    setText2('');
  };

  const copyDiff = () => {
    const diffText = diffResults.map(result => {
      const prefix = result.type === 'added' ? '+ ' : result.type === 'deleted' ? '- ' : '  ';
      return prefix + result.content;
    }).join('\n');
    
    navigator.clipboard.writeText(diffText);
  };

  return (
    <div className="space-y-6">
      {/* Compare Options */}
      <div className="space-y-4 p-4 bg-foreground/5 rounded-lg">
        <h3 className="font-semibold">Comparison Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Compare By</label>
            <div className="flex gap-2">
              {[
                { value: 'line', label: 'Lines' },
                { value: 'word', label: 'Words' },
                { value: 'character', label: 'Characters' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setCompareMode(option.value as 'character' | 'word' | 'line')}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    compareMode === option.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-foreground/20 hover:bg-foreground/5'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Options</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                />
                <span className="text-sm">Ignore case</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                />
                <span className="text-sm">Ignore extra whitespace</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Input Texts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Original Text</label>
            <div className="flex gap-2">
              <button
                onClick={swapTexts}
                className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
              >
                ⇄ Swap
              </button>
              <button
                onClick={clearTexts}
                className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter the original text here..."
            className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background font-mono text-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Modified Text</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter the modified text here..."
            className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background font-mono text-sm"
          />
        </div>
      </div>

      {/* Statistics */}
      {diffResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Comparison Results</h3>
            <button
              onClick={copyDiff}
              className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
            >
              Copy Diff
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.added}</div>
              <div className="text-sm text-green-600">Added</div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.deleted}</div>
              <div className="text-sm text-red-600">Deleted</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">{stats.equal}</div>
              <div className="text-sm text-foreground/60">Unchanged</div>
            </div>
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-foreground/60">Total {compareMode}s</div>
            </div>
          </div>

          {/* Diff Display */}
          <div className="border border-foreground/20 rounded-lg overflow-hidden">
            <div className="bg-foreground/5 p-3 border-b border-foreground/20">
              <h4 className="font-semibold text-sm">Differences</h4>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-foreground/10">
                {diffResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 font-mono text-sm ${
                      result.type === 'added'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : result.type === 'deleted'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                        : 'bg-background'
                    }`}
                  >
                    <span className="mr-2 text-foreground/60">
                      {result.type === 'added' ? '+' : result.type === 'deleted' ? '-' : ' '}
                    </span>
                    <span className={compareMode === 'line' ? 'whitespace-pre-wrap' : ''}>
                      {result.content || (compareMode === 'line' ? '(empty line)' : '(empty)')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!text1.trim() && !text2.trim() && (
        <div className="text-center p-8 text-foreground/60">
          <div className="text-4xl mb-4">⚖️</div>
          <p>Enter text in both fields above to compare differences</p>
          <p className="text-sm mt-2">Added content will appear in green, deleted content in red</p>
        </div>
      )}
    </div>
  );
}