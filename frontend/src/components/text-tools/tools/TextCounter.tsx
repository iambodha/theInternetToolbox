'use client';

import { useState, useMemo } from 'react';

export default function TextCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    if (!text) return null;

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim().split(/\s+/).filter(w => w).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    const lines = text.split('\n').length;
    
    // Character frequency
    const charFreq: { [key: string]: number } = {};
    for (const char of text.toLowerCase()) {
      if (char.match(/[a-z]/)) {
        charFreq[char] = (charFreq[char] || 0) + 1;
      }
    }
    
    // Word frequency
    const wordFreq: { [key: string]: number } = {};
    const wordsArray = text.toLowerCase().match(/\b\w+\b/g) || [];
    for (const word of wordsArray) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }

    // Most frequent words (top 10)
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Most frequent characters (top 10)
    const topChars = Object.entries(charFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Average words per sentence
    const avgWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;

    // Reading time (assuming 200 words per minute)
    const readingTimeMinutes = Math.ceil(words / 200);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      topWords,
      topChars,
      avgWordsPerSentence,
      readingTimeMinutes,
      uniqueWords: Object.keys(wordFreq).length,
    };
  }, [text]);

  const copyStats = () => {
    if (!stats) return;
    
    const statsText = `Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Unique words: ${stats.uniqueWords}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Average words per sentence: ${stats.avgWordsPerSentence}
Estimated reading time: ${stats.readingTimeMinutes} minute(s)`;

    navigator.clipboard.writeText(statsText);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="input-text" className="block text-sm font-medium mb-2">
            Enter Text to Analyze
          </label>
          <textarea
            id="input-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            className="w-full h-40 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background"
          />
        </div>
      </div>

      {/* Basic Statistics */}
      {stats && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Text Statistics</h3>
            <button
              onClick={copyStats}
              className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
            >
              Copy Stats
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.characters}</div>
              <div className="text-sm text-foreground/60">Characters</div>
            </div>
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.charactersNoSpaces}</div>
              <div className="text-sm text-foreground/60">No Spaces</div>
            </div>
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.words}</div>
              <div className="text-sm text-foreground/60">Words</div>
            </div>
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.uniqueWords}</div>
              <div className="text-sm text-foreground/60">Unique Words</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.sentences}</div>
              <div className="text-sm text-foreground/60">Sentences</div>
            </div>
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.paragraphs}</div>
              <div className="text-sm text-foreground/60">Paragraphs</div>
            </div>
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.lines}</div>
              <div className="text-sm text-foreground/60">Lines</div>
            </div>
            <div className="p-4 bg-foreground/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.readingTimeMinutes}</div>
              <div className="text-sm text-foreground/60">Min Read</div>
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="p-4 bg-foreground/5 rounded-lg">
            <h4 className="font-semibold mb-2">Reading Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-foreground/60">Average words per sentence:</span>
                <span className="ml-2 font-medium">{stats.avgWordsPerSentence}</span>
              </div>
              <div>
                <span className="text-foreground/60">Estimated reading time:</span>
                <span className="ml-2 font-medium">{stats.readingTimeMinutes} minute(s)</span>
              </div>
            </div>
          </div>

          {/* Top Words */}
          {stats.topWords.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Most Frequent Words</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {stats.topWords.map(([word, count]) => (
                  <div key={word} className="p-2 bg-foreground/5 rounded text-center">
                    <div className="font-medium text-sm">{word}</div>
                    <div className="text-xs text-foreground/60">{count}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Characters */}
          {stats.topChars.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Most Frequent Letters</h4>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {stats.topChars.map(([char, count]) => (
                  <div key={char} className="p-2 bg-foreground/5 rounded text-center">
                    <div className="font-medium text-sm uppercase">{char}</div>
                    <div className="text-xs text-foreground/60">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!text && (
        <div className="text-center p-8 text-foreground/60">
          <div className="text-4xl mb-4">📊</div>
          <p>Enter some text above to see detailed statistics and analysis</p>
        </div>
      )}
    </div>
  );
}