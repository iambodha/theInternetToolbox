'use client';

import { useState } from 'react';

interface WaveInputs {
  frequency?: number;
  wavelength?: number;
  waveSpeed?: number;
  period?: number;
  amplitude?: number;
  angularFrequency?: number;
  waveNumber?: number;
}

export default function WaveCalculator() {
  const [inputs, setInputs] = useState<WaveInputs>({});
  const [results, setResults] = useState<WaveInputs>({});
  const [waveType, setWaveType] = useState<'sound' | 'light' | 'water' | 'custom'>('sound');

  const waveTypes = [
    { id: 'sound', name: 'Sound Wave', description: 'v ≈ 343 m/s (air)', icon: '🔊', speed: 343 },
    { id: 'light', name: 'Light Wave', description: 'c = 3×10⁸ m/s (vacuum)', icon: '💡', speed: 299792458 },
    { id: 'water', name: 'Water Wave', description: 'v ≈ 1.5 m/s (typical)', icon: '🌊', speed: 1.5 },
    { id: 'custom', name: 'Custom Wave', description: 'Enter your own speed', icon: '⚙️', speed: null },
  ] as const;

  const handleInputChange = (field: keyof WaveInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const calculate = () => {
    const { frequency, wavelength, period, angularFrequency, waveNumber } = inputs;
    let { waveSpeed } = inputs;
    const newResults: WaveInputs = { ...inputs };

    // Use predefined wave speed if not custom
    if (waveType !== 'custom') {
      const selectedWaveType = waveTypes.find(w => w.id === waveType);
      if (selectedWaveType?.speed && waveSpeed === undefined) {
        waveSpeed = selectedWaveType.speed;
        newResults.waveSpeed = waveSpeed;
      }
    }

    try {
      // Basic wave equation: v = fλ
      if (frequency !== undefined && wavelength !== undefined) {
        newResults.waveSpeed = frequency * wavelength;
      } else if (waveSpeed !== undefined && frequency !== undefined) {
        newResults.wavelength = waveSpeed / frequency;
      } else if (waveSpeed !== undefined && wavelength !== undefined) {
        newResults.frequency = waveSpeed / wavelength;
      }

      // Period and frequency relationship: T = 1/f
      if (frequency !== undefined) {
        newResults.period = 1 / frequency;
      } else if (period !== undefined) {
        newResults.frequency = 1 / period;
      }

      // Angular frequency: ω = 2πf
      if (frequency !== undefined) {
        newResults.angularFrequency = 2 * Math.PI * frequency;
      } else if (angularFrequency !== undefined) {
        newResults.frequency = angularFrequency / (2 * Math.PI);
      }

      // Wave number: k = 2π/λ
      if (wavelength !== undefined) {
        newResults.waveNumber = (2 * Math.PI) / wavelength;
      } else if (waveNumber !== undefined) {
        newResults.wavelength = (2 * Math.PI) / waveNumber;
      }

      // Recalculate derived values
      if (newResults.frequency !== undefined && newResults.frequency !== frequency) {
        newResults.period = 1 / newResults.frequency;
        newResults.angularFrequency = 2 * Math.PI * newResults.frequency;
        
        if (waveSpeed !== undefined) {
          newResults.wavelength = waveSpeed / newResults.frequency;
          newResults.waveNumber = (2 * Math.PI) / newResults.wavelength;
        }
      }

      if (newResults.wavelength !== undefined && newResults.wavelength !== wavelength) {
        newResults.waveNumber = (2 * Math.PI) / newResults.wavelength;
        
        if (waveSpeed !== undefined) {
          newResults.frequency = waveSpeed / newResults.wavelength;
          newResults.period = 1 / newResults.frequency;
          newResults.angularFrequency = 2 * Math.PI * newResults.frequency;
        }
      }

      setResults(newResults);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  const clearAll = () => {
    setInputs({});
    setResults({});
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '';
    if (num >= 1000000 || num <= 0.001) return num.toExponential(3);
    return num.toFixed(3);
  };

  const formatFrequency = (num: number | undefined): string => {
    if (num === undefined) return '';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} GHz`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)} MHz`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)} kHz`;
    return `${num.toFixed(3)} Hz`;
  };

  return (
    <div className="space-y-6">
      {/* Wave Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Wave Type</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {waveTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setWaveType(type.id)}
              className={`p-4 text-left border rounded-lg transition-colors ${
                waveType === type.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{type.icon}</span>
                <span className="font-medium text-sm">{type.name}</span>
              </div>
              <div className="text-xs bg-background/10 px-2 py-1 rounded">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Frequency (f)</label>
          <input
            type="number"
            value={inputs.frequency || ''}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="Hz"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Wavelength (λ)</label>
          <input
            type="number"
            value={inputs.wavelength || ''}
            onChange={(e) => handleInputChange('wavelength', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="m"
            step="0.001"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Wave Speed (v)
            {waveType !== 'custom' && <span className="text-blue-500 ml-1">&larr; preset value</span>}
          </label>
          <input
            type="number"
            value={inputs.waveSpeed || ''}
            onChange={(e) => handleInputChange('waveSpeed', e.target.value)}
            disabled={waveType !== 'custom'}
            className={`w-full p-3 border rounded-lg ${
              waveType !== 'custom' 
                ? 'bg-foreground/5 cursor-not-allowed border-foreground/10' 
                : 'bg-background border-foreground/20'
            }`}
            placeholder="m/s"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Period (T)</label>
          <input
            type="number"
            value={inputs.period || ''}
            onChange={(e) => handleInputChange('period', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="s"
            step="0.001"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Angular Frequency (ω)</label>
          <input
            type="number"
            value={inputs.angularFrequency || ''}
            onChange={(e) => handleInputChange('angularFrequency', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="rad/s"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Wave Number (k)</label>
          <input
            type="number"
            value={inputs.waveNumber || ''}
            onChange={(e) => handleInputChange('waveNumber', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="rad/m"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amplitude (A)</label>
          <input
            type="number"
            value={inputs.amplitude || ''}
            onChange={(e) => handleInputChange('amplitude', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="m"
            step="0.001"
            min="0"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={calculate}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.frequency !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Frequency (f)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatFrequency(results.frequency)}
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  {formatNumber(results.frequency)} Hz
                </div>
              </div>
            )}
            {results.wavelength !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Wavelength (λ)</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(results.wavelength)} m
                </div>
              </div>
            )}
            {results.waveSpeed !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Wave Speed (v)</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(results.waveSpeed)} m/s
                </div>
              </div>
            )}
            {results.period !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Period (T)</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(results.period)} s
                </div>
              </div>
            )}
            {results.angularFrequency !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Angular Frequency (ω)</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(results.angularFrequency)} rad/s
                </div>
              </div>
            )}
            {results.waveNumber !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Wave Number (k)</div>
                <div className="text-2xl font-bold text-teal-600">
                  {formatNumber(results.waveNumber)} rad/m
                </div>
              </div>
            )}
            {results.amplitude !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Amplitude (A)</div>
                <div className="text-2xl font-bold text-pink-600">
                  {formatNumber(results.amplitude)} m
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wave Equation Visualization */}
      {(results.frequency || results.wavelength || results.amplitude) && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Wave Equation</h3>
          <div className="font-mono text-lg bg-background p-4 rounded border border-foreground/20">
            y(x,t) = A sin(kx - ωt + φ)
          </div>
          <div className="mt-3 text-sm text-foreground/70 space-y-1">
            <p>• A = {results.amplitude ? formatNumber(results.amplitude) : 'A'} m (amplitude)</p>
            <p>• k = {results.waveNumber ? formatNumber(results.waveNumber) : '2π/λ'} rad/m (wave number)</p>
            <p>• ω = {results.angularFrequency ? formatNumber(results.angularFrequency) : '2πf'} rad/s (angular frequency)</p>
            <p>• φ = phase constant (rad)</p>
          </div>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Wave Formulas</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>v = fλ</strong> - Wave speed = frequency × wavelength
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>T = 1/f</strong> - Period = 1 / frequency
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>ω = 2πf</strong> - Angular frequency = 2π × frequency
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>k = 2π/λ</strong> - Wave number = 2π / wavelength
          </div>
        </div>
      </div>

      {/* Wave Examples */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">🌊 Common Wave Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700 dark:text-green-300">
          <div>
            <strong>Sound Waves:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Human hearing: 20 Hz - 20 kHz</li>
              <li>• Middle C: 261.6 Hz</li>
              <li>• Ultrasound: &gt; 20 kHz</li>
            </ul>
          </div>
          <div>
            <strong>Electromagnetic Waves:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Visible light: 400-700 nm</li>
              <li>• Radio waves: km wavelengths</li>
              <li>• X-rays: 0.01-10 nm</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Higher frequency = shorter wavelength (for constant speed)</li>
          <li>• Wave speed depends on the medium</li>
          <li>• Amplitude determines wave intensity/loudness</li>
          <li>• Period and frequency are inversely related</li>
          <li>• Use scientific notation for very large/small values</li>
        </ul>
      </div>
    </div>
  );
}