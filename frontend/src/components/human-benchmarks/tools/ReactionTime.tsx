'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type GameState = 'waiting' | 'ready' | 'go' | 'clicked' | 'tooEarly';

interface ReactionResult {
  time: number;
  timestamp: Date;
}

export default function ReactionTime() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [results, setResults] = useState<ReactionResult[]>([]);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [averageTime, setAverageTime] = useState<number | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickStartTimeRef = useRef<number>(0);

  const calculateStats = useCallback((newResults: ReactionResult[]) => {
    if (newResults.length === 0) return;
    
    const times = newResults.map(r => r.time);
    const best = Math.min(...times);
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    setBestTime(best);
    setAverageTime(Math.round(average));
  }, []);

  const startTest = useCallback(() => {
    if (gameState === 'waiting') {
      setGameState('ready');
      clickStartTimeRef.current = Date.now();
      
      // Random delay between 2-5 seconds
      const delay = Math.random() * 3000 + 2000;
      timeoutRef.current = setTimeout(() => {
        startTimeRef.current = performance.now();
        setGameState('go');
      }, delay);
    }
  }, [gameState]);

  const handleClick = useCallback(() => {
    const clickTime = performance.now();
    
    if (gameState === 'ready') {
      // Clicked too early
      setGameState('tooEarly');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else if (gameState === 'go') {
      // Valid reaction
      const reactionTimeMs = Math.round(clickTime - startTimeRef.current);
      setReactionTime(reactionTimeMs);
      setGameState('clicked');
      
      const newResult = {
        time: reactionTimeMs,
        timestamp: new Date()
      };
      
      const newResults = [...results, newResult];
      setResults(newResults);
      calculateStats(newResults);
    }
  }, [gameState, results, calculateStats]);

  const resetTest = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setGameState('waiting');
    setReactionTime(null);
  }, []);

  const clearResults = () => {
    setResults([]);
    setBestTime(null);
    setAverageTime(null);
    resetTest();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        if (gameState === 'waiting' || gameState === 'tooEarly' || gameState === 'clicked') {
          startTest();
        } else {
          handleClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startTest, handleClick]);

  const getPercentile = (time: number): number => {
    // Approximate percentiles based on typical reaction time data
    if (time < 200) return 99;
    if (time < 220) return 95;
    if (time < 250) return 90;
    if (time < 280) return 75;
    if (time < 320) return 50;
    if (time < 380) return 25;
    if (time < 450) return 10;
    return 5;
  };

  const getPerformanceRating = (time: number): { rating: string; color: string } => {
    if (time < 200) return { rating: 'Exceptional', color: isDark ? 'text-purple-400' : 'text-purple-600' };
    if (time < 250) return { rating: 'Excellent', color: isDark ? 'text-green-400' : 'text-green-600' };
    if (time < 300) return { rating: 'Good', color: isDark ? 'text-blue-400' : 'text-blue-600' };
    if (time < 350) return { rating: 'Average', color: isDark ? 'text-yellow-400' : 'text-yellow-600' };
    if (time < 400) return { rating: 'Below Average', color: isDark ? 'text-orange-400' : 'text-orange-600' };
    return { rating: 'Slow', color: isDark ? 'text-red-400' : 'text-red-600' };
  };

  return (
    <div className="space-y-8">
      {/* Game Area */}
      <div className="flex justify-center">
        <div 
          className={`relative w-full max-w-2xl h-96 rounded-lg cursor-pointer select-none transition-all duration-300 ${
            gameState === 'waiting' 
              ? 'bg-red-500 hover:bg-red-400' 
              : gameState === 'ready'
              ? 'bg-red-600'
              : gameState === 'go'
              ? 'bg-green-500'
              : gameState === 'tooEarly'
              ? 'bg-orange-500'
              : 'bg-blue-500'
          }`}
          onClick={gameState === 'waiting' || gameState === 'tooEarly' || gameState === 'clicked' ? startTest : handleClick}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white">
            {gameState === 'waiting' && (
              <div className="text-center">
                <div className="text-6xl mb-4">👆</div>
                <h2 className="text-3xl font-bold mb-2">Click to Start</h2>
                <p className="text-xl">Wait for the green screen, then click as fast as you can!</p>
                <p className="text-sm mt-4 opacity-80">You can also use SPACE or ENTER</p>
              </div>
            )}
            
            {gameState === 'ready' && (
              <div className="text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-3xl font-bold mb-2">Wait for Green...</h2>
                <p className="text-xl">Don&apos;t click yet!</p>
              </div>
            )}
            
            {gameState === 'go' && (
              <div className="text-center">
                <div className="text-6xl mb-4">⚡</div>
                <h2 className="text-4xl font-bold">CLICK NOW!</h2>
              </div>
            )}
            
            {gameState === 'tooEarly' && (
              <div className="text-center">
                <div className="text-6xl mb-4">😅</div>
                <h2 className="text-3xl font-bold mb-2">Too Early!</h2>
                <p className="text-xl mb-4">You clicked before the screen turned green</p>
                <button 
                  onClick={resetTest}
                  className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {gameState === 'clicked' && reactionTime && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-4xl font-bold mb-4">{reactionTime} ms</h2>
                <div className={`text-xl mb-2 ${getPerformanceRating(reactionTime).color}`}>
                  {getPerformanceRating(reactionTime).rating}
                </div>
                <p className="text-lg mb-4">
                  Better than {getPercentile(reactionTime)}% of people
                </p>
                <button 
                  onClick={resetTest}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-lg p-6 text-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              {bestTime} ms
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Best Time</div>
          </div>
          
          <div className={`rounded-lg p-6 text-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {averageTime} ms
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Average Time</div>
          </div>
          
          <div className={`rounded-lg p-6 text-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {results.length}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Attempts</div>
          </div>
        </div>
      )}

      {/* Results History */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Recent Results</h3>
            <button
              onClick={clearResults}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Clear Results
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.slice(-10).reverse().map((result, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-4">
                  <span className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{result.time} ms</span>
                  <span className={`text-sm ${getPerformanceRating(result.time).color}`}>
                    {getPerformanceRating(result.time).rating}
                  </span>
                </div>
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className={`border rounded-lg p-6 ${
        isDark 
          ? 'bg-blue-950/20 border-blue-800' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`text-xl ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>ℹ️</div>
          <div>
            <h4 className={`font-medium mb-2 ${
              isDark ? 'text-blue-200' : 'text-blue-900'
            }`}>How to Play</h4>
            <ul className={`text-sm space-y-1 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <li>• Click the red area to start the test</li>
              <li>• Wait for the screen to turn green</li>
              <li>• Click as quickly as possible when you see green</li>
              <li>• Don&apos;t click too early or you&apos;ll have to restart</li>
              <li>• You can use your mouse, spacebar, or Enter key</li>
              <li>• Take multiple attempts to improve your average</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Guide */}
      <div className={`border rounded-lg p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h4 className={`font-medium mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Reaction Time Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>Exceptional:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>&lt; 200ms</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-green-400' : 'text-green-600'}>Excellent:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>200-250ms</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>Good:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>250-300ms</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>Average:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>300-350ms</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>Below Average:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>350-400ms</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-red-400' : 'text-red-600'}>Slow:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>&gt; 400ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}