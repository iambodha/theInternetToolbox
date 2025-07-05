'use client';

import { useState, useCallback } from 'react';
import { styles } from '@/lib/styles';
import { useTheme } from '@/contexts/ThemeContext';

type GameState = 'start' | 'playing' | 'correct' | 'incorrect' | 'gameOver';

interface ColorResult {
  level: number;
  baseColor: string;
  targetColor: string;
  correct: boolean;
  reactionTime: number;
  colorDifference: number;
  timestamp: Date;
}

interface ColorGridProps {
  gridSize: number;
  baseColor: string;
  targetColor: string;
  targetPosition: number;
  onColorClick: (position: number) => void;
  isClickable: boolean;
}

function ColorGrid({ gridSize, baseColor, targetColor, targetPosition, onColorClick, isClickable }: ColorGridProps) {
  const totalCells = gridSize * gridSize;
  
  return (
    <div 
      className="inline-block p-4 rounded-lg border-2 border-gray-300"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '2px',
        backgroundColor: '#f5f5f5'
      }}
    >
      {Array.from({ length: totalCells }, (_, index) => (
        <button
          key={index}
          onClick={() => isClickable && onColorClick(index)}
          className={`aspect-square transition-all duration-200 ${
            isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
          }`}
          style={{
            backgroundColor: index === targetPosition ? targetColor : baseColor,
            width: '50px',
            height: '50px',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '4px'
          }}
        />
      ))}
    </div>
  );
}

