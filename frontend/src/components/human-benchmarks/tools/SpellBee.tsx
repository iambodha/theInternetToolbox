'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { styles } from '@/lib/styles';
import { useTheme } from '@/contexts/ThemeContext';
import { generate } from 'random-words';

interface SpellResult {
  word: string;
  userSpelling: string;
  correct: boolean;
  timestamp: Date;
  difficulty: string;
}

interface GameHistory {
  id: string;
  date: Date;
  difficulty: string;
  totalWords: number;
  correctWords: number;
  accuracy: number;
  results: SpellResult[];
  duration: number; // in seconds
}

interface SpellBeeSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  speechSpeed: 'slow' | 'normal' | 'fast';
  autoAdvance: boolean;
  hints: boolean;
}

interface WordDefinition {
  word: string;
  definition?: string;
  difficulty: string;
  syllables?: number;
}

type GameState = 'start' | 'playing' | 'finished';

// Simple word lists organized by difficulty (backup only)
const fallbackWordLists = {
  easy: [
    'cat', 'dog', 'run', 'sun', 'fun', 'big', 'red', 'hot', 'top', 'box',
    'cup', 'pen', 'bat', 'hat', 'map', 'bag', 'leg', 'egg', 'bus', 'mud',
    'rug', 'hug', 'pig', 'dig', 'bug', 'jug', 'web', 'bed', 'net', 'jet',
    'car', 'far', 'jar', 'bar', 'tar', 'war', 'sit', 'hit', 'fit', 'pit',
    'win', 'sin', 'fin', 'bin', 'pin', 'tin', 'van', 'pan', 'can', 'man',
    'ten', 'hen', 'den', 'pen', 'men', 'set', 'wet', 'get', 'let', 'met'
  ],
  medium: [
    'apple', 'table', 'happy', 'simple', 'people', 'middle', 'little', 'bottle',
    'gentle', 'circle', 'purple', 'double', 'trouble', 'single', 'jungle',
    'orange', 'change', 'bridge', 'flower', 'window', 'kitchen', 'chicken',
    'between', 'picture', 'machine', 'science', 'special', 'because', 'through',
    'another', 'garden', 'market', 'banana', 'summer', 'winter', 'spring',
    'autumn', 'family', 'friend', 'school', 'office', 'camera', 'guitar',
    'forest', 'mountain', 'ocean', 'river', 'island', 'castle', 'temple'
  ],
  hard: [
    'beautiful', 'necessary', 'chocolate', 'different', 'important', 'hospital',
    'telephone', 'elephant', 'musician', 'fantastic', 'celebrate', 'adventure',
    'wonderful', 'dangerous', 'breakfast', 'Christmas', 'afternoon', 'yesterday',
    'remember', 'together', 'favorite', 'surprise', 'lightning', 'champion',
    'keyboard', 'sandwich', 'language', 'exercise', 'question', 'daughter',
    'knowledge', 'strength', 'business', 'building', 'mountain', 'vacation',
    'birthday', 'category', 'democracy', 'education', 'government', 'research',
    'technology', 'university', 'restaurant', 'apartment', 'environment'
  ],
  expert: [
    'extraordinary', 'pronunciation', 'Mediterranean', 'encyclopedia', 'pharmaceutical',
    'Massachusetts', 'entrepreneur', 'bureaucracy', 'kaleidoscope', 'conscientious',
    'chrysanthemum', 'psychologist', 'lieutenant', 'hemorrhage', 'rhythm',
    'vacuum', 'receive', 'ceiling', 'definitely', 'separate', 'necessary',
    'occurrence', 'privilege', 'accommodate', 'conscience', 'miniature',
    'maintenance', 'acquaintance', 'guarantee', 'embarrass', 'committee',
    'independence', 'responsibility', 'archaeological', 'antidisestablishmentarianism'
  ]
};

// Simple, fast word generator using random-words library
class WordGenerator {
  private static wordsCache: Map<string, string[]> = new Map();

