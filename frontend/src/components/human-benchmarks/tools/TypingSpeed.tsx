'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { styles } from '@/lib/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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

    // Shuffle and select words
    const shuffled = words.sort(() => 0.5 - Math.random());
    let selectedWords = shuffled.slice(0, settings.wordCount);

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
    const wordsTyped = typedText.split(' ').length;
    const wpm = Math.round(wordsTyped / timeElapsed);
    
    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === generatedText[i]) {
        correctChars++;
      }
    }
    
    const accuracy = Math.round((correctChars / typedText.length) * 100);
    
    return { wpm: Math.max(0, wpm), accuracy: Math.max(0, accuracy) };
  }, [startTime, typedText, generatedText]);

  // Start the test
  const startTest = () => {
    const text = generateText();
    setGeneratedText(text);
    setTypedText('');
    setCurrentIndex(0);
    setErrors(0);
    setIsStarted(true);
    setIsFinished(false);
    setTimeLeft(settings.duration);
    setStartTime(Date.now());
    setRealTimeStats([]);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start real-time stats tracking
    statsIntervalRef.current = setInterval(() => {
      const stats = calculateCurrentStats();
      setRealTimeStats(prev => [...prev, {
        ...stats,
        errors,
        timestamp: Date.now()
      }]);
    }, 1000);

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

    const finalStats = calculateCurrentStats();
    const newStats: TypingStats = {
      ...finalStats,
      errors,
      timestamp: Date.now()
    };

    setStatsHistory(prev => [...prev, newStats].slice(-20)); // Keep last 20 results
    setIsFinished(true);
  }, [calculateCurrentStats, errors]);

  // Handle input change
  const handleInputChange = (value: string) => {
    if (!isStarted || isFinished) return;

    setTypedText(value);
    
    // Count errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== generatedText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);
    setCurrentIndex(value.length);

    // Check if finished by reaching end of text
    if (value.length >= generatedText.length) {
      finishTest();
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
                  onChange={(e) => setSettings(prev => ({ ...prev, mode: e.target.value as any }))}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="words">Common Words</option>
                  <option value="random">Random Letters</option>
                  <option value="numbers">Numbers</option>
                </select>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                <select
                  value={settings.duration}
                  onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) as any }))}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                  <option value={120}>120s</option>
                </select>
              </div>

              {/* Word Count */}
              <div>
                <label className="block text-sm font-medium mb-2">Word Count</label>
                <select
                  value={settings.wordCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, wordCount: parseInt(e.target.value) as any }))}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={25}>25 words</option>
                  <option value={50}>50 words</option>
                  <option value={100}>100 words</option>
                  <option value={200}>200 words</option>
                </select>
              </div>

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
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-500">
                {settings.mode} • {settings.duration}s
              </div>
            </div>
            <button
              onClick={resetTest}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Text Display */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-lg leading-relaxed font-mono relative">
            <div className="max-h-32 overflow-y-auto">
              {generatedText.split('').map((char, index) => (
                <span
                  key={index}
                  className={
                    index < currentIndex
                      ? typedText[index] === char
                        ? 'text-green-600 bg-green-100 dark:bg-green-900'
                        : 'text-red-600 bg-red-100 dark:bg-red-900'
                      : index === currentIndex
                      ? 'bg-blue-200 dark:bg-blue-700 animate-pulse'
                      : 'text-gray-500'
                  }
                >
                  {char}
                </span>
              ))}
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
              <h4 className="text-lg font-semibold mb-4">Live Performance</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={realTimeStats.map((stat, index) => ({ 
                  time: index + 1, 
                  wpm: stat.wpm, 
                  accuracy: stat.accuracy 
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="wpm" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} />
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
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={statsHistory.map((stat, index) => ({ 
                test: index + 1, 
                wpm: stat.wpm, 
                accuracy: stat.accuracy 
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="test" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="wpm" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="accuracy" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsHistory.slice(-6).reverse().map((stat, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
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
