'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { styles } from '@/lib/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Word lists for different modes
const commonWords = [
  'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with',
  'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what',
  'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
  'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make',
  'like', 'into', 'him', 'time', 'has', 'two', 'more', 'very', 'after', 'words', 'its', 'just', 'where', 'only',
  'new', 'work', 'part', 'take', 'get', 'place', 'made', 'live', 'where', 'after', 'back', 'little', 'only', 'round',
  'man', 'year', 'came', 'show', 'every', 'good', 'me', 'give', 'our', 'under', 'name', 'very', 'through', 'just',
  'form', 'sentence', 'great', 'think', 'say', 'help', 'low', 'line', 'differ', 'turn', 'cause', 'much', 'mean',
  'before', 'move', 'right', 'boy', 'old', 'too', 'same', 'tell', 'does', 'set', 'three', 'want', 'air', 'well',
  'also', 'play', 'small', 'end', 'put', 'home', 'read', 'hand', 'port', 'large', 'spell', 'add', 'even', 'land',
  'here', 'must', 'big', 'high', 'such', 'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light', 'kind',
  'off', 'need', 'house', 'picture', 'try', 'us', 'again', 'animal', 'point', 'mother', 'world', 'near', 'build',
  'self', 'earth', 'father', 'head', 'stand', 'own', 'page', 'should', 'country', 'found', 'answer', 'school',
  'grow', 'study', 'still', 'learn', 'plant', 'cover', 'food', 'sun', 'four', 'between', 'state', 'keep', 'eye',
  'never', 'last', 'let', 'thought', 'city', 'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw',
  'far', 'sea', 'draw', 'left', 'late', 'run', "don't", 'while', 'press', 'close', 'night', 'real', 'life', 'few'
];

const punctuationMarks = ['.', ',', '!', '?', ';', ':', '"', "'", '-', '(', ')', '[', ']'];
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timestamp: number;
}

interface TestSettings {
  mode: 'words' | 'random' | 'numbers';
  testType: 'duration' | 'wordCount';
  duration: 15 | 30 | 60 | 120;
  includePunctuation: boolean;
  includeNumbers: boolean;
  wordCount: 25 | 50 | 100 | 200;
}

