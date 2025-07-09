'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ConcentrationUnit {
  id: string;
  name: string;
  symbol: string;
  description: string;
  requiresMW?: boolean;
  requiresDensity?: boolean;
}

const concentrationUnits: ConcentrationUnit[] = [
  { id: 'molarity', name: 'Molarity', symbol: 'M', description: 'Moles of solute per liter of solution' },
  { id: 'molality', name: 'Molality', symbol: 'm', description: 'Moles of solute per kg of solvent', requiresMW: true, requiresDensity: true },
  { id: 'mass_percent', name: 'Mass Percent', symbol: '% w/w', description: 'Mass of solute per 100g of solution', requiresMW: true, requiresDensity: true },
  { id: 'volume_percent', name: 'Volume Percent', symbol: '% v/v', description: 'Volume of solute per 100mL of solution' },
  { id: 'mass_volume_percent', name: 'Mass/Volume Percent', symbol: '% w/v', description: 'Mass of solute per 100mL of solution', requiresMW: true },
  { id: 'ppm', name: 'Parts per Million', symbol: 'ppm', description: 'mg of solute per L of solution (for dilute aqueous solutions)', requiresMW: true },
  { id: 'ppb', name: 'Parts per Billion', symbol: 'ppb', description: 'μg of solute per L of solution (for very dilute solutions)', requiresMW: true },
  { id: 'normality', name: 'Normality', symbol: 'N', description: 'Equivalents of solute per liter of solution', requiresMW: true },
  { id: 'mg_per_l', name: 'Milligrams per Liter', symbol: 'mg/L', description: 'Mass concentration in mg per L', requiresMW: true },
  { id: 'ug_per_ml', name: 'Micrograms per mL', symbol: 'μg/mL', description: 'Mass concentration in μg per mL', requiresMW: true }
];

