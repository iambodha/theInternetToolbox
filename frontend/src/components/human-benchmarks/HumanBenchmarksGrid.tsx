'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { styles } from '@/lib/styles';

interface BenchmarkTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'reaction' | 'memory' | 'typing' | 'visual' | 'language';
  route: string;
}

const benchmarkTools: BenchmarkTool[] = [
  // Reaction Tests
  { id: 'reaction-time', title: 'Reaction Time', description: 'Test how quickly you can react to visual stimuli', icon: '⚡', category: 'reaction', route: '/human-benchmarks/reaction-time' },
  { id: 'aim-trainer', title: 'Aim Trainer', description: 'Test your mouse precision and targeting speed', icon: '🎯', category: 'reaction', route: '/human-benchmarks/aim-trainer' },
  
  // Memory Tests
  { id: 'number-memory', title: 'Number Memory', description: 'How many digits can you remember in sequence?', icon: '🧠', category: 'memory', route: '/human-benchmarks/number-memory' },
  { id: 'verbal-memory', title: 'Verbal Memory', description: 'Remember words and identify if you\'ve seen them before', icon: '📝', category: 'memory', route: '/human-benchmarks/verbal-memory' },
  
  // Typing Tests
  { id: 'typing-speed', title: 'Typing Speed', description: 'Test your typing speed and accuracy with real text', icon: '⌨️', category: 'typing', route: '/human-benchmarks/typing-speed' },
  
  // Visual Tests
  { id: 'visual-acuity', title: 'Visual Acuity', description: 'Test how well you can see small details and symbols', icon: '👁️', category: 'visual', route: '/human-benchmarks/visual-acuity' },
  { id: 'color-strength', title: 'Color Strength', description: 'Test your color discrimination by finding the odd color out', icon: '🎨', category: 'visual', route: '/human-benchmarks/color-strength' },
  
  // Language Tests
  { id: 'spell-bee', title: 'Spell Bee', description: 'Listen to words and spell them correctly using text-to-speech', icon: '🐝', category: 'language', route: '/human-benchmarks/spell-bee' },
];

const categories = [
  { id: 'all', name: 'All Tests', count: benchmarkTools.length },
  { id: 'reaction', name: 'Reaction', count: benchmarkTools.filter(t => t.category === 'reaction').length },
  { id: 'memory', name: 'Memory', count: benchmarkTools.filter(t => t.category === 'memory').length },
  { id: 'typing', name: 'Typing', count: benchmarkTools.filter(t => t.category === 'typing').length },
  { id: 'visual', name: 'Visual', count: benchmarkTools.filter(t => t.category === 'visual').length },
  { id: 'language', name: 'Language', count: benchmarkTools.filter(t => t.category === 'language').length },
];

export default function HumanBenchmarksGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? benchmarkTools 
    : benchmarkTools.filter(tool => tool.category === selectedCategory);

  const handleToolClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className={styles.layout.container}>
      {/* Category filters */}
      <div className={styles.grid.filters}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`${styles.button.filter} ${
              selectedCategory === category.id
                ? styles.button.filterActive
                : styles.button.filterInactive
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Tools grid */}
      <div className={styles.grid.tools}>
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleToolClick(tool.route)}
            className={styles.card.base}
          >
            <div className={styles.card.content}>
              <div className={styles.card.header}>
                <div className={styles.card.icon}>{tool.icon}</div>
                <div>
                  <h3 className={styles.card.title}>{tool.title}</h3>
                </div>
              </div>
              <p className={styles.card.description}>{tool.description}</p>
              <div className={styles.card.footer}>
                <span className={styles.card.category}>{tool.category}</span>
                <span className={styles.card.arrow}>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}