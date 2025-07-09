'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ElementInput {
  symbol: string;
  mass: string;
  percentage: string;
}

interface Element {
  symbol: string;
  name: string;
  atomicWeight: number;
}

const elements: Element[] = [
  { symbol: 'H', name: 'Hydrogen', atomicWeight: 1.008 },
  { symbol: 'He', name: 'Helium', atomicWeight: 4.003 },
  { symbol: 'Li', name: 'Lithium', atomicWeight: 6.941 },
  { symbol: 'Be', name: 'Beryllium', atomicWeight: 9.012 },
  { symbol: 'B', name: 'Boron', atomicWeight: 10.81 },
  { symbol: 'C', name: 'Carbon', atomicWeight: 12.01 },
  { symbol: 'N', name: 'Nitrogen', atomicWeight: 14.01 },
  { symbol: 'O', name: 'Oxygen', atomicWeight: 16.00 },
  { symbol: 'F', name: 'Fluorine', atomicWeight: 19.00 },
  { symbol: 'Ne', name: 'Neon', atomicWeight: 20.18 },
  { symbol: 'Na', name: 'Sodium', atomicWeight: 22.99 },
  { symbol: 'Mg', name: 'Magnesium', atomicWeight: 24.31 },
  { symbol: 'Al', name: 'Aluminum', atomicWeight: 26.98 },
  { symbol: 'Si', name: 'Silicon', atomicWeight: 28.09 },
  { symbol: 'P', name: 'Phosphorus', atomicWeight: 30.97 },
  { symbol: 'S', name: 'Sulfur', atomicWeight: 32.07 },
  { symbol: 'Cl', name: 'Chlorine', atomicWeight: 35.45 },
  { symbol: 'Ar', name: 'Argon', atomicWeight: 39.95 },
  { symbol: 'K', name: 'Potassium', atomicWeight: 39.10 },
  { symbol: 'Ca', name: 'Calcium', atomicWeight: 40.08 },
  { symbol: 'Cr', name: 'Chromium', atomicWeight: 52.00 },
  { symbol: 'Mn', name: 'Manganese', atomicWeight: 54.94 },
  { symbol: 'Fe', name: 'Iron', atomicWeight: 55.85 },
  { symbol: 'Co', name: 'Cobalt', atomicWeight: 58.93 },
  { symbol: 'Ni', name: 'Nickel', atomicWeight: 58.69 },
  { symbol: 'Cu', name: 'Copper', atomicWeight: 63.55 },
  { symbol: 'Zn', name: 'Zinc', atomicWeight: 65.38 },
  { symbol: 'Br', name: 'Bromine', atomicWeight: 79.90 },
  { symbol: 'Ag', name: 'Silver', atomicWeight: 107.9 },
  { symbol: 'I', name: 'Iodine', atomicWeight: 126.9 },
  { symbol: 'Ba', name: 'Barium', atomicWeight: 137.3 },
  { symbol: 'Pb', name: 'Lead', atomicWeight: 207.2 }
];

interface CalculationResult {
  empiricalFormula: string;
  molecularFormula: string;
  empiricalMass: number;
  molecularMass: number;
  multiplier: number;
  elements: {
    symbol: string;
    moles: number;
    ratio: number;
    subscript: number;
  }[];
}

const exampleCompounds = [
  {
    name: 'Glucose',
    elements: [
      { symbol: 'C', percentage: '40.00' },
      { symbol: 'H', percentage: '6.71' },
      { symbol: 'O', percentage: '53.29' }
    ],
    molecularMass: 180.16
  },
  {
    name: 'Caffeine',
    elements: [
      { symbol: 'C', percentage: '49.48' },
      { symbol: 'H', percentage: '5.15' },
      { symbol: 'N', percentage: '28.87' },
      { symbol: 'O', percentage: '16.49' }
    ],
    molecularMass: 194.19
  },
  {
    name: 'Aspirin',
    elements: [
      { symbol: 'C', percentage: '60.00' },
      { symbol: 'H', percentage: '4.48' },
      { symbol: 'O', percentage: '35.52' }
    ],
    molecularMass: 180.16
  }
];

