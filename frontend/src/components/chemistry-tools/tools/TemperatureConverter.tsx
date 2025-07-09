'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface TemperatureScale {
  id: string;
  name: string;
  symbol: string;
  description: string;
}

const temperatureScales: TemperatureScale[] = [
  { id: 'celsius', name: 'Celsius', symbol: '°C', description: 'Water freezes at 0°C, boils at 100°C' },
  { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', description: 'Water freezes at 32°F, boils at 212°F' },
  { id: 'kelvin', name: 'Kelvin', symbol: 'K', description: 'Absolute zero at 0 K, water freezes at 273.15 K' },
  { id: 'rankine', name: 'Rankine', symbol: '°R', description: 'Absolute zero at 0°R, water freezes at 491.67°R' }
];

const commonTemperatures = [
  { name: 'Absolute Zero', celsius: -273.15 },
  { name: 'Dry Ice Sublimation', celsius: -78.5 },
  { name: 'Water Freezing', celsius: 0 },
  { name: 'Room Temperature', celsius: 20 },
  { name: 'Body Temperature', celsius: 37 },
  { name: 'Water Boiling (1 atm)', celsius: 100 },
  { name: 'Oven Temperature (moderate)', celsius: 175 },
  { name: 'Iron Melting Point', celsius: 1538 }
];

export default function TemperatureConverter() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [fromScale, setFromScale] = useState('celsius');
  const [toScale, setToScale] = useState('fahrenheit');
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<{ [key: string]: number } | null>(null);

  const convertTemperature = (value: number, from: string, to: string): number => {
    // First convert to Celsius
    let celsius: number;
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * (5/9);
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      case 'rankine':
        celsius = (value - 491.67) * (5/9);
        break;
      default:
        celsius = value;
    }

    // Then convert from Celsius to target scale
    switch (to) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return (celsius * (9/5)) + 32;
      case 'kelvin':
        return celsius + 273.15;
      case 'rankine':
        return (celsius + 273.15) * (9/5);
      default:
        return celsius;
    }
  };

  const handleConversion = () => {
    if (!inputValue) return;

    const value = parseFloat(inputValue);
    if (isNaN(value)) return;

    const allResults: { [key: string]: number } = {};
    temperatureScales.forEach(scale => {
      allResults[scale.id] = convertTemperature(value, fromScale, scale.id);
    });

    setResults(allResults);
  };

  const swapScales = () => {
    const temp = fromScale;
    setFromScale(toScale);
    setToScale(temp);
    if (results) {
      setInputValue(results[toScale].toFixed(2));
      handleConversion();
    }
  };

  const formatTemperature = (value: number): string => {
    return value.toFixed(2);
  };

  const clearAll = () => {
    setInputValue('');
    setResults(null);
  };

  const loadCommonTemperature = (celsius: number) => {
    const converted = convertTemperature(celsius, 'celsius', fromScale);
    setInputValue(converted.toFixed(2));
    handleConversion();
  };

  const getTemperatureColor = (celsius: number): string => {
    if (celsius < -200) return 'text-purple-600';
    if (celsius < -50) return 'text-blue-600';
    if (celsius < 0) return 'text-cyan-600';
    if (celsius < 25) return 'text-green-600';
    if (celsius < 50) return 'text-yellow-600';
    if (celsius < 100) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Scale Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <label className="block text-sm font-medium">From Scale</label>
          <select
            value={fromScale}
            onChange={(e) => setFromScale(e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            {temperatureScales.map((scale) => (
              <option key={scale.id} value={scale.id}>
                {scale.name} ({scale.symbol})
              </option>
            ))}
          </select>
          <p className="text-xs text-foreground/60">
            {temperatureScales.find(s => s.id === fromScale)?.description}
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={swapScales}
            className="p-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 transition-colors"
            title="Swap scales"
          >
            <span className="text-xl">⇄</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">To Scale</label>
          <select
            value={toScale}
            onChange={(e) => setToScale(e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          >
            {temperatureScales.map((scale) => (
              <option key={scale.id} value={scale.id}>
                {scale.name} ({scale.symbol})
              </option>
            ))}
          </select>
          <p className="text-xs text-foreground/60">
            {temperatureScales.find(s => s.id === toScale)?.description}
          </p>
        </div>
      </div>

      {/* Temperature Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Temperature Value
        </label>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleConversion()}
          className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
          placeholder={`Enter temperature in ${temperatureScales.find(s => s.id === fromScale)?.name}`}
          step="any"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleConversion}
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

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Conversion Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {temperatureScales.map((scale) => {
              const value = results[scale.id];
              const celsiusValue = scale.id === 'celsius' ? value : convertTemperature(value, scale.id, 'celsius');
              
              return (
                <div
                  key={scale.id}
                  className={`p-4 rounded-lg border ${
                    scale.id === toScale
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-foreground/20 bg-foreground/5'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${getTemperatureColor(celsiusValue)}`}>
                      {formatTemperature(value)}
                    </div>
                    <div className="text-foreground/60 text-sm">{scale.symbol}</div>
                    <div className="text-xs text-foreground/50 mt-1">{scale.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Common Temperatures Quick Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4">🌡️ Common Temperature References</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {commonTemperatures.map((temp, index) => {
            const fahrenheit = convertTemperature(temp.celsius, 'celsius', 'fahrenheit');
            const kelvin = convertTemperature(temp.celsius, 'celsius', 'kelvin');
            
            return (
              <button
                key={index}
                onClick={() => loadCommonTemperature(temp.celsius)}
                className="p-3 text-left border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
                  {temp.name}
                </div>
                <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <div>{temp.celsius}°C</div>
                  <div>{fahrenheit.toFixed(1)}°F</div>
                  <div>{kelvin.toFixed(1)} K</div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
          Click any temperature to load it into the converter
        </p>
      </div>

      {/* Conversion Formulas */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-4">📐 Conversion Formulas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-green-700 dark:text-green-300">
          <div>
            <strong>To Celsius:</strong>
            <ul className="mt-2 space-y-1 font-mono">
              <li>°F → °C: (°F - 32) × 5/9</li>
              <li>K → °C: K - 273.15</li>
              <li>°R → °C: (°R - 491.67) × 5/9</li>
            </ul>
          </div>
          <div>
            <strong>From Celsius:</strong>
            <ul className="mt-2 space-y-1 font-mono">
              <li>°C → °F: (°C × 9/5) + 32</li>
              <li>°C → K: °C + 273.15</li>
              <li>°C → °R: (°C + 273.15) × 9/5</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Temperature Scale Information */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-4">🔬 Temperature Scale Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-purple-700 dark:text-purple-300">
          <div>
            <strong>Celsius (°C):</strong>
            <p className="mt-1">Based on water's freezing (0°C) and boiling (100°C) points at standard pressure. Most commonly used in science and daily life worldwide.</p>
          </div>
          <div>
            <strong>Fahrenheit (°F):</strong>
            <p className="mt-1">Primarily used in the United States. Originally based on the freezing point of brine and human body temperature.</p>
          </div>
          <div>
            <strong>Kelvin (K):</strong>
            <p className="mt-1">The SI base unit for temperature. Absolute scale starting at absolute zero (-273.15°C). Essential for gas law calculations.</p>
          </div>
          <div>
            <strong>Rankine (°R):</strong>
            <p className="mt-1">Absolute scale using Fahrenheit-sized degrees. Primarily used in some engineering applications in the United States.</p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Usage Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Always use Kelvin for gas law calculations (PV = nRT)</li>
          <li>• Remember: absolute zero is -273.15°C, 0 K, -459.67°F, or 0°R</li>
          <li>• For quick mental conversion: °F ≈ (°C × 2) + 30 (approximate)</li>
          <li>• Color coding helps visualize temperature ranges: purple (very cold) to red (very hot)</li>
          <li>• Use common temperatures as reference points for quick estimates</li>
          <li>• Temperature differences are the same in Celsius and Kelvin (ΔT in °C = ΔT in K)</li>
        </ul>
      </div>
    </div>
  );
}