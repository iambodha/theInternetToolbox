'use client';

import { useState } from 'react';
import { styles } from '@/lib/styles';

const directions = ['↑', '↓', '←', '→'];
const directionNames = ['Up', 'Down', 'Left', 'Right'];

export default function VisualAcuity() {
  const [currentSize, setCurrentSize] = useState(40);
  const [currentDirection, setCurrentDirection] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'testing' | 'finished'>('start');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [smallestSize, setSmallestSize] = useState(40);

  const generateNewArrow = () => {
    setCurrentDirection(Math.floor(Math.random() * 4));
  };

  const startTest = () => {
    setGameState('testing');
    setScore(0);
    setAttempts(0);
    setCorrectAnswers(0);
    setCurrentSize(40);
    setSmallestSize(40);
    generateNewArrow();
  };

  const handleDirectionClick = (selectedDirection: number) => {
    if (gameState !== 'testing') return;

    const isCorrect = selectedDirection === currentDirection;
    setAttempts(attempts + 1);

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setScore(score + 1);
      
      // Make arrow smaller for next round
      const newSize = Math.max(8, currentSize - 2);
      setCurrentSize(newSize);
      setSmallestSize(Math.min(smallestSize, newSize));
      
      generateNewArrow();
    } else {
      // End test on wrong answer
      setGameState('finished');
    }

    // End test after 15 attempts or if arrow gets too small
    if (attempts >= 14 || currentSize <= 8) {
      setGameState('finished');
    }
  };

  const calculateVisualAcuity = () => {
    // Rough estimation based on smallest readable size
    const acuity = Math.max(0.1, (60 - smallestSize) / 40);
    return acuity.toFixed(1);
  };

  const reset = () => {
    setGameState('start');
    setScore(0);
    setAttempts(0);
    setCorrectAnswers(0);
    setCurrentSize(40);
    setSmallestSize(40);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {gameState === 'start' && (
        <div className="text-center space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">How it works:</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Look at the arrow and click the button that matches its direction. 
              The arrows will get smaller as you progress. The test ends when you make a mistake.
            </p>
          </div>
          <button
            onClick={startTest}
            className={`${styles.button.primary} px-8 py-3 text-lg`}
          >
            Start Visual Acuity Test
          </button>
        </div>
      )}

      {gameState === 'testing' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Correct</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentSize}px
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Arrow Size</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {attempts + 1}/15
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Attempt</div>
            </div>
          </div>

          {/* Arrow display */}
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg border-2 border-gray-200 dark:border-gray-600">
            <div className="flex justify-center items-center min-h-[200px]">
              <span 
                className="text-black dark:text-white font-bold select-none"
                style={{ fontSize: `${currentSize}px` }}
              >
                {directions[currentDirection]}
              </span>
            </div>
          </div>

          {/* Direction buttons */}
          <div className="grid grid-cols-2 gap-4">
            {directionNames.map((direction, index) => (
              <button
                key={index}
                onClick={() => handleDirectionClick(index)}
                className={`${styles.button.secondary} p-4 text-lg flex items-center justify-center space-x-2`}
              >
                <span className="text-xl">{directions[index]}</span>
                <span>{direction}</span>
              </button>
            ))}
          </div>

          <div className="text-center text-gray-600 dark:text-gray-300">
            Click the button that matches the arrow direction
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
              Test Complete!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {correctAnswers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Correct Answers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {smallestSize}px
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Smallest Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {calculateVisualAcuity()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Visual Score</div>
              </div>
            </div>
          </div>
          <button
            onClick={reset}
            className={`${styles.button.primary} px-6 py-2`}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}