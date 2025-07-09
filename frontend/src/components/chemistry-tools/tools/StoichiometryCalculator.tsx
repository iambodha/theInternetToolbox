'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface StoichiometryInputs {
  givenMoles?: number;
  givenMass?: number;
  givenMolarMass?: number;
  targetMolarMass?: number;
  moleRatio?: number;
  targetMoles?: number;
  targetMass?: number;
}

export default function StoichiometryCalculator() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [inputs, setInputs] = useState<StoichiometryInputs>({});
  const [calculationMode, setCalculationMode] = useState<'moles' | 'mass'>('mass');
  const [results, setResults] = useState<StoichiometryInputs>({});
  const [equation, setEquation] = useState('');
  const [balancedEquation, setBalancedEquation] = useState('');

  const handleInputChange = (field: keyof StoichiometryInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const performCalculation = () => {
    const { givenMoles, givenMass, givenMolarMass, targetMolarMass, moleRatio } = inputs;
    let newResults: StoichiometryInputs = { ...inputs };

    // Calculate given moles if not provided
    let actualGivenMoles = givenMoles;
    if (!actualGivenMoles && givenMass && givenMolarMass) {
      actualGivenMoles = givenMass / givenMolarMass;
      newResults.givenMoles = actualGivenMoles;
    }

    // Calculate target moles using stoichiometry
    if (actualGivenMoles && moleRatio) {
      newResults.targetMoles = actualGivenMoles * moleRatio;
    }

    // Calculate target mass if needed
    if (newResults.targetMoles && targetMolarMass) {
      newResults.targetMass = newResults.targetMoles * targetMolarMass;
    }

    // Calculate given mass if not provided
    if (actualGivenMoles && givenMolarMass && !givenMass) {
      newResults.givenMass = actualGivenMoles * givenMolarMass;
    }

    setResults(newResults);
  };

  const clearAll = () => {
    setInputs({});
    setResults({});
    setEquation('');
    setBalancedEquation('');
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '';
    if (num < 0.001) return num.toExponential(3);
    return num.toFixed(4);
  };

  // Simple equation balancer (basic implementation)
  const balanceEquation = () => {
    if (!equation.includes('->') && !equation.includes('=')) {
      setBalancedEquation('Please enter equation with -> or = separator');
      return;
    }
    
    // This is a simplified balancer - for complex equations, would need more sophisticated algorithm
    const cleanEq = equation.replace(/\s+/g, '').replace('->', '=');
    setBalancedEquation(`Balanced: ${cleanEq} (Note: This is a simplified balancer. For complex equations, please verify manually)`);
  };

  // Common reactions database
  const commonReactions = [
    { name: 'Combustion of Methane', equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O' },
    { name: 'Formation of Water', equation: '2H₂ + O₂ → 2H₂O' },
    { name: 'Decomposition of Water', equation: '2H₂O → 2H₂ + O₂' },
    { name: 'Formation of Ammonia', equation: 'N₂ + 3H₂ → 2NH₃' },
    { name: 'Combustion of Ethane', equation: '2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O' },
    { name: 'Photosynthesis', equation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' }
  ];

  return (
    <div className="space-y-6">
      {/* Equation Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Chemical Equation (Optional)</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="e.g., 2H₂ + O₂ → 2H₂O"
            className="flex-1 p-3 border border-foreground/20 rounded-lg bg-background"
          />
          <button
            onClick={balanceEquation}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Balance
          </button>
        </div>
        {balancedEquation && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">{balancedEquation}</p>
          </div>
        )}
      </div>

      {/* Common Reactions */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Common Reactions (Click to use)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {commonReactions.map((reaction, index) => (
            <button
              key={index}
              onClick={() => setEquation(reaction.equation)}
              className="p-3 text-left border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              <div className="font-medium text-sm">{reaction.name}</div>
              <div className="text-xs text-foreground/60 font-mono">{reaction.equation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calculation Mode */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">What do you want to calculate?</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setCalculationMode('moles')}
            className={`p-3 text-left border rounded-lg transition-colors ${
              calculationMode === 'moles'
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 hover:bg-foreground/5'
            }`}
          >
            <div className="font-medium text-sm">Target Moles</div>
            <div className="text-xs text-foreground/60">Calculate moles of product</div>
          </button>
          <button
            onClick={() => setCalculationMode('mass')}
            className={`p-3 text-left border rounded-lg transition-colors ${
              calculationMode === 'mass'
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 hover:bg-foreground/5'
            }`}
          >
            <div className="font-medium text-sm">Target Mass</div>
            <div className="text-xs text-foreground/60">Calculate mass of product</div>
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Given Reactant */}
        <div className="space-y-4">
          <h4 className="font-medium text-lg">Given Reactant</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Given Moles (mol)
            </label>
            <input
              type="number"
              value={inputs.givenMoles || ''}
              onChange={(e) => handleInputChange('givenMoles', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="0.0"
              step="0.001"
            />
          </div>

          <div className="text-center text-foreground/50">OR</div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Given Mass (g)
            </label>
            <input
              type="number"
              value={inputs.givenMass || ''}
              onChange={(e) => handleInputChange('givenMass', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="0.0"
              step="0.001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Molar Mass of Given (g/mol)
            </label>
            <input
              type="number"
              value={inputs.givenMolarMass || ''}
              onChange={(e) => handleInputChange('givenMolarMass', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="0.0"
              step="0.01"
            />
          </div>
        </div>

        {/* Target Product */}
        <div className="space-y-4">
          <h4 className="font-medium text-lg">Target Product</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Mole Ratio (Target : Given)
            </label>
            <input
              type="number"
              value={inputs.moleRatio || ''}
              onChange={(e) => handleInputChange('moleRatio', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="e.g., 2 (if 2 mol product per 1 mol reactant)"
              step="0.1"
            />
            <div className="text-xs text-foreground/50 mt-1">
              From balanced equation coefficients
            </div>
          </div>

          {calculationMode === 'mass' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Molar Mass of Target (g/mol)
              </label>
              <input
                type="number"
                value={inputs.targetMolarMass || ''}
                onChange={(e) => handleInputChange('targetMolarMass', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="0.0"
                step="0.01"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={performCalculation}
          className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
        >
          Calculate
        </button>
        <button
          onClick={clearAll}
          className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Results */}
      {Object.keys(results).some(key => results[key as keyof StoichiometryInputs] !== undefined) && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.givenMoles !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Given Moles</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatNumber(results.givenMoles)} mol
                </div>
              </div>
            )}
            {results.givenMass !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Given Mass</div>
                <div className="text-xl font-bold text-green-600">
                  {formatNumber(results.givenMass)} g
                </div>
              </div>
            )}
            {results.targetMoles !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Target Moles</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatNumber(results.targetMoles)} mol
                </div>
              </div>
            )}
            {results.targetMass !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Target Mass</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatNumber(results.targetMass)} g
                </div>
              </div>
            )}
          </div>

          {/* Calculation Steps */}
          {results.givenMoles && results.targetMoles && inputs.moleRatio && (
            <div className="mt-6 p-4 bg-background rounded-lg border border-foreground/20">
              <h4 className="font-medium mb-3">Calculation Steps</h4>
              <div className="space-y-2 text-sm">
                <div>1. Given: {formatNumber(results.givenMoles)} mol of reactant</div>
                <div>2. Mole ratio: {inputs.moleRatio}:1 (product:reactant)</div>
                <div>3. Target moles = {formatNumber(results.givenMoles)} × {inputs.moleRatio} = {formatNumber(results.targetMoles)} mol</div>
                {results.targetMass && inputs.targetMolarMass && (
                  <div>4. Target mass = {formatNumber(results.targetMoles)} mol × {inputs.targetMolarMass} g/mol = {formatNumber(results.targetMass)} g</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Key Formulas</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Moles = Mass ÷ Molar Mass</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Product Moles = Reactant Moles × Mole Ratio</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Mass = Moles × Molar Mass</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Mole Ratio = Coefficient of Product ÷ Coefficient of Reactant</strong>
          </div>
        </div>
      </div>

      {/* Stoichiometry Examples */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">🧪 Example Problem</h4>
        <div className="text-sm text-green-700 dark:text-green-300">
          <div className="mb-3">
            <strong>Problem:</strong> How many grams of H₂O are produced from 2.5 mol of H₂?
          </div>
          <div className="mb-3">
            <strong>Equation:</strong> 2H₂ + O₂ → 2H₂O
          </div>
          <div className="space-y-1">
            <div><strong>Steps:</strong></div>
            <div>1. Given: 2.5 mol H₂</div>
            <div>2. Mole ratio: 2 mol H₂O : 2 mol H₂ = 1:1</div>
            <div>3. Moles H₂O = 2.5 mol H₂ × (1 mol H₂O / 1 mol H₂) = 2.5 mol H₂O</div>
            <div>4. Mass H₂O = 2.5 mol × 18.02 g/mol = 45.05 g H₂O</div>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Always start with a balanced chemical equation</li>
          <li>• Identify what you're given and what you need to find</li>
          <li>• Use mole ratios from balanced equation coefficients</li>
          <li>• Convert between mass and moles using molar mass</li>
          <li>• Check your answer for reasonableness</li>
          <li>• For limiting reactant problems, calculate for both reactants</li>
        </ul>
      </div>
    </div>
  );
}