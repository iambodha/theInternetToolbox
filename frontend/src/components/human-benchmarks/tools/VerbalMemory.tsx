'use client';

import { useState } from 'react';
import { styles } from '@/lib/styles';

const wordLists = [
  ['apple', 'chair', 'ocean', 'guitar', 'mountain', 'coffee', 'bicycle', 'sunset', 'flower', 'keyboard'],
  ['elephant', 'thunder', 'diamond', 'sandwich', 'telescope', 'umbrella', 'volcano', 'butterfly', 'magazine', 'basketball'],
  ['library', 'helicopter', 'strawberry', 'microscope', 'adventure', 'photograph', 'waterfall', 'symphony', 'laboratory', 'refrigerator'],
  ['university', 'constellation', 'architecture', 'philosopher', 'documentary', 'extraordinary', 'investigation', 'environment', 'transportation', 'imagination'],
];

export default function VerbalMemory() {
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState('');
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wordIndex, setWordIndex] = useState(0);
  const [level, setLevel] = useState(1);

  const startGame = () => {
    const selectedList = wordLists[Math.min(level - 1, wordLists.length - 1)];
    const shuffled = [...selectedList].sort(() => Math.random() - 0.5);
    setCurrentWords(shuffled);
    setSeenWords(new Set());
    setScore(0);
    setLives(3);
    setWordIndex(0);
    setGameState('playing');
    showNextWord(shuffled, new Set(), 0);
  };

  const showNextWord = (words: string[], seen: Set<string>, index: number) => {
    if (index >= words.length * 2) {
      // Extend with repeated words
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(randomWord);
    } else {
      // Show mix of new and repeated words
      const shouldRepeat = Math.random() < 0.3 && seen.size > 2;
      if (shouldRepeat) {
        const seenArray = Array.from(seen);
        const randomSeenWord = seenArray[Math.floor(Math.random() * seenArray.length)];
        setCurrentWord(randomSeenWord);
      } else {
        const availableWords = words.filter(word => !seen.has(word));
        if (availableWords.length > 0) {
          const newWord = availableWords[0];
          setCurrentWord(newWord);
        } else {
          // All words have been seen, pick random
          const randomWord = words[Math.floor(Math.random() * words.length)];
          setCurrentWord(randomWord);
        }
      }
    }
  };

  const handleAnswer = (isSeen: boolean) => {
    if (gameState !== 'playing') return;

    const wasActuallySeen = seenWords.has(currentWord);
    const isCorrect = (isSeen && wasActuallySeen) || (!isSeen && !wasActuallySeen);

    if (isCorrect) {
      setScore(score + 1);
      // Level up every 15 correct answers
      if ((score + 1) % 15 === 0 && level < wordLists.length) {
        setLevel(level + 1);
      }
    } else {
      setLives(lives - 1);
      if (lives <= 1) {
        setGameState('finished');
        return;
      }
    }

    // Add current word to seen set if not already there
    const newSeenWords = new Set(seenWords);
    newSeenWords.add(currentWord);
    setSeenWords(newSeenWords);

    // Show next word
    const newIndex = wordIndex + 1;
    setWordIndex(newIndex);
    showNextWord(currentWords, newSeenWords, newIndex);
  };

  const reset = () => {
    setGameState('start');
    setScore(0);
    setLives(3);
    setLevel(1);
    setCurrentWords([]);
    setSeenWords(new Set());
    setWordIndex(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {gameState === 'start' && (
        <div className="text-center space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">How it works:</h3>
            <p className="text-gray-600 dark:text-gray-300">
              You&apos;ll see a series of words. Click &quot;SEEN&quot; if you&apos;ve seen the word before in this test, 
              or &quot;NEW&quot; if it&apos;s the first time seeing it. You have 3 lives.
            </p>
          </div>
          <button
            onClick={startGame}
            className={`${styles.button.primary} px-8 py-3 text-lg`}
          >
            Start Verbal Memory Test
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Score</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {lives}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Lives</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {level}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Level</div>
            </div>
          </div>

          {/* Word display */}
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg border-2 border-gray-200 dark:border-gray-600">
            <div className="flex justify-center items-center min-h-[150px]">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100 select-none">
                {currentWord}
              </span>
            </div>
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className={`${styles.button.secondary} p-6 text-xl font-semibold bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300`}
            >
              NEW
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className={`${styles.button.secondary} p-6 text-xl font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300`}
            >
              SEEN
            </button>
          </div>

          <div className="text-center text-gray-600 dark:text-gray-300">
            Have you seen this word before in this test?
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
              Test Complete!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {score}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Final Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {level}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Level Reached</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              You correctly identified {score} words before running out of lives!
            </p>
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