export default function TypingSpeed() {
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [generatedText, setGeneratedText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [statsHistory, setStatsHistory] = useState<TypingStats[]>([]);
  const [realTimeStats, setRealTimeStats] = useState<TypingStats[]>([]);
  const [settings, setSettings] = useState<TestSettings>({
    mode: 'words',
    testType: 'duration',
    duration: 30,
    includePunctuation: false,
    includeNumbers: false,
    wordCount: 50
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random text based on settings
  const generateText = useCallback(() => {
    let words: string[] = [];
    
    switch (settings.mode) {
      case 'words':
        words = [...commonWords];
        break;
      case 'random':
        words = Array.from({ length: 200 }, () => {
          const length = Math.floor(Math.random() * 8) + 3;
          return Array.from({ length }, () => 
            String.fromCharCode(97 + Math.floor(Math.random() * 26))
          ).join('');
        });
        break;
      case 'numbers':
        words = Array.from({ length: 200 }, () => {
          const length = Math.floor(Math.random() * 5) + 1;
          return Array.from({ length }, () => 
            numbers[Math.floor(Math.random() * numbers.length)]
          ).join('');
        });
        break;
    }

    // Shuffle words
    const shuffled = words.sort(() => 0.5 - Math.random());
    
    // For duration tests, generate a large amount of words (infinite feel)
    // For word count tests, use the specified word count
    const wordCount = settings.testType === 'duration' ? 1000 : settings.wordCount;
    let selectedWords = [];
    
    // Generate words by cycling through shuffled array if needed
    for (let i = 0; i < wordCount; i++) {
      selectedWords.push(shuffled[i % shuffled.length]);
    }

    // Add punctuation if enabled
    if (settings.includePunctuation && settings.mode === 'words') {
      selectedWords = selectedWords.map(word => {
        if (Math.random() < 0.15) { // 15% chance of punctuation
          const punct = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
          return word + punct;
        }
        return word;
      });
    }

    // Add numbers if enabled
    if (settings.includeNumbers && settings.mode === 'words') {
      selectedWords = selectedWords.map(word => {
        if (Math.random() < 0.08) { // 8% chance of adding a number
          const num = Math.floor(Math.random() * 1000);
          return Math.random() < 0.5 ? `${word}${num}` : `${num}${word}`;
        }
        return word;
      });
    }

    return selectedWords.join(' ');
  }, [settings]);

  // Calculate current WPM and accuracy
  const calculateCurrentStats = useCallback(() => {
    if (!startTime || typedText.length === 0) return { wpm: 0, accuracy: 100 };
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    
    // Calculate WPM based on characters typed (standard: 5 characters = 1 word)
    const charactersTyped = typedText.length;
    const wordsTyped = charactersTyped / 5;
    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === generatedText[i]) {
        correctChars++;
      }
    }
    
    const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
    
    return { wpm: Math.max(0, wpm), accuracy: Math.max(0, Math.min(100, accuracy)) };
  }, [startTime, typedText, generatedText]);

  // Start the test
  const startTest = () => {
    const text = generateText();
    const testStartTime = Date.now();
    
    setGeneratedText(text);
    setTypedText('');
    setCurrentIndex(0);
    setErrors(0);
    setIsStarted(true);
    setIsFinished(false);
    setStartTime(testStartTime);
    setRealTimeStats([]);
    
    // Only start timer for duration-based tests
    if (settings.testType === 'duration') {
      setTimeLeft(settings.duration);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // For word count tests, no timer needed
      setTimeLeft(0);
    }

    // Start real-time stats tracking - reduced frequency for better performance
    statsIntervalRef.current = setInterval(() => {
      const timeElapsed = (Date.now() - testStartTime) / 1000 / 60; // in minutes
      const timeElapsedSeconds = Math.floor((Date.now() - testStartTime) / 1000);
      
      // Get current typed text length and calculate stats
      setRealTimeStats(prev => {
        const currentTypedLength = inputRef.current?.value?.length || 0;
        
        if (currentTypedLength === 0) {
          return [...prev, { wpm: 0, accuracy: 100, errors: 0, timestamp: timeElapsedSeconds }];
        }
        
        // Calculate WPM based on characters typed (standard: 5 characters = 1 word)
        const charactersTyped = currentTypedLength;
        const wordsTyped = charactersTyped / 5;
        const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        
        // Calculate accuracy based on current input - optimized with early exit
        const currentText = inputRef.current?.value || '';
        let correctChars = 0;
        let currentErrors = 0;
        
        for (let i = 0; i < currentText.length; i++) {
          if (currentText[i] === text[i]) {
            correctChars++;
          } else {
            currentErrors++;
          }
        }
        
        const accuracy = currentText.length > 0 ? Math.round((correctChars / currentText.length) * 100) : 100;
        
        return [...prev, {
          wpm: Math.max(0, wpm),
          accuracy: Math.max(0, Math.min(100, accuracy)),
          errors: currentErrors,
          timestamp: timeElapsedSeconds
        }];
      });
    }, 2000); // Reduced from 1000ms to 2000ms for better performance

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Finish the test
  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    // Calculate final stats using current input value directly
    const finalTypedText = inputRef.current?.value || typedText;
    const timeElapsed = startTime ? (Date.now() - startTime) / 1000 / 60 : 0; // in minutes
    
    if (finalTypedText.length > 0 && timeElapsed > 0) {
      // Calculate final WPM
      const charactersTyped = finalTypedText.length;
      const wordsTyped = charactersTyped / 5;
      const finalWPM = Math.round(wordsTyped / timeElapsed);
      
      // Calculate final accuracy
      let correctChars = 0;
      for (let i = 0; i < finalTypedText.length; i++) {
        if (finalTypedText[i] === generatedText[i]) {
          correctChars++;
        }
      }
      const finalAccuracy = Math.round((correctChars / finalTypedText.length) * 100);
      
      // Count final errors
      let finalErrors = 0;
      for (let i = 0; i < finalTypedText.length; i++) {
        if (finalTypedText[i] !== generatedText[i]) {
          finalErrors++;
        }
      }
      
      const newStats: TypingStats = {
        wpm: Math.max(0, finalWPM),
        accuracy: Math.max(0, Math.min(100, finalAccuracy)),
        errors: finalErrors,
        timestamp: Date.now()
      };

      setStatsHistory(prev => [...prev, newStats].slice(-20)); // Keep last 20 results
    }
    
    setIsFinished(true);
  }, [startTime, typedText, generatedText]);

  // Handle input change
  const handleInputChange = (value: string) => {
    if (!isStarted || isFinished) return;

    setTypedText(value);
    setErrors(calculateErrors(value));
    setCurrentIndex(value.length);

    // Check if finished based on test type
    if (settings.testType === 'wordCount') {
      // For word count tests, finish when target word count is reached
      const wordsTyped = value.trim().split(' ').filter(w => w.trim()).length;
      if (wordsTyped >= settings.wordCount) {
        finishTest();
      }
    } else {
      // For duration tests, finish when reaching end of generated text (though this should rarely happen with 1000 words)
      if (value.length >= generatedText.length) {
        finishTest();
      }
    }
  };

  // Reset test
  const resetTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    
    setIsStarted(false);
    setIsFinished(false);
    setTypedText('');
    setCurrentIndex(0);
    setErrors(0);
    setStartTime(null);
    setRealTimeStats([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    };
  }, []);

  const currentStats = calculateCurrentStats();

  // Memoized text display with responsive line-based scrolling
  const textDisplay = useMemo(() => {
    if (!generatedText) return null;
    
    // Calculate responsive characters per line based on container width
    // Estimate: ~10-11 characters per 100px width for monospace font at text-xl
    const estimatedContainerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 200, 1000) : 700;
    const charactersPerLine = Math.floor(estimatedContainerWidth / 10); // More conservative estimate
    
    const words = generatedText.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    // Build lines by adding words until we approach character limit
    for (const word of words) {
      // Check if adding this word would exceed the limit
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= charactersPerLine) {
        currentLine = testLine;
      } else {
        // Only push current line if it has content
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    
    // Add the last line if it has content
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Determine current line based on typed characters
    let charCount = 0;
    let currentLineIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineEndPosition = charCount + lines[i].length;
      if (currentIndex <= lineEndPosition) {
        currentLineIndex = i;
        break;
      }
      charCount += lines[i].length + 1; // +1 for space between lines
    }
    
    // Show 3 lines: current line and next 2 lines
    const visibleLines = lines.slice(currentLineIndex, currentLineIndex + 3);
    const startCharIndex = lines.slice(0, currentLineIndex).reduce((sum, line) => sum + line.length + 1, 0);
    
    return (
      <div className="space-y-3 w-full">
        {visibleLines.map((line, lineIdx) => {
          const lineStartIndex = startCharIndex + visibleLines.slice(0, lineIdx).reduce((sum, l) => sum + l.length + 1, 0);
          
          return (
            <div key={currentLineIndex + lineIdx} className={`
              w-full leading-relaxed break-words
              ${lineIdx === 0 ? 'text-xl font-normal' : lineIdx === 1 ? 'text-xl font-medium' : 'text-lg opacity-60'}
              transition-all duration-200 ease-in-out
            `}>
              {line.split('').map((char, charIdx) => {
                const actualIndex = lineStartIndex + charIdx;
                return (
                  <span
                    key={actualIndex}
                    className={
                      actualIndex < currentIndex
                        ? typedText[actualIndex] === char
                          ? 'text-green-600 bg-green-100 dark:bg-green-900 rounded-sm'
                          : 'text-red-600 bg-red-100 dark:bg-red-900 rounded-sm'
                        : actualIndex === currentIndex
                        ? 'bg-blue-200 dark:bg-blue-700 animate-pulse rounded-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }, [generatedText, currentIndex, typedText]);

  // Optimized error counting with early exit
  const calculateErrors = useCallback((value: string) => {
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== generatedText[i]) {
        errorCount++;
      }
    }
    return errorCount;
  }, [generatedText]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!isStarted ? (
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold mb-4">Test Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <select
                  value={settings.mode}
                  onChange={(e) => setSettings(prev => ({ ...prev, mode: e.target.value as 'words' | 'random' | 'numbers' }))}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="words">Common Words</option>
                  <option value="random">Random Letters</option>
                  <option value="numbers">Numbers</option>
                </select>
              </div>

              {/* Test Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Test Type</label>
                <select
                  value={settings.testType}
                  onChange={(e) => setSettings(prev => ({ ...prev, testType: e.target.value as 'duration' | 'wordCount' }))}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="duration">By Duration</option>
                  <option value="wordCount">By Word Count</option>
                </select>
              </div>

              {/* Duration Selection */}
              {settings.testType === 'duration' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                  <select
                    value={settings.duration}
                    onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) as 15 | 30 | 60 | 120 }))}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value={15}>15s</option>
                    <option value={30}>30s</option>
                    <option value={60}>60s</option>
                    <option value={120}>120s</option>
                  </select>
                </div>
              )}

              {/* Word Count Selection */}
              {settings.testType === 'wordCount' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Word Count</label>
                  <select
                    value={settings.wordCount}
                    onChange={(e) => setSettings(prev => ({ ...prev, wordCount: parseInt(e.target.value) as 25 | 50 | 100 | 200 }))}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value={25}>25 words</option>
                    <option value={50}>50 words</option>
                    <option value={100}>100 words</option>
                    <option value={200}>200 words</option>
                  </select>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Options</label>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.includePunctuation}
                      onChange={(e) => setSettings(prev => ({ ...prev, includePunctuation: e.target.checked }))}
                      disabled={settings.mode !== 'words'}
                    />
                    <span className="text-sm">Punctuation</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.includeNumbers}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                      disabled={settings.mode !== 'words'}
                    />
                    <span className="text-sm">Numbers</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to Test Your Typing Speed?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Type the generated text as quickly and accurately as possible. 
              The test will automatically end when time runs out or you complete all the text.
            </p>
            <button
              onClick={startTest}
              className={`${styles.button.primary} px-8 py-3 text-lg`}
            >
              Start Typing Test
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Test Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {settings.testType === 'duration' ? (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {settings.mode} • {settings.duration}s
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((typedText.split(' ').filter(w => w.trim()).length / settings.wordCount) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {settings.mode} • {typedText.split(' ').filter(w => w.trim()).length}/{settings.wordCount} words
                  </div>
                </>
              )}
            </div>
            <button
              onClick={resetTest}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Text Display */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg leading-relaxed font-mono relative">
            <div className="min-h-32">
              {textDisplay}
            </div>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={typedText}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isFinished}
            className="w-full p-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            placeholder="Start typing here..."
          />

          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentStats.wpm}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">WPM</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentStats.accuracy}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {errors}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Errors</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currentIndex}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Characters</div>
            </div>
          </div>

          {/* Real-time Performance Graph */}
          {realTimeStats.length > 1 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 dark:text-white">Live Performance</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={realTimeStats.map((stat, _) => ({ 
                  second: stat.timestamp,
                  wpm: stat.wpm, 
                  accuracy: stat.accuracy 
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="second" 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Seconds', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'WPM / Accuracy %', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'wpm' ? 'WPM' : 'Accuracy %']}
                    labelFormatter={(label) => `${label}s`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wpm" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={false}
                    name="WPM"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={false}
                    name="Accuracy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {isFinished && (
            <div className="text-center space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                  Test Complete!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Final Speed: {currentStats.wpm} WPM with {currentStats.accuracy}% accuracy
                </p>
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={resetTest}
                  className={`${styles.button.primary} px-6 py-2`}
                >
                  Try Again
                </button>
                <button
                  onClick={() => setIsStarted(false)}
                  className={`${styles.button.secondary} px-6 py-2`}
                >
                  Change Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics History */}
      {statsHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Performance History</h3>
          
          {/* History Graph */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 dark:text-white">Performance History</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={statsHistory.map((stat, index) => ({ 
                test: index + 1, 
                wpm: stat.wpm, 
                accuracy: stat.accuracy,
                errors: stat.errors
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="test" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Test Number', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'WPM / Accuracy %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'wpm') return [value, 'WPM'];
                    if (name === 'accuracy') return [value, 'Accuracy %'];
                    if (name === 'errors') return [value, 'Errors'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Test ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="wpm" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="wpm"
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="accuracy"
                />
                <Line 
                  type="monotone" 
                  dataKey="errors" 
                  stroke="#EF4444" 
                  strokeWidth={2} 
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                  strokeDasharray="5 5"
                  name="errors"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span>WPM</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span>Accuracy %</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-red-500 border-dashed"></div>
                <span>Errors</span>
              </div>
            </div>
          </div>

          {/* Recent Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsHistory.slice(-6).reverse().map((stat, statIndex) => (
              <div key={statIndex} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{stat.wpm} WPM</span>
                  <span className="text-sm text-gray-500">
                    {new Date(stat.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Accuracy: {stat.accuracy}% • Errors: {stat.errors}
                </div>
              </div>
            ))}
          </div>

          {/* Overall Stats */}
          {statsHistory.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.max(...statsHistory.map(s => s.wpm))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Best WPM</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(statsHistory.reduce((sum, s) => sum + s.wpm, 0) / statsHistory.length)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Average WPM</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(statsHistory.reduce((sum, s) => sum + s.accuracy, 0) / statsHistory.length)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Average Accuracy</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {statsHistory.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Tests Completed</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
