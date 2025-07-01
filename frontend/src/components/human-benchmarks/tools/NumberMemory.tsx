'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type GameState = 'start' | 'memorize' | 'input' | 'correct' | 'incorrect' | 'gameOver';

interface MemoryResult {
  level: number;
  sequence: string;
  userInput: string;
  correct: boolean;
  timestamp: Date;
}

export default function NumberMemory() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sequence, setSequence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(3);
  const [bestLevel, setBestLevel] = useState<number>(0);
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [showingNumber, setShowingNumber] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate random number sequence
  const generateSequence = useCallback((length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }, []);

  // Calculate display time based on level (longer sequences get more time)
  const getDisplayTime = useCallback((level: number): number => {
    return Math.max(1, Math.floor(level / 2) + 1);
  }, []);

  // Start a new level
  const startLevel = useCallback((level: number) => {
    const newSequence = generateSequence(level);
    setSequence(newSequence);
    setUserInput('');
    setGameState('memorize');
    setShowingNumber(true);
    
    const displayTime = getDisplayTime(level);
    setTimeLeft(displayTime);
    
    // Countdown timer
    const countdown = () => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('input');
          setShowingNumber(false);
          // Focus input field after a brief delay
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    };
    
    timerRef.current = setInterval(countdown, 1000);
  }, [generateSequence, getDisplayTime]);

  // Start the game
  const startGame = () => {
    setCurrentLevel(1);
    setResults([]);
    startLevel(1);
  };

  // Submit answer
  const submitAnswer = useCallback(() => {
    if (userInput.trim() === '') return;
    
    const isCorrect = userInput === sequence;
    const newResult: MemoryResult = {
      level: currentLevel,
      sequence,
      userInput,
      correct: isCorrect,
      timestamp: new Date()
    };
    
    const newResults = [...results, newResult];
    setResults(newResults);
    
    if (isCorrect) {
      setGameState('correct');
      if (currentLevel > bestLevel) {
        setBestLevel(currentLevel);
      }
      
      // Advance to next level after a delay
      setTimeout(() => {
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);
        startLevel(nextLevel);
      }, 1500);
    } else {
      setGameState('incorrect');
      setTimeout(() => {
        setGameState('gameOver');
      }, 2000);
    }
  }, [userInput, sequence, currentLevel, results, bestLevel, startLevel]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setUserInput(value);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState === 'input') {
      submitAnswer();
    }
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Clear timer when game state changes
  useEffect(() => {
    if (gameState !== 'memorize' && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [gameState]);

  const getPerformanceRating = (level: number): { rating: string; color: string } => {
    if (level >= 15) return { rating: 'Superhuman', color: 'text-purple-600' };
    if (level >= 12) return { rating: 'Exceptional', color: 'text-indigo-600' };
    if (level >= 10) return { rating: 'Excellent', color: 'text-green-600' };
    if (level >= 8) return { rating: 'Very Good', color: 'text-blue-600' };
    if (level >= 6) return { rating: 'Good', color: 'text-teal-600' };
    if (level >= 4) return { rating: 'Average', color: 'text-yellow-600' };
    if (level >= 2) return { rating: 'Below Average', color: 'text-orange-600' };
    return { rating: 'Poor', color: 'text-red-600' };
  };

  const getPercentile = (level: number): number => {
    // Approximate percentiles based on typical number memory performance
    if (level >= 15) return 99;
    if (level >= 12) return 95;
    if (level >= 10) return 90;
    if (level >= 8) return 75;
    if (level >= 6) return 50;
    if (level >= 4) return 25;
    if (level >= 2) return 10;
    return 5;
  };

  return (
    <div className="space-y-8">
      {/* Game Area */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          {gameState === 'start' && (
            <div className="text-center bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-12">
              <div className="text-6xl mb-6">🧠</div>
              <h2 className="text-3xl font-bold mb-4">Number Memory Test</h2>
              <p className="text-lg text-foreground/70 mb-6">
                Memorize the number sequence and type it back. Each level adds one more digit.
              </p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Start Test
              </button>
            </div>
          )}

          {gameState === 'memorize' && (
            <div className="text-center bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-12">
              <div className="text-sm text-foreground/60 mb-2">Level {currentLevel}</div>
              <div className="text-6xl font-mono font-bold mb-6 tracking-wider">
                {showingNumber ? sequence : ''}
              </div>
              <div className="text-lg mb-4">
                Memorize this {currentLevel}-digit number
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {timeLeft}
              </div>
              <div className="text-sm text-foreground/60">
                seconds remaining
              </div>
            </div>
          )}

          {gameState === 'input' && (
            <div className="text-center bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-12">
              <div className="text-sm text-foreground/60 mb-2">Level {currentLevel}</div>
              <div className="text-2xl font-bold mb-6">
                Type the {currentLevel}-digit number
              </div>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter the number..."
                className="w-full max-w-md px-4 py-3 text-2xl font-mono text-center border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
                maxLength={currentLevel}
              />
              <div className="mt-6">
                <button
                  onClick={submitAnswer}
                  disabled={userInput.length !== currentLevel}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {gameState === 'correct' && (
            <div className="text-center bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Correct!</h2>
              <p className="text-lg mb-4">
                You remembered all {currentLevel} digits
              </p>
              <div className="text-2xl font-mono font-bold">
                {sequence}
              </div>
              <p className="text-sm text-foreground/60 mt-4">
                Advancing to level {currentLevel + 1}...
              </p>
            </div>
          )}

          {gameState === 'incorrect' && (
            <div className="text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-12">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">Incorrect</h2>
              <div className="space-y-2 text-lg">
                <div>
                  <span className="text-foreground/60">Correct: </span>
                  <span className="font-mono font-bold">{sequence}</span>
                </div>
                <div>
                  <span className="text-foreground/60">You entered: </span>
                  <span className="font-mono font-bold">{userInput}</span>
                </div>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="text-center bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-12">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold mb-4">Game Over</h2>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                Level {currentLevel - 1}
              </div>
              <div className={`text-xl mb-2 ${getPerformanceRating(currentLevel - 1).color}`}>
                {getPerformanceRating(currentLevel - 1).rating}
              </div>
              <p className="text-lg mb-6">
                Better than {getPercentile(currentLevel - 1)}% of people
              </p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {bestLevel > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-foreground/5 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {bestLevel}
            </div>
            <div className="text-sm text-foreground/60">Best Level</div>
          </div>
          
          <div className="bg-foreground/5 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {bestLevel}
            </div>
            <div className="text-sm text-foreground/60">Max Digits</div>
          </div>
          
          <div className="bg-foreground/5 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {results.filter(r => r.correct).length}
            </div>
            <div className="text-sm text-foreground/60">Levels Passed</div>
          </div>
        </div>
      )}

      {/* Recent Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Attempts</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.slice(-10).reverse().map((result, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                result.correct ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
              }`}>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold">Level {result.level}</span>
                  <span className={`text-sm ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {result.correct ? '✅ Passed' : '❌ Failed'}
                  </span>
                  <span className="font-mono text-sm">
                    {result.sequence}
                  </span>
                  {!result.correct && (
                    <span className="font-mono text-sm text-foreground/60">
                      → {result.userInput}
                    </span>
                  )}
                </div>
                <span className="text-sm text-foreground/60">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to Play</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• A number sequence will be displayed for a few seconds</li>
              <li>• Memorize the number as quickly as possible</li>
              <li>• Type the exact sequence back when prompted</li>
              <li>• Each level adds one more digit to remember</li>
              <li>• The game ends when you make a mistake</li>
              <li>• Longer sequences get slightly more viewing time</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Guide */}
      <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h4 className="font-medium mb-4">Performance Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-purple-600">Superhuman:</span>
              <span>15+ digits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-600">Exceptional:</span>
              <span>12-14 digits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Excellent:</span>
              <span>10-11 digits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Very Good:</span>
              <span>8-9 digits</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-teal-600">Good:</span>
              <span>6-7 digits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">Average:</span>
              <span>4-5 digits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">Below Average:</span>
              <span>2-3 digits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Poor:</span>
              <span>1 digit</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-foreground/60">
          <p>Most people can remember 7±2 digits. The world record is over 25 digits!</p>
        </div>
      </div>
    </div>
  );
}