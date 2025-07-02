'use client';

import { useState } from 'react';
import { styles } from '@/lib/styles';
import { useTheme } from '@/contexts/ThemeContext';

// Different test modes
const testModes = {
  arrows: {
    name: 'Arrows',
    symbols: ['↑', '↓', '←', '→'],
    options: ['Up', 'Down', 'Left', 'Right'],
    description: 'Classic arrow direction test'
  },
  letters: {
    name: 'Letters',
    symbols: ['E', 'F', 'P', 'T'],
    options: ['E', 'F', 'P', 'T'],
    description: 'Traditional eye chart letters'
  },
  tumbling: {
    name: 'Tumbling E',
    symbols: ['E', 'Ǝ', 'M', 'W'],
    options: ['Right', 'Left', 'Down', 'Up'],
    description: 'Rotated E test (standard optometry)'
  },
  numbers: {
    name: 'Numbers',
    symbols: ['6', '9', '2', '5'],
    options: ['6', '9', '2', '5'],
    description: 'Number recognition test'
  },
  shapes: {
    name: 'Shapes',
    symbols: ['○', '□', '△', '◇'],
    options: ['Circle', 'Square', 'Triangle', 'Diamond'],
    description: 'Geometric shape recognition'
  },
  landolt: {
    name: 'Landolt C',
    symbols: ['⊃', '⊂', '∪', '∩'],
    options: ['Right', 'Left', 'Down', 'Up'],
    description: 'Landolt C gap detection'
  }
};

