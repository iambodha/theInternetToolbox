'use client';

import { useState } from 'react';

export default function TextSorter() {
  const [inputText, setInputText] = useState('');
  const [sortedText, setSortedText] = useState('');
  const [sortType, setSortType] = useState<'alphabetical' | 'numerical' | 'length' | 'random'>('alphabetical');
  const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>('ascending');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);

  const sortText = () => {
    if (!inputText.trim()) {
      setSortedText('');
      return;
    }

    let lines = inputText.split('\n');
    
    // Remove empty lines if option is selected
    if (removeEmpty) {
      lines = lines.filter(line => line.trim());
    }

    // Remove duplicates if option is selected
    if (removeDuplicates) {
      const seen = new Set();
      lines = lines.filter(line => {
        const normalized = caseSensitive ? line : line.toLowerCase();
        if (seen.has(normalized)) {
          return false;
        }
        seen.add(normalized);
        return true;
      });
    }

    // Sort based on selected type
    switch (sortType) {
      case 'alphabetical':
        lines.sort((a, b) => {
          const strA = caseSensitive ? a : a.toLowerCase();
          const strB = caseSensitive ? b : b.toLowerCase();
          return sortOrder === 'ascending' 
            ? strA.localeCompare(strB)
            : strB.localeCompare(strA);
        });
        break;

      case 'numerical':
        lines.sort((a, b) => {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return sortOrder === 'ascending' ? numA - numB : numB - numA;
        });
        break;

      case 'length':
        lines.sort((a, b) => {
          return sortOrder === 'ascending' 
            ? a.length - b.length 
            : b.length - a.length;
        });
        break;

      case 'random':
        // Fisher-Yates shuffle
        for (let i = lines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [lines[i], lines[j]] = [lines[j], lines[i]];
        }
        break;
    }

    setSortedText(lines.join('\n'));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(sortedText);
  };

  const useResult = () => {
    setInputText(sortedText);
    setSortedText('');
  };

  const clearAll = () => {
    setInputText('');
    setSortedText('');
  };

  const addNumbers = () => {
    if (!sortedText) return;
    
    const lines = sortedText.split('\n');
    const numberedLines = lines.map((line, index) => `${index + 1}. ${line}`);
    setSortedText(numberedLines.join('\n'));
  };

  const addBullets = () => {
    if (!sortedText) return;
    
    const lines = sortedText.split('\n');
    const bulletedLines = lines.map(line => `• ${line}`);
    setSortedText(bulletedLines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Input Text */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="input-text" className="block text-sm font-medium">
            Input Text (one item per line)
          </label>
          <button
            onClick={clearAll}
            className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
          >
            Clear All
          </button>
        </div>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your lines here, one item per line..."
          className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background"
        />
      </div>

      {/* Sort Options */}
      <div className="space-y-4 p-4 bg-foreground/5 rounded-lg">
        <h3 className="font-semibold">Sort Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sort Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Sort By</label>
            <div className="space-y-2">
              {[
                { value: 'alphabetical', label: 'Alphabetical (A-Z)', description: 'Sort by letter order' },
                { value: 'numerical', label: 'Numerical', description: 'Sort by numeric value' },
                { value: 'length', label: 'Length', description: 'Sort by text length' },
                { value: 'random', label: 'Random', description: 'Shuffle randomly' }
              ].map(option => (
                <label key={option.value} className="flex items-start space-x-2">
                  <input
                    type="radio"
                    name="sortType"
                    value={option.value}
                    checked={sortType === option.value}
                    onChange={(e) => setSortType(e.target.value as 'alphabetical' | 'numerical' | 'length' | 'random')}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">{option.label}</span>
                    <p className="text-xs text-foreground/60">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Order & Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Order & Options</label>
            <div className="space-y-2">
              {sortType !== 'random' && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="ascending"
                      checked={sortOrder === 'ascending'}
                      onChange={(e) => setSortOrder(e.target.value as 'ascending' | 'descending')}
                    />
                    <span className="text-sm">Ascending (A-Z, 1-9, Short-Long)</span>
                  </label>
                </div>
              )}
              {sortType !== 'random' && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="descending"
                      checked={sortOrder === 'descending'}
                      onChange={(e) => setSortOrder(e.target.value as 'ascending' | 'descending')}
                    />
                    <span className="text-sm">Descending (Z-A, 9-1, Long-Short)</span>
                  </label>
                </div>
              )}
              
              <div className="space-y-2 pt-2 border-t border-foreground/10">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                  />
                  <span className="text-sm">Case sensitive</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={removeEmpty}
                    onChange={(e) => setRemoveEmpty(e.target.checked)}
                  />
                  <span className="text-sm">Remove empty lines</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={removeDuplicates}
                    onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  />
                  <span className="text-sm">Remove duplicates</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Button */}
      <div className="flex justify-center">
        <button
          onClick={sortText}
          disabled={!inputText.trim()}
          className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sort Text
        </button>
      </div>

      {/* Result */}
      {sortedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Sorted Text</label>
            <div className="flex gap-2">
              <button
                onClick={addNumbers}
                className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
              >
                Add Numbers
              </button>
              <button
                onClick={addBullets}
                className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
              >
                Add Bullets
              </button>
              <button
                onClick={useResult}
                className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
              >
                Use as Input
              </button>
              <button
                onClick={copyResult}
                className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <textarea
            value={sortedText}
            onChange={(e) => setSortedText(e.target.value)}
            className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none bg-background"
          />
        </div>
      )}

      {/* Statistics */}
      {inputText && sortedText && (
        <div className="p-4 bg-foreground/5 rounded-lg">
          <h4 className="font-semibold mb-3">Sort Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-foreground/60">Original lines:</span>
              <span className="ml-2 font-medium">{inputText.split('\n').length}</span>
            </div>
            <div>
              <span className="text-foreground/60">Sorted lines:</span>
              <span className="ml-2 font-medium">{sortedText.split('\n').length}</span>
            </div>
            <div>
              <span className="text-foreground/60">Empty removed:</span>
              <span className="ml-2 font-medium">
                {inputText.split('\n').length - sortedText.split('\n').filter(line => line.trim()).length}
              </span>
            </div>
            <div>
              <span className="text-foreground/60">Sort type:</span>
              <span className="ml-2 font-medium capitalize">{sortType}</span>
            </div>
          </div>
        </div>
      )}

      {!inputText && (
        <div className="text-center p-8 text-foreground/60">
          <div className="text-4xl mb-4">📊</div>
          <p>Enter lines of text above to sort them</p>
          <p className="text-sm mt-2">Each line will be treated as a separate item to sort</p>
        </div>
      )}
    </div>
  );
}