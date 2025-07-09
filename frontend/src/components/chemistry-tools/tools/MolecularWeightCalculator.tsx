'use client';

import { useState } from 'react';

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
  { symbol: 'Sc', name: 'Scandium', atomicWeight: 44.96 },
  { symbol: 'Ti', name: 'Titanium', atomicWeight: 47.87 },
  { symbol: 'V', name: 'Vanadium', atomicWeight: 50.94 },
  { symbol: 'Cr', name: 'Chromium', atomicWeight: 52.00 },
  { symbol: 'Mn', name: 'Manganese', atomicWeight: 54.94 },
  { symbol: 'Fe', name: 'Iron', atomicWeight: 55.85 },
  { symbol: 'Co', name: 'Cobalt', atomicWeight: 58.93 },
  { symbol: 'Ni', name: 'Nickel', atomicWeight: 58.69 },
  { symbol: 'Cu', name: 'Copper', atomicWeight: 63.55 },
  { symbol: 'Zn', name: 'Zinc', atomicWeight: 65.38 },
  { symbol: 'Ga', name: 'Gallium', atomicWeight: 69.72 },
  { symbol: 'Ge', name: 'Germanium', atomicWeight: 72.63 },
  { symbol: 'As', name: 'Arsenic', atomicWeight: 74.92 },
  { symbol: 'Se', name: 'Selenium', atomicWeight: 78.97 },
  { symbol: 'Br', name: 'Bromine', atomicWeight: 79.90 },
  { symbol: 'Kr', name: 'Krypton', atomicWeight: 83.80 },
  { symbol: 'Rb', name: 'Rubidium', atomicWeight: 85.47 },
  { symbol: 'Sr', name: 'Strontium', atomicWeight: 87.62 },
  { symbol: 'Y', name: 'Yttrium', atomicWeight: 88.91 },
  { symbol: 'Zr', name: 'Zirconium', atomicWeight: 91.22 },
  { symbol: 'Nb', name: 'Niobium', atomicWeight: 92.91 },
  { symbol: 'Mo', name: 'Molybdenum', atomicWeight: 95.95 },
  { symbol: 'Tc', name: 'Technetium', atomicWeight: 98.00 },
  { symbol: 'Ru', name: 'Ruthenium', atomicWeight: 101.1 },
  { symbol: 'Rh', name: 'Rhodium', atomicWeight: 102.9 },
  { symbol: 'Pd', name: 'Palladium', atomicWeight: 106.4 },
  { symbol: 'Ag', name: 'Silver', atomicWeight: 107.9 },
  { symbol: 'Cd', name: 'Cadmium', atomicWeight: 112.4 },
  { symbol: 'In', name: 'Indium', atomicWeight: 114.8 },
  { symbol: 'Sn', name: 'Tin', atomicWeight: 118.7 },
  { symbol: 'Sb', name: 'Antimony', atomicWeight: 121.8 },
  { symbol: 'Te', name: 'Tellurium', atomicWeight: 127.6 },
  { symbol: 'I', name: 'Iodine', atomicWeight: 126.9 },
  { symbol: 'Xe', name: 'Xenon', atomicWeight: 131.3 },
  { symbol: 'Cs', name: 'Cesium', atomicWeight: 132.9 },
  { symbol: 'Ba', name: 'Barium', atomicWeight: 137.3 },
  { symbol: 'La', name: 'Lanthanum', atomicWeight: 138.9 },
  { symbol: 'Ce', name: 'Cerium', atomicWeight: 140.1 },
  { symbol: 'Pr', name: 'Praseodymium', atomicWeight: 140.9 },
  { symbol: 'Nd', name: 'Neodymium', atomicWeight: 144.2 },
  { symbol: 'Pm', name: 'Promethium', atomicWeight: 145.0 },
  { symbol: 'Sm', name: 'Samarium', atomicWeight: 150.4 },
  { symbol: 'Eu', name: 'Europium', atomicWeight: 152.0 },
  { symbol: 'Gd', name: 'Gadolinium', atomicWeight: 157.3 },
  { symbol: 'Tb', name: 'Terbium', atomicWeight: 158.9 },
  { symbol: 'Dy', name: 'Dysprosium', atomicWeight: 162.5 },
  { symbol: 'Ho', name: 'Holmium', atomicWeight: 164.9 },
  { symbol: 'Er', name: 'Erbium', atomicWeight: 167.3 },
  { symbol: 'Tm', name: 'Thulium', atomicWeight: 168.9 },
  { symbol: 'Yb', name: 'Ytterbium', atomicWeight: 173.1 },
  { symbol: 'Lu', name: 'Lutetium', atomicWeight: 175.0 },
  { symbol: 'Hf', name: 'Hafnium', atomicWeight: 178.5 },
  { symbol: 'Ta', name: 'Tantalum', atomicWeight: 180.9 },
  { symbol: 'W', name: 'Tungsten', atomicWeight: 183.8 },
  { symbol: 'Re', name: 'Rhenium', atomicWeight: 186.2 },
  { symbol: 'Os', name: 'Osmium', atomicWeight: 190.2 },
  { symbol: 'Ir', name: 'Iridium', atomicWeight: 192.2 },
  { symbol: 'Pt', name: 'Platinum', atomicWeight: 195.1 },
  { symbol: 'Au', name: 'Gold', atomicWeight: 197.0 },
  { symbol: 'Hg', name: 'Mercury', atomicWeight: 200.6 },
  { symbol: 'Tl', name: 'Thallium', atomicWeight: 204.4 },
  { symbol: 'Pb', name: 'Lead', atomicWeight: 207.2 },
  { symbol: 'Bi', name: 'Bismuth', atomicWeight: 209.0 },
  { symbol: 'Po', name: 'Polonium', atomicWeight: 209.0 },
  { symbol: 'At', name: 'Astatine', atomicWeight: 210.0 },
  { symbol: 'Rn', name: 'Radon', atomicWeight: 222.0 },
  { symbol: 'Fr', name: 'Francium', atomicWeight: 223.0 },
  { symbol: 'Ra', name: 'Radium', atomicWeight: 226.0 },
  { symbol: 'Ac', name: 'Actinium', atomicWeight: 227.0 },
  { symbol: 'Th', name: 'Thorium', atomicWeight: 232.0 },
  { symbol: 'Pa', name: 'Protactinium', atomicWeight: 231.0 },
  { symbol: 'U', name: 'Uranium', atomicWeight: 238.0 }
];