export default function VisualAcuity() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [currentMode, setCurrentMode] = useState<keyof typeof testModes>('arrows');
  const [currentSize, setCurrentSize] = useState(60);
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'testing' | 'finished'>('start');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [smallestSize, setSmallestSize] = useState(60);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const generateNewSymbol = () => {
    setCurrentSymbolIndex(Math.floor(Math.random() * testModes[currentMode].symbols.length));
  };

  const startTest = () => {
    setGameState('testing');
    setScore(0);
    setAttempts(0);
    setCorrectAnswers(0);
    setCurrentSize(60);
    setSmallestSize(60);
    setConsecutiveCorrect(0);
    generateNewSymbol();
  };

  const calculateSizeReduction = (size: number, consecutive: number) => {
    // Dynamic reduction based on current size and consecutive correct answers
    if (size > 30) {
      // Large sizes: reduce by 3-5px
      return Math.max(3, 5 - Math.floor(consecutive / 3));
    } else if (size > 15) {
      // Medium sizes: reduce by 1-2px
      return Math.max(1, 2 - Math.floor(consecutive / 5));
    } else if (size > 8) {
      // Small sizes: reduce by 0.5-1px
      return consecutive % 2 === 0 ? 1 : 0.5;
    } else if (size > 4) {
      // Very small sizes: reduce by 0.25-0.5px
      return consecutive % 3 === 0 ? 0.5 : 0.25;
    } else {
      // Extremely small sizes: reduce by 0.1-0.25px
      return consecutive % 4 === 0 ? 0.25 : 0.1;
    }
  };

  const handleOptionClick = (selectedIndex: number) => {
    if (gameState !== 'testing') return;

    const isCorrect = selectedIndex === currentSymbolIndex;
    setAttempts(attempts + 1);

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setScore(score + 1);
      setConsecutiveCorrect(consecutiveCorrect + 1);
      
      // Calculate dynamic size reduction
      const reduction = calculateSizeReduction(currentSize, consecutiveCorrect);
      const newSize = Math.max(1, currentSize - reduction);
      setCurrentSize(newSize);
      setSmallestSize(Math.min(smallestSize, newSize));
      
      generateNewSymbol();
    } else {
      // End test on wrong answer
      setGameState('finished');
      return;
    }

    // End test after 30 attempts or if symbol gets impossibly small
    if (attempts >= 29 || currentSize <= 1) {
      setGameState('finished');
    }
  };

  const calculateVisualAcuity = () => {
    // More accurate visual acuity calculation based on Snellen chart principles
    if (smallestSize >= 16) {
      return "20/40+";
    } else if (smallestSize >= 12) {
      return "20/30";
    } else if (smallestSize >= 8) {
      return "20/20";
    } else if (smallestSize >= 6) {
      return "20/15";
    } else if (smallestSize >= 4) {
      return "20/10";
    } else if (smallestSize >= 2) {
      return "20/5";
    } else {
      return "20/2.5";
    }
  };

  const getVisualAcuityDescription = () => {
    if (smallestSize >= 16) return "Below average";
    if (smallestSize >= 12) return "Average";
    if (smallestSize >= 8) return "Good";
    if (smallestSize >= 6) return "Very good";
    if (smallestSize >= 4) return "Excellent";
    if (smallestSize >= 2) return "Exceptional";
    return "Superhuman";
  };

  const reset = () => {
    setGameState('start');
    setScore(0);
    setAttempts(0);
    setCorrectAnswers(0);
    setCurrentSize(60);
    setSmallestSize(60);
    setConsecutiveCorrect(0);
  };

  const currentModeData = testModes[currentMode];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {gameState === 'start' && (
        <div className="text-center space-y-6">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Enhanced Visual Acuity Test</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose a test mode and see how small you can go! The symbols will get progressively smaller as you succeed. 
              The test ends when you make a mistake or reach the limits of human vision.
            </p>
            
            {/* Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {Object.entries(testModes).map(([key, mode]) => (
                <button
                  key={key}
                  onClick={() => setCurrentMode(key as keyof typeof testModes)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    currentMode === key
                      ? isDark 
                        ? 'border-blue-400 bg-blue-900/30 text-blue-100' 
                        : 'border-blue-500 bg-blue-50 text-blue-900'
                      : isDark
                        ? 'border-gray-600 bg-gray-700/50 text-gray-100 hover:border-gray-500'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-2xl font-bold">
                      {mode.symbols[0]}
                    </span>
                    <span className="font-semibold">{mode.name}</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {mode.description}
                  </p>
                </button>
              ))}
            </div>
            
            <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                <strong>Selected:</strong> {currentModeData.name} - {currentModeData.description}
              </p>
            </div>
          </div>
          
          <button
            onClick={startTest}
            className={`${styles.button.primary} px-8 py-3 text-lg`}
          >
            Start {currentModeData.name} Test
          </button>
        </div>
      )}

      {gameState === 'testing' && (
        <div className="space-y-8">
          {/* Current Mode Display */}
          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isDark ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}>
              {currentModeData.name} Mode
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg text-center border ${
              isDark 
                ? 'bg-blue-900/20 border-blue-800/50 text-blue-400' 
                : 'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              <div className="text-xl font-bold">
                {score}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Correct</div>
            </div>
            <div className={`p-3 rounded-lg text-center border ${
              isDark 
                ? 'bg-green-900/20 border-green-800/50 text-green-400' 
                : 'bg-green-50 border-green-100 text-green-700'
            }`}>
              <div className="text-xl font-bold">
                {currentSize.toFixed(1)}px
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Size</div>
            </div>
            <div className={`p-3 rounded-lg text-center border ${
              isDark 
                ? 'bg-purple-900/20 border-purple-800/50 text-purple-400' 
                : 'bg-purple-50 border-purple-100 text-purple-700'
            }`}>
              <div className="text-xl font-bold">
                {attempts + 1}/30
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Attempt</div>
            </div>
            <div className={`p-3 rounded-lg text-center border ${
              isDark 
                ? 'bg-orange-900/20 border-orange-800/50 text-orange-400' 
                : 'bg-orange-50 border-orange-100 text-orange-700'
            }`}>
              <div className="text-xl font-bold">
                {consecutiveCorrect}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Streak</div>
            </div>
          </div>

          {/* Symbol display */}
          <div className={`p-12 rounded-lg border-2 relative shadow-sm ${
            isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-center items-center min-h-[300px]">
              <span 
                className={`font-bold select-none transition-all duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                style={{ 
                  fontSize: `${currentSize}px`,
                  lineHeight: 1,
                  fontFamily: currentMode === 'letters' || currentMode === 'numbers' ? 'serif' : 'monospace'
                }}
              >
                {currentModeData.symbols[currentSymbolIndex]}
              </span>
            </div>
            {currentSize < 10 && (
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs border ${
                isDark 
                  ? 'bg-yellow-900/30 text-yellow-200 border-yellow-700/50' 
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              }`}>
                Extreme mode: {currentSize.toFixed(1)}px
              </div>
            )}
          </div>

          {/* Option buttons */}
          <div className="grid grid-cols-2 gap-4">
            {currentModeData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                className={`${styles.button.secondary} p-4 text-lg flex items-center justify-center space-x-2 hover:scale-105 transition-transform`}
              >
                {/* Only show symbol if it's different from the option text */}
                {currentModeData.symbols[index] !== option && (
                  <span className="text-xl">{currentModeData.symbols[index]}</span>
                )}
                <span>{option}</span>
              </button>
            ))}
          </div>

          <div className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {currentSize < 5 ? 
              "🔍 Incredible! You&#39;re in superhuman territory!" :
              currentSize < 10 ? 
              "⭐ Amazing visual acuity!" :
              `Identify the ${currentModeData.name.toLowerCase()} symbol above`
            }
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center space-y-6">
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-100'
          }`}>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-blue-200' : 'text-blue-900'
            }`}>
              {currentModeData.name} Test Complete!
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Mode: {currentModeData.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-4">
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  {correctAnswers}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Correct Answers</div>
              </div>
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-green-400' : 'text-green-700'
                }`}>
                  {smallestSize.toFixed(1)}px
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Smallest Size</div>
              </div>
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-purple-400' : 'text-purple-700'
                }`}>
                  {calculateVisualAcuity()}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Visual Acuity</div>
              </div>
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-orange-400' : 'text-orange-700'
                }`}>
                  {getVisualAcuityDescription()}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Rating</div>
              </div>
            </div>
            
            {smallestSize < 5 && (
              <div className={`p-4 rounded-lg mt-4 border ${
                isDark 
                  ? 'bg-yellow-900/20 border-yellow-700/50' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`font-semibold ${
                  isDark ? 'text-yellow-200' : 'text-yellow-800'
                }`}>
                  🏆 Exceptional Performance!
                </p>
                <p className={`text-sm mt-1 ${
                  isDark ? 'text-yellow-300' : 'text-yellow-700'
                }`}>
                  You&#39;ve achieved superhuman visual acuity with {currentModeData.name}. This is extremely rare!
                </p>
              </div>
            )}
          </div>
          
          <div className="space-x-4">
            <button
              onClick={reset}
              className={`${styles.button.primary} px-6 py-2`}
            >
              Try Again
            </button>
            <button
              onClick={() => {
                reset();
                // Cycle to next mode for variety
                const modes = Object.keys(testModes);
                const currentIndex = modes.indexOf(currentMode);
                const nextMode = modes[(currentIndex + 1) % modes.length] as keyof typeof testModes;
                setCurrentMode(nextMode);
              }}
              className={`${styles.button.secondary} px-6 py-2`}
            >
              Try Different Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
