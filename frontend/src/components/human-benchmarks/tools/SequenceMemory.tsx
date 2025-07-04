'use client';

import { useState } from 'react';
import { styles } from '@/lib/styles';
import { useTheme } from '@/contexts/ThemeContext';

export default function SequenceMemory() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'showing' | 'input' | 'correct' | 'wrong'>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highlightedSquare, setHighlightedSquare] = useState<number | null>(null);

  const gridSize = 3;
  const totalSquares = gridSize * gridSize;

  const generateSequence = (length: number) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * totalSquares));
    }
    return newSequence;
  };

  const startGame = () => {
    const newSequence = generateSequence(level + 2);
    setSequence(newSequence);
    setUserSequence([]);
    setGameState('showing');
    setIsShowing(true);
    showSequence(newSequence);
  };

  const showSequence = async (seq: number[]) => {
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setHighlightedSquare(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setHighlightedSquare(null);
    }
    setIsShowing(false);
    setGameState('input');
  };

  const handleSquareClick = (squareIndex: number) => {
    if (gameState !== 'input' || isShowing) return;

    const newUserSequence = [...userSequence, squareIndex];
    setUserSequence(newUserSequence);

    // Check if this click is correct
    if (squareIndex !== sequence[newUserSequence.length - 1]) {
      setGameState('wrong');
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      setScore(score + 1);
      setLevel(level + 1);
      setGameState('correct');
    }
  };

  const reset = () => {
    setSequence([]);
    setUserSequence([]);
    setGameState('start');
    setLevel(1);
    setScore(0);
    setHighlightedSquare(null);
    setIsShowing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {gameState === 'start' && (
        <div className="text-center space-y-6">
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>How it works:</h3>
            <p className={`${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Watch the sequence of squares that light up, then click them in the same order. 
              The sequence gets longer with each level.
            </p>
          </div>
          <button
            onClick={startGame}
            className={`${styles.button.primary} px-8 py-3 text-lg`}
          >
            Start Test
          </button>
        </div>
      )}

      {gameState !== 'start' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg text-center border ${
              isDark 
                ? 'bg-blue-900/20 border-blue-800 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              <div className="text-2xl font-bold">
                {level}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>Level</div>
            </div>
            <div className={`p-4 rounded-lg text-center border ${
              isDark 
                ? 'bg-green-900/20 border-green-800 text-green-400' 
                : 'bg-green-50 border-green-200 text-green-600'
            }`}>
              <div className="text-2xl font-bold">
                {score}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>Score</div>
            </div>
          </div>

          {/* Game status */}
          <div className="text-center mb-6">
            {gameState === 'showing' && (
              <p className={`text-lg ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Watch the sequence...
              </p>
            )}
            {gameState === 'input' && (
              <p className={`text-lg ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                Click the squares in the same order ({userSequence.length}/{sequence.length})
              </p>
            )}
            {gameState === 'correct' && (
              <div className="space-y-4">
                <p className={`text-lg ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  Correct! Moving to level {level}
                </p>
                <button
                  onClick={startGame}
                  className={`${styles.button.primary} px-6 py-2`}
                >
                  Continue
                </button>
              </div>
            )}
            {gameState === 'wrong' && (
              <div className="space-y-4">
                <p className={`text-lg ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  Wrong sequence! You reached level {level}
                </p>
                <button
                  onClick={reset}
                  className={`${styles.button.primary} px-6 py-2`}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Grid */}
          <div 
            className="grid gap-2 mx-auto justify-center"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              maxWidth: '300px'
            }}
          >
            {Array.from({ length: totalSquares }, (_, index) => (
              <button
                key={index}
                onClick={() => handleSquareClick(index)}
                disabled={gameState !== 'input'}
                className={`
                  w-20 h-20 rounded-lg border-2 transition-all duration-200
                  ${highlightedSquare === index 
                    ? 'bg-blue-500 border-blue-600 scale-105' 
                    : isDark 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                  }
                  ${gameState === 'input' ? 'cursor-pointer' : 'cursor-default'}
                  ${userSequence.includes(index) && gameState === 'input' 
                    ? isDark 
                      ? 'bg-green-800 border-green-400' 
                      : 'bg-green-200 border-green-400'
                    : ''
                  }
                `}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}