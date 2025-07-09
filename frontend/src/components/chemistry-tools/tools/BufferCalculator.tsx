'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface BufferInputs {
  acidConcentration?: number;
  conjugateBaseConcentration?: number;
  pKa?: number;
  pH?: number;
  desiredpH?: number;
  totalVolume?: number;
  acidVolume?: number;
  baseVolume?: number;
}

export default function BufferCalculator() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [inputs, setInputs] = useState<BufferInputs>({});
  const [calculationMode, setCalculationMode] = useState<'pH' | 'ratio' | 'prepare'>('pH');
  const [results, setResults] = useState<BufferInputs>({});
  const [selectedBuffer, setSelectedBuffer] = useState('custom');

  // Common buffer systems
  const bufferSystems = [
    { id: 'custom', name: 'Custom Buffer', pKa: undefined, description: 'Enter your own pKa value' },
    { id: 'acetate', name: 'Acetate Buffer', pKa: 4.76, description: 'CH₃COOH/CH₃COO⁻' },
    { id: 'phosphate1', name: 'Phosphate Buffer (pH 2)', pKa: 2.15, description: 'H₃PO₄/H₂PO₄⁻' },
    { id: 'phosphate2', name: 'Phosphate Buffer (pH 7)', pKa: 7.21, description: 'H₂PO₄⁻/HPO₄²⁻' },
    { id: 'phosphate3', name: 'Phosphate Buffer (pH 12)', pKa: 12.32, description: 'HPO₄²⁻/PO₄³⁻' },
    { id: 'tris', name: 'Tris Buffer', pKa: 8.06, description: 'Tris-H⁺/Tris' },
    { id: 'bicarbonate', name: 'Bicarbonate Buffer', pKa: 6.35, description: 'H₂CO₃/HCO₃⁻' },
    { id: 'ammonia', name: 'Ammonia Buffer', pKa: 9.25, description: 'NH₄⁺/NH₃' },
    { id: 'citrate', name: 'Citrate Buffer', pKa: 6.40, description: 'Citric acid system' }
  ];

  const handleInputChange = (field: keyof BufferInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const handleBufferChange = (bufferId: string) => {
    setSelectedBuffer(bufferId);
    const buffer = bufferSystems.find(b => b.id === bufferId);
    if (buffer && buffer.pKa !== undefined) {
      setInputs(prev => ({ ...prev, pKa: buffer.pKa }));
    }
  };

  const performCalculation = () => {
    const { acidConcentration, conjugateBaseConcentration, pKa, desiredpH, totalVolume } = inputs;
    let newResults: BufferInputs = { ...inputs };

    switch (calculationMode) {
      case 'pH':
        // Henderson-Hasselbalch equation: pH = pKa + log([A⁻]/[HA])
        if (pKa && acidConcentration && conjugateBaseConcentration) {
          const ratio = conjugateBaseConcentration / acidConcentration;
          newResults.pH = pKa + Math.log10(ratio);
        }
        break;

      case 'ratio':
        // Calculate required ratio for desired pH
        if (pKa && desiredpH) {
          const logRatio = desiredpH - pKa;
          const ratio = Math.pow(10, logRatio);
          
          // If we have total concentration or volume, calculate individual concentrations
          if (acidConcentration) {
            newResults.conjugateBaseConcentration = acidConcentration * ratio;
          } else if (conjugateBaseConcentration) {
            newResults.acidConcentration = conjugateBaseConcentration / ratio;
          }
          
          newResults.pH = desiredpH;
          // Store the ratio for display
          newResults.desiredpH = ratio;
        }
        break;

      case 'prepare':
        // Calculate volumes needed for buffer preparation
        if (pKa && desiredpH && totalVolume && acidConcentration && conjugateBaseConcentration) {
          const logRatio = desiredpH - pKa;
          const ratio = Math.pow(10, logRatio);
          
          // Solve system of equations:
          // Va + Vb = Vtotal
          // (Cb * Vb) / (Ca * Va) = ratio
          // Therefore: Vb = ratio * Ca * Va / Cb
          // Substituting: Va + (ratio * Ca * Va / Cb) = Vtotal
          // Va * (1 + ratio * Ca / Cb) = Vtotal
          
          const denominator = 1 + (ratio * acidConcentration / conjugateBaseConcentration);
          newResults.acidVolume = totalVolume / denominator;
          newResults.baseVolume = totalVolume - newResults.acidVolume;
          newResults.pH = desiredpH;
        }
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

  const getBufferCapacity = () => {
    const { acidConcentration, conjugateBaseConcentration } = results;
    if (acidConcentration && conjugateBaseConcentration) {
      // Buffer capacity is maximum when [HA] = [A⁻]
      const totalConc = acidConcentration + conjugateBaseConcentration;
      const minConc = Math.min(acidConcentration, conjugateBaseConcentration);
      return (2.3 * totalConc * minConc) / Math.pow(totalConc, 2);
    }
    return undefined;
  };

  const getEffectiveRange = () => {
    const { pKa } = inputs;
    if (pKa) {
      return {
        lower: pKa - 1,
        upper: pKa + 1
      };
    }
    return undefined;
  };

  const bufferCapacity = getBufferCapacity();
  const effectiveRange = getEffectiveRange();

  return (
    <div className="space-y-6">
      {/* Buffer System Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Buffer System</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {bufferSystems.map((buffer) => (
            <button
              key={buffer.id}
              onClick={() => handleBufferChange(buffer.id)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                selectedBuffer === buffer.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="font-medium text-sm">{buffer.name}</div>
              <div className="text-xs text-foreground/60">{buffer.description}</div>
              {buffer.pKa && (
                <div className="text-xs text-foreground/50 mt-1">pKa = {buffer.pKa}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Calculation Mode */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">What do you want to calculate?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setCalculationMode('pH')}
            className={`p-3 text-left border rounded-lg transition-colors ${
              calculationMode === 'pH'
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 hover:bg-foreground/5'
            }`}
          >
            <div className="font-medium text-sm">Buffer pH</div>
            <div className="text-xs text-foreground/60">Calculate pH from concentrations</div>
          </button>
          <button
            onClick={() => setCalculationMode('ratio')}
            className={`p-3 text-left border rounded-lg transition-colors ${
              calculationMode === 'ratio'
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 hover:bg-foreground/5'
            }`}
          >
            <div className="font-medium text-sm">Concentration Ratio</div>
            <div className="text-xs text-foreground/60">Calculate ratio for desired pH</div>
          </button>
          <button
            onClick={() => setCalculationMode('prepare')}
            className={`p-3 text-left border rounded-lg transition-colors ${
              calculationMode === 'prepare'
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 hover:bg-foreground/5'
            }`}
          >
            <div className="font-medium text-sm">Buffer Preparation</div>
            <div className="text-xs text-foreground/60">Calculate volumes needed</div>
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {/* pKa */}
        <div>
          <label className="block text-sm font-medium mb-2">
            pKa of Weak Acid
          </label>
          <input
            type="number"
            value={inputs.pKa || ''}
            onChange={(e) => handleInputChange('pKa', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="e.g., 4.76 for acetic acid"
            step="0.01"
          />
        </div>

        {calculationMode === 'pH' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                [HA] - Acid Concentration (M)
              </label>
              <input
                type="number"
                value={inputs.acidConcentration || ''}
                onChange={(e) => handleInputChange('acidConcentration', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="0.0"
                step="0.001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                [A⁻] - Conjugate Base Concentration (M)
              </label>
              <input
                type="number"
                value={inputs.conjugateBaseConcentration || ''}
                onChange={(e) => handleInputChange('conjugateBaseConcentration', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="0.0"
                step="0.001"
              />
            </div>
          </div>
        )}

        {calculationMode === 'ratio' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Desired pH
              </label>
              <input
                type="number"
                value={inputs.desiredpH || ''}
                onChange={(e) => handleInputChange('desiredpH', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="7.0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                [HA] - Acid Concentration (M)
              </label>
              <input
                type="number"
                value={inputs.acidConcentration || ''}
                onChange={(e) => handleInputChange('acidConcentration', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="Optional"
                step="0.001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                [A⁻] - Base Concentration (M)
              </label>
              <input
                type="number"
                value={inputs.conjugateBaseConcentration || ''}
                onChange={(e) => handleInputChange('conjugateBaseConcentration', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="Optional"
                step="0.001"
              />
            </div>
          </div>
        )}

        {calculationMode === 'prepare' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Desired pH
              </label>
              <input
                type="number"
                value={inputs.desiredpH || ''}
                onChange={(e) => handleInputChange('desiredpH', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="7.0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Total Volume (mL)
              </label>
              <input
                type="number"
                value={inputs.totalVolume || ''}
                onChange={(e) => handleInputChange('totalVolume', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="100"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Acid Concentration (M)
              </label>
              <input
                type="number"
                value={inputs.acidConcentration || ''}
                onChange={(e) => handleInputChange('acidConcentration', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="0.1"
                step="0.001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Base Concentration (M)
              </label>
              <input
                type="number"
                value={inputs.conjugateBaseConcentration || ''}
                onChange={(e) => handleInputChange('conjugateBaseConcentration', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="0.1"
                step="0.001"
              />
            </div>
          </div>
        )}
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
      {Object.keys(results).some(key => results[key as keyof BufferInputs] !== undefined) && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.pH !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Buffer pH</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(results.pH)}
                </div>
              </div>
            )}
            {results.acidConcentration !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">[HA] Concentration</div>
                <div className="text-xl font-bold text-red-600">
                  {formatNumber(results.acidConcentration)} M
                </div>
              </div>
            )}
            {results.conjugateBaseConcentration !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">[A⁻] Concentration</div>
                <div className="text-xl font-bold text-green-600">
                  {formatNumber(results.conjugateBaseConcentration)} M
                </div>
              </div>
            )}
            {calculationMode === 'ratio' && results.desiredpH !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Required Ratio [A⁻]/[HA]</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatNumber(results.desiredpH)}
                </div>
              </div>
            )}
            {results.acidVolume !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Acid Volume</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatNumber(results.acidVolume)} mL
                </div>
              </div>
            )}
            {results.baseVolume !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Base Volume</div>
                <div className="text-xl font-bold text-teal-600">
                  {formatNumber(results.baseVolume)} mL
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {effectiveRange && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Effective Buffer Range</div>
                <div className="text-lg font-bold text-indigo-600">
                  pH {formatNumber(effectiveRange.lower)} - {formatNumber(effectiveRange.upper)}
                </div>
                <div className="text-xs text-foreground/50 mt-1">
                  pKa ± 1 unit
                </div>
              </div>
            )}
            {bufferCapacity && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Buffer Capacity (β)</div>
                <div className="text-lg font-bold text-pink-600">
                  {formatNumber(bufferCapacity)}
                </div>
                <div className="text-xs text-foreground/50 mt-1">
                  mol/L per pH unit
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Henderson-Hasselbalch Equation */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Henderson-Hasselbalch Equation</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center text-lg">
            <strong>pH = pKa + log([A⁻]/[HA])</strong>
          </div>
          <div className="text-xs text-center mt-2">
            Where [A⁻] is conjugate base concentration and [HA] is weak acid concentration
          </div>
        </div>
      </div>

      {/* Buffer Information */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">🧪 Buffer Properties</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700 dark:text-green-300">
          <div>
            <strong>Buffer Capacity:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Maximum when [HA] = [A⁻]</li>
              <li>• Decreases as ratio deviates from 1:1</li>
              <li>• Higher total concentration = higher capacity</li>
            </ul>
          </div>
          <div>
            <strong>Effective Range:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Best buffering: pKa ± 1 pH unit</li>
              <li>• Choose buffer with pKa near desired pH</li>
              <li>• Outside range: poor buffering</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Choose a buffer system with pKa within ±1 of your target pH</li>
          <li>• Higher concentrations provide better buffering capacity</li>
          <li>• Equal concentrations of acid and base give maximum buffering</li>
          <li>• Temperature affects pKa values - consider working temperature</li>
          <li>• Always prepare buffers fresh when possible</li>
          <li>• Use good quality reagents for critical applications</li>
        </ul>
      </div>
    </div>
  );
}