export default function ColorStrength() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<ColorResult[]>([]);
  const [bestLevel, setBestLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [startTime, setStartTime] = useState<number>(0);
  
  // Current game state
  const [baseColor, setBaseColor] = useState('');
  const [targetColor, setTargetColor] = useState('');
  const [targetPosition, setTargetPosition] = useState(0);
  const [gridSize, setGridSize] = useState(3);

  // Generate a random color in HSL format
  const generateRandomColor = useCallback(() => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
    const lightness = Math.floor(Math.random() * 40) + 30; // 30-70%
    return { hue, saturation, lightness };
  }, []);

  // Convert HSL to CSS string
  const hslToString = useCallback((hue: number, saturation: number, lightness: number) => {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }, []);

  // Calculate color difference (simplified)
  const calculateColorDifference = useCallback((color1: string, color2: string) => {
    // Extract HSL values from strings and calculate difference
    const hsl1 = color1.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const hsl2 = color2.match(/\d+/g)?.map(Number) || [0, 0, 0];
    
    const hueDiff = Math.abs(hsl1[0] - hsl2[0]);
    const satDiff = Math.abs(hsl1[1] - hsl2[1]);
    const lightDiff = Math.abs(hsl1[2] - hsl2[2]);
    
    return Math.sqrt(hueDiff * hueDiff + satDiff * satDiff + lightDiff * lightDiff);
  }, []);

  // Generate level configuration
  const getLevelConfig = useCallback((level: number) => {
    // Grid size increases every 5 levels
    const gridSize = Math.min(6, 3 + Math.floor(level / 5));
    
    // Color difference decreases as level increases (gets harder)
    const maxDifference = Math.max(5, 50 - (level * 2));
    const minDifference = Math.max(1, 20 - level);
    
    return { gridSize, maxDifference, minDifference };
  }, []);

  // Generate new colors for the current level
  const generateLevelColors = useCallback(() => {
    const config = getLevelConfig(currentLevel);
    const baseColorHSL = generateRandomColor();
    const baseColorString = hslToString(baseColorHSL.hue, baseColorHSL.saturation, baseColorHSL.lightness);
    
    // Generate target color with appropriate difference
    const difference = Math.random() * (config.maxDifference - config.minDifference) + config.minDifference;
    
    // Vary hue, saturation, or lightness
    const variationType = Math.random();
    let targetHue = baseColorHSL.hue;
    let targetSaturation = baseColorHSL.saturation;
    let targetLightness = baseColorHSL.lightness;
    
    if (variationType < 0.4) {
      // Vary hue
      targetHue = (baseColorHSL.hue + (Math.random() > 0.5 ? difference : -difference) + 360) % 360;
    } else if (variationType < 0.7) {
      // Vary saturation
      targetSaturation = Math.max(0, Math.min(100, baseColorHSL.saturation + (Math.random() > 0.5 ? difference : -difference)));
    } else {
      // Vary lightness
      targetLightness = Math.max(0, Math.min(100, baseColorHSL.lightness + (Math.random() > 0.5 ? difference : -difference)));
    }
    
    const targetColorString = hslToString(targetHue, targetSaturation, targetLightness);
    
    return {
      baseColor: baseColorString,
      targetColor: targetColorString,
      gridSize: config.gridSize,
      actualDifference: calculateColorDifference(baseColorString, targetColorString)
    };
  }, [currentLevel, generateRandomColor, hslToString, getLevelConfig, calculateColorDifference]);

  // Start a new level
  const startLevel = useCallback(() => {
    const colors = generateLevelColors();
    setBaseColor(colors.baseColor);
    setTargetColor(colors.targetColor);
    setGridSize(colors.gridSize);
    setTargetPosition(Math.floor(Math.random() * (colors.gridSize * colors.gridSize)));
    setGameState('playing');
    setStartTime(Date.now());
  }, [generateLevelColors]);

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setCurrentLevel(1);
    setScore(0);
    setResults([]);
    setLives(3);
    startLevel();
  };

  // Handle color click
  const handleColorClick = useCallback((position: number) => {
    if (gameState !== 'playing') return;
    
    const reactionTime = Date.now() - startTime;
    const isCorrect = position === targetPosition;
    
    const result: ColorResult = {
      level: currentLevel,
      baseColor,
      targetColor,
      correct: isCorrect,
      reactionTime,
      colorDifference: calculateColorDifference(baseColor, targetColor),
      timestamp: new Date()
    };
    
    setResults(prev => [...prev, result]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setGameState('correct');
      
      // Update best level
      if (currentLevel > bestLevel) {
        setBestLevel(currentLevel);
      }
      
      // Advance to next level after delay
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        startLevel();
      }, 1500);
    } else {
      setGameState('incorrect');
      setLives(prev => prev - 1);
      
      if (lives <= 1) {
        // Game over
        setTimeout(() => {
          setGameState('gameOver');
        }, 2000);
      } else {
        // Continue with same level after delay
        setTimeout(() => {
          startLevel();
        }, 2000);
      }
    }
  }, [gameState, startTime, targetPosition, currentLevel, baseColor, targetColor, calculateColorDifference, bestLevel, lives, startLevel]);

  // Reset game
  const resetGame = () => {
    setGameState('start');
    setCurrentLevel(1);
    setScore(0);
    setResults([]);
    setLives(3);
    setBaseColor('');
    setTargetColor('');
    setTargetPosition(0);
    setGridSize(3);
  };

  // Get performance rating
  const getPerformanceRating = (level: number): { rating: string; color: string } => {
    if (level >= 25) return { rating: 'Superhuman', color: isDark ? 'text-purple-400' : 'text-purple-600' };
    if (level >= 20) return { rating: 'Exceptional', color: isDark ? 'text-indigo-400' : 'text-indigo-600' };
    if (level >= 15) return { rating: 'Excellent', color: isDark ? 'text-green-400' : 'text-green-600' };
    if (level >= 12) return { rating: 'Very Good', color: isDark ? 'text-blue-400' : 'text-blue-600' };
    if (level >= 8) return { rating: 'Good', color: isDark ? 'text-teal-400' : 'text-teal-600' };
    if (level >= 5) return { rating: 'Average', color: isDark ? 'text-yellow-400' : 'text-yellow-600' };
    if (level >= 2) return { rating: 'Below Average', color: isDark ? 'text-orange-400' : 'text-orange-600' };
    return { rating: 'Poor', color: isDark ? 'text-red-400' : 'text-red-600' };
  };

  const getPercentile = (level: number): number => {
    if (level >= 25) return 99;
    if (level >= 20) return 95;
    if (level >= 15) return 90;
    if (level >= 12) return 75;
    if (level >= 8) return 50;
    if (level >= 5) return 25;
    if (level >= 2) return 10;
    return 5;
  };

  return (
    <div className="space-y-8">
      {/* Game Area */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          {gameState === 'start' && (
            <div className={`text-center border rounded-lg p-12 ${
              isDark 
                ? 'bg-gradient-to-br from-purple-950/20 to-blue-950/20 border-purple-800' 
                : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
            }`}>
              <div className="text-6xl mb-6">🎨</div>
              <h2 className={`text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Color Strength Test</h2>
              <p className={`text-lg mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Find the odd color out! Test your color discrimination by identifying 
                the one square that&apos;s slightly different from the others.
              </p>
              <div className={`text-sm mb-6 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                • Grid size increases every 5 levels<br/>
                • Colors get more similar as you progress<br/>
                • You have 3 lives to reach your best score
              </div>
              <button
                onClick={startGame}
                className={`${styles.button.primary} px-8 py-4 text-lg`}
              >
                Start Color Test
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-6">
              {/* Level info */}
              <div className="text-center">
                <div className={`text-sm mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Level {currentLevel} • {gridSize}×{gridSize} Grid
                </div>
                <div className="flex justify-center space-x-4 mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    Score: {score}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    Lives: {lives}
                  </div>
                </div>
              </div>

              {/* Color grid */}
              <div className="flex justify-center">
                <ColorGrid
                  gridSize={gridSize}
                  baseColor={baseColor}
                  targetColor={targetColor}
                  targetPosition={targetPosition}
                  onColorClick={handleColorClick}
                  isClickable={true}
                />
              </div>

              <div className={`text-center ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Click on the square that looks different from the others
              </div>
            </div>
          )}

          {gameState === 'correct' && (
            <div className={`text-center border rounded-lg p-12 ${
              isDark 
                ? 'bg-green-950/20 border-green-800' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="text-6xl mb-4">✅</div>
              <h2 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>Correct!</h2>
              <p className={`text-lg mb-4 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Great eye! You found the different color.
              </p>
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Advancing to level {currentLevel + 1}...
              </div>
            </div>
          )}

          {gameState === 'incorrect' && (
            <div className={`text-center border rounded-lg p-12 ${
              isDark 
                ? 'bg-red-950/20 border-red-800' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="text-6xl mb-4">❌</div>
              <h2 className={`text-3xl font-bold mb-4 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>Incorrect</h2>
              <p className={`text-lg mb-4 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                The different color was in position {targetPosition + 1}
              </p>
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {lives > 1 ? `${lives - 1} lives remaining...` : 'Game Over...'}
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className={`text-center border rounded-lg p-12 ${
              isDark 
                ? 'bg-purple-950/20 border-purple-800' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="text-6xl mb-4">🎯</div>
              <h2 className={`text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Game Over</h2>
              <div className={`text-4xl font-bold mb-2 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Level {currentLevel - 1}
              </div>
              <div className={`text-xl mb-2 ${getPerformanceRating(currentLevel - 1).color}`}>
                {getPerformanceRating(currentLevel - 1).rating}
              </div>
              <p className={`text-lg mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Better than {getPercentile(currentLevel - 1)}% of people
              </p>
              <button
                onClick={resetGame}
                className={`${styles.button.primary} px-6 py-3`}
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
          <div className={`rounded-lg p-6 text-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {bestLevel}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Best Level</div>
          </div>
          
          <div className={`rounded-lg p-6 text-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {results.filter(r => r.correct).length}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Colors Found</div>
          </div>
          
          <div className={`rounded-lg p-6 text-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              {results.length > 0 ? Math.round((results.filter(r => r.correct).length / results.length) * 100) : 0}%
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Accuracy</div>
          </div>
        </div>
      )}

      {/* Recent Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Recent Attempts</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.slice(-10).reverse().map((result, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                result.correct 
                  ? isDark 
                    ? 'bg-green-950/20 border border-green-800' 
                    : 'bg-green-50 border border-green-200'
                  : isDark 
                    ? 'bg-red-950/20 border border-red-800' 
                    : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: result.baseColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: result.targetColor }}
                    />
                  </div>
                  <span className={`font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Level {result.level}</span>
                  <span className={`text-sm ${
                    result.correct 
                      ? isDark ? 'text-green-400' : 'text-green-600'
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {result.correct ? '✅ Found' : '❌ Missed'}
                  </span>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {result.reactionTime}ms
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
              <li>• Look at the grid of colored squares</li>
              <li>• One square is slightly different from the others</li>
              <li>• Click on the square that looks different</li>
              <li>• Colors become more similar as levels increase</li>
              <li>• Grid size increases every 5 levels</li>
              <li>• You have 3 lives - game ends when you run out</li>
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
        }`}>Performance Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>Superhuman:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>25+ levels</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>Exceptional:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>20-24 levels</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-green-400' : 'text-green-600'}>Excellent:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>15-19 levels</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>Very Good:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>12-14 levels</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDark ? 'text-teal-400' : 'text-teal-600'}>Good:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>8-11 levels</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>Average:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>5-7 levels</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>Below Average:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>2&#8211;4 levels</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-red-400' : 'text-red-600'}>Poor:</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>1 level</span>
            </div>
          </div>
        </div>
        <div className={`mt-4 text-xs ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p>Color discrimination varies greatly between individuals. Some people can detect incredibly subtle differences!</p>
        </div>
      </div>
    </div>
  );
}