  // Generate words based on difficulty
  static generateWords(difficulty: 'easy' | 'medium' | 'hard' | 'expert', count: number = 100): string[] {
    const cacheKey = `${difficulty}-${count}`;
    
    // Check cache first
    if (this.wordsCache.has(cacheKey)) {
      return this.wordsCache.get(cacheKey)!;
    }

    try {
      // Generate a large pool of random words
      const allWords = generate({ exactly: count * 3, maxLength: 20 }) as string[];
      
      // Filter by difficulty (word length)
      const { minLength, maxLength } = this.getDifficultyLengths(difficulty);
      const filteredWords = allWords
        .filter(word => 
          word.length >= minLength && 
          word.length <= maxLength &&
          /^[a-zA-Z]+$/.test(word) // Only alphabetic characters
        )
        .slice(0, count);

      // If we don't have enough words, supplement with fallback
      if (filteredWords.length < count) {
        const fallbackWords = [...fallbackWordLists[difficulty]];
        const shuffled = this.shuffleArray(fallbackWords);
        filteredWords.push(...shuffled.slice(0, count - filteredWords.length));
      }

      // Cache and return
      const finalWords = this.shuffleArray(filteredWords).slice(0, count);
      this.wordsCache.set(cacheKey, finalWords);
      return finalWords;
      
    } catch (error) {
      console.warn('Random words library failed, using fallback:', error);
      // Fallback to static word lists
      const fallbackWords = [...fallbackWordLists[difficulty]];
      return this.shuffleArray(fallbackWords).slice(0, count);
    }
  }

  // Get length constraints for each difficulty
  private static getDifficultyLengths(difficulty: string) {
    switch (difficulty) {
      case 'easy': return { minLength: 3, maxLength: 5 };
      case 'medium': return { minLength: 5, maxLength: 8 };
      case 'hard': return { minLength: 7, maxLength: 12 };
      case 'expert': return { minLength: 9, maxLength: 20 };
      default: return { minLength: 3, maxLength: 8 };
    }
  }

