'use client';

import { useState } from 'react';

interface KinematicsInputs {
  initialVelocity?: number;
  finalVelocity?: number;
  acceleration?: number;
  time?: number;
  displacement?: number;
}

export default function KinematicsCalculator() {
  const [inputs, setInputs] = useState<KinematicsInputs>({});
  const [results, setResults] = useState<KinematicsInputs>({});
  const [selectedEquation, setSelectedEquation] = useState<'vf-vi-at' | 'd-vi-vf-t' | 'd-vi-at' | 'vf2-vi2-ad'>('vf-vi-at');

  const equations = [
    { id: 'vf-vi-at', name: 'v = v₀ + at', description: 'Final velocity from initial velocity, acceleration, and time' },
    { id: 'd-vi-vf-t', name: 'd = (v₀ + v)t/2', description: 'Displacement from velocities and time' },
    { id: 'd-vi-at', name: 'd = v₀t + ½at²', description: 'Displacement from initial velocity, acceleration, and time' },
    { id:'vf2-vi2-ad', name: 'v² = v₀² + 2ad', description: 'Final velocity squared from initial velocity, acceleration, and displacement' },
  ];

  const handleInputChange = (field: keyof KinematicsInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const calculate = () => {
    const { initialVelocity: v0, finalVelocity: v, acceleration: a, time: t, displacement: d } = inputs;
    let newResults: KinematicsInputs = { ...inputs };

    try {
      switch (selectedEquation) {
        case 'vf-vi-at':
          if (v0 !== undefined && a !== undefined && t !== undefined) {
            newResults.finalVelocity = v0 + a * t;
          } else if (v !== undefined && a !== undefined && t !== undefined) {
            newResults.initialVelocity = v - a * t;
          } else if (v0 !== undefined && v !== undefined && t !== undefined) {
            newResults.acceleration = (v - v0) / t;
          } else if (v0 !== undefined && v !== undefined && a !== undefined) {
            newResults.time = (v - v0) / a;
          }
          break;

        case 'd-vi-vf-t':
          if (v0 !== undefined && v !== undefined && t !== undefined) {
            newResults.displacement = ((v0 + v) * t) / 2;
          } else if (d !== undefined && v !== undefined && t !== undefined) {
            newResults.initialVelocity = (2 * d) / t - v;
          } else if (d !== undefined && v0 !== undefined && t !== undefined) {
            newResults.finalVelocity = (2 * d) / t - v0;
          } else if (d !== undefined && v0 !== undefined && v !== undefined) {
            newResults.time = (2 * d) / (v0 + v);
          }
          break;

        case 'd-vi-at':
          if (v0 !== undefined && a !== undefined && t !== undefined) {
            newResults.displacement = v0 * t + 0.5 * a * t * t;
          } else if (d !== undefined && a !== undefined && t !== undefined) {
            newResults.initialVelocity = (d - 0.5 * a * t * t) / t;
          } else if (d !== undefined && v0 !== undefined && t !== undefined) {
            newResults.acceleration = (2 * (d - v0 * t)) / (t * t);
          }
          break;

        case 'vf2-vi2-ad':
          if (v0 !== undefined && a !== undefined && d !== undefined) {
            const vSquared = v0 * v0 + 2 * a * d;
            newResults.finalVelocity = vSquared >= 0 ? Math.sqrt(vSquared) : undefined;
          } else if (v !== undefined && a !== undefined && d !== undefined) {
            newResults.initialVelocity = Math.sqrt(Math.max(0, v * v - 2 * a * d));
          } else if (v0 !== undefined && v !== undefined && d !== undefined) {
            newResults.acceleration = (v * v - v0 * v0) / (2 * d);
          } else if (v0 !== undefined && v !== undefined && a !== undefined) {
            newResults.displacement = (v * v - v0 * v0) / (2 * a);
          }
          break;
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
    return num.toFixed(3);
  };

  return (
    <div className="space-y-6">
      {/* Equation Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Kinematic Equation</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {equations.map((eq) => (
            <button
              key={eq.id}
              onClick={() => setSelectedEquation(eq.id as any)}
              className={`p-4 text-left border rounded-lg transition-colors ${
                selectedEquation === eq.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="font-mono font-medium text-sm">{eq.name}</div>
              <div className="text-xs text-foreground/60 mt-1">{eq.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Initial Velocity (v₀)</label>
          <input
            type="number"
            value={inputs.initialVelocity || ''}
            onChange={(e) => handleInputChange('initialVelocity', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="m/s"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Final Velocity (v)</label>
          <input
            type="number"
            value={inputs.finalVelocity || ''}
            onChange={(e) => handleInputChange('finalVelocity', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="m/s"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Acceleration (a)</label>
          <input
            type="number"
            value={inputs.acceleration || ''}
            onChange={(e) => handleInputChange('acceleration', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="m/s²"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Time (t)</label>
          <input
            type="number"
            value={inputs.time || ''}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="s"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Displacement (d)</label>
          <input
            type="number"
            value={inputs.displacement || ''}
            onChange={(e) => handleInputChange('displacement', e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="m"
            step="0.1"
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
            {results.initialVelocity !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Initial Velocity (v₀)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(results.initialVelocity)} m/s
                </div>
              </div>
            )}
            {results.finalVelocity !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Final Velocity (v)</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(results.finalVelocity)} m/s
                </div>
              </div>
            )}
            {results.acceleration !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Acceleration (a)</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(results.acceleration)} m/s²
                </div>
              </div>
            )}
            {results.time !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Time (t)</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(results.time)} s
                </div>
              </div>
            )}
            {results.displacement !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Displacement (d)</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(results.displacement)} m
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Kinematic Equations</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          {equations.map((eq) => (
            <div key={eq.id} className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
              <strong>{eq.name}</strong> - {eq.description}
            </div>
          ))}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">💡 Usage Tips</h4>
        <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
          <li>• Enter known values and select the appropriate equation</li>
          <li>• Positive acceleration means speeding up, negative means slowing down</li>
          <li>• Displacement can be negative (opposite direction)</li>
          <li>• All calculations assume constant acceleration</li>
          <li>• Time must be positive for physical motion</li>
        </ul>
      </div>
    </div>
  );
}