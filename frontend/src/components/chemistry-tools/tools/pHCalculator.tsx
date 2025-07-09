'use client';

import { useState } from 'react';

interface pHCalculation {
  pH?: number;
  pOH?: number;
  hydrogenConcentration?: number;
  hydroxideConcentration?: number;
}

export default function PHCalculator() {
  const [inputs, setInputs] = useState<pHCalculation>({
    pH: undefined,
    pOH: undefined,
    hydrogenConcentration: undefined,
    hydroxideConcentration: undefined,
  });

  const [calculationMode, setCalculationMode] = useState<'pH' | 'pOH' | 'hydrogen' | 'hydroxide'>('pH');
  const [results, setResults] = useState<pHCalculation>({});

  const handleInputChange = (field: keyof pHCalculation, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateFrompH = (pH: number) => {
    const pOH = 14 - pH;
    const hydrogenConcentration = Math.pow(10, -pH);
    const hydroxideConcentration = Math.pow(10, -pOH);
    
    return {
      pH,
      pOH,
      hydrogenConcentration,
      hydroxideConcentration
    };
  };

  const calculateFrompOH = (pOH: number) => {
    const pH = 14 - pOH;
    const hydrogenConcentration = Math.pow(10, -pH);
    const hydroxideConcentration = Math.pow(10, -pOH);
    
    return {
      pH,
      pOH,
      hydrogenConcentration,
      hydroxideConcentration
    };
  };

  const calculateFromHydrogen = (hydrogenConcentration: number) => {
    const pH = -Math.log10(hydrogenConcentration);
    const pOH = 14 - pH;
    const hydroxideConcentration = Math.pow(10, -pOH);
    
    return {
      pH,
      pOH,
      hydrogenConcentration,
      hydroxideConcentration
    };
  };

  const calculateFromHydroxide = (hydroxideConcentration: number) => {
    const pOH = -Math.log10(hydroxideConcentration);
    const pH = 14 - pOH;
    const hydrogenConcentration = Math.pow(10, -pH);
    
    return {
      pH,
      pOH,
      hydrogenConcentration,
      hydroxideConcentration
    };
  };

  const performCalculation = () => {
    let results: pHCalculation = {};

    switch (calculationMode) {
      case 'pH':
        if (inputs.pH !== undefined) {
          results = calculateFrompH(inputs.pH);
        }
        break;
      case 'pOH':
        if (inputs.pOH !== undefined) {
          results = calculateFrompOH(inputs.pOH);
        }
        break;
      case 'hydrogen':
        if (inputs.hydrogenConcentration !== undefined) {
          results = calculateFromHydrogen(inputs.hydrogenConcentration);
        }
        break;
      case 'hydroxide':
        if (inputs.hydroxideConcentration !== undefined) {
          results = calculateFromHydroxide(inputs.hydroxideConcentration);
        }
        break;
    }

    setResults(results);
  };

  const clearAll = () => {
    setInputs({});
    setResults({});
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '';
    if (num < 0.0001) return num.toExponential(3);
    return num.toFixed(4);
  };

  const formatConcentration = (num: number | undefined): string => {
    if (num === undefined) return '';
    return num.toExponential(3);
  };

  const getpHDescription = (pH: number | undefined): string => {
    if (pH === undefined) return '';
    if (pH < 7) return 'Acidic';
    if (pH === 7) return 'Neutral';
    return 'Basic/Alkaline';
  };

  const getpHColor = (pH: number | undefined): string => {
    if (pH === undefined) return 'text-gray-500';
    if (pH < 7) return 'text-red-600';
    if (pH === 7) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Calculation Mode Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">What do you want to calculate from?</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { mode: 'pH', label: 'pH', description: '-log[H⁺]' },
            { mode: 'pOH', label: 'pOH', description: '-log[OH⁻]' },
            { mode: 'hydrogen', label: '[H⁺]', description: 'H⁺ concentration' },
            { mode: 'hydroxide', label: '[OH⁻]', description: 'OH⁻ concentration' }
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => setCalculationMode(option.mode as 'pH' | 'pOH' | 'hydrogen' | 'hydroxide')}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            pH
            {calculationMode === 'pH' && <span className="text-blue-500 ml-1">← input value</span>}
          </label>
          <input
            type="number"
            value={inputs.pH || ''}
            onChange={(e) => handleInputChange('pH', e.target.value)}
            disabled={calculationMode !== 'pH'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode !== 'pH' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0 - 14.0"
            step="0.01"
            min="0"
            max="14"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            pOH
            {calculationMode === 'pOH' && <span className="text-blue-500 ml-1">← input value</span>}
          </label>
          <input
            type="number"
            value={inputs.pOH || ''}
            onChange={(e) => handleInputChange('pOH', e.target.value)}
            disabled={calculationMode !== 'pOH'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode !== 'pOH' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="0.0 - 14.0"
            step="0.01"
            min="0"
            max="14"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            [H⁺] Concentration (M)
            {calculationMode === 'hydrogen' && <span className="text-blue-500 ml-1">← input value</span>}
          </label>
          <input
            type="number"
            value={inputs.hydrogenConcentration || ''}
            onChange={(e) => handleInputChange('hydrogenConcentration', e.target.value)}
            disabled={calculationMode !== 'hydrogen'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode !== 'hydrogen' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="e.g., 1e-7"
            step="any"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            [OH⁻] Concentration (M)
            {calculationMode === 'hydroxide' && <span className="text-blue-500 ml-1">← input value</span>}
          </label>
          <input
            type="number"
            value={inputs.hydroxideConcentration || ''}
            onChange={(e) => handleInputChange('hydroxideConcentration', e.target.value)}
            disabled={calculationMode !== 'hydroxide'}
            className={`w-full p-3 border rounded-lg ${
              calculationMode !== 'hydroxide' 
                ? 'bg-foreground/5 cursor-not-allowed' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="e.g., 1e-7"
            step="any"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.pH !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">pH</div>
                <div className={`text-2xl font-bold ${getpHColor(results.pH)}`}>
                  {formatNumber(results.pH)}
                </div>
                <div className={`text-sm ${getpHColor(results.pH)}`}>
                  {getpHDescription(results.pH)}
                </div>
              </div>
            )}
            {results.pOH !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">pOH</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(results.pOH)}
                </div>
              </div>
            )}
            {results.hydrogenConcentration !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">[H⁺] Concentration</div>
                <div className="text-lg font-bold text-orange-600">
                  {formatConcentration(results.hydrogenConcentration)} M
                </div>
              </div>
            )}
            {results.hydroxideConcentration !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">[OH⁻] Concentration</div>
                <div className="text-lg font-bold text-teal-600">
                  {formatConcentration(results.hydroxideConcentration)} M
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* pH Scale Visual */}
      {results.pH !== undefined && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">pH Scale</h3>
          <div className="relative">
            <div className="h-8 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500"></div>
            <div className="flex justify-between text-xs mt-2">
              <span>0 (Very Acidic)</span>
              <span>7 (Neutral)</span>
              <span>14 (Very Basic)</span>
            </div>
            {/* pH Indicator */}
            <div 
              className="absolute top-0 w-2 h-8 bg-black border-2 border-white rounded-sm"
              style={{ left: `${(results.pH / 14) * 100}%`, transform: 'translateX(-50%)' }}
            ></div>
          </div>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Key Formulas</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>pH = -log₁₀[H⁺]</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>pOH = -log₁₀[OH⁻]</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>pH + pOH = 14 (at 25°C)</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>[H⁺] × [OH⁻] = 1.0 × 10⁻¹⁴</strong>
          </div>
        </div>
      </div>

      {/* Common Examples */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">🧪 Common Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700 dark:text-green-300">
          <div>
            <strong>Acidic Solutions:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Lemon juice: pH ≈ 2</li>
              <li>• Coffee: pH ≈ 5</li>
              <li>• Vinegar: pH ≈ 2.4</li>
            </ul>
          </div>
          <div>
            <strong>Basic Solutions:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Baking soda: pH ≈ 9</li>
              <li>• Ammonia: pH ≈ 11</li>
              <li>• Soap: pH ≈ 10</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• pH &lt; 7 = acidic, pH = 7 = neutral, pH &gt; 7 = basic</li>
          <li>• Each pH unit represents a 10-fold change in acidity</li>
          <li>• Use scientific notation for very small concentrations</li>
          <li>• Temperature affects pH calculations (formulas assume 25°C)</li>
          <li>• Pure water at 25°C has pH = 7 and [H⁺] = [OH⁻] = 1.0 × 10⁻⁷ M</li>
        </ul>
      </div>
    </div>
  );
}