interface ParsedElement {
  symbol: string;
  count: number;
  atomicWeight: number;
}

const commonCompounds = [
  { name: 'Water', formula: 'H2O' },
  { name: 'Carbon Dioxide', formula: 'CO2' },
  { name: 'Sodium Chloride', formula: 'NaCl' },
  { name: 'Glucose', formula: 'C6H12O6' },
  { name: 'Methane', formula: 'CH4' },
  { name: 'Ammonia', formula: 'NH3' },
  { name: 'Sulfuric Acid', formula: 'H2SO4' },
  { name: 'Calcium Carbonate', formula: 'CaCO3' },
  { name: 'Ethanol', formula: 'C2H6O' },
  { name: 'Hydrochloric Acid', formula: 'HCl' },
  { name: 'Sodium Hydroxide', formula: 'NaOH' },
  { name: 'Acetic Acid', formula: 'CH3COOH' }
];

export default function MolecularWeightCalculator() {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState<{
    molecularWeight: number;
    elements: ParsedElement[];
    totalAtoms: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseFormula = (formula: string): ParsedElement[] => {
    // Remove spaces and validate basic format
    const cleanFormula = formula.replace(/\s/g, '');
    if (!/^[A-Z][a-z]?(\d+)?(\([A-Z][a-z]?(\d+)?\)\d+|[A-Z][a-z]?(\d+)?)*$/.test(cleanFormula) && cleanFormula !== '') {
      throw new Error('Invalid chemical formula format');
    }

    let i = 0;
    const stack: Map<string, number>[] = [new Map()];

    while (i < cleanFormula.length) {
      if (cleanFormula[i] === '(') {
        stack.push(new Map());
        i++;
      } else if (cleanFormula[i] === ')') {
        i++;
        let multiplier = '';
        while (i < cleanFormula.length && /\d/.test(cleanFormula[i])) {
          multiplier += cleanFormula[i];
          i++;
        }
        const mult = parseInt(multiplier) || 1;
        
        const group = stack.pop()!;
        const current = stack[stack.length - 1];
        
        for (const [element, count] of group) {
          current.set(element, (current.get(element) || 0) + count * mult);
        }
      } else if (/[A-Z]/.test(cleanFormula[i])) {
        let element = cleanFormula[i];
        i++;
        
        while (i < cleanFormula.length && /[a-z]/.test(cleanFormula[i])) {
          element += cleanFormula[i];
          i++;
        }
        
        let count = '';
        while (i < cleanFormula.length && /\d/.test(cleanFormula[i])) {
          count += cleanFormula[i];
          i++;
        }
        
        const elementCount = parseInt(count) || 1;
        const current = stack[stack.length - 1];
        current.set(element, (current.get(element) || 0) + elementCount);
      } else {
        i++;
      }
    }

    const finalElements: ParsedElement[] = [];
    for (const [symbol, count] of stack[0]) {
      const element = elements.find(e => e.symbol === symbol);
      if (!element) {
        throw new Error(`Unknown element: ${symbol}`);
      }
      finalElements.push({
        symbol,
        count,
        atomicWeight: element.atomicWeight
      });
    }

    return finalElements.sort((a, b) => a.symbol.localeCompare(b.symbol));
  };

  const calculateMolecularWeight = () => {
    setError(null);
    
    if (!formula.trim()) {
      setError('Please enter a chemical formula');
      return;
    }

    try {
      const parsedElements = parseFormula(formula);
      const molecularWeight = parsedElements.reduce(
        (total, element) => total + (element.atomicWeight * element.count),
        0
      );
      const totalAtoms = parsedElements.reduce(
        (total, element) => total + element.count,
        0
      );

      setResult({
        molecularWeight,
        elements: parsedElements,
        totalAtoms
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error parsing formula');
    }
  };

  const loadCompound = (compound: { name: string; formula: string }) => {
    setFormula(compound.formula);
    setError(null);
  };

  const clearAll = () => {
    setFormula('');
    setResult(null);
    setError(null);
  };

  const formatWeight = (weight: number): string => {
    return weight.toFixed(3);
  };

  return (
    <div className="space-y-6">
      {/* Formula Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Chemical Formula
        </label>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && calculateMolecularWeight()}
          className="w-full p-3 border border-foreground/20 rounded-lg bg-background font-mono text-lg"
          placeholder="e.g., H2SO4, Ca(OH)2, C6H12O6"
        />
        <p className="text-xs text-foreground/60">
          Use parentheses for complex groups. Numbers after elements indicate count.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={calculateMolecularWeight}
          disabled={!formula.trim()}
          className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Calculate
        </button>
        <button
          onClick={clearAll}
          className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
        >
          Clear
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
          {/* Molecular Weight Result */}
          <div className="p-6 bg-foreground/5 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Molecular Weight</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatWeight(result.molecularWeight)}
              </div>
              <div className="text-foreground/60 mb-4">g/mol</div>
              <div className="text-sm text-foreground/70">
                Formula: <span className="font-mono">{formula}</span>
              </div>
              <div className="text-sm text-foreground/70">
                Total atoms: {result.totalAtoms}
              </div>
            </div>
          </div>

          {/* Element Breakdown */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-4">📊 Element Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-200 dark:border-green-700">
                    <th className="text-left py-2 text-green-800 dark:text-green-200">Element</th>
                    <th className="text-center py-2 text-green-800 dark:text-green-200">Symbol</th>
                    <th className="text-center py-2 text-green-800 dark:text-green-200">Count</th>
                    <th className="text-center py-2 text-green-800 dark:text-green-200">Atomic Weight</th>
                    <th className="text-center py-2 text-green-800 dark:text-green-200">Total Weight</th>
                    <th className="text-center py-2 text-green-800 dark:text-green-200">% Mass</th>
                  </tr>
                </thead>
                <tbody>
                  {result.elements.map((element, index) => {
                    const elementData = elements.find(e => e.symbol === element.symbol);
                    const totalWeight = element.atomicWeight * element.count;
                    const massPercent = (totalWeight / result.molecularWeight) * 100;

                    return (
                      <tr key={index} className="border-b border-green-100 dark:border-green-800/50">
                        <td className="py-2 text-green-700 dark:text-green-300">{elementData?.name}</td>
                        <td className="py-2 text-center text-green-700 dark:text-green-300 font-mono">{element.symbol}</td>
                        <td className="py-2 text-center text-green-700 dark:text-green-300">{element.count}</td>
                        <td className="py-2 text-center text-green-700 dark:text-green-300">{element.atomicWeight.toFixed(3)}</td>
                        <td className="py-2 text-center text-green-700 dark:text-green-300 font-medium">{totalWeight.toFixed(3)}</td>
                        <td className="py-2 text-center text-green-700 dark:text-green-300">{massPercent.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Common Compounds */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4">🧪 Common Compounds</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonCompounds.map((compound, index) => (
            <button
              key={index}
              onClick={() => loadCompound(compound)}
              className="p-3 text-left border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                {compound.name}
              </div>
              <div className="font-mono text-blue-700 dark:text-blue-300 text-xs">
                {compound.formula}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
          Click any compound to load its formula
        </p>
      </div>

      {/* Formula Guidelines */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-4">📝 Formula Writing Guidelines</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-purple-700 dark:text-purple-300">
          <div>
            <strong>Basic Rules:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Element symbols are case-sensitive (Ca not ca)</li>
              <li>• Numbers after elements indicate count</li>
              <li>• Use parentheses for complex groups</li>
              <li>• No spaces in formula</li>
            </ul>
          </div>
          <div>
            <strong>Examples:</strong>
            <ul className="mt-2 space-y-1 font-mono">
              <li>• H2O (water)</li>
              <li>• Ca(OH)2 (calcium hydroxide)</li>
              <li>• Al2(SO4)3 (aluminum sulfate)</li>
              <li>• CH3COOH (acetic acid)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Atomic Weights Reference */}
      <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">⚛️ Quick Atomic Weights Reference</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
          {elements.slice(0, 30).map((element) => (
            <div key={element.symbol} className="text-center p-2 border border-gray-200 dark:border-gray-700 rounded">
              <div className="font-mono font-bold text-gray-800 dark:text-gray-200">{element.symbol}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{element.atomicWeight}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
          Showing first 30 elements. All elements supported in calculations.
        </p>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Usage Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Molecular weight is the sum of all atomic weights in the formula</li>
          <li>• Results show mass percentage of each element</li>
          <li>• Use for stoichiometry calculations and solution preparations</li>
          <li>• Double-check complex formulas with parentheses carefully</li>
          <li>• Atomic weights are based on IUPAC standard values</li>
          <li>• Total atoms count helps verify formula correctness</li>
        </ul>
      </div>
    </div>
  );
}