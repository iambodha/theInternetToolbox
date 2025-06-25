'use client';

import { useState } from 'react';

export default function TextCleaner() {
  const [inputText, setInputText] = useState('');
  const [cleanedText, setCleanedText] = useState('');

  const cleaningOptions = [
    {
      id: 'removeExtraSpaces',
      name: 'Remove Extra Spaces',
      description: 'Replace multiple spaces with single spaces',
      action: (text: string) => text.replace(/\s+/g, ' ')
    },
    {
      id: 'removeExtraLineBreaks',
      name: 'Remove Extra Line Breaks',
      description: 'Replace multiple line breaks with single line breaks',
      action: (text: string) => text.replace(/\n\s*\n/g, '\n')
    },
    {
      id: 'trimLines',
      name: 'Trim Line Spaces',
      description: 'Remove leading and trailing spaces from each line',
      action: (text: string) => text.split('\n').map(line => line.trim()).join('\n')
    },
    {
      id: 'removeEmptyLines',
      name: 'Remove Empty Lines',
      description: 'Remove all empty or whitespace-only lines',
      action: (text: string) => text.split('\n').filter(line => line.trim()).join('\n')
    },
    {
      id: 'removeNumbers',
      name: 'Remove Numbers',
      description: 'Remove all numeric characters',
      action: (text: string) => text.replace(/\d/g, '')
    },
    {
      id: 'removeSpecialChars',
      name: 'Remove Special Characters',
      description: 'Keep only letters, numbers, and basic punctuation',
      action: (text: string) => text.replace(/[^\w\s.,!?;:'"()-]/g, '')
    },
    {
      id: 'removePunctuation',
      name: 'Remove Punctuation',
      description: 'Remove all punctuation marks',
      action: (text: string) => text.replace(/[^\w\s]/g, '')
    },
    {
      id: 'removeHTML',
      name: 'Remove HTML Tags',
      description: 'Strip all HTML tags from text',
      action: (text: string) => text.replace(/<[^>]*>/g, '')
    },
    {
      id: 'removeURLs',
      name: 'Remove URLs',
      description: 'Remove HTTP/HTTPS URLs',
      action: (text: string) => text.replace(/https?:\/\/[^\s]+/g, '')
    },
    {
      id: 'removeEmails',
      name: 'Remove Email Addresses',
      description: 'Remove email addresses',
      action: (text: string) => text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '')
    },
    {
      id: 'removePhones',
      name: 'Remove Phone Numbers',
      description: 'Remove phone numbers (US format)',
      action: (text: string) => text.replace(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, '')
    },
    {
      id: 'normalizeSpaces',
      name: 'Normalize Whitespace',
      description: 'Convert tabs and other whitespace to regular spaces',
      action: (text: string) => text.replace(/\s/g, ' ')
    }
  ];

  const applyCleaningOption = (optionId: string) => {
    const option = cleaningOptions.find(opt => opt.id === optionId);
    if (option && inputText) {
      const cleaned = option.action(inputText);
      setCleanedText(cleaned);
    }
  };

  const applyAllBasicCleaning = () => {
    if (!inputText) return;
    
    let cleaned = inputText;
    // Apply common cleaning operations in order
    cleaned = cleaned.replace(/\s+/g, ' '); // Remove extra spaces
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n'); // Trim lines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n'); // Remove extra line breaks
    cleaned = cleaned.split('\n').filter(line => line.trim()).join('\n'); // Remove empty lines
    cleaned = cleaned.trim(); // Trim overall
    
    setCleanedText(cleaned);
  };

  const applyAdvancedCleaning = () => {
    if (!inputText) return;
    
    let cleaned = inputText;
    // Apply advanced cleaning
    cleaned = cleaned.replace(/<[^>]*>/g, ''); // Remove HTML
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, ''); // Remove URLs
    cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, ''); // Remove emails
    cleaned = cleaned.replace(/\s+/g, ' '); // Remove extra spaces
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n'); // Trim lines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n'); // Remove extra line breaks
    cleaned = cleaned.trim(); // Trim overall
    
    setCleanedText(cleaned);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(cleanedText);
  };

  const useResult = () => {
    setInputText(cleanedText);
    setCleanedText('');
  };

  const clearAll = () => {
    setInputText('');
    setCleanedText('');
  };

  return (
    <div className="space-y-6">
      {/* Input Text */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="input-text" className="block text-sm font-medium">
            Input Text
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
          placeholder="Paste your text here to clean it..."
          className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Clean</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={applyAllBasicCleaning}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Basic Clean
          </button>
          <button
            onClick={applyAdvancedCleaning}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Advanced Clean
          </button>
        </div>
        <div className="text-sm text-foreground/60">
          <p><strong>Basic Clean:</strong> Removes extra spaces, line breaks, and empty lines</p>
          <p><strong>Advanced Clean:</strong> Also removes HTML tags, URLs, and email addresses</p>
        </div>
      </div>

      {/* Individual Cleaning Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual Cleaning Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cleaningOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => applyCleaningOption(option.id)}
              disabled={!inputText.trim()}
              className="p-3 text-left border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="font-medium text-sm">{option.name}</div>
              <div className="text-xs text-foreground/60 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {cleanedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Cleaned Text</label>
            <div className="flex gap-2">
              <button
                onClick={useResult}
                className="px-3 py-1 text-sm bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
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
            value={cleanedText}
            readOnly
            className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none bg-background"
          />
        </div>
      )}

      {/* Statistics */}
      {inputText && cleanedText && (
        <div className="p-4 bg-foreground/5 rounded-lg">
          <h4 className="font-semibold mb-3">Cleaning Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-foreground/60">Original characters:</span>
              <span className="ml-2 font-medium">{inputText.length}</span>
            </div>
            <div>
              <span className="text-foreground/60">Cleaned characters:</span>
              <span className="ml-2 font-medium">{cleanedText.length}</span>
            </div>
            <div>
              <span className="text-foreground/60">Characters removed:</span>
              <span className="ml-2 font-medium">{inputText.length - cleanedText.length}</span>
            </div>
            <div>
              <span className="text-foreground/60">Reduction:</span>
              <span className="ml-2 font-medium">
                {inputText.length > 0 ? Math.round(((inputText.length - cleanedText.length) / inputText.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {!inputText && (
        <div className="text-center p-8 text-foreground/60">
          <div className="text-4xl mb-4">🧹</div>
          <p>Enter some text above to clean and format it</p>
          <p className="text-sm mt-2">Remove unwanted spaces, characters, and formatting</p>
        </div>
      )}
    </div>
  );
}