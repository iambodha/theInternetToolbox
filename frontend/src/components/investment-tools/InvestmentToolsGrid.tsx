'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';

interface InvestmentTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'calculator' | 'analyzer' | 'planner' | 'tracker';
  route: string;
}

const investmentTools: InvestmentTool[] = [
  // Calculator Tools
  { id: 'investment-calculator', title: 'Investment Calculator', description: 'Calculate compound returns, future value, and investment growth over time', icon: '📈', category: 'calculator', route: '/investment-tools/calculator' },
  { id: 'retirement-calculator', title: 'Retirement Calculator', description: 'Plan for retirement with contribution and withdrawal calculations', icon: '🏖️', category: 'planner', route: '/investment-tools/retirement' },
  { id: 'roi-calculator', title: 'ROI Calculator', description: 'Calculate return on investment and compare investment options', icon: '💰', category: 'calculator', route: '/investment-tools/roi' },
  
  // Analyzer Tools
  { id: 'portfolio-analyzer', title: 'Portfolio Analyzer', description: 'Analyze portfolio performance, diversification, and risk metrics', icon: '📊', category: 'analyzer', route: '/investment-tools/portfolio' },
  { id: 'compound-interest', title: 'Compound Interest Calculator', description: 'Calculate the power of compound interest over time', icon: '⚡', category: 'calculator', route: '/investment-tools/compound' },
  
  // Planner Tools
  { id: 'goal-planner', title: 'Investment Goal Planner', description: 'Plan and track progress towards financial goals', icon: '🎯', category: 'planner', route: '/investment-tools/goals' },
];

const categories = [
  { id: 'all', name: 'All Tools', count: investmentTools.length },
  { id: 'calculator', name: 'Calculators', count: investmentTools.filter(t => t.category === 'calculator').length },
  { id: 'analyzer', name: 'Analyzers', count: investmentTools.filter(t => t.category === 'analyzer').length },
  { id: 'planner', name: 'Planners', count: investmentTools.filter(t => t.category === 'planner').length },
];

export default function InvestmentToolsGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? investmentTools 
    : investmentTools.filter(tool => tool.category === selectedCategory);

  const handleToolClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className={styles.spacing.section}>
      {/* Category Filter */}
      <FilterGrid>
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name} ({category.count})
          </FilterButton>
        ))}
      </FilterGrid>

      {/* Tools Grid */}
      <ToolGrid>
        {filteredTools.map((tool) => (
          <ToolCard
            key={tool.id}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            category={categories.find(c => c.id === tool.category)?.name}
            onClick={() => handleToolClick(tool.route)}
          />
        ))}
      </ToolGrid>
    </div>
  );
}