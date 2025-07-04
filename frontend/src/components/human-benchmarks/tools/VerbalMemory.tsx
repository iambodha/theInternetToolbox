'use client';

import { useState, useCallback } from 'react';
import { styles } from '@/lib/styles';
import { useTheme } from '@/contexts/ThemeContext';

const wordLists = [
  ['apple', 'chair', 'ocean', 'guitar', 'mountain', 'coffee', 'bicycle', 'sunset', 'flower', 'keyboard'],
  ['elephant', 'thunder', 'diamond', 'sandwich', 'telescope', 'umbrella', 'volcano', 'butterfly', 'magazine', 'basketball'],
  ['library', 'helicopter', 'strawberry', 'microscope', 'adventure', 'photograph', 'waterfall', 'symphony', 'laboratory', 'refrigerator'],
  ['university', 'constellation', 'architecture', 'philosopher', 'documentary', 'extraordinary', 'investigation', 'environment', 'transportation', 'imagination'],
];

interface WordResult {
  word: string;
  wasCorrect: boolean;
  userAnswer: 'seen' | 'new';
  actualAnswer: 'seen' | 'new';
  timestamp: Date;
}

export default function VerbalMemory() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState('');
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [allShownWords, setAllShownWords] = useState<string[]>([]);
  const [results, setResults] = useState<WordResult[]>([]);
  const [bestScore, setBestScore] = useState<number>(0);

  // Generate a balanced mix of new and repeated words
  const generateWordSequence = useCallback((wordList: string[], seenSet: Set<string>) => {
    const unseenWords = wordList.filter(word => !seenSet.has(word));
    const seenArray = Array.from(seenSet);
    
    // If we have few seen words, prioritize showing new words
    if (seenArray.length < 3) {
      return unseenWords.length > 0 ? unseenWords[0] : wordList[Math.floor(Math.random() * wordList.length)];
    }
    
    // Create a balanced mix: 60% new words, 40% repeated words
    const shouldShowSeen = Math.random() < 0.4;
    
    if (shouldShowSeen && seenArray.length > 0) {
      // Show a previously seen word
      return seenArray[Math.floor(Math.random() * seenArray.length)];
    } else if (unseenWords.length > 0) {
      // Show a new word
      return unseenWords[0];
    } else {
      // All words from current level have been seen, pick random from seen words
      return seenArray[Math.floor(Math.random() * seenArray.length)];
    }
  }, []);

  const startGame = () => {
    const selectedList = wordLists[Math.min(level - 1, wordLists.length - 1)];
    const shuffled = [...selectedList].sort(() => Math.random() - 0.5);
    
    setWordPool(shuffled);
    setSeenWords(new Set());
    setAllShownWords([]);
    setScore(0);
    setLives(3);
    setResults([]);
    setGameState('playing');
    
    // Show first word (always new)
    const firstWord = shuffled[0];
    setCurrentWord(firstWord);
    setAllShownWords([firstWord]);
  };

  const showNextWord = useCallback(() => {
    const selectedList = wordLists[Math.min(level - 1, wordLists.length - 1)];
    const nextWord = generateWordSequence(selectedList, seenWords);
    
    setCurrentWord(nextWord);
    setAllShownWords(prev => [...prev, nextWord]);
  }, [level, seenWords, generateWordSequence]);

  const handleAnswer = (userAnswer: 'seen' | 'new') => {
    if (gameState !== 'playing') return;

    const wasActuallySeen = seenWords.has(currentWord);
    const actualAnswer: 'seen' | 'new' = wasActuallySeen ? 'seen' : 'new';
    const isCorrect = (userAnswer === 'seen' && wasActuallySeen) || (userAnswer === 'new' && !wasActuallySeen);

    // Record the result
    const result: WordResult = {
      word: currentWord,
      wasCorrect: isCorrect,
      userAnswer,
      actualAnswer,
      timestamp: new Date()
    };
    setResults(prev => [...prev, result]);

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      
      // Update best score
      if (newScore > bestScore) {
        setBestScore(newScore);
      }
      
      // Level up every 20 correct answers
      if (newScore % 20 === 0 && level < wordLists.length) {
        setLevel(level + 1);
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setGameState('finished');
        return;
      }
    }

    // Add current word to seen set (it has now been seen)
    const newSeenWords = new Set(seenWords);
    newSeenWords.add(currentWord);
    setSeenWords(newSeenWords);

    // Show next word after a brief delay
    setTimeout(() => {
      showNextWord();
    }, 100);
  };

  const reset = () => {
    setGameState('start');
    setScore(0);
    setLives(3);
    setLevel(1);
    setCurrentWord('');
    setWordPool([]);
    setSeenWords(new Set());
    setAllShownWords([]);
    setResults([]);
  };

  const getPerformanceRating = (score: number): { rating: string; color: string } => {
    if (score >= 50) return { rating: 'Exceptional', color: isDark ? 'text-purple-400' : 'text-purple-600' };
    if (score >= 35) return { rating: 'Excellent', color: isDark ? 'text-green-400' : 'text-green-600' };
    if (score >= 25) return { rating: 'Very Good', color: isDark ? 'text-blue-400' : 'text-blue-600' };
    if (score >= 15) return { rating: 'Good', color: isDark ? 'text-teal-400' : 'text-teal-600' };
    if (score >= 10) return { rating: 'Average', color: isDark ? 'text-yellow-400' : 'text-yellow-600' };
    if (score >= 5) return { rating: 'Below Average', color: isDark ? 'text-orange-400' : 'text-orange-600' };
    return { rating: 'Poor', color: isDark ? 'text-red-400' : 'text-red-600' };
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
          
          {bestScore > 0 && (
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {bestScore}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-purple-300' : 'text-purple-700'
              }`}>
                Best Score
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg text-center border ${
              isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className={`text-2xl font-bold ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {score}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>Score</div>
            </div>
            <div className={`p-4 rounded-lg text-center border ${
              isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            }`}>
              <div className={`text-2xl font-bold ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                {lives}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-red-300' : 'text-red-700'
              }`}>Lives</div>
            </div>
            <div className={`p-4 rounded-lg text-center border ${
              isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
            }`}>
              <div className={`text-2xl font-bold ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {level}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-purple-300' : 'text-purple-700'
              }`}>Level</div>
            </div>
          </div>

          {/* Word display */}
          <div className={`p-12 rounded-lg border-2 ${
            isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-center items-center min-h-[150px]">
              <span className={`text-4xl font-bold select-none ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {currentWord}
              </span>
            </div>
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer('new')}
              className={`p-6 text-xl font-semibold rounded-lg border-2 transition-colors ${
                isDark 
                  ? 'bg-green-900/20 border-green-800 text-green-400 hover:bg-green-900/30' 
                  : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              }`}
            >
              NEW
            </button>
            <button
              onClick={() => handleAnswer('seen')}
              className={`p-6 text-xl font-semibold rounded-lg border-2 transition-colors ${
                isDark 
                  ? 'bg-blue-900/20 border-blue-800 text-blue-400 hover:bg-blue-900/30' 
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
            >
              SEEN
            </button>
          </div>

          <div className={`text-center ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Have you seen this word before in this test?
          </div>

          {/* Progress info */}
          <div className={`text-center text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Words shown: {allShownWords.length} • Unique words seen: {seenWords.size}
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center space-y-6">
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`text-xl font-semibold mb-4 ${
              isDark ? 'text-blue-200' : 'text-blue-800'
            }`}>
              Test Complete!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {score}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>Final Score</div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {level}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-purple-300' : 'text-purple-700'
                }`}>Level Reached</div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  {results.filter(r => r.wasCorrect).length}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-green-300' : 'text-green-700'
                }`}>Correct</div>
              </div>
            </div>
            <div className={`text-lg mb-2 ${getPerformanceRating(score).color}`}>
              {getPerformanceRating(score).rating}
            </div>
            <p className={`${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              You correctly identified {score} words before running out of lives!
            </p>
            
            {/* Accuracy breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className={`font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Accuracy: {results.length > 0 ? Math.round((results.filter(r => r.wasCorrect).length / results.length) * 100) : 0}%
                </div>
                <div className={`${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {results.filter(r => r.wasCorrect).length} / {results.length} correct
                </div>
              </div>
              <div>
                <div className={`font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Words Seen: {seenWords.size}
                </div>
                <div className={`${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total shown: {allShownWords.length}
                </div>
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

      {/* Recent Results */}
      {results.length > 0 && gameState === 'finished' && (
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Last 10 Words</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.slice(-10).map((result, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                result.wasCorrect 
                  ? isDark 
                    ? 'bg-green-900/20 border border-green-800' 
                    : 'bg-green-50 border border-green-200'
                  : isDark 
                    ? 'bg-red-900/20 border border-red-800' 
                    : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-4">
                  <span className={`font-mono font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {result.word}
                  </span>
                  <span className={`text-sm ${
                    result.wasCorrect 
                      ? isDark ? 'text-green-400' : 'text-green-600'
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {result.wasCorrect ? '✓' : '✗'} {result.userAnswer.toUpperCase()}
                  </span>
                  {!result.wasCorrect && (
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      (was {result.actualAnswer.toUpperCase()})
                    </span>
                  )}
                </div>
                <span className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
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
              <li>• A word will appear on screen</li>
              <li>• Click "NEW" if you haven't seen it before in this test</li>
              <li>• Click "SEEN" if you have seen it before in this test</li>
              <li>• You lose a life for each wrong answer</li>
              <li>• The game ends when you run out of lives</li>
              <li>• Level up every 20 correct answers for harder words</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
