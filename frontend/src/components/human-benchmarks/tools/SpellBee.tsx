'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { styles } from '@/lib/styles';
import { useTheme } from '@/contexts/ThemeContext';

interface SpellResult {
  word: string;
  userSpelling: string;
  correct: boolean;
  timestamp: Date;
  difficulty: string;
}

interface SpellBeeSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  speechSpeed: 'slow' | 'normal' | 'fast';
  autoAdvance: boolean;
  hints: boolean;
}

type GameState = 'start' | 'playing' | 'finished';

// Word lists organized by difficulty
const wordLists = {
  easy: [
    'cat', 'dog', 'run', 'sun', 'fun', 'big', 'red', 'hot', 'top', 'box',
    'cup', 'pen', 'bat', 'hat', 'map', 'bag', 'leg', 'egg', 'bus', 'mud',
    'rug', 'hug', 'pig', 'dig', 'bug', 'jug', 'web', 'bed', 'net', 'jet'
  ],
  medium: [
    'apple', 'table', 'happy', 'simple', 'people', 'middle', 'little', 'bottle',
    'gentle', 'circle', 'purple', 'double', 'trouble', 'single', 'jungle',
    'orange', 'change', 'bridge', 'flower', 'window', 'kitchen', 'chicken',
    'between', 'picture', 'machine', 'science', 'special', 'because', 'through',
    'another'
  ],
  hard: [
    'beautiful', 'necessary', 'chocolate', 'different', 'important', 'hospital',
    'telephone', 'elephant', 'musician', 'fantastic', 'celebrate', 'adventure',
    'wonderful', 'dangerous', 'breakfast', 'Christmas', 'afternoon', 'yesterday',
    'remember', 'together', 'favorite', 'surprise', 'lightning', 'champion',
    'keyboard', 'sandwich', 'language', 'exercise', 'question', 'daughter'
  ],
  expert: [
    'extraordinary', 'pronunciation', 'Mediterranean', 'encyclopedia', 'pharmaceutical',
    'Massachusetts', 'entrepreneur', 'bureaucracy', 'kaleidoscope', 'conscientious',
    'chrysanthemum', 'psychologist', 'lieutenant', 'hemorrhage', 'rhythm',
    'vacuum', 'receive', 'ceiling', 'definitely', 'separate', 'necessary',
    'occurrence', 'privilege', 'accommodate', 'conscience', 'miniature',
    'maintenance', 'acquaintance', 'guarantee', 'embarrass'
  ]
};

