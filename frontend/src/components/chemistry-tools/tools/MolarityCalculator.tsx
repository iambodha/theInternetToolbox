'use client';

import { useState } from 'react';

interface MolarityCalculation {
  molarity?: number;
  moles?: number;
  volume?: number;
  molecularWeight?: number;
  mass?: number;
}

export default function MolarityCalculator() {
  const [inputs, setInputs] = useState<MolarityCalculation>({
    molarity: undefined,
    moles: undefined,
    volume: undefined,
    molecularWeight: undefined,
    mass: undefined,
  });

  const [calculationMode, setCalculationMode] = useState<'molarity' | 'moles' | 'volume' | 'mass'>('molarity');
  const [results, setResults] = useState<MolarityCalculation>({});

  const handleInputChange = (field: keyof MolarityCalculation, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateMolarity = () => {
    const { moles, volume } = inputs;
    if (moles !== undefined && volume !== undefined && volume > 0) {
      return moles / volume;
    }
    return undefined;
  };

  const calculateMoles = () => {
    const { molarity, volume, mass, molecularWeight } = inputs;
    
    // From molarity and volume
    if (molarity !== undefined && volume !== undefined) {
      return molarity * volume;
    }
    
    // From mass and molecular weight
    if (mass !== undefined && molecularWeight !== undefined && molecularWeight > 0) {
      return mass / molecularWeight;
    }
    
    return undefined;
  };

  const calculateVolume = () => {
    const { molarity, moles } = inputs;
    if (molarity !== undefined && moles !== undefined && molarity > 0) {
      return moles / molarity;
    }
    return undefined;
  };

  const calculateMass = () => {
    const { moles, molecularWeight } = inputs;
    if (moles !== undefined && molecularWeight !== undefined) {
      return moles * molecularWeight;
    }
    return undefined;
  };

  const performCalculation = () => {
    const newResults: MolarityCalculation = {};

    switch (calculationMode) {
      case 'molarity':
        newResults.molarity = calculateMolarity();
        break;
      case 'moles':
        newResults.moles = calculateMoles();
        break;
      case 'volume':
        newResults.volume = calculateVolume();
        break;
      case 'mass':
        newResults.mass = calculateMass();
        break;
    }

    setResults(newResults);
  };

  const clearAll = () => {
    setInputs({});
    setResults({});
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '';
    if (num < 0.001) return num.toExponential(3);
    return num.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Calculation Mode Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">What do you want to calculate?</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { mode: 'molarity', label: 'Molarity (M)', description: 'mol/L' },
            { mode: 'moles', label: 'Moles (mol)', description: 'amount' },
            { mode: 'volume', label: 'Volume (L)', description: 'liters' },
            { mode: 'mass', label: 'Mass (g)', description: 'grams' }
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => setCalculationMode(option.mode as 'molarity' | 'moles' | 'volume' | 'mass')}
              className={`p-3 text-left border rounded-lg transition-colors ${
                calculationMode === option.mode
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-foreground/60">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Molarity (M)
            {calculationMode === 'molarity' && <span className="text-blue-500 ml-1">← calculating</span>}
          </label>
          <input
            type="number"
            value={inputs.molarity || ''}
            onChange={(e) => handleInputChange('molarity', e.target.value)}
            disabled={calculationMode === 'molarity'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode === 'molarity' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0"
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Moles (mol)
            {calculationMode === 'moles' && <span className="text-blue-500 ml-1">← calculating</span>}
          </label>
          <input
            type="number"
            value={inputs.moles || ''}
            onChange={(e) => handleInputChange('moles', e.target.value)}
            disabled={calculationMode === 'moles'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode === 'moles' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0"
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Volume (L)
            {calculationMode === 'volume' && <span className="text-blue-500 ml-1">← calculating</span>}
          </label>
          <input
            type="number"
            value={inputs.volume || ''}
            onChange={(e) => handleInputChange('volume', e.target.value)}
            disabled={calculationMode === 'volume'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode === 'volume' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0"
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Molecular Weight (g/mol)
          </label>
          <input
            type="number"
            value={inputs.molecularWeight || ''}
            onChange={(e) => handleInputChange('molecularWeight', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="0.0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Mass (g)
            {calculationMode === 'mass' && <span className="text-blue-500 ml-1">← calculating</span>}
          </label>
          <input
            type="number"
            value={inputs.mass || ''}
            onChange={(e) => handleInputChange('mass', e.target.value)}
            disabled={calculationMode === 'mass'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode === 'mass' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0"
            step="0.001"
          />
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
      {Object.keys(results).length > 0 && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.molarity !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Molarity</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(results.molarity)} M
                </div>
              </div>
            )}
            {results.moles !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Moles</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(results.moles)} mol
                </div>
              </div>
            )}
            {results.volume !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Volume</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(results.volume)} L
                </div>
              </div>
            )}
            {results.mass !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Mass</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(results.mass)} g
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Key Formulas</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Molarity (M) = Moles (mol) ÷ Volume (L)</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Moles (mol) = Mass (g) ÷ Molecular Weight (g/mol)</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Mass (g) = Moles (mol) × Molecular Weight (g/mol)</strong>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Enter known values and select what you want to calculate</li>
          <li>• Molarity is concentration in moles per liter (mol/L)</li>
          <li>• Use molecular weight from periodic table or compound databases</li>
          <li>• Remember to convert mL to L (divide by 1000)</li>
          <li>• Results are rounded to 4 decimal places for accuracy</li>
        </ul>
      </div>
    </div>
  );
}