export default function ConcentrationConverter() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [fromUnit, setFromUnit] = useState('molarity');
  const [toUnit, setToUnit] = useState('mass_volume_percent');
  const [inputValue, setInputValue] = useState('');
  const [molecularWeight, setMolecularWeight] = useState('');
  const [density, setDensity] = useState('1.0'); // g/mL
  const [equivalents, setEquivalents] = useState('1'); // for normality
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fromUnitData = concentrationUnits.find(u => u.id === fromUnit);
  const toUnitData = concentrationUnits.find(u => u.id === toUnit);

  const needsMW = fromUnitData?.requiresMW || toUnitData?.requiresMW;
  const needsDensity = fromUnitData?.requiresDensity || toUnitData?.requiresDensity;

  const convertConcentration = () => {
    setError(null);
    
    if (!inputValue) {
      setError('Please enter a concentration value');
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    if (needsMW && (!molecularWeight || parseFloat(molecularWeight) <= 0)) {
      setError('Please enter a valid molecular weight');
      return;
    }

    if (needsDensity && (!density || parseFloat(density) <= 0)) {
      setError('Please enter a valid solution density');
      return;
    }

    const mw = parseFloat(molecularWeight) || 1;
    const rho = parseFloat(density) || 1;
    const eq = parseFloat(equivalents) || 1;

    try {
      // Convert input to molarity first
      let molarity: number;

      switch (fromUnit) {
        case 'molarity':
          molarity = value;
          break;
        case 'molality':
          // m = M / (ρ - M × MW/1000)
          // Rearranging: M = m × ρ / (1 + m × MW/1000)
          molarity = (value * rho) / (1 + (value * mw / 1000));
          break;
        case 'mass_percent':
          // % w/w to M: (% × ρ × 10) / MW
          molarity = (value * rho * 10) / mw;
          break;
        case 'mass_volume_percent':
          // % w/v to M: (% × 10) / MW
          molarity = (value * 10) / mw;
          break;
        case 'ppm':
          // ppm to M: ppm / MW / 1000
          molarity = value / (mw * 1000);
          break;
        case 'ppb':
          // ppb to M: ppb / MW / 1,000,000
          molarity = value / (mw * 1000000);
          break;
        case 'normality':
          // N to M: N / equivalents
          molarity = value / eq;
          break;
        case 'mg_per_l':
          // mg/L to M: (mg/L) / MW / 1000
          molarity = value / (mw * 1000);
          break;
        case 'ug_per_ml':
          // μg/mL to M: (μg/mL) / MW
          molarity = value / mw;
          break;
        default:
          molarity = value;
      }

      // Convert molarity to target unit
      let convertedValue: number;

      switch (toUnit) {
        case 'molarity':
          convertedValue = molarity;
          break;
        case 'molality':
          // M to m: M / (ρ - M × MW/1000)
          convertedValue = molarity / (rho - (molarity * mw / 1000));
          break;
        case 'mass_percent':
          // M to % w/w: (M × MW) / (ρ × 10)
          convertedValue = (molarity * mw) / (rho * 10);
          break;
        case 'mass_volume_percent':
          // M to % w/v: (M × MW) / 10
          convertedValue = (molarity * mw) / 10;
          break;
        case 'ppm':
          // M to ppm: M × MW × 1000
          convertedValue = molarity * mw * 1000;
          break;
        case 'ppb':
          // M to ppb: M × MW × 1,000,000
          convertedValue = molarity * mw * 1000000;
          break;
        case 'normality':
          // M to N: M × equivalents
          convertedValue = molarity * eq;
          break;
        case 'mg_per_l':
          // M to mg/L: M × MW × 1000
          convertedValue = molarity * mw * 1000;
          break;
        case 'ug_per_ml':
          // M to μg/mL: M × MW
          convertedValue = molarity * mw;
          break;
        default:
          convertedValue = molarity;
      }

      setResult(convertedValue);
    } catch (err) {
      setError('Error in conversion calculation. Please check your inputs.');
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result !== null) {
      setInputValue(result.toString());
      setResult(null);
    }
  };

  const formatResult = (value: number): string => {
    if (Math.abs(value) >= 1000000 || (Math.abs(value) < 0.001 && value !== 0)) {
      return value.toExponential(4);
    }
    return value.toFixed(6).replace(/\.?0+$/, '');
  };

  const clearAll = () => {
    setInputValue('');
    setResult(null);
    setError(null);
  };

  const loadExample = (example: { name: string; molarity: number; mw: number }) => {
    setInputValue(example.molarity.toString());
    setMolecularWeight(example.mw.toString());
    setFromUnit('molarity');
  };

  const commonSolutions = [
    { name: 'NaCl (table salt)', molarity: 1, mw: 58.44 },
    { name: 'Glucose', molarity: 0.1, mw: 180.16 },
    { name: 'HCl (hydrochloric acid)', molarity: 1, mw: 36.46 },
    { name: 'NaOH (sodium hydroxide)', molarity: 0.1, mw: 40.00 },
    { name: 'CaCl₂ (calcium chloride)', molarity: 0.5, mw: 110.98 },
    { name: 'KMnO₄ (potassium permanganate)', molarity: 0.02, mw: 158.03 }
  ];

  return (
    <div className="space-y-6">
      {/* Unit Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <label className="block text-sm font-medium">From Unit</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            {concentrationUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
          <p className="text-xs text-foreground/60">
            {fromUnitData?.description}
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={swapUnits}
            className="p-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 transition-colors"
            title="Swap units"
          >
            <span className="text-xl">⇄</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">To Unit</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            {concentrationUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
          <p className="text-xs text-foreground/60">
            {toUnitData?.description}
          </p>
        </div>
      </div>

      {/* Input Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Concentration Value
          </label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && convertConcentration()}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="Enter concentration"
            step="any"
          />
        </div>

        {needsMW && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Molecular Weight (g/mol)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={molecularWeight}
              onChange={(e) => setMolecularWeight(e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="e.g., 58.44"
              step="any"
            />
          </div>
        )}

        {needsDensity && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Solution Density (g/mL)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="e.g., 1.0"
              step="any"
            />
          </div>
        )}

        {(fromUnit === 'normality' || toUnit === 'normality') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Equivalents per Mole
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={equivalents}
              onChange={(e) => setEquivalents(e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="e.g., 1"
              step="any"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={convertConcentration}
          disabled={!inputValue}
          className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Convert
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

      {/* Result */}
      {result !== null && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Conversion Result</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatResult(result)}
            </div>
            <div className="text-foreground/60">
              {toUnitData?.symbol}
            </div>
            <div className="mt-4 text-sm text-foreground/70">
              {inputValue} {fromUnitData?.symbol} = {formatResult(result)} {toUnitData?.symbol}
            </div>
          </div>
        </div>
      )}

      {/* Common Solutions */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4">🧪 Common Solutions Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonSolutions.map((solution, index) => (
            <button
              key={index}
              onClick={() => loadExample(solution)}
              className="p-3 text-left border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
                {solution.name}
              </div>
              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                <div>MW: {solution.mw} g/mol</div>
                <div>Example: {solution.molarity} M</div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
          Click any solution to load its molecular weight and concentration
        </p>
      </div>

      {/* Conversion Equations */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-4">📐 Key Conversion Equations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-green-700 dark:text-green-300">
          <div>
            <strong>Basic Conversions:</strong>
            <ul className="mt-2 space-y-1 font-mono text-xs">
              <li>M → % w/v: (M × MW) / 10</li>
              <li>% w/v → M: (% × 10) / MW</li>
              <li>M → ppm: M × MW × 1000</li>
              <li>ppm → M: ppm / (MW × 1000)</li>
            </ul>
          </div>
          <div>
            <strong>Advanced Conversions:</strong>
            <ul className="mt-2 space-y-1 font-mono text-xs">
              <li>M → m: M / (ρ - M×MW/1000)</li>
              <li>m → M: (m × ρ) / (1 + m×MW/1000)</li>
              <li>M → N: M × equivalents</li>
              <li>% w/w → M: (% × ρ × 10) / MW</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-3">
          Where: M = molarity, m = molality, MW = molecular weight, ρ = density, % = percent
        </p>
      </div>

      {/* Unit Definitions */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-4">📚 Concentration Unit Definitions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-purple-700 dark:text-purple-300">
          <div>
            <strong>Molarity (M):</strong>
            <p className="mt-1">Moles of solute per liter of solution. Most common in chemistry labs.</p>
            
            <strong className="block mt-3">Molality (m):</strong>
            <p className="mt-1">Moles of solute per kg of solvent. Temperature-independent.</p>
            
            <strong className="block mt-3">Mass Percent (% w/w):</strong>
            <p className="mt-1">Mass of solute per 100g total solution mass.</p>
          </div>
          <div>
            <strong>ppm/ppb:</strong>
            <p className="mt-1">Parts per million/billion. Used for very dilute solutions.</p>
            
            <strong className="block mt-3">Normality (N):</strong>
            <p className="mt-1">Equivalents of solute per liter of solution. Used in acid-base chemistry.</p>
            
            <strong className="block mt-3">% w/v:</strong>
            <p className="mt-1">Mass of solute per 100mL of solution. Common in biological labs.</p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Usage Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Molarity is temperature-dependent; molality is not</li>
          <li>• For dilute aqueous solutions, density ≈ 1.0 g/mL</li>
          <li>• ppm = mg/L for aqueous solutions (assuming density = 1.0 g/mL)</li>
          <li>• Normality depends on the number of equivalents (H⁺, OH⁻, or electrons)</li>
          <li>• Always double-check molecular weights from reliable sources</li>
          <li>• % w/v is often used in biological applications (e.g., 0.9% NaCl)</li>
        </ul>
      </div>
    </div>
  );
}