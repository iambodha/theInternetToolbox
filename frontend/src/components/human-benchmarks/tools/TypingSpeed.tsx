'use client';

import { useState, useRef } from 'react';
import { styles } from '@/lib/styles';

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once.",
  "Technology has revolutionized the way we communicate, work, and live our daily lives in the modern world.",
  "Programming is the art of telling another human being what one wants the computer to do in a precise manner.",
  "Artificial intelligence and machine learning are transforming industries and creating new opportunities for innovation.",
  "The beauty of nature lies in its complexity, diversity, and the intricate balance between all living organisms."
];

export default function TypingSpeed() {
  const [text, setText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const startTest = () => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(randomText);
    setCurrentText('');
    setCurrentIndex(0);
    setErrors(0);
    setIsStarted(true);
    setIsFinished(false);
    setStartTime(Date.now());
    setEndTime(null);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (value: string) => {
    if (!isStarted || isFinished) return;

    setCurrentText(value);
    
    // Count errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);
    setCurrentIndex(value.length);

    // Check if finished
    if (value === text) {
      setEndTime(Date.now());
      setIsFinished(true);
    }
  };

  const calculateWPM = () => {
    if (!startTime || !endTime) return 0;
    const timeInMinutes = (endTime - startTime) / 60000;
    const wordsTyped = currentText.split(' ').length;
    return Math.round(wordsTyped / timeInMinutes);
  };

  const calculateAccuracy = () => {
    if (currentText.length === 0) return 100;
    return Math.round(((currentText.length - errors) / currentText.length) * 100);
  };

  const reset = () => {
    setText('');
    setCurrentText('');
    setCurrentIndex(0);
    setErrors(0);
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setEndTime(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!isStarted ? (
        <div className="text-center space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">How it works:</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Type the given text as quickly and accurately as possible. 
              Your words per minute (WPM) and accuracy will be calculated.
            </p>
          </div>
          <button
            onClick={startTest}
            className={`${styles.button.primary} px-8 py-3 text-lg`}
          >
            Start Typing Test
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Text display */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-lg leading-relaxed font-mono">
            {text.split('').map((char, index) => (
              <span
                key={index}
                className={
                  index < currentIndex
                    ? currentText[index] === char
                      ? 'text-green-600 bg-green-100 dark:bg-green-900'
                      : 'text-red-600 bg-red-100 dark:bg-red-900'
                    : index === currentIndex
                    ? 'bg-blue-200 dark:bg-blue-700'
                    : 'text-gray-500'
                }
              >
                {char}
              </span>
            ))}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={currentText}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isFinished}
            className="w-full p-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            placeholder="Start typing here..."
          />

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {isFinished ? calculateWPM() : '0'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">WPM</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {calculateAccuracy()}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {errors}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Errors</div>
            </div>
          </div>

          {isFinished && (
            <div className="text-center space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                  Test Complete!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  You typed at {calculateWPM()} WPM with {calculateAccuracy()}% accuracy
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
      )}
    </div>
  );
}
