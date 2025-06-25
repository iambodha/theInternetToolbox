'use client';

import { useState } from 'react';

export default function TextGenerator() {
  const [generatorType, setGeneratorType] = useState('lorem');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    paragraphs: 3,
    sentences: 5,
    words: 50,
    passwordLength: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
    listItems: 10,
    minLength: 5,
    maxLength: 15,
  });

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generateLorem = () => {
    let result = '';
    
    for (let p = 0; p < options.paragraphs; p++) {
      let paragraph = '';
      
      for (let s = 0; s < options.sentences; s++) {
        let sentence = '';
        const sentenceLength = Math.floor(Math.random() * 10) + 5;
        
        for (let w = 0; w < sentenceLength; w++) {
          const word = loremWords[Math.floor(Math.random() * loremWords.length)];
          sentence += (w === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
          sentence += w < sentenceLength - 1 ? ' ' : '.';
        }
        
        paragraph += sentence + ' ';
      }
      
      result += paragraph.trim() + '\n\n';
    }
    
    return result.trim();
  };

  const generatePassword = () => {
    let chars = '';
    if (options.includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (options.includeNumbers) chars += '0123456789';
    if (options.includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!chars) return '';
    
    let password = '';
    for (let i = 0; i < options.passwordLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const fetchRandomWords = async (count: number) => {
    try {
      // Use a free dictionary API to get random words
      const response = await fetch(`https://api.datamuse.com/words?ml=random&max=${count * 2}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return data.slice(0, count).map((item: { word: string }) => item.word);
      }
      
      // Fallback to another API if first one fails
      const fallbackResponse = await fetch(`https://random-word-api.herokuapp.com/word?number=${count}`);
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData && Array.isArray(fallbackData)) {
        return fallbackData;
      }
      
      // Final fallback to hardcoded words
      return generateFallbackWords(count);
    } catch (error) {
      console.error('Error fetching random words:', error);
      return generateFallbackWords(count);
    }
  };

  const generateFallbackWords = (count: number) => {
    const fallbackWords = [
      'apple', 'banana', 'computer', 'database', 'elephant', 'firefox', 'guitar',
      'hamburger', 'internet', 'javascript', 'keyboard', 'laptop', 'mountain',
      'notebook', 'orange', 'penguin', 'question', 'rainbow', 'sunshine',
      'telephone', 'umbrella', 'vacation', 'watermelon', 'xylophone', 'yellow',
      'zebra', 'adventure', 'building', 'creative', 'delicious', 'energetic',
      'fantastic', 'gorgeous', 'happiness', 'incredible', 'journey', 'knowledge',
      'laughter', 'magnificent', 'natural', 'outstanding', 'peaceful', 'quality'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(fallbackWords[Math.floor(Math.random() * fallbackWords.length)]);
    }
    return result;
  };

  const generateRandomWords = async () => {
    try {
      const words = await fetchRandomWords(options.words);
      return words.join(' ');
    } catch (error) {
      console.error('Error generating random words:', error);
      return generateFallbackWords(options.words).join(' ');
    }
  };

  const generateRandomList = async () => {
    try {
      const words = await fetchRandomWords(options.listItems * 2);
      const items = [];
      
      for (let i = 0; i < options.listItems; i++) {
        let item = '';
        
        // Create items using combinations of dictionary words
        if (words.length >= 2) {
          const word1 = words[Math.floor(Math.random() * words.length)];
          const word2 = words[Math.floor(Math.random() * words.length)];
          item = `${word1} ${word2}`;
        } else {
          item = words[i % words.length] || `Item ${i + 1}`;
        }
        
        // Adjust length based on options
        if (item.length < options.minLength) {
          const suffixes = ['pro', 'max', 'plus', 'premium', 'deluxe', 'super'];
          item += ' ' + suffixes[Math.floor(Math.random() * suffixes.length)];
        }
        
        if (item.length > options.maxLength) {
          item = item.substring(0, options.maxLength);
        }
        
        items.push(item);
      }
      
      return items.join('\n');
    } catch (error) {
      console.error('Error generating random list:', error);
      // Fallback to original method
      const adjectives = ['amazing', 'bright', 'creative', 'dynamic', 'elegant', 'fantastic', 'graceful'];
      const nouns = ['project', 'idea', 'solution', 'concept', 'design', 'strategy', 'approach'];
      
      const items = [];
      for (let i = 0; i < options.listItems; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const length = Math.floor(Math.random() * (options.maxLength - options.minLength + 1)) + options.minLength;
        
        let item = `${adj} ${noun}`;
        if (item.length < length) {
          item += ' ' + Math.random().toString(36).substring(2, length - item.length + 2);
        }
        items.push(item.substring(0, length));
      }
      
      return items.join('\n');
    }
  };

  const generateUUIDs = () => {
    const uuids = [];
    for (let i = 0; i < options.listItems; i++) {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      uuids.push(uuid);
    }
    return uuids.join('\n');
  };

  const generateText = async () => {
    setIsLoading(true);
    let result = '';
    
    try {
      switch (generatorType) {
        case 'lorem':
          result = generateLorem();
          break;
        case 'password':
          result = generatePassword();
          break;
        case 'words':
          result = await generateRandomWords();
          break;
        case 'list':
          result = await generateRandomList();
          break;
        case 'uuid':
          result = generateUUIDs();
          break;
        default:
          result = 'Select a generator type';
      }
      
      setGeneratedText(result);
    } catch (error) {
      console.error('Error generating text:', error);
      setGeneratedText('Error generating text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
  };

  const generatorTypes = [
    { id: 'lorem', name: 'Lorem Ipsum', description: 'Generate placeholder text' },
    { id: 'password', name: 'Password', description: 'Generate secure passwords' },
    { id: 'words', name: 'Random Words', description: 'Generate random word sequences' },
    { id: 'list', name: 'Random List', description: 'Generate list of random items' },
    { id: 'uuid', name: 'UUIDs', description: 'Generate unique identifiers' },
  ];

  return (
    <div className="space-y-6">
      {/* Generator Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Generator Type</label>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {generatorTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setGeneratorType(type.id)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                generatorType === type.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="font-medium text-sm">{type.name}</div>
              <div className="text-xs opacity-70 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4 p-4 bg-foreground/5 rounded-lg">
        <h3 className="font-semibold">Options</h3>
        
        {generatorType === 'lorem' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Paragraphs</label>
              <input
                type="number"
                min="1"
                max="10"
                value={options.paragraphs}
                onChange={(e) => setOptions({...options, paragraphs: parseInt(e.target.value) || 1})}
                className="w-full p-2 border border-foreground/20 rounded bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sentences per paragraph</label>
              <input
                type="number"
                min="1"
                max="10"
                value={options.sentences}
                onChange={(e) => setOptions({...options, sentences: parseInt(e.target.value) || 1})}
                className="w-full p-2 border border-foreground/20 rounded bg-background"
              />
            </div>
          </div>
        )}

        {generatorType === 'password' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password Length</label>
              <input
                type="number"
                min="4"
                max="128"
                value={options.passwordLength}
                onChange={(e) => setOptions({...options, passwordLength: parseInt(e.target.value) || 8})}
                className="w-full p-2 border border-foreground/20 rounded bg-background"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) => setOptions({...options, includeUppercase: e.target.checked})}
                />
                <span className="text-sm">Uppercase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) => setOptions({...options, includeLowercase: e.target.checked})}
                />
                <span className="text-sm">Lowercase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) => setOptions({...options, includeNumbers: e.target.checked})}
                />
                <span className="text-sm">Numbers</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) => setOptions({...options, includeSymbols: e.target.checked})}
                />
                <span className="text-sm">Symbols</span>
              </label>
            </div>
          </div>
        )}

        {generatorType === 'words' && (
          <div>
            <label className="block text-sm font-medium mb-1">Number of Words</label>
            <input
              type="number"
              min="1"
              max="100"
              value={options.words}
              onChange={(e) => setOptions({...options, words: parseInt(e.target.value) || 1})}
              className="w-full p-2 border border-foreground/20 rounded bg-background"
            />
          </div>
        )}

        {(generatorType === 'list' || generatorType === 'uuid') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Number of Items</label>
              <input
                type="number"
                min="1"
                max="100"
                value={options.listItems}
                onChange={(e) => setOptions({...options, listItems: parseInt(e.target.value) || 1})}
                className="w-full p-2 border border-foreground/20 rounded bg-background"
              />
            </div>
            {generatorType === 'list' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Length</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={options.minLength}
                    onChange={(e) => setOptions({...options, minLength: parseInt(e.target.value) || 1})}
                    className="w-full p-2 border border-foreground/20 rounded bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Length</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={options.maxLength}
                    onChange={(e) => setOptions({...options, maxLength: parseInt(e.target.value) || 1})}
                    className="w-full p-2 border border-foreground/20 rounded bg-background"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateText}
          disabled={isLoading}
          className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : `Generate ${generatorTypes.find(t => t.id === generatorType)?.name}`}
        </button>
      </div>

      {/* Generated Text */}
      {generatedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Generated Text</label>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
            >
              Copy
            </button>
          </div>
          <textarea
            value={generatedText}
            readOnly
            className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none bg-background font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}