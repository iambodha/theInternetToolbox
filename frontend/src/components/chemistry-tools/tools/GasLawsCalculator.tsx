'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface GasLawInputs {
  pressure1?: number;
  volume1?: number;
  temperature1?: number;
  pressure2?: number;
  volume2?: number;
  temperature2?: number;
  moles?: number;
  gasConstant?: number;
}

type GasLaw = 'ideal' | 'boyles' | 'charles' | 'gay-lussac' | 'combined';

export default function GasLawsCalculator() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [selectedLaw, setSelectedLaw] = useState<GasLaw>('ideal');
  const [inputs, setInputs] = useState<GasLawInputs>({
    gasConstant: 0.0821 // L·atm/(mol·K)
  });
  const [calculationMode, setCalculationMode] = useState<string>('pressure');
  const [results, setResults] = useState<GasLawInputs>({});
  const [units, setUnits] = useState({
    pressure: 'atm',
    volume: 'L',
    temperature: 'K'
  });

  const gasLaws = [
    { id: 'ideal', name: 'Ideal Gas Law', formula: 'PV = nRT', description: 'Relates P, V, n, R, T' },
    { id: 'boyles', name: "Boyle's Law", formula: 'P₁V₁ = P₂V₂', description: 'Temperature constant' },
    { id: 'charles', name: "Charles' Law", formula: 'V₁/T₁ = V₂/T₂', description: 'Pressure constant' },
    { id: 'gay-lussac', name: "Gay-Lussac's Law", formula: 'P₁/T₁ = P₂/T₂', description: 'Volume constant' },
    { id: 'combined', name: 'Combined Gas Law', formula: 'P₁V₁/T₁ = P₂V₂/T₂', description: 'Moles constant' }
  ];

  const handleInputChange = (field: keyof GasLawInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const convertTemperature = (temp: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === toUnit) return temp;
    
    // Convert to Kelvin first
    let kelvin = temp;
    if (fromUnit === 'C') kelvin = temp + 273.15;
    if (fromUnit === 'F') kelvin = (temp - 32) * 5/9 + 273.15;
    
    // Convert from Kelvin to target
    if (toUnit === 'C') return kelvin - 273.15;
    if (toUnit === 'F') return (kelvin - 273.15) * 9/5 + 32;
    return kelvin;
  };

  const performCalculation = () => {
    const { pressure1, volume1, temperature1, pressure2, volume2, temperature2, moles, gasConstant } = inputs;
    let newResults: GasLawInputs = { ...inputs };

    // Convert temperatures to Kelvin for calculations
    const t1K = temperature1 ? convertTemperature(temperature1, units.temperature, 'K') : undefined;
    const t2K = temperature2 ? convertTemperature(temperature2, units.temperature, 'K') : undefined;

    switch (selectedLaw) {
      case 'ideal':
        // PV = nRT
        if (calculationMode === 'pressure' && volume1 && moles && gasConstant && t1K) {
          newResults.pressure1 = (moles * gasConstant * t1K) / volume1;
        } else if (calculationMode === 'volume' && pressure1 && moles && gasConstant && t1K) {
          newResults.volume1 = (moles * gasConstant * t1K) / pressure1;
        } else if (calculationMode === 'temperature' && pressure1 && volume1 && moles && gasConstant) {
          const tempK = (pressure1 * volume1) / (moles * gasConstant);
          newResults.temperature1 = convertTemperature(tempK, 'K', units.temperature);
        } else if (calculationMode === 'moles' && pressure1 && volume1 && gasConstant && t1K) {
          newResults.moles = (pressure1 * volume1) / (gasConstant * t1K);
        }
        break;

      case 'boyles':
        // P1V1 = P2V2
        if (calculationMode === 'pressure2' && pressure1 && volume1 && volume2) {
          newResults.pressure2 = (pressure1 * volume1) / volume2;
        } else if (calculationMode === 'volume2' && pressure1 && volume1 && pressure2) {
          newResults.volume2 = (pressure1 * volume1) / pressure2;
        } else if (calculationMode === 'pressure1' && pressure2 && volume1 && volume2) {
          newResults.pressure1 = (pressure2 * volume2) / volume1;
        } else if (calculationMode === 'volume1' && pressure1 && pressure2 && volume2) {
          newResults.volume1 = (pressure2 * volume2) / pressure1;
        }
        break;

      case 'charles':
        // V1/T1 = V2/T2
        if (calculationMode === 'volume2' && volume1 && t1K && t2K) {
          newResults.volume2 = (volume1 * t2K) / t1K;
        } else if (calculationMode === 'temperature2' && volume1 && volume2 && t1K) {
          const tempK = (volume2 * t1K) / volume1;
          newResults.temperature2 = convertTemperature(tempK, 'K', units.temperature);
        } else if (calculationMode === 'volume1' && volume2 && t1K && t2K) {
          newResults.volume1 = (volume2 * t1K) / t2K;
        } else if (calculationMode === 'temperature1' && volume1 && volume2 && t2K) {
          const tempK = (volume1 * t2K) / volume2;
          newResults.temperature1 = convertTemperature(tempK, 'K', units.temperature);
        }
        break;

      case 'gay-lussac':
        // P1/T1 = P2/T2
        if (calculationMode === 'pressure2' && pressure1 && t1K && t2K) {
          newResults.pressure2 = (pressure1 * t2K) / t1K;
        } else if (calculationMode === 'temperature2' && pressure1 && pressure2 && t1K) {
          const tempK = (pressure2 * t1K) / pressure1;
          newResults.temperature2 = convertTemperature(tempK, 'K', units.temperature);
        } else if (calculationMode === 'pressure1' && pressure2 && t1K && t2K) {
          newResults.pressure1 = (pressure2 * t1K) / t2K;
        } else if (calculationMode === 'temperature1' && pressure1 && pressure2 && t2K) {
          const tempK = (pressure1 * t2K) / pressure2;
          newResults.temperature1 = convertTemperature(tempK, 'K', units.temperature);
        }
        break;

      case 'combined':
        // P1V1/T1 = P2V2/T2
        if (calculationMode === 'pressure2' && pressure1 && volume1 && t1K && volume2 && t2K) {
          newResults.pressure2 = (pressure1 * volume1 * t2K) / (t1K * volume2);
        } else if (calculationMode === 'volume2' && pressure1 && volume1 && t1K && pressure2 && t2K) {
          newResults.volume2 = (pressure1 * volume1 * t2K) / (pressure2 * t1K);
        } else if (calculationMode === 'temperature2' && pressure1 && volume1 && t1K && pressure2 && volume2) {
          const tempK = (pressure2 * volume2 * t1K) / (pressure1 * volume1);
          newResults.temperature2 = convertTemperature(tempK, 'K', units.temperature);
        }
        break;
    }

    setResults(newResults);
  };

  const clearAll = () => {
    setInputs({ gasConstant: 0.0821 });
    setResults({});
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '';
    if (Math.abs(num) < 0.001 || Math.abs(num) > 1000) return num.toExponential(3);
    return num.toFixed(3);
  };

  const getAvailableCalculationModes = () => {
    switch (selectedLaw) {
      case 'ideal':
        return [
          { value: 'pressure', label: 'Pressure (P)' },
          { value: 'volume', label: 'Volume (V)' },
          { value: 'temperature', label: 'Temperature (T)' },
          { value: 'moles', label: 'Moles (n)' }
        ];
      case 'boyles':
        return [
          { value: 'pressure1', label: 'P₁ (Initial Pressure)' },
          { value: 'volume1', label: 'V₁ (Initial Volume)' },
          { value: 'pressure2', label: 'P₂ (Final Pressure)' },
          { value: 'volume2', label: 'V₂ (Final Volume)' }
        ];
      case 'charles':
        return [
          { value: 'volume1', label: 'V₁ (Initial Volume)' },
          { value: 'temperature1', label: 'T₁ (Initial Temperature)' },
          { value: 'volume2', label: 'V₂ (Final Volume)' },
          { value: 'temperature2', label: 'T₂ (Final Temperature)' }
        ];
      case 'gay-lussac':
        return [
          { value: 'pressure1', label: 'P₁ (Initial Pressure)' },
          { value: 'temperature1', label: 'T₁ (Initial Temperature)' },
          { value: 'pressure2', label: 'P₂ (Final Pressure)' },
          { value: 'temperature2', label: 'T₂ (Final Temperature)' }
        ];
      case 'combined':
        return [
          { value: 'pressure2', label: 'P₂ (Final Pressure)' },
          { value: 'volume2', label: 'V₂ (Final Volume)' },
          { value: 'temperature2', label: 'T₂ (Final Temperature)' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Gas Law Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Gas Law</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gasLaws.map((law) => (
            <button
              key={law.id}
              onClick={() => {
                setSelectedLaw(law.id as GasLaw);
                setResults({});
                setCalculationMode(getAvailableCalculationModes()[0]?.value || 'pressure');
              }}
              className={`p-4 text-left border rounded-lg transition-colors ${
                selectedLaw === law.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="font-medium text-sm">{law.name}</div>
              <div className="text-xs text-foreground/60 font-mono mt-1">{law.formula}</div>
              <div className="text-xs text-foreground/50 mt-1">{law.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calculation Mode */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">What do you want to calculate?</label>
        <select
          value={calculationMode}
          onChange={(e) => setCalculationMode(e.target.value)}
          className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
        >
          {getAvailableCalculationModes().map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>

      {/* Unit Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Pressure Unit</label>
          <select
            value={units.pressure}
            onChange={(e) => setUnits(prev => ({ ...prev, pressure: e.target.value }))}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            <option value="atm">Atmospheres (atm)</option>
            <option value="kPa">Kilopascals (kPa)</option>
            <option value="mmHg">mmHg (Torr)</option>
            <option value="Pa">Pascals (Pa)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Volume Unit</label>
          <select
            value={units.volume}
            onChange={(e) => setUnits(prev => ({ ...prev, volume: e.target.value }))}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            <option value="L">Liters (L)</option>
            <option value="mL">Milliliters (mL)</option>
            <option value="m³">Cubic meters (m³)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Temperature Unit</label>
          <select
            value={units.temperature}
            onChange={(e) => setUnits(prev => ({ ...prev, temperature: e.target.value }))}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            <option value="K">Kelvin (K)</option>
            <option value="C">Celsius (°C)</option>
            <option value="F">Fahrenheit (°F)</option>
          </select>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {selectedLaw === 'ideal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Pressure ({units.pressure})
                {calculationMode === 'pressure' && <span className="text-blue-500 ml-1">← calculating</span>}
              </label>
              <input
                type="number"
                value={inputs.pressure1 || ''}
                onChange={(e) => handleInputChange('pressure1', e.target.value)}
                disabled={calculationMode === 'pressure'}
                className={`w-full p-3 border rounded-lg ${
                  calculationMode === 'pressure' 
                    ? 'bg-foreground/5 cursor-not-allowed' 
                    : 'bg-background border-foreground/20'
                }`}
                placeholder="0.0"
                step="0.001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Volume ({units.volume})
                {calculationMode === 'volume' && <span className="text-blue-500 ml-1">← calculating</span>}
              </label>
              <input
                type="number"
                value={inputs.volume1 || ''}
                onChange={(e) => handleInputChange('volume1', e.target.value)}
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
                Temperature ({units.temperature})
                {calculationMode === 'temperature' && <span className="text-blue-500 ml-1">← calculating</span>}
              </label>
              <input
                type="number"
                value={inputs.temperature1 || ''}
                onChange={(e) => handleInputChange('temperature1', e.target.value)}
                disabled={calculationMode === 'temperature'}
                className={`w-full p-3 border rounded-lg ${
                  calculationMode === 'temperature' 
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
                Gas Constant (R)
              </label>
              <select
                value={inputs.gasConstant}
                onChange={(e) => handleInputChange('gasConstant', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              >
                <option value="0.0821">0.0821 L·atm/(mol·K)</option>
                <option value="8.314">8.314 J/(mol·K)</option>
                <option value="1.987">1.987 cal/(mol·K)</option>
                <option value="62.36">62.36 L·Torr/(mol·K)</option>
              </select>
            </div>
          </div>
        )}

        {/* Other gas law input fields... */}
        {selectedLaw !== 'ideal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Initial conditions */}
            <div className="space-y-4">
              <h4 className="font-medium">Initial Conditions</h4>
              {(selectedLaw === 'boyles' || selectedLaw === 'combined') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    P₁ ({units.pressure})
                    {calculationMode === 'pressure1' && <span className="text-blue-500 ml-1">← calculating</span>}
                  </label>
                  <input
                    type="number"
                    value={inputs.pressure1 || ''}
                    onChange={(e) => handleInputChange('pressure1', e.target.value)}
                    disabled={calculationMode === 'pressure1'}
                    className={`w-full p-3 border rounded-lg ${
                      calculationMode === 'pressure1' 
                        ? 'bg-foreground/5 cursor-not-allowed' 
                        : 'bg-background border-foreground/20'
                    }`}
                    placeholder="0.0"
                    step="0.001"
                  />
                </div>
              )}
              {(selectedLaw === 'charles' || selectedLaw === 'boyles' || selectedLaw === 'combined') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    V₁ ({units.volume})
                    {calculationMode === 'volume1' && <span className="text-blue-500 ml-1">← calculating</span>}
                  </label>
                  <input
                    type="number"
                    value={inputs.volume1 || ''}
                    onChange={(e) => handleInputChange('volume1', e.target.value)}
                    disabled={calculationMode === 'volume1'}
                    className={`w-full p-3 border rounded-lg ${
                      calculationMode === 'volume1' 
                        ? 'bg-foreground/5 cursor-not-allowed' 
                        : 'bg-background border-foreground/20'
                    }`}
                    placeholder="0.0"
                    step="0.001"
                  />
                </div>
              )}
              {(selectedLaw === 'charles' || selectedLaw === 'gay-lussac' || selectedLaw === 'combined') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    T₁ ({units.temperature})
                    {calculationMode === 'temperature1' && <span className="text-blue-500 ml-1">← calculating</span>}
                  </label>
                  <input
                    type="number"
                    value={inputs.temperature1 || ''}
                    onChange={(e) => handleInputChange('temperature1', e.target.value)}
                    disabled={calculationMode === 'temperature1'}
                    className={`w-full p-3 border rounded-lg ${
                      calculationMode === 'temperature1' 
                        ? 'bg-foreground/5 cursor-not-allowed' 
                        : 'bg-background border-foreground/20'
                    }`}
                    placeholder="0.0"
                    step="0.001"
                  />
                </div>
              )}
            </div>

            {/* Final conditions */}
            <div className="space-y-4">
              <h4 className="font-medium">Final Conditions</h4>
              {(selectedLaw === 'boyles' || selectedLaw === 'gay-lussac' || selectedLaw === 'combined') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    P₂ ({units.pressure})
                    {calculationMode === 'pressure2' && <span className="text-blue-500 ml-1">← calculating</span>}
                  </label>
                  <input
                    type="number"
                    value={inputs.pressure2 || ''}
                    onChange={(e) => handleInputChange('pressure2', e.target.value)}
                    disabled={calculationMode === 'pressure2'}
                    className={`w-full p-3 border rounded-lg ${
                      calculationMode === 'pressure2' 
                        ? 'bg-foreground/5 cursor-not-allowed' 
                        : 'bg-background border-foreground/20'
                    }`}
                    placeholder="0.0"
                    step="0.001"
                  />
                </div>
              )}
              {(selectedLaw === 'charles' || selectedLaw === 'boyles' || selectedLaw === 'combined') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    V₂ ({units.volume})
                    {calculationMode === 'volume2' && <span className="text-blue-500 ml-1">← calculating</span>}
                  </label>
                  <input
                    type="number"
                    value={inputs.volume2 || ''}
                    onChange={(e) => handleInputChange('volume2', e.target.value)}
                    disabled={calculationMode === 'volume2'}
                    className={`w-full p-3 border rounded-lg ${
                      calculationMode === 'volume2' 
                        ? 'bg-foreground/5 cursor-not-allowed' 
                        : 'bg-background border-foreground/20'
                    }`}
                    placeholder="0.0"
                    step="0.001"
                  />
                </div>
              )}
              {(selectedLaw === 'charles' || selectedLaw === 'gay-lussac' || selectedLaw === 'combined') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    T₂ ({units.temperature})
                    {calculationMode === 'temperature2' && <span className="text-blue-500 ml-1">← calculating</span>}
                  </label>
                  <input
                    type="number"
                    value={inputs.temperature2 || ''}
                    onChange={(e) => handleInputChange('temperature2', e.target.value)}
                    disabled={calculationMode === 'temperature2'}
                    className={`w-full p-3 border rounded-lg ${
                      calculationMode === 'temperature2' 
                        ? 'bg-foreground/5 cursor-not-allowed' 
                        : 'bg-background border-foreground/20'
                    }`}
                    placeholder="0.0"
                    step="0.001"
                  />
                </div>
              )}
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
      {Object.keys(results).some(key => results[key as keyof GasLawInputs] !== undefined && key !== 'gasConstant') && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.pressure1 !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Pressure</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatNumber(results.pressure1)} {units.pressure}
                </div>
              </div>
            )}
            {results.volume1 !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Volume</div>
                <div className="text-xl font-bold text-green-600">
                  {formatNumber(results.volume1)} {units.volume}
                </div>
              </div>
            )}
            {results.temperature1 !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Temperature</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatNumber(results.temperature1)} {units.temperature}
                </div>
              </div>
            )}
            {results.moles !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Moles</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatNumber(results.moles)} mol
                </div>
              </div>
            )}
            {results.pressure2 !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Final Pressure</div>
                <div className="text-xl font-bold text-red-600">
                  {formatNumber(results.pressure2)} {units.pressure}
                </div>
              </div>
            )}
            {results.volume2 !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Final Volume</div>
                <div className="text-xl font-bold text-teal-600">
                  {formatNumber(results.volume2)} {units.volume}
                </div>
              </div>
            )}
            {results.temperature2 !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Final Temperature</div>
                <div className="text-xl font-bold text-pink-600">
                  {formatNumber(results.temperature2)} {units.temperature}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Gas Law Formulas</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Ideal Gas Law: PV = nRT</strong>
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Boyle's Law: P₁V₁ = P₂V₂</strong> (T constant)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Charles' Law: V₁/T₁ = V₂/T₂</strong> (P constant)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Gay-Lussac's Law: P₁/T₁ = P₂/T₂</strong> (V constant)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>Combined Gas Law: P₁V₁/T₁ = P₂V₂/T₂</strong> (n constant)
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Temperature must be in Kelvin for calculations (automatically converted)</li>
          <li>• Ensure consistent units throughout your calculations</li>
          <li>• Gas laws assume ideal gas behavior (valid at low pressure, high temperature)</li>
          <li>• For real gases, consider Van der Waals equation corrections</li>
          <li>• Standard conditions: STP (0°C, 1 atm) and SATP (25°C, 1 bar)</li>
        </ul>
      </div>
    </div>
  );
}