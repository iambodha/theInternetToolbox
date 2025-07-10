'use client';

import { useState } from 'react';

interface EnergyInputs {
  mass?: number;
  velocity?: number;
  height?: number;
  kineticEnergy?: number;
  potentialEnergy?: number;
  mechanicalEnergy?: number;
  work?: number;
  force?: number;
  distance?: number;
  power?: number;
  time?: number;
}

export default function EnergyCalculator() {
  const [inputs, setInputs] = useState<EnergyInputs>({});
  const [results, setResults] = useState<EnergyInputs>({});
  const [calculationType, setCalculationType] = useState<'kinetic' | 'potential' | 'mechanical' | 'work' | 'power'>('kinetic');

  const calculationTypes = [
    { id: 'kinetic', name: 'Kinetic Energy', description: 'KE = ½mv²', icon: '🏃' },
    { id: 'potential', name: 'Potential Energy', description: 'PE = mgh', icon: '⛰️' },
    { id: 'mechanical', name: 'Mechanical Energy', description: 'ME = KE + PE', icon: '⚙️' },
    { id: 'work', name: 'Work', description: 'W = F⋅d', icon: '💪' },
    { id: 'power', name: 'Power', description: 'P = W/t', icon: '⚡' },
  ] as const;

  const handleInputChange = (field: keyof EnergyInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const calculate = () => {
    const { mass, velocity, height, kineticEnergy, potentialEnergy, mechanicalEnergy, work, force, distance, power, time } = inputs;
    const newResults: EnergyInputs = { ...inputs };
    const g = 9.81; // gravitational acceleration

    try {
      switch (calculationType) {
        case 'kinetic':
          // KE = ½mv²
          if (mass !== undefined && velocity !== undefined) {
            newResults.kineticEnergy = 0.5 * mass * velocity * velocity;
          } else if (kineticEnergy !== undefined && mass !== undefined) {
            newResults.velocity = Math.sqrt((2 * kineticEnergy) / mass);
          } else if (kineticEnergy !== undefined && velocity !== undefined) {
            newResults.mass = (2 * kineticEnergy) / (velocity * velocity);
          }
          break;

        case 'potential':
          // PE = mgh
          if (mass !== undefined && height !== undefined) {
            newResults.potentialEnergy = mass * g * height;
          } else if (potentialEnergy !== undefined && mass !== undefined) {
            newResults.height = potentialEnergy / (mass * g);
          } else if (potentialEnergy !== undefined && height !== undefined) {
            newResults.mass = potentialEnergy / (g * height);
          }
          break;

        case 'mechanical':
          // ME = KE + PE
          if (kineticEnergy !== undefined && potentialEnergy !== undefined) {
            newResults.mechanicalEnergy = kineticEnergy + potentialEnergy;
          } else if (mechanicalEnergy !== undefined && kineticEnergy !== undefined) {
            newResults.potentialEnergy = mechanicalEnergy - kineticEnergy;
          } else if (mechanicalEnergy !== undefined && potentialEnergy !== undefined) {
            newResults.kineticEnergy = mechanicalEnergy - potentialEnergy;
          }
          // Also calculate from mass, velocity, and height
          if (mass !== undefined && velocity !== undefined && height !== undefined) {
            const ke = 0.5 * mass * velocity * velocity;
            const pe = mass * g * height;
            newResults.kineticEnergy = ke;
            newResults.potentialEnergy = pe;
            newResults.mechanicalEnergy = ke + pe;
          }
          break;

        case 'work':
          // W = F⋅d
          if (force !== undefined && distance !== undefined) {
            newResults.work = force * distance;
          } else if (work !== undefined && force !== undefined) {
            newResults.distance = work / force;
          } else if (work !== undefined && distance !== undefined) {
            newResults.force = work / distance;
          }
          break;

        case 'power':
          // P = W/t
          if (work !== undefined && time !== undefined) {
            newResults.power = work / time;
          } else if (power !== undefined && time !== undefined) {
            newResults.work = power * time;
          } else if (power !== undefined && work !== undefined) {
            newResults.time = work / power;
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
    if (num >= 1000 || num <= 0.001) return num.toExponential(3);
    return num.toFixed(3);
  };

  return (
    <div className="space-y-6">
      {/* Calculation Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Energy Calculation Type</label>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {calculationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setCalculationType(type.id)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                calculationType === type.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{type.icon}</span>
                <span className="font-medium text-xs">{type.name}</span>
              </div>
              <div className="font-mono text-xs bg-background/10 px-1 py-0.5 rounded">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(calculationType === 'kinetic' || calculationType === 'potential' || calculationType === 'mechanical') && (
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

        {(calculationType === 'kinetic' || calculationType === 'mechanical') && (
          <div>
            <label className="block text-sm font-medium mb-2">Velocity (v)</label>
            <input
              type="number"
              value={inputs.velocity || ''}
              onChange={(e) => handleInputChange('velocity', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="m/s"
              step="0.1"
              min="0"
            />
          </div>
        )}

        {(calculationType === 'potential' || calculationType === 'mechanical') && (
          <div>
            <label className="block text-sm font-medium mb-2">Height (h)</label>
            <input
              type="number"
              value={inputs.height || ''}
              onChange={(e) => handleInputChange('height', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="m"
              step="0.1"
              min="0"
            />
          </div>
        )}

        {calculationType === 'kinetic' && (
          <div>
            <label className="block text-sm font-medium mb-2">Kinetic Energy (KE)</label>
            <input
              type="number"
              value={inputs.kineticEnergy || ''}
              onChange={(e) => handleInputChange('kineticEnergy', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="J"
              step="0.1"
              min="0"
            />
          </div>
        )}

        {calculationType === 'potential' && (
          <div>
            <label className="block text-sm font-medium mb-2">Potential Energy (PE)</label>
            <input
              type="number"
              value={inputs.potentialEnergy || ''}
              onChange={(e) => handleInputChange('potentialEnergy', e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="J"
              step="0.1"
              min="0"
            />
          </div>
        )}

        {calculationType === 'mechanical' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Kinetic Energy (KE)</label>
              <input
                type="number"
                value={inputs.kineticEnergy || ''}
                onChange={(e) => handleInputChange('kineticEnergy', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="J"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Potential Energy (PE)</label>
              <input
                type="number"
                value={inputs.potentialEnergy || ''}
                onChange={(e) => handleInputChange('potentialEnergy', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="J"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mechanical Energy (ME)</label>
              <input
                type="number"
                value={inputs.mechanicalEnergy || ''}
                onChange={(e) => handleInputChange('mechanicalEnergy', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="J"
                step="0.1"
                min="0"
              />
            </div>
          </>
        )}

        {(calculationType === 'work' || calculationType === 'power') && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Work (W)</label>
              <input
                type="number"
                value={inputs.work || ''}
                onChange={(e) => handleInputChange('work', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="J"
                step="0.1"
              />
            </div>
          </>
        )}

        {calculationType === 'work' && (
          <>
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
            <div>
              <label className="block text-sm font-medium mb-2">Distance (d)</label>
              <input
                type="number"
                value={inputs.distance || ''}
                onChange={(e) => handleInputChange('distance', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="m"
                step="0.1"
                min="0"
              />
            </div>
          </>
        )}

        {calculationType === 'power' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Power (P)</label>
              <input
                type="number"
                value={inputs.power || ''}
                onChange={(e) => handleInputChange('power', e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
                placeholder="W"
                step="0.1"
                min="0"
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
            {results.velocity !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Velocity (v)</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(results.velocity)} m/s
                </div>
              </div>
            )}
            {results.height !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Height (h)</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(results.height)} m
                </div>
              </div>
            )}
            {results.kineticEnergy !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Kinetic Energy (KE)</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(results.kineticEnergy)} J
                </div>
              </div>
            )}
            {results.potentialEnergy !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Potential Energy (PE)</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(results.potentialEnergy)} J
                </div>
              </div>
            )}
            {results.mechanicalEnergy !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Mechanical Energy (ME)</div>
                <div className="text-2xl font-bold text-teal-600">
                  {formatNumber(results.mechanicalEnergy)} J
                </div>
              </div>
            )}
            {results.work !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Work (W)</div>
                <div className="text-2xl font-bold text-pink-600">
                  {formatNumber(results.work)} J
                </div>
              </div>
            )}
            {results.force !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Force (F)</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatNumber(results.force)} N
                </div>
              </div>
            )}
            {results.distance !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Distance (d)</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatNumber(results.distance)} m
                </div>
              </div>
            )}
            {results.power !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Power (P)</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatNumber(results.power)} W
                </div>
              </div>
            )}
            {results.time !== undefined && (
              <div className="p-4 bg-background rounded-lg border border-foreground/20">
                <div className="text-sm text-foreground/60">Time (t)</div>
                <div className="text-2xl font-bold text-cyan-600">
                  {formatNumber(results.time)} s
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Energy Formulas</h4>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>KE = ½mv²</strong> - Kinetic Energy (energy of motion)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>PE = mgh</strong> - Potential Energy (gravitational, g = 9.81 m/s²)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>ME = KE + PE</strong> - Mechanical Energy (total energy)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>W = F⋅d</strong> - Work (energy transferred by force)
          </div>
          <div className="font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
            <strong>P = W/t</strong> - Power (rate of energy transfer)
          </div>
        </div>
      </div>

      {/* Conservation of Energy */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">🔄 Conservation of Energy</h4>
        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
          In a closed system without friction, mechanical energy is conserved:
        </p>
        <div className="font-mono bg-green-100 dark:bg-green-900/30 p-2 rounded text-sm text-green-700 dark:text-green-300">
          <strong>ME₁ = ME₂</strong> → <strong>KE₁ + PE₁ = KE₂ + PE₂</strong>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Energy is measured in Joules (J)</li>
          <li>• Power is measured in Watts (W) = J/s</li>
          <li>• Kinetic energy increases with the square of velocity</li>
          <li>• Potential energy is relative to a reference point</li>
          <li>• Work-energy theorem: Work done = Change in kinetic energy</li>
        </ul>
      </div>
    </div>
  );
}