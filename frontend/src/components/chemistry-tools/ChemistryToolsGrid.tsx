'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';

interface ChemistryTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'calculator' | 'converter' | 'analyzer';
  route: string;
}

const chemistryTools: ChemistryTool[] = [
  // Calculator Tools
  { id: 'molarity-calculator', title: 'Molarity Calculator', description: 'Calculate molarity, moles, volume, and molecular weight relationships', icon: '🧪', category: 'calculator', route: '/chemistry-tools/molarity-calculator' },
  { id: 'dilution-calculator', title: 'Dilution Calculator', description: 'Calculate concentrations and volumes for solution dilutions', icon: '💧', category: 'calculator', route: '/chemistry-tools/dilution-calculator' },
  { id: 'gas-laws-calculator', title: 'Gas Laws Calculator', description: 'Apply ideal gas law, Boyle\'s, Charles\', and Gay-Lussac\'s laws', icon: '🎈', category: 'calculator', route: '/chemistry-tools/gas-laws-calculator' },
  { id: 'stoichiometry-calculator', title: 'Stoichiometry Calculator', description: 'Balance equations and calculate reaction stoichiometry', icon: '⚖️', category: 'calculator', route: '/chemistry-tools/stoichiometry-calculator' },
  { id: 'ph-calculator', title: 'pH Calculator', description: 'Calculate pH, pOH, and hydrogen ion concentrations', icon: '🔬', category: 'calculator', route: '/chemistry-tools/ph-calculator' },
  { id: 'buffer-calculator', title: 'Buffer Calculator', description: 'Calculate buffer pH using Henderson-Hasselbalch equation', icon: '⚗️', category: 'calculator', route: '/chemistry-tools/buffer-calculator' },
  
  // Converter Tools
  { id: 'unit-converter', title: 'Unit Converter', description: 'Convert between common chemistry units (mass, volume, pressure, etc.)', icon: '🔄', category: 'converter', route: '/chemistry-tools/unit-converter' },
  { id: 'temperature-converter', title: 'Temperature Converter', description: 'Convert between Celsius, Fahrenheit, and Kelvin scales', icon: '🌡️', category: 'converter', route: '/chemistry-tools/temperature-converter' },
  { id: 'concentration-converter', title: 'Concentration Converter', description: 'Convert between molarity, molality, mass percent, and ppm', icon: '📊', category: 'converter', route: '/chemistry-tools/concentration-converter' },
  
  // Analyzer Tools
  { id: 'molecular-weight-calculator', title: 'Molecular Weight Calculator', description: 'Calculate molecular weight from chemical formulas', icon: '⚛️', category: 'analyzer', route: '/chemistry-tools/molecular-weight-calculator' },
  { id: 'empirical-formula-calculator', title: 'Empirical Formula Calculator', description: 'Determine empirical and molecular formulas from composition data', icon: '🧮', category: 'analyzer', route: '/chemistry-tools/empirical-formula-calculator' },
  { id: 'equation-balancer', title: 'Equation Balancer', description: 'Balance chemical equations automatically', icon: '⚖️', category: 'analyzer', route: '/chemistry-tools/equation-balancer' },
];

const categories = [
  { id: 'all', name: 'All Tools', count: chemistryTools.length },
  { id: 'calculator', name: 'Calculators', count: chemistryTools.filter(t => t.category === 'calculator').length },
  { id: 'converter', name: 'Converters', count: chemistryTools.filter(t => t.category === 'converter').length },
  { id: 'analyzer', name: 'Analyzers', count: chemistryTools.filter(t => t.category === 'analyzer').length },
];

export default function ChemistryToolsGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? chemistryTools 
    : chemistryTools.filter(tool => tool.category === selectedCategory);

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