export default function EmpiricalFormulaCalculator() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [inputMode, setInputMode] = useState<'percentage' | 'mass'>('percentage');
  const [elementInputs, setElementInputs] = useState<ElementInput[]>([
    { symbol: 'C', mass: '', percentage: '' },
    { symbol: 'H', mass: '', percentage: '' }
  ]);
  const [molecularMass, setMolecularMass] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addElement = () => {
    setElementInputs([...elementInputs, { symbol: 'O', mass: '', percentage: '' }]);
  };

  const removeElement = (index: number) => {
    if (elementInputs.length > 1) {
      const newInputs = elementInputs.filter((_, i) => i !== index);
      setElementInputs(newInputs);
    }
  };

  const updateElement = (index: number, field: keyof ElementInput, value: string) => {
    const newInputs = [...elementInputs];
    newInputs[index][field] = value;
    setElementInputs(newInputs);
  };

  const calculateEmpiricalFormula = () => {
    setError(null);

    // Validate inputs
    const validInputs = elementInputs.filter(input => {
      const value = inputMode === 'percentage' ? input.percentage : input.mass;
      return input.symbol && value && parseFloat(value) > 0;
    });

    if (validInputs.length < 2) {
      setError('Please enter at least 2 elements with valid values');
      return;
    }

    // Check for duplicate elements
    const symbols = validInputs.map(input => input.symbol);
    if (new Set(symbols).size !== symbols.length) {
      setError('Duplicate elements found. Each element should appear only once.');
      return;
    }

    try {
      // Calculate moles for each element
      const elementData = validInputs.map(input => {
        const element = elements.find(e => e.symbol === input.symbol);
        if (!element) {
          throw new Error(`Unknown element: ${input.symbol}`);
        }

        let mass: number;
        if (inputMode === 'percentage') {
          mass = parseFloat(input.percentage);
          // Normalize percentages if they don't add up to 100
          const totalPercentage = validInputs.reduce((sum, inp) => sum + parseFloat(inp.percentage), 0);
          if (Math.abs(totalPercentage - 100) > 0.1) {
            mass = (mass / totalPercentage) * 100;
          }
        } else {
          mass = parseFloat(input.mass);
        }

        const moles = mass / element.atomicWeight;
        
        return {
          symbol: input.symbol,
          atomicWeight: element.atomicWeight,
          mass,
          moles
        };
      });

      // Find the smallest number of moles
      const minMoles = Math.min(...elementData.map(e => e.moles));

      // Calculate mole ratios
      const ratios = elementData.map(e => ({
        ...e,
        ratio: e.moles / minMoles
      }));

      // Convert ratios to whole numbers
      const subscripts = convertToWholeNumbers(ratios.map(r => r.ratio));

      // Build empirical formula
      const empiricalElements = ratios.map((element, index) => ({
        symbol: element.symbol,
        moles: element.moles,
        ratio: element.ratio,
        subscript: subscripts[index]
      }));

      const empiricalFormula = buildFormula(empiricalElements);
      
      // Calculate empirical mass
      const empiricalMass = empiricalElements.reduce(
        (sum, element) => {
          const atomicWeight = elements.find(e => e.symbol === element.symbol)?.atomicWeight || 0;
          return sum + (atomicWeight * element.subscript);
        },
        0
      );

      // Calculate molecular formula if molecular mass is provided
      let molecularFormula = empiricalFormula;
      let multiplier = 1;
      let molMass = empiricalMass;

      if (molecularMass && parseFloat(molecularMass) > 0) {
        molMass = parseFloat(molecularMass);
        multiplier = Math.round(molMass / empiricalMass);
        
        if (multiplier > 1) {
          const molecularElements = empiricalElements.map(element => ({
            ...element,
            subscript: element.subscript * multiplier
          }));
          molecularFormula = buildFormula(molecularElements);
        }
      }

      setResult({
        empiricalFormula,
        molecularFormula,
        empiricalMass,
        molecularMass: molMass,
        multiplier,
        elements: empiricalElements
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error in calculation');
    }
  };

  const convertToWholeNumbers = (ratios: number[]): number[] => {
    // Try different multipliers to find whole numbers
    for (let multiplier = 1; multiplier <= 12; multiplier++) {
      const multiplied = ratios.map(r => r * multiplier);
      const rounded = multiplied.map(r => Math.round(r));
      
      // Check if all values are close to whole numbers
      const isWhole = multiplied.every((val, i) => Math.abs(val - rounded[i]) < 0.1);
      
      if (isWhole) {
        return rounded;
      }
    }
    
    // If no good multiplier found, round the original ratios
    return ratios.map(r => Math.round(r));
  };

  const buildFormula = (elements: { symbol: string; subscript: number }[]): string => {
    return elements
      .map(element => element.symbol + (element.subscript > 1 ? element.subscript : ''))
      .join('');
  };

  const loadExample = (example: typeof exampleCompounds[0]) => {
    const newInputs = example.elements.map(el => ({
      symbol: el.symbol,
      mass: '',
      percentage: el.percentage
    }));
    setElementInputs(newInputs);
    setMolecularMass(example.molecularMass.toString());
    setInputMode('percentage');
    setError(null);
    setResult(null);
  };

  const clearAll = () => {
    setElementInputs([
      { symbol: 'C', mass: '', percentage: '' },
      { symbol: 'H', mass: '', percentage: '' }
    ]);
    setMolecularMass('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Mode Selection */}
      <div className="flex space-x-4">
        <button
          onClick={() => setInputMode('percentage')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            inputMode === 'percentage'
              ? 'bg-foreground text-background'
              : 'bg-foreground/10 text-foreground hover:bg-foreground/20'
          }`}
        >
          Mass Percentages
        </button>
        <button
          onClick={() => setInputMode('mass')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            inputMode === 'mass'
              ? 'bg-foreground text-background'
              : 'bg-foreground/10 text-foreground hover:bg-foreground/20'
          }`}
        >
          Mass Values
        </button>
      </div>

      {/* Element Inputs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Element Composition</h3>
          <button
            onClick={addElement}
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            + Add Element
          </button>
        </div>

        {elementInputs.map((input, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Element</label>
              <select
                value={input.symbol}
                onChange={(e) => updateElement(index, 'symbol', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              >
                {elements.map((element) => (
                  <option key={element.symbol} value={element.symbol}>
                    {element.symbol} - {element.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {inputMode === 'percentage' ? 'Mass Percentage (%)' : 'Mass (g)'}
              </label>
              <input
                type="number"
                value={inputMode === 'percentage' ? input.percentage : input.mass}
                onChange={(e) => updateElement(index, inputMode === 'percentage' ? 'percentage' : 'mass', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder={inputMode === 'percentage' ? 'e.g., 40.0' : 'e.g., 2.4'}
                step="any"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Atomic Weight</label>
              <input
                type="text"
                value={elements.find(e => e.symbol === input.symbol)?.atomicWeight.toFixed(3) || ''}
                disabled
                className="w-full p-3 border border-foreground/20 rounded-lg bg-foreground/5 text-foreground/60"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium invisible">Action</label>
              <button
                onClick={() => removeElement(index)}
                disabled={elementInputs.length <= 1}
                className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Molecular Mass Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Molecular Mass (optional - for molecular formula calculation)
        </label>
        <input
          type="number"
          value={molecularMass}
          onChange={(e) => setMolecularMass(e.target.value)}
          className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          placeholder="e.g., 180.16 g/mol"
          step="any"
        />
        <p className="text-xs text-foreground/60">
          Enter the known molecular mass to calculate the molecular formula
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={calculateEmpiricalFormula}
          className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
        >
          Calculate Formula
        </button>
        <button
          onClick={clearAll}
          className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Formula Results */}
          <div className="p-6 bg-foreground/5 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Formula Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-sm text-foreground/60 mb-2">Empirical Formula</div>
                <div className="text-3xl font-bold text-blue-600 mb-2 font-mono">
                  {result.empiricalFormula}
                </div>
                <div className="text-sm text-foreground/70">
                  Molecular Weight: {result.empiricalMass.toFixed(3)} g/mol
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-foreground/60 mb-2">Molecular Formula</div>
                <div className="text-3xl font-bold text-green-600 mb-2 font-mono">
                  {result.molecularFormula}
                </div>
                <div className="text-sm text-foreground/70">
                  Molecular Weight: {result.molecularMass.toFixed(3)} g/mol
                </div>
                {result.multiplier > 1 && (
                  <div className="text-xs text-foreground/60 mt-1">
                    Multiplier: {result.multiplier}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calculation Details */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-4">📊 Calculation Details</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-200 dark:border-green-700">
                    <th className="text-left py-2 text-green-800 dark:text-green-200">Element</th>
                    <th className="text-center py-2 text-green-800 dark:text-green-200">Moles</th>
                    <th className="text-center py-2 text-green-800 dark:text-green-200">Mole Ratio</th>
                    <th className="text-center py-2 text-green-800 dark:text-green-200">Subscript</th>
                  </tr>
                </thead>
                <tbody>
                  {result.elements.map((element, index) => (
                    <tr key={index} className="border-b border-green-100 dark:border-green-800/50">
                      <td className="py-2 text-green-700 dark:text-green-300 font-mono">{element.symbol}</td>
                      <td className="py-2 text-center text-green-700 dark:text-green-300">{element.moles.toFixed(4)}</td>
                      <td className="py-2 text-center text-green-700 dark:text-green-300">{element.ratio.toFixed(3)}</td>
                      <td className="py-2 text-center text-green-700 dark:text-green-300 font-medium">{element.subscript}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Example Compounds */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4">🧪 Example Compounds</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exampleCompounds.map((compound, index) => (
            <button
              key={index}
              onClick={() => loadExample(compound)}
              className="p-4 text-left border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
                {compound.name}
              </div>
              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                {compound.elements.map((el, i) => (
                  <div key={i}>{el.symbol}: {el.percentage}%</div>
                ))}
                <div className="mt-2 text-blue-600 dark:text-blue-400">
                  MW: {compound.molecularMass} g/mol
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
          Click any compound to load its composition data
        </p>
      </div>

      {/* Calculation Steps */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-4">📐 Calculation Steps</h4>
        <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
          <div>
            <strong>1. Convert to moles:</strong> Divide mass (or assume 100g for percentages) by atomic weight
          </div>
          <div>
            <strong>2. Find mole ratios:</strong> Divide all mole values by the smallest mole value
          </div>
          <div>
            <strong>3. Convert to whole numbers:</strong> Multiply ratios by appropriate factor to get integers
          </div>
          <div>
            <strong>4. Write empirical formula:</strong> Use whole number ratios as subscripts
          </div>
          <div>
            <strong>5. Find molecular formula:</strong> Multiply empirical formula by (molecular mass / empirical mass)
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Usage Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Mass percentages should ideally add up to 100%</li>
          <li>• The empirical formula shows the simplest whole number ratio</li>
          <li>• The molecular formula is a multiple of the empirical formula</li>
          <li>• Use mass spectrometry or other methods to determine molecular mass</li>
          <li>• Small rounding errors in percentages are automatically corrected</li>
          <li>• For combustion analysis, remember to account for all products</li>
        </ul>
      </div>
    </div>
  );
}