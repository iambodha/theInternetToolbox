'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { styles } from '@/lib/styles';
import { useTheme } from '@/contexts/ThemeContext';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  createdAt: number;
}

interface Shot {
  id: number;
  hit: boolean;
  reactionTime: number;
  accuracy: number; // Distance from center in pixels
  timestamp: number;
}

interface TestSettings {
  duration: 30 | 60 | 120;
  targetSize: 'small' | 'medium' | 'large';
  targetSpeed: 'slow' | 'medium' | 'fast';
  mode: 'classic' | 'precision' | 'speed';
}

export default function AimTrainer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [targetId, setTargetId] = useState(0);
  const [settings, setSettings] = useState<TestSettings>({
    duration: 30,
    targetSize: 'medium',
    targetSpeed: 'medium',
    mode: 'classic'
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get target size in pixels
  const getTargetSize = () => {
    switch (settings.targetSize) {
      case 'small': return 40;
      case 'medium': return 60;
      case 'large': return 80;
      default: return 60;
    }
  };

  // Get target spawn delay
  const getTargetDelay = () => {
    switch (settings.targetSpeed) {
      case 'slow': return 2000;
      case 'medium': return 1500;
      case 'fast': return 1000;
      default: return 1500;
    }
  };

  // Generate random target position
  const generateTarget = useCallback(() => {
    if (!gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const size = getTargetSize();
    const margin = size / 2 + 10; // Ensure target doesn't go off-screen

    const x = Math.random() * (rect.width - size * 2) + margin;
    const y = Math.random() * (rect.height - size * 2) + margin;

    const newTarget: Target = {
      id: targetId,
      x,
      y,
      size,
      createdAt: Date.now()
    };

    setCurrentTarget(newTarget);
    setTargetId(prev => prev + 1);

    // Auto-remove target after a timeout (miss)
    targetTimeoutRef.current = setTimeout(() => {
      if (currentTarget?.id === newTarget.id) {
        const missedShot: Shot = {
          id: newTarget.id,
          hit: false,
          reactionTime: 0,
          accuracy: 0,
          timestamp: Date.now()
        };
        setShots(prev => [...prev, missedShot]);
        setCurrentTarget(null);
        scheduleNextTarget();
      }
    }, getTargetDelay() * 2); // Target disappears after 2x spawn delay
  }, [targetId, currentTarget, settings]);

  // Schedule next target
  const scheduleNextTarget = useCallback(() => {
    if (gameState !== 'playing') return;

    const delay = getTargetDelay();
    setTimeout(() => {
      if (gameState === 'playing') {
        generateTarget();
      }
    }, delay);
  }, [gameState, generateTarget, settings]);

  // Handle target click
  const handleTargetClick = (event: React.MouseEvent, target: Target) => {
    event.stopPropagation();
    
    const reactionTime = Date.now() - target.createdAt;
    
    // Calculate accuracy (distance from center)
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clickX = event.clientX;
    const clickY = event.clientY;
    const accuracy = Math.sqrt(
      Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
    );

    const hitShot: Shot = {
      id: target.id,
      hit: true,
      reactionTime,
      accuracy,
      timestamp: Date.now()
    };

    setShots(prev => [...prev, hitShot]);
    setScore(prev => prev + 1);
    setCurrentTarget(null);

    // Clear the timeout since target was hit
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }

    scheduleNextTarget();
  };

  // Handle miss click (clicking on background)
  const handleMissClick = () => {
    if (!currentTarget) return;

    const missShot: Shot = {
      id: Date.now(),
      hit: false,
      reactionTime: 0,
      accuracy: 0,
      timestamp: Date.now()
    };

    setShots(prev => [...prev, missShot]);
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    setTimeLeft(settings.duration);
    setScore(0);
    setShots([]);
    setCurrentTarget(null);
    setTargetId(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Generate first target after a short delay
    setTimeout(() => {
      generateTarget();
    }, 1000);
  };

  // Finish game
  const finishGame = () => {
    setGameState('finished');
    setCurrentTarget(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState('start');
    setCurrentTarget(null);
    setShots([]);
    setScore(0);
    setTimeLeft(settings.duration);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }
  };

  // Calculate statistics
  const stats = {
    totalShots: shots.length,
    hits: shots.filter(s => s.hit).length,
    misses: shots.filter(s => !s.hit).length,
    accuracy: shots.length > 0 ? Math.round((shots.filter(s => s.hit).length / shots.length) * 100) : 0,
    avgReactionTime: shots.filter(s => s.hit).length > 0 
      ? Math.round(shots.filter(s => s.hit).reduce((sum, s) => sum + s.reactionTime, 0) / shots.filter(s => s.hit).length)
      : 0,
    avgPrecision: shots.filter(s => s.hit).length > 0
      ? Math.round(shots.filter(s => s.hit).reduce((sum, s) => sum + s.accuracy, 0) / shots.filter(s => s.hit).length)
      : 0
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {gameState === 'start' && (
        <div className="space-y-6">
          {/* Settings */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Game Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Duration */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Duration
                </label>
                <select
                  value={settings.duration}
                  onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) as 30 | 60 | 120 }))}
                  className={`w-full p-2 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={120}>2 minutes</option>
                </select>
              </div>

              {/* Target Size */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Target Size
                </label>
                <select
                  value={settings.targetSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, targetSize: e.target.value as 'small' | 'medium' | 'large' }))}
                  className={`w-full p-2 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="small">Small (40px)</option>
                  <option value="medium">Medium (60px)</option>
                  <option value="large">Large (80px)</option>
                </select>
              </div>

              {/* Target Speed */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Target Speed
                </label>
                <select
                  value={settings.targetSpeed}
                  onChange={(e) => setSettings(prev => ({ ...prev, targetSpeed: e.target.value as 'slow' | 'medium' | 'fast' }))}
                  className={`w-full p-2 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="slow">Slow (2s)</option>
                  <option value="medium">Medium (1.5s)</option>
                  <option value="fast">Fast (1s)</option>
                </select>
              </div>

              {/* Mode */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mode
                </label>
                <select
                  value={settings.mode}
                  onChange={(e) => setSettings(prev => ({ ...prev, mode: e.target.value as 'classic' | 'precision' | 'speed' }))}
                  className={`w-full p-2 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="classic">Classic</option>
                  <option value="precision">Precision</option>
                  <option value="speed">Speed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>
              🎯 Aim Trainer
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Click on the targets as quickly and accurately as possible. Targets will appear randomly 
              and disappear if not clicked in time. Your goal is to achieve the highest accuracy and 
              fastest reaction time possible.
            </p>
            <button
              onClick={startGame}
              className={`${styles.button.primary} px-8 py-3 text-lg`}
            >
              Start Aim Training
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg text-center border ${
              isDark 
                ? 'bg-blue-900/20 border-blue-800/50 text-blue-400' 
                : 'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              <div className="text-xl font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Time</div>
            </div>
            <div className={`p-3 rounded-lg text-center border ${
              isDark 
                ? 'bg-green-900/20 border-green-800/50 text-green-400' 
                : 'bg-green-50 border-green-100 text-green-700'
            }`}>
              <div className="text-xl font-bold">{score}</div>
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Hits</div>
            </div>
            <div className={`p-3 rounded-lg text-center border ${
              isDark 
                ? 'bg-purple-900/20 border-purple-800/50 text-purple-400' 
                : 'bg-purple-50 border-purple-100 text-purple-700'
            }`}>
              <div className="text-xl font-bold">{stats.accuracy}%</div>
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Accuracy</div>
            </div>
            <div className={`p-3 rounded-lg text-center border ${
              isDark 
                ? 'bg-orange-900/20 border-orange-800/50 text-orange-400' 
                : 'bg-orange-50 border-orange-100 text-orange-700'
            }`}>
              <div className="text-xl font-bold">{stats.avgReactionTime}ms</div>
              <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Avg Time</div>
            </div>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            onClick={handleMissClick}
            className={`relative w-full h-96 rounded-lg border-2 cursor-crosshair ${
              isDark 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-gray-50 border-gray-300'
            }`}
            style={{ minHeight: '400px' }}
          >
            {currentTarget && (
              <button
                onClick={(e) => handleTargetClick(e, currentTarget)}
                className={`absolute rounded-full transition-all duration-200 hover:scale-110 ${
                  isDark 
                    ? 'bg-red-500 hover:bg-red-400 border-2 border-red-400' 
                    : 'bg-red-500 hover:bg-red-400 border-2 border-red-600'
                }`}
                style={{
                  left: currentTarget.x,
                  top: currentTarget.y,
                  width: currentTarget.size,
                  height: currentTarget.size,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
            
            {/* Crosshair in center when no target */}
            {!currentTarget && (
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`}>
                ✛
              </div>
            )}
          </div>

          <div className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Click the red targets as quickly as possible!
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center space-y-6">
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-100'
          }`}>
            <h3 className={`text-xl font-semibold mb-4 ${
              isDark ? 'text-blue-200' : 'text-blue-900'
            }`}>
              🎯 Aim Training Complete!
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-6">
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-green-400' : 'text-green-700'
                }`}>
                  {stats.hits}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Targets Hit</div>
              </div>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  {stats.accuracy}%
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Accuracy</div>
              </div>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-purple-400' : 'text-purple-700'
                }`}>
                  {stats.avgReactionTime}ms
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Avg Reaction</div>
              </div>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-orange-400' : 'text-orange-700'
                }`}>
                  {stats.avgPrecision}px
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Avg Precision</div>
              </div>
            </div>

            {/* Performance rating */}
            <div className={`p-4 rounded-lg mb-4 ${
              stats.accuracy >= 80 && stats.avgReactionTime <= 300
                ? isDark ? 'bg-green-900/20' : 'bg-green-50'
                : stats.accuracy >= 60 && stats.avgReactionTime <= 500
                ? isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
                : isDark ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <p className={`font-semibold ${
                stats.accuracy >= 80 && stats.avgReactionTime <= 300
                  ? isDark ? 'text-green-200' : 'text-green-800'
                  : stats.accuracy >= 60 && stats.avgReactionTime <= 500
                  ? isDark ? 'text-yellow-200' : 'text-yellow-800'
                  : isDark ? 'text-red-200' : 'text-red-800'
              }`}>
                {stats.accuracy >= 80 && stats.avgReactionTime <= 300
                  ? '🏆 Excellent! Sharp shooting skills!'
                  : stats.accuracy >= 60 && stats.avgReactionTime <= 500
                  ? '👍 Good work! Keep practicing!'
                  : '💪 Room for improvement! Try again!'
                }
              </p>
            </div>
          </div>
          
          <div className="space-x-4">
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
        </div>
      )}
    </div>
  );
}
