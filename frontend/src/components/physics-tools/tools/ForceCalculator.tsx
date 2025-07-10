'use client';

import { useState } from 'react';

interface ForceInputs {
  mass?: number;
  acceleration?: number;
  force?: number;
  weight?: number;
  friction?: number;
  normal?: number;
  frictionCoeff?: number;
}

export default function ForceCalculator() {
  const [inputs, setInputs] = useState<ForceInputs>({});
  const [results, setResults] = useState<ForceInputs>({});
  const [calculationType, setCalculationType] = useState<'newton' | 'weight' | 'friction'>('newton');

  const calculationTypes = [
    { id: 'newton', name: "Newton's Second Law", description: 'F = ma', icon: '⚡' },
    { id: 'weight', name: 'Weight Force', description: 'W = mg', icon: '🌍' },
    { id: 'friction', name: 'Friction Force', description: 'f = μN', icon: '🔥' },
  ] as const;

  const handleInputChange = (field: keyof ForceInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const calculate = () => {
    const { mass, acceleration, force, weight, friction, normal, frictionCoeff } = inputs;
    const newResults: ForceInputs = { ...inputs };

    try {
      switch (calculationType) {
        case 'newton':
          // F = ma
          if (mass !== undefined && acceleration !== undefined) {
            newResults.force = mass * acceleration;
          } else if (force !== undefined && mass !== undefined) {
            newResults.acceleration = force / mass;
          } else if (force !== undefined && acceleration !== undefined) {
            newResults.mass = force / acceleration;
          }
          break;

        case 'weight':
          // W = mg (g = 9.81 m/s²)
          const g = 9.81;
          if (mass !== undefined) {
            newResults.weight = mass * g;
          } else if (weight !== undefined) {
            newResults.mass = weight / g;
          }
          break;

        case 'friction':
          // f = μN
          if (frictionCoeff !== undefined && normal !== undefined) {
            newResults.friction = frictionCoeff * normal;
          } else if (friction !== undefined && normal !== undefined) {
            newResults.frictionCoeff = friction / normal;
          } else if (friction !== undefined && frictionCoeff !== undefined) {
            newResults.normal = friction / frictionCoeff;
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
      {/* Calculation Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Force Calculation Type</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {calculationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setCalculationType(type.id)}
              className={`p-4 text-left border rounded-lg transition-colors ${
                calculationType === type.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{type.icon}</span>
                <span className="font-medium text-sm">{type.name}</span>
              </div>
              <div className="font-mono text-xs bg-background/10 px-2 py-1 rounded">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(calculationType === 'newton' || calculationType === 'weight') && (
          <div>
            <label className="block text-sm font-medium mb-2">Mass (m)</label>
            <input
              type="number"
              value={inputs.mass || ''}
              onChange={(e) => handleInputChange('mass', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="kg"
              step="0.1"
              min="0"
            />
          </div>
        )}

        {calculationType === 'newton' && (
          <>
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
              <label className="block text-sm font-medium mb-2">Force (F)</label>
              <input
                type="number"
                value={inputs.force || ''}
                onChange={(e) => handleInputChange('force', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="N"
                step="0.1"
              />
            </div>
          </>
        )}

        {calculationType === 'weight' && (
          <div>
            <label className="block text-sm font-medium mb-2">Weight (W)</label>
            <input
              type="number"
              value={inputs.weight || ''}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="N"
              step="0.1"
              min="0"
            />
          </div>
        )}

        {calculationType === 'friction' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Friction Force (f)</label>
              <input
                type="number"
                value={inputs.friction || ''}
                onChange={(e) => handleInputChange('friction', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="N"
                step="0.1"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Normal Force (N)</label>
              <input
                type="number"
                value={inputs.normal || ''}
                onChange={(e) => handleInputChange('normal', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="N"
                step="0.1"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Friction Coefficient (μ)</label>
              <input
                type="number"
                value={inputs.frictionCoeff || ''}
                onChange={(e) => handleInputChange('frictionCoeff', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="dimensionless"
                step="0.01"
                min="0"
                max="2"
              />
            </div>
          </>
        )}
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
            {results.mass !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Mass (m)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(results.mass)} kg
                </div>
              </div>
            )}
            {results.acceleration !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Acceleration (a)</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(results.acceleration)} m/s²
                </div>
              </div>
            )}
            {results.force !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Force (F)</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(results.force)} N
                </div>
              </div>
            )}
            {results.weight !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Weight (W)</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(results.weight)} N
                </div>
              </div>
            )}
            {results.friction !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Friction Force (f)</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(results.friction)} N
                </div>
              </div>
            )}
            {results.normal !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Normal Force (N)</div>
                <div className="text-2xl font-bold text-teal-600">
                  {formatNumber(results.normal)} N
                </div>
              </div>
            )}
            {results.frictionCoeff !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Friction Coefficient (μ)</div>
                <div className="text-2xl font-bold text-pink-600">
                  {formatNumber(results.frictionCoeff)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Force Formulas</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>F = ma</strong> - Newton&apos;s Second Law (Force = mass × acceleration)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>W = mg</strong> - Weight force (g = 9.81 m/s²)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>f = μN</strong> - Friction force (μ = coefficient, N = normal force)
          </div>
        </div>
      </div>

      {/* Common Friction Coefficients */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">🔧 Common Friction Coefficients</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700 dark:text-green-300">
          <div>
            <strong>Static Friction:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Steel on steel: μ ≈ 0.6</li>
              <li>• Rubber on concrete: μ ≈ 1.0</li>
              <li>• Ice on ice: μ ≈ 0.1</li>
            </ul>
          </div>
          <div>
            <strong>Kinetic Friction:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Wood on wood: μ ≈ 0.3</li>
              <li>• Metal on metal: μ ≈ 0.4</li>
              <li>• Glass on glass: μ ≈ 0.9</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Force is a vector quantity (has direction)</li>
          <li>• Weight is the gravitational force on an object</li>
          <li>• Static friction ≥ kinetic friction for the same materials</li>
          <li>• Normal force is perpendicular to the contact surface</li>
          <li>• 1 Newton (N) = 1 kg⋅m/s²</li>
        </ul>
      </div>
    </div>
  );
}