export default function SpellBee() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [gameState, setGameState] = useState<GameState>('start');
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [results, setResults] = useState<SpellResult[]>([]);
  const [settings, setSettings] = useState<SpellBeeSettings>({
    difficulty: 'medium',
    speechSpeed: 'normal',
    autoAdvance: true,
    hints: true
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Get speech rate based on settings
  const getSpeechRate = () => {
    switch (settings.speechSpeed) {
      case 'slow': return 0.7;
      case 'fast': return 1.3;
      default: return 1.0;
    }
  };

  // Speak the word using TTS
  const speakWord = useCallback((word: string, repeat: boolean = false) => {
    if (!synthRef.current) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = getSpeechRate();
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to use a clear, neutral voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      if (repeat) {
        setTimeout(() => speakWord(word), 500);
      }
    };

    synthRef.current.speak(utterance);
  }, [settings.speechSpeed]);

  // Generate a new word from the current difficulty level
  const generateNewWord = useCallback(() => {
    const wordList = wordLists[settings.difficulty];
    const availableWords = wordList.filter(word => !usedWords.has(word));
    
    if (availableWords.length === 0) {
      // All words used, reset the used words set
      setUsedWords(new Set());
      return wordList[Math.floor(Math.random() * wordList.length)];
    }
    
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  }, [settings.difficulty, usedWords]);

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTotalWords(0);
    setResults([]);
    setShowResult(null);
    setUsedWords(new Set());
    
    const newWord = generateNewWord();
    setCurrentWord(newWord);
    setUserInput('');
    
    // Speak the first word after a short delay
    setTimeout(() => {
      speakWord(newWord);
    }, 500);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);
  };

  // Submit the spelling
  const submitSpelling = useCallback(() => {
    if (!userInput.trim() || gameState !== 'playing') return;

    const isCorrect = userInput.toLowerCase().trim() === currentWord.toLowerCase();
    const newResult: SpellResult = {
      word: currentWord,
      userSpelling: userInput.trim(),
      correct: isCorrect,
      timestamp: new Date(),
      difficulty: settings.difficulty
    };

    setResults(prev => [...prev, newResult]);
    setTotalWords(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setUsedWords(prev => new Set([...prev, currentWord]));
    }

    setShowResult(isCorrect);

    // Auto-advance or wait for user action
    if (settings.autoAdvance) {
      setTimeout(() => {
        nextWord();
      }, 2000);
    }
  }, [userInput, currentWord, gameState, settings.autoAdvance, settings.difficulty]);

  // Move to next word
  const nextWord = () => {
    if (totalWords >= 20) {
      // End game after 20 words
      setGameState('finished');
      if (score > bestScore) {
        setBestScore(score);
      }
      return;
    }

    const newWord = generateNewWord();
    setCurrentWord(newWord);
    setUserInput('');
    setShowResult(null);
    
    setTimeout(() => {
      speakWord(newWord);
    }, 300);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 800);
  };

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState === 'playing') {
      if (showResult !== null) {
        nextWord();
      } else {
        submitSpelling();
      }
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState('start');
    setCurrentWord('');
    setUserInput('');
    setScore(0);
    setTotalWords(0);
    setResults([]);
    setShowResult(null);
    setUsedWords(new Set());
    
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return isDark ? 'text-green-400' : 'text-green-600';
      case 'medium': return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'hard': return isDark ? 'text-orange-400' : 'text-orange-600';
      case 'expert': return isDark ? 'text-red-400' : 'text-red-600';
      default: return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  // Calculate accuracy
  const accuracy = totalWords > 0 ? Math.round((score / totalWords) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {gameState === 'start' && (
        <div className="space-y-6">
          {/* Settings */}
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Spell Bee Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Difficulty Level</label>
                <select
                  value={settings.difficulty}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    difficulty: e.target.value as 'easy' | 'medium' | 'hard' | 'expert' 
                  }))}
                  className={`w-full p-3 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="easy">Easy (3-4 letters)</option>
                  <option value="medium">Medium (5-8 letters)</option>
                  <option value="hard">Hard (9-12 letters)</option>
                  <option value="expert">Expert (challenging words)</option>
                </select>
              </div>

              {/* Speech Speed */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Speech Speed</label>
                <select
                  value={settings.speechSpeed}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    speechSpeed: e.target.value as 'slow' | 'normal' | 'fast' 
                  }))}
                  className={`w-full p-3 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>

            {/* Options */}
            <div className="mt-4 space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoAdvance}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))}
                  className={`${
                    isDark ? 'text-blue-500' : 'text-blue-600'
                  } focus:ring-blue-500`}
                />
                <span className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Auto-advance after correct spelling</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.hints}
                  onChange={(e) => setSettings(prev => ({ ...prev, hints: e.target.checked }))}
                  className={`${
                    isDark ? 'text-blue-500' : 'text-blue-600'
                  } focus:ring-blue-500`}
                />
                <span className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Show word length hints</span>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className={`p-6 rounded-lg border text-center ${
            isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="text-4xl mb-4">🐝</div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-blue-200' : 'text-blue-900'
            }`}>Spell Bee Challenge</h3>
            <p className={`mb-4 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Listen to the pronunciation and spell the word correctly. You'll face 20 words total.
              Use the "Repeat" button to hear the word again if needed.
            </p>
            <button
              onClick={startGame}
              className={`${styles.button.primary} px-8 py-3 text-lg`}
            >
              Start Spell Bee
            </button>
          </div>

          {bestScore > 0 && (
            <div className={`p-4 rounded-lg border text-center ${
              isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Best Score: {bestScore}/20
              </div>
              <div className={`text-sm ${
                isDark ? 'text-purple-300' : 'text-purple-700'
              }`}>
                ({Math.round((bestScore / 20) * 100)}% accuracy)
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          {/* Progress and Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg text-center border ${
              isDark 
                ? 'bg-blue-900/20 border-blue-800 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              <div className="text-2xl font-bold">{totalWords + 1}/20</div>
              <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Progress</div>
            </div>
            <div className={`p-4 rounded-lg text-center border ${
              isDark 
                ? 'bg-green-900/20 border-green-800 text-green-400' 
                : 'bg-green-50 border-green-200 text-green-600'
            }`}>
              <div className="text-2xl font-bold">{score}</div>
              <div className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>Correct</div>
            </div>
            <div className={`p-4 rounded-lg text-center border ${
              isDark 
                ? 'bg-purple-900/20 border-purple-800 text-purple-400' 
                : 'bg-purple-50 border-purple-200 text-purple-600'
            }`}>
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Accuracy</div>
            </div>
          </div>

          {/* Difficulty indicator */}
          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              getDifficultyColor(settings.difficulty)
            } ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              {settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)} Level
            </span>
          </div>

          {/* Audio controls */}
          <div className={`p-8 rounded-lg border text-center ${
            isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="text-6xl mb-4">🔊</div>
            <div className="space-y-4">
              <button
                onClick={() => speakWord(currentWord)}
                disabled={isPlaying}
                className={`${styles.button.primary} px-6 py-3 text-lg ${
                  isPlaying ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isPlaying ? 'Playing...' : 'Repeat Word'}
              </button>
              
              {settings.hints && (
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Word length: {currentWord.length} letters
                </p>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your spelling here..."
              disabled={showResult !== null}
              className={`w-full p-4 text-xl text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } ${
                showResult === true ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                showResult === false ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
              }`}
            />

            {/* Result feedback */}
            {showResult !== null && (
              <div className={`p-4 rounded-lg text-center ${
                showResult 
                  ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                  : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              } border`}>
                <div className={`text-lg font-semibold ${
                  showResult 
                    ? isDark ? 'text-green-200' : 'text-green-800'
                    : isDark ? 'text-red-200' : 'text-red-800'
                }`}>
                  {showResult ? '✅ Correct!' : '❌ Incorrect'}
                </div>
                {!showResult && (
                  <div className={`text-sm mt-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    The correct spelling is: <strong>{currentWord}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-center space-x-4">
              {showResult === null ? (
                <button
                  onClick={submitSpelling}
                  disabled={!userInput.trim()}
                  className={`${styles.button.primary} px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Submit Spelling
                </button>
              ) : (
                <button
                  onClick={nextWord}
                  className={`${styles.button.primary} px-6 py-2`}
                >
                  Next Word
                </button>
              )}
              <button
                onClick={resetGame}
                className={`${styles.button.secondary} px-6 py-2`}
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="space-y-6">
          {/* Final Results */}
          <div className={`p-6 rounded-lg border text-center ${
            isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className={`text-2xl font-semibold mb-2 ${
              isDark ? 'text-blue-200' : 'text-blue-900'
            }`}>Spell Bee Complete!</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-green-400' : 'text-green-700'
                }`}>{score}/20</div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Words Spelled Correctly
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>{accuracy}%</div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Accuracy
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-lg font-bold ${getDifficultyColor(settings.difficulty)}`}>
                  {settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Difficulty Level
                </div>
              </div>
            </div>

            {/* Performance message */}
            <div className={`mt-6 p-4 rounded-lg ${
              accuracy >= 80 
                ? isDark ? 'bg-green-900/20' : 'bg-green-50'
                : accuracy >= 60
                ? isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
                : isDark ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <p className={`font-semibold ${
                accuracy >= 80 
                  ? isDark ? 'text-green-200' : 'text-green-800'
                  : accuracy >= 60
                  ? isDark ? 'text-yellow-200' : 'text-yellow-800'
                  : isDark ? 'text-red-200' : 'text-red-800'
              }`}>
                {accuracy >= 80 
                  ? '🐝 Excellent spelling! You\'re a spelling bee champion!'
                  : accuracy >= 60
                  ? '📚 Good work! Keep practicing to improve your spelling.'
                  : '💪 Don\'t give up! Spelling takes practice - try an easier level.'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetGame}
              className={`${styles.button.primary} px-6 py-2`}
            >
              Try Again
            </button>
            <button
              onClick={() => setGameState('start')}
              className={`${styles.button.secondary} px-6 py-2`}
            >
              Change Settings
            </button>
          </div>

          {/* Recent Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h4 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Recent Words</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {results.slice(-10).map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    result.correct 
                      ? isDark 
                        ? 'bg-green-900/20 border-green-800' 
                        : 'bg-green-50 border-green-200'
                      : isDark 
                        ? 'bg-red-900/20 border-red-800' 
                        : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {result.word}
                      </span>
                      <span className={`text-sm ${
                        result.correct 
                          ? isDark ? 'text-green-400' : 'text-green-600'
                          : isDark ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {result.correct ? '✓' : '✗'}
                      </span>
                    </div>
                    {!result.correct && (
                      <div className={`text-sm mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Your spelling: {result.userSpelling}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions and Tips */}
      <div className={`border rounded-lg p-6 ${
        isDark 
          ? 'bg-blue-950/20 border-blue-800' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`text-xl ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>💡</div>
          <div>
            <h4 className={`font-medium mb-2 ${
              isDark ? 'text-blue-200' : 'text-blue-900'
            }`}>How to Play</h4>
            <ul className={`text-sm space-y-1 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <li>• Listen to the word pronunciation using text-to-speech</li>
              <li>• Type the correct spelling in the input field</li>
              <li>• Use the "Repeat Word" button to hear it again</li>
              <li>• Press Enter or click Submit to check your answer</li>
              <li>• Complete 20 words to finish the challenge</li>
              <li>• Choose difficulty levels from easy 3-letter words to expert vocabulary</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