  // Simple shuffle function
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Clear cache
  static clearCache() {
    this.wordsCache.clear();
  }
}

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
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  // Enhanced TTS management
  const [ttsQueue, setTtsQueue] = useState<string[]>([]);
  const [isProcessingTTS, setIsProcessingTTS] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis and handle voice loading
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Handle voice loading - some browsers load voices asynchronously
      const loadVoices = () => {
        if (synthRef.current) {
          synthRef.current.getVoices(); // Trigger voice loading
        }
      };
      
      loadVoices();
      if (synthRef.current) {
        synthRef.current.addEventListener('voiceschanged', loadVoices);
      }
      
      return () => {
        if (synthRef.current) {
          synthRef.current.removeEventListener('voiceschanged', loadVoices);
        }
      };
    }
  }, []);

  // Load words when difficulty changes
  useEffect(() => {
    const loadWords = async () => {
      setIsLoadingWords(true);
      try {
        const words = await WordGenerator.generateWords(settings.difficulty, 100);
        setWordPool(words);
      } catch (error) {
        console.error('Failed to load words:', error);
        setWordPool(fallbackWordLists[settings.difficulty]);
      } finally {
        setIsLoadingWords(false);
      }
    };

    loadWords();
  }, [settings.difficulty]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('spell-bee-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((game: any) => ({
          ...game,
          date: new Date(game.date),
          results: game.results.map((result: any) => ({
            ...result,
            timestamp: new Date(result.timestamp)
          }))
        }));
        setGameHistory(parsedHistory);
        
        // Calculate best score from history
        const maxScore = Math.max(0, ...parsedHistory.map((game: GameHistory) => game.correctWords));
        setBestScore(maxScore);
      } catch (error) {
        console.error('Failed to load game history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (gameHistory.length > 0) {
      localStorage.setItem('spell-bee-history', JSON.stringify(gameHistory));
    }
  }, [gameHistory]);

  // Get speech rate based on settings
  const getSpeechRate = () => {
    switch (settings.speechSpeed) {
      case 'slow': return 0.7;
      case 'fast': return 1.3;
      default: return 1.0;
    }
  };

  // Enhanced speech clearing function
  const clearTTS = useCallback(() => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      // Clear any pending utterances
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onend = null;
        currentUtteranceRef.current.onerror = null;
        currentUtteranceRef.current = null;
      }
      
      setIsPlaying(false);
      setIsProcessingTTS(false);
      setTtsQueue([]);
    }
  }, []);

  // Enhanced speak function with better flow control
  const speakWord = useCallback((word: string, priority: boolean = false) => {
    if (!synthRef.current || !word) {
      console.warn('Speech synthesis not available or no word provided');
      return;
    }

    // Clear any existing speech first
    clearTTS();
    
    // Small delay to ensure clearing is complete
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(word.trim());
        
        // Configure speech parameters
        utterance.rate = getSpeechRate();
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';
        
        // Select best available voice
        const voices = synthRef.current!.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || 
           voice.name.includes('Microsoft') || 
           voice.name.includes('Samantha') ||
           voice.name.includes('Daniel'))
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Set up event handlers
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsProcessingTTS(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setIsProcessingTTS(false);
          currentUtteranceRef.current = null;
        };

        utterance.onerror = (event) => {
          console.warn('Speech synthesis error:', event.error);
          setIsPlaying(false);
          setIsProcessingTTS(false);
          currentUtteranceRef.current = null;
        };

        utterance.onpause = () => {
          setIsPlaying(false);
        };

        utterance.onresume = () => {
          setIsPlaying(true);
        };

        // Store reference to current utterance
        currentUtteranceRef.current = utterance;
        
        // Speak the word
        synthRef.current!.speak(utterance);
        
      } catch (error) {
        console.error('Error creating speech utterance:', error);
        setIsPlaying(false);
        setIsProcessingTTS(false);
      }
    }, 50); // Small delay to ensure cleanup is complete
    
  }, [getSpeechRate, clearTTS]);

  // Function to speak individual words from history with proper clearing
  const speakHistoryWord = useCallback((word: string) => {
    if (!synthRef.current || !word) return;
    
    // Use the enhanced speak function
    speakWord(word, true);
  }, [speakWord]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Generate a new word from the current word pool
  const generateNewWord = useCallback(() => {
    if (wordPool.length === 0) {
      return fallbackWordLists[settings.difficulty][0];
    }

    const availableWords = wordPool.filter(word => !usedWords.has(word));
    
    if (availableWords.length === 0) {
      // All words used, reset the used words set
      setUsedWords(new Set());
      return wordPool[Math.floor(Math.random() * wordPool.length)];
    }
    
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  }, [wordPool, usedWords, settings.difficulty]);

  // Start the game
  const startGame = async () => {
    // Clear any existing TTS first
    clearTTS();
    
    setGameState('playing');
    setScore(0);
    setTotalWords(0);
    setResults([]);
    setShowResult(null);
    setUsedWords(new Set());
    setGameStartTime(new Date());
    
    // Ensure we have words loaded
    if (wordPool.length === 0) {
      setIsLoadingWords(true);
      const words = await WordGenerator.generateWords(settings.difficulty, 100);
      setWordPool(words);
      setIsLoadingWords(false);
    }
    
    const newWord = generateNewWord();
    setCurrentWord(newWord);
    setUserInput('');
    
    // Speak the first word after a longer delay to ensure everything is ready
    setTimeout(() => {
      speakWord(newWord);
    }, 800);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1200);
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
    const newTotalWords = totalWords + 1;
    setTotalWords(newTotalWords);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setUsedWords(prev => new Set([...prev, currentWord]));
    }

    setShowResult(isCorrect);

    // Check if game should end after this word
    if (newTotalWords >= 20) {
      // Game is complete after this word
      setTimeout(() => {
        clearTTS();
        finishGame();
      }, settings.autoAdvance ? 2000 : 0);
      return;
    }

    // Continue to next word if game isn't complete
    if (settings.autoAdvance) {
      setTimeout(() => {
        nextWord();
      }, 2000);
    }
  }, [userInput, currentWord, gameState, settings.autoAdvance, settings.difficulty, totalWords]);

  // Move to next word
  const nextWord = () => {
    // Double-check if we should finish the game
    if (totalWords >= 20) {
      clearTTS();
      finishGame();
      return;
    }

    // Clear any ongoing speech
    clearTTS();

    const newWord = generateNewWord();
    setCurrentWord(newWord);
    setUserInput('');
    setShowResult(null);
    
    // Longer delay to ensure proper sequencing
    setTimeout(() => {
      speakWord(newWord);
    }, 500);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 900);
  };

  // New function to finish game and save history
  const finishGame = () => {
    const endTime = new Date();
    const duration = gameStartTime ? Math.floor((endTime.getTime() - gameStartTime.getTime()) / 1000) : 0;
    
    const newGameHistory: GameHistory = {
      id: `game-${Date.now()}`,
      date: endTime,
      difficulty: settings.difficulty,
      totalWords: 20,
      correctWords: score,
      accuracy: Math.round((score / 20) * 100),
      results: [...results],
      duration
    };

    setGameHistory(prev => [newGameHistory, ...prev].slice(0, 50)); // Keep last 50 games
    
    if (score > bestScore) {
      setBestScore(score);
    }
    
    setGameState('finished');
  };

  // Enhanced reset game function
  const resetGame = () => {
    // Clear TTS first
    clearTTS();
    
    setGameState('start');
    setCurrentWord('');
    setUserInput('');
    setScore(0);
    setTotalWords(0);
    setResults([]);
    setShowResult(null);
    setUsedWords(new Set());
  };

  // Clear all history
  const clearHistory = () => {
    setGameHistory([]);
    localStorage.removeItem('spell-bee-history');
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
                  disabled={isLoadingWords}
                >
                  <option value="easy">Easy (3-5 letters)</option>
                  <option value="medium">Medium (5-8 letters)</option>
                  <option value="hard">Hard (7-12 letters)</option>
                  <option value="expert">Expert (9+ letters)</option>
                </select>
                {isLoadingWords && (
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Loading words from dictionary...
                  </p>
                )}
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
            }`}>Enhanced Spell Bee Challenge</h3>
            <p className={`mb-4 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Listen to words from our extensive dictionary database and spell them correctly. 
              Words are dynamically loaded based on your chosen difficulty level.
            </p>
            <div className={`text-sm mb-4 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              <div className="flex items-center justify-center space-x-4">
                <span>📚 {wordPool.length} words loaded</span>
                <span>•</span>
                <span>🌐 Online dictionary integration</span>
                <span>•</span>
                <span>🎯 Difficulty-based selection</span>
              </div>
            </div>
            <button
              onClick={startGame}
              disabled={isLoadingWords}
              className={`${styles.button.primary} px-8 py-3 text-lg ${
                isLoadingWords ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoadingWords ? 'Loading Words...' : 'Start Enhanced Spell Bee'}
            </button>
          </div>

          {/* Best Score and History Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            {bestScore > 0 && (
              <div className={`flex-1 p-4 rounded-lg border text-center ${
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
            
            {gameHistory.length > 0 && (
              <div className="flex-1">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`w-full p-4 rounded-lg border text-center transition-colors ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="text-2xl font-bold mb-1">📚</div>
                  <div className="text-sm">
                    View Game History ({gameHistory.length} games)
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Game History Modal/Section */}
          {showHistory && gameHistory.length > 0 && (
            <div className={`p-6 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Game History</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={clearHistory}
                    className={`px-3 py-1 text-sm rounded border ${
                      isDark 
                        ? 'border-red-600 text-red-400 hover:bg-red-900/20' 
                        : 'border-red-300 text-red-600 hover:bg-red-50'
                    } transition-colors`}
                  >
                    Clear History
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className={`px-3 py-1 text-sm rounded border ${
                      isDark 
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    } transition-colors`}
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {gameHistory.map((game, index) => (
                  <div key={game.id} className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className={`text-lg font-bold ${getDifficultyColor(game.difficulty)}`}>
                          {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {game.date.toLocaleDateString()} at {game.date.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`text-lg font-semibold ${
                          game.accuracy >= 80 
                            ? isDark ? 'text-green-400' : 'text-green-600'
                            : game.accuracy >= 60
                            ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                            : isDark ? 'text-red-400' : 'text-red-600'
                        }`}>
                          {game.correctWords}/20 ({game.accuracy}%)
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {Math.floor(game.duration / 60)}:{(game.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Words breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {game.results.map((result, resultIndex) => (
                        <div key={resultIndex} className={`flex items-center justify-between p-2 rounded ${
                          result.correct 
                            ? isDark ? 'bg-green-900/20' : 'bg-green-50'
                            : isDark ? 'bg-red-900/20' : 'bg-red-50'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => speakHistoryWord(result.word)}
                              className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                              }`}
                              title="Pronounce word"
                            >
                              🔊
                            </button>
                            <span className="font-medium">{result.word}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!result.correct && (
                              <span className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                ({result.userSpelling})
                              </span>
                            )}
                            <span className={`font-bold ${
                              result.correct 
                                ? isDark ? 'text-green-400' : 'text-green-600'
                                : isDark ? 'text-red-400' : 'text-red-600'
                            }`}>
                              {result.correct ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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

          {/* Game History Toggle during gameplay */}
          {results.length > 0 && (
            <div className="text-center">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-4 py-2 rounded-lg border transition-colors text-sm ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {showHistory ? '🔼 Hide Progress' : '🔽 Show Progress'} ({results.length} words completed)
              </button>
            </div>
          )}

          {/* In-Game History Panel */}
          {showHistory && results.length > 0 && (
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Current Game Progress</h4>
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {score}/{results.length} correct ({Math.round((score / results.length) * 100)}%)
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm max-h-48 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className={`flex items-center justify-between p-2 rounded ${
                    result.correct 
                      ? isDark ? 'bg-green-900/20' : 'bg-green-50'
                      : isDark ? 'bg-red-900/20' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <button
                        onClick={() => speakHistoryWord(result.word)}
                        className={`p-1 rounded-full hover:bg-black/10 transition-colors flex-shrink-0 ${
                          isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title="Pronounce word"
                      >
                        🔊
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{result.word}</div>
                        {!result.correct && (
                          <div className={`text-xs truncate ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            You: {result.userSpelling}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`font-bold ml-2 flex-shrink-0 ${
                      result.correct 
                        ? isDark ? 'text-green-400' : 'text-green-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {result.correct ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Quick stats summary */}
              <div className={`mt-3 pt-3 border-t flex justify-center space-x-6 text-xs ${
                isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
              }`}>
                <span>Correct: {score}</span>
                <span>Wrong: {results.length - score}</span>
                <span>Remaining: {20 - totalWords}</span>
              </div>
            </div>
          )}

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
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => speakWord(currentWord)}
                  disabled={isPlaying}
                  className={`${styles.button.primary} px-6 py-3 text-lg ${
                    isPlaying ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isPlaying ? 'Playing...' : 'Repeat Word'}
                </button>
                <button
                  onClick={() => speakWord(currentWord)}
                  disabled={isPlaying}
                  className={`p-3 rounded-full border-2 transition-colors ${
                    isPlaying 
                      ? 'opacity-50 cursor-not-allowed'
                      : isDark 
                        ? 'border-blue-600 text-blue-400 hover:bg-blue-900/20' 
                        : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                  }`}
                  title="Pronounce word"
                >
                  <span className="text-xl">🔊</span>
                </button>
              </div>
              
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

          {/* Enhanced Recent Results with pronunciation */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h4 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>This Game's Words</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {results.map((result, index) => (
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => speakHistoryWord(result.word)}
                          className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                            isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title="Pronounce word"
                        >
                          🔊
                        </button>
                        <span className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {result.word}
                        </span>
                      </div>
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
                        Your spelling: <span className="font-medium">{result.userSpelling}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Instructions */}
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
            }`}>Enhanced Features</h4>
            <ul className={`text-sm space-y-1 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <li>• 🌐 <strong>Dynamic Word Loading:</strong> Words fetched from online dictionaries</li>
              <li>• 📚 <strong>Extensive Database:</strong> Thousands of words across all difficulty levels</li>
              <li>• 🎯 <strong>Smart Difficulty:</strong> Words selected based on length and complexity</li>
              <li>• 🔄 <strong>Automatic Fallback:</strong> Offline mode with curated word lists</li>
              <li>• 🎧 <strong>Clear Pronunciation:</strong> High-quality text-to-speech</li>
              <li>• 📊 <strong>Performance Tracking:</strong> Detailed statistics and progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
