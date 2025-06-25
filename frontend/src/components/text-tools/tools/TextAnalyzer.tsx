'use client';

import { useState, useMemo } from 'react';

export default function TextAnalyzer() {
  const [text, setText] = useState('');

  const getSyllableCount = (text: string): number => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.reduce((total, word) => {
      // Simple syllable counting heuristic
      const vowels = word.match(/[aeiouy]+/g) || [];
      let syllables = vowels.length;
      
      // Adjust for silent e
      if (word.endsWith('e') && syllables > 1) {
        syllables--;
      }
      
      // Minimum 1 syllable per word
      return total + Math.max(1, syllables);
    }, 0);
  };

  const analysis = useMemo(() => {
    if (!text.trim()) return null;

    // Basic counts
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim().split(/\s+/).filter(w => w).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    const lines = text.split('\n').length;

    // Word analysis
    const wordsArray = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(wordsArray).size;
    const averageWordLength = wordsArray.length > 0 
      ? Math.round((wordsArray.reduce((sum, word) => sum + word.length, 0) / wordsArray.length) * 100) / 100
      : 0;

    // Sentence analysis
    const averageWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 100) / 100 : 0;
    const averageSentenceLength = sentences > 0 
      ? Math.round((characters / sentences) * 100) / 100 
      : 0;

    // Reading metrics
    const readingTimeMinutes = Math.ceil(words / 200); // 200 WPM average
    const speakingTimeMinutes = Math.ceil(words / 150); // 150 WPM average speaking

    // Readability scores
    const fleschKincaidGradeLevel = sentences > 0 && words > 0
      ? Math.round((0.39 * (words / sentences) + 11.8 * (getSyllableCount(text) / words) - 15.59) * 100) / 100
      : 0;

    const fleschReadingEase = sentences > 0 && words > 0
      ? Math.round((206.835 - 1.015 * (words / sentences) - 84.6 * (getSyllableCount(text) / words)) * 100) / 100
      : 0;

    // Character frequency
    const charFrequency: { [key: string]: number } = {};
    for (const char of text.toLowerCase()) {
      if (char.match(/[a-z]/)) {
        charFrequency[char] = (charFrequency[char] || 0) + 1;
      }
    }

    // Word frequency (top 10)
    const wordFrequency: { [key: string]: number } = {};
    for (const word of wordsArray) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
    const topWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Text complexity metrics
    const complexWords = wordsArray.filter(word => getSyllableCount(word) >= 3).length;
    const complexityScore = words > 0 ? Math.round((complexWords / words) * 100) : 0;

    // Language patterns
    const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
    const lowercaseCount = (text.match(/[a-z]/g) || []).length;
    const digitCount = (text.match(/\d/g) || []).length;
    const punctuationCount = (text.match(/[^\w\s]/g) || []).length;

    return {
      basic: {
        characters,
        charactersNoSpaces,
        words,
        uniqueWords,
        sentences,
        paragraphs,
        lines,
      },
      averages: {
        wordLength: averageWordLength,
        wordsPerSentence: averageWordsPerSentence,
        sentenceLength: averageSentenceLength,
      },
      readability: {
        fleschKincaidGradeLevel,
        fleschReadingEase,
        readingTime: readingTimeMinutes,
        speakingTime: speakingTimeMinutes,
        complexityScore,
      },
      composition: {
        uppercaseCount,
        lowercaseCount,
        digitCount,
        punctuationCount,
      },
      frequency: {
        topWords,
        charFrequency,
      }
    };
  }, [text]);

  const getReadabilityLevel = (score: number): { level: string; color: string; description: string } => {
    if (score >= 90) return { level: 'Very Easy', color: 'text-green-600', description: '5th grade level' };
    if (score >= 80) return { level: 'Easy', color: 'text-green-500', description: '6th grade level' };
    if (score >= 70) return { level: 'Fairly Easy', color: 'text-blue-500', description: '7th grade level' };
    if (score >= 60) return { level: 'Standard', color: 'text-yellow-600', description: '8th-9th grade level' };
    if (score >= 50) return { level: 'Fairly Difficult', color: 'text-orange-600', description: '10th-12th grade level' };
    if (score >= 30) return { level: 'Difficult', color: 'text-red-500', description: 'College level' };
    return { level: 'Very Difficult', color: 'text-red-700', description: 'Graduate level' };
  };

  const copyAnalysis = () => {
    if (!analysis) return;
    
    const analysisText = `Text Analysis Report:

Basic Statistics:
- Characters: ${analysis.basic.characters}
- Characters (no spaces): ${analysis.basic.charactersNoSpaces}
- Words: ${analysis.basic.words}
- Unique words: ${analysis.basic.uniqueWords}
- Sentences: ${analysis.basic.sentences}
- Paragraphs: ${analysis.basic.paragraphs}
- Lines: ${analysis.basic.lines}

Averages:
- Average word length: ${analysis.averages.wordLength} characters
- Average words per sentence: ${analysis.averages.wordsPerSentence}
- Average sentence length: ${analysis.averages.sentenceLength} characters

Readability:
- Flesch Reading Ease: ${analysis.readability.fleschReadingEase}
- Flesch-Kincaid Grade Level: ${analysis.readability.fleschKincaidGradeLevel}
- Reading time: ${analysis.readability.readingTime} minutes
- Speaking time: ${analysis.readability.speakingTime} minutes
- Complexity score: ${analysis.readability.complexityScore}%`;

    navigator.clipboard.writeText(analysisText);
  };

  const readabilityInfo = analysis ? getReadabilityLevel(analysis.readability.fleschReadingEase) : null;

  return (
    <div className="space-y-6">
      {/* Input Text */}
      <div className="space-y-3">
        <label htmlFor="text-input" className="block text-sm font-medium">
          Text to Analyze
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text here for comprehensive analysis..."
          className="w-full h-48 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background"
        />
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Text Analysis Results</h3>
            <button
              onClick={copyAnalysis}
              className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
            >
              Copy Analysis
            </button>
          </div>

          {/* Basic Statistics */}
          <div className="space-y-3">
            <h4 className="font-semibold">Basic Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.basic.characters}</div>
                <div className="text-sm text-blue-600">Characters</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.basic.words}</div>
                <div className="text-sm text-green-600">Words</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{analysis.basic.sentences}</div>
                <div className="text-sm text-purple-600">Sentences</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{analysis.basic.paragraphs}</div>
                <div className="text-sm text-orange-600">Paragraphs</div>
              </div>
            </div>
          </div>

          {/* Readability Analysis */}
          <div className="space-y-3">
            <h4 className="font-semibold">Readability Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="p-4 bg-foreground/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Flesch Reading Ease</span>
                    <span className="text-lg font-bold">{analysis.readability.fleschReadingEase}</span>
                  </div>
                  {readabilityInfo && (
                    <div className="text-sm">
                      <span className={`font-medium ${readabilityInfo.color}`}>
                        {readabilityInfo.level}
                      </span>
                      <span className="text-foreground/60 ml-2">
                        ({readabilityInfo.description})
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-foreground/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade Level</span>
                    <span className="text-lg font-bold">{analysis.readability.fleschKincaidGradeLevel}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-foreground/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reading Time</span>
                    <span className="text-lg font-bold">{analysis.readability.readingTime} min</span>
                  </div>
                </div>
                <div className="p-4 bg-foreground/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Speaking Time</span>
                    <span className="text-lg font-bold">{analysis.readability.speakingTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="space-y-3">
            <h4 className="font-semibold">Detailed Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-foreground/5 rounded-lg">
                <div className="font-medium">Average word length</div>
                <div className="text-lg font-bold">{analysis.averages.wordLength} chars</div>
              </div>
              <div className="p-3 bg-foreground/5 rounded-lg">
                <div className="font-medium">Words per sentence</div>
                <div className="text-lg font-bold">{analysis.averages.wordsPerSentence}</div>
              </div>
              <div className="p-3 bg-foreground/5 rounded-lg">
                <div className="font-medium">Unique words</div>
                <div className="text-lg font-bold">{analysis.basic.uniqueWords}</div>
              </div>
              <div className="p-3 bg-foreground/5 rounded-lg">
                <div className="font-medium">Complexity score</div>
                <div className="text-lg font-bold">{analysis.readability.complexityScore}%</div>
              </div>
              <div className="p-3 bg-foreground/5 rounded-lg">
                <div className="font-medium">Uppercase letters</div>
                <div className="text-lg font-bold">{analysis.composition.uppercaseCount}</div>
              </div>
              <div className="p-3 bg-foreground/5 rounded-lg">
                <div className="font-medium">Punctuation marks</div>
                <div className="text-lg font-bold">{analysis.composition.punctuationCount}</div>
              </div>
            </div>
          </div>

          {/* Top Words */}
          {analysis.frequency.topWords.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Most Frequent Words</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {analysis.frequency.topWords.map(([word, count]) => (
                  <div key={word} className="p-2 bg-foreground/5 rounded text-center">
                    <div className="font-medium text-sm">{word}</div>
                    <div className="text-xs text-foreground/60">{count}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!text && (
        <div className="text-center p-8 text-foreground/60">
          <div className="text-4xl mb-4">📈</div>
          <p>Enter text above to analyze its readability and complexity</p>
          <p className="text-sm mt-2">Get detailed statistics, readability scores, and word frequency analysis</p>
        </div>
      )}
    </div>
  );
}