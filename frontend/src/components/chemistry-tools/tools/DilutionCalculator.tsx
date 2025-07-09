'use client';

import { useState } from 'react';

interface DilutionInputs {
  c1?: number; // Initial concentration
  v1?: number; // Initial volume
  c2?: number; // Final concentration
  v2?: number; // Final volume
}

export default function DilutionCalculator() {
  const [inputs, setInputs] = useState<DilutionInputs>({});
  const [calculationMode, setCalculationMode] = useState<'c1' | 'v1' | 'c2' | 'v2'>('v2');
  const [results, setResults] = useState<DilutionInputs>({});
  const [concentrationUnit, setConcentrationUnit] = useState('M');
  const [volumeUnit, setVolumeUnit] = useState('mL');

  const handleInputChange = (field: keyof DilutionInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const performCalculation = () => {
    const { c1, v1, c2, v2 } = inputs;
    const newResults: DilutionInputs = { ...inputs };

    // Using C1V1 = C2V2 formula
    switch (calculationMode) {
      case 'c1':
        if (v1 && c2 && v2) {
          newResults.c1 = (c2 * v2) / v1;
        }
        break;
      case 'v1':
        if (c1 && c2 && v2) {
          newResults.v1 = (c2 * v2) / c1;
        }
        break;
      case 'c2':
        if (c1 && v1 && v2) {
          newResults.c2 = (c1 * v1) / v2;
        }
        break;
      case 'v2':
        if (c1 && v1 && c2) {
          newResults.v2 = (c1 * v1) / c2;
        }
        break;
    }

    setResults(newResults);
  };

  const calculateDilutionFactor = () => {
    const { c1, c2 } = results;
    if (c1 && c2) {
      return c1 / c2;
    }
    return undefined;
  };

  const calculateWaterToAdd = () => {
    const { v1, v2 } = results;
    if (v1 && v2 && v2 > v1) {
      return v2 - v1;
    }
    return undefined;
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

  const dilutionFactor = calculateDilutionFactor();
  const waterToAdd = calculateWaterToAdd();

  return (
    <div className="space-y-6">
      {/* Calculation Mode Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">What do you want to calculate?</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { mode: 'c1', label: 'C₁', description: 'Initial concentration' },
            { mode: 'v1', label: 'V₁', description: 'Initial volume' },
            { mode: 'c2', label: 'C₂', description: 'Final concentration' },
            { mode: 'v2', label: 'V₂', description: 'Final volume' }
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => setCalculationMode(option.mode as 'c1' | 'v1' | 'c2' | 'v2')}
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

      {/* Unit Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Concentration Unit</label>
          <select
            value={concentrationUnit}
            onChange={(e) => setConcentrationUnit(e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            <option value="M">Molarity (M)</option>
            <option value="mM">Millimolar (mM)</option>
            <option value="μM">Micromolar (μM)</option>
            <option value="g/L">g/L</option>
            <option value="mg/mL">mg/mL</option>
            <option value="%">Percentage (%)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Volume Unit</label>
          <select
            value={volumeUnit}
            onChange={(e) => setVolumeUnit(e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            <option value="mL">Milliliters (mL)</option>
            <option value="L">Liters (L)</option>
            <option value="μL">Microliters (μL)</option>
          </select>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            C₁ - Initial Concentration ({concentrationUnit})
            {calculationMode === 'c1' && <span className="text-blue-500 ml-1">← calculating</span>}
          </label>
          <input
            type="number"
            value={inputs.c1 || ''}
            onChange={(e) => handleInputChange('c1', e.target.value)}
            disabled={calculationMode === 'c1'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode === 'c1' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0"
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            V₁ - Initial Volume ({volumeUnit})
            {calculationMode === 'v1' && <span className="text-blue-500 ml-1">← calculating</span>}
          </label>
          <input
            type="number"
            value={inputs.v1 || ''}
            onChange={(e) => handleInputChange('v1', e.target.value)}
            disabled={calculationMode === 'v1'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode === 'v1' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0"
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            C₂ - Final Concentration ({concentrationUnit})
            {calculationMode === 'c2' && <span className="text-blue-500 ml-1">← calculating</span>}
          </label>
          <input
            type="number"
            value={inputs.c2 || ''}
            onChange={(e) => handleInputChange('c2', e.target.value)}
            disabled={calculationMode === 'c2'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode === 'c2' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0"
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            V₂ - Final Volume ({volumeUnit})
            {calculationMode === 'v2' && <span className="text-blue-500 ml-1">← calculating</span>}
          </label>
          <input
            type="number"
            value={inputs.v2 || ''}
            onChange={(e) => handleInputChange('v2', e.target.value)}
            disabled={calculationMode === 'v2'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode === 'v2' 
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
      {Object.keys(results).some(key => results[key as keyof DilutionInputs] !== undefined) && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border border-foreground/20">
              <div className="text-sm text-foreground/60">C₁ (Initial)</div>
              <div className="text-xl font-bold text-blue-600">
                {formatNumber(results.c1)} {concentrationUnit}
              </div>
            </div>
            <div className="p-4 bg-background rounded-lg border border-foreground/20">
              <div className="text-sm text-foreground/60">V₁ (Initial)</div>
              <div className="text-xl font-bold text-green-600">
                {formatNumber(results.v1)} {volumeUnit}
              </div>
            </div>
            <div className="p-4 bg-background rounded-lg border border-foreground/20">
              <div className="text-sm text-foreground/60">C₂ (Final)</div>
              <div className="text-xl font-bold text-purple-600">
                {formatNumber(results.c2)} {concentrationUnit}
              </div>
            </div>
            <div className="p-4 bg-background rounded-lg border border-foreground/20">
              <div className="text-sm text-foreground/60">V₂ (Final)</div>
              <div className="text-xl font-bold text-orange-600">
                {formatNumber(results.v2)} {volumeUnit}
              </div>
            </div>
          </div>

          {/* Additional Calculations */}
          {(dilutionFactor || waterToAdd) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {dilutionFactor && (
                <div className="p-4 bg-background rounded-lg border border-foreground/20">
                  <div className="text-sm text-foreground/60">Dilution Factor</div>
                  <div className="text-xl font-bold text-red-600">
                    {formatNumber(dilutionFactor)}x
                  </div>
                  <div className="text-xs text-foreground/50 mt-1">
                    {dilutionFactor > 1 ? `${formatNumber(dilutionFactor)}-fold dilution` : 'Concentration'}
                  </div>
                </div>
              )}
              {waterToAdd && waterToAdd > 0 && (
                <div className="p-4 bg-background rounded-lg border border-foreground/20">
                  <div className="text-sm text-foreground/60">Water to Add</div>
                  <div className="text-xl font-bold text-cyan-600">
                    {formatNumber(waterToAdd)} {volumeUnit}
                  </div>
                  <div className="text-xs text-foreground/50 mt-1">
                    Volume of solvent needed
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Key Formulas</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>C₁V₁ = C₂V₂</strong> (Dilution equation)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Dilution Factor = C₁ ÷ C₂</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Volume to Add = V₂ - V₁</strong>
          </div>
        </div>
      </div>

      {/* Dilution Examples */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">🧪 Common Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700 dark:text-green-300">
          <div>
            <strong>Serial Dilutions:</strong>
            <ul className="mt-1 space-y-1">
              <li>• 1:10 dilution (10x)</li>
              <li>• 1:100 dilution (100x)</li>
              <li>• 1:1000 dilution (1000x)</li>
            </ul>
          </div>
          <div>
            <strong>Common Lab Dilutions:</strong>
            <ul className="mt-1 space-y-1">
              <li>• 1M to 0.1M (10x dilution)</li>
              <li>• Stock to working solution</li>
              <li>• Buffer preparation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Always add concentrated solution to water, not water to concentrated solution</li>
          <li>• Mix thoroughly after each addition</li>
          <li>• Use appropriate measuring devices for accuracy</li>
          <li>• Check units - ensure consistent volume and concentration units</li>
          <li>• For serial dilutions, calculate each step separately</li>
        </ul>
      </div>
    </div>
  );
}