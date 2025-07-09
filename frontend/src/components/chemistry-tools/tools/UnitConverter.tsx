'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ConversionResult {
  value: number;
  unit: string;
  formula?: string;
}

export default function UnitConverter() {
  const { } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('mass');
  const [inputValue, setInputValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);

  // Unit categories and their conversions
  const unitCategories = {
    mass: {
      name: 'Mass',
      icon: '⚖️',
      baseUnit: 'g',
      units: {
        'ng': { name: 'Nanogram (ng)', factor: 1e-9 },
        'μg': { name: 'Microgram (μg)', factor: 1e-6 },
        'mg': { name: 'Milligram (mg)', factor: 1e-3 },
        'g': { name: 'Gram (g)', factor: 1 },
        'kg': { name: 'Kilogram (kg)', factor: 1000 },
        'lb': { name: 'Pound (lb)', factor: 453.592 },
        'oz': { name: 'Ounce (oz)', factor: 28.3495 },
        'u': { name: 'Atomic Mass Unit (u)', factor: 1.66054e-24 }
      }
    },
    volume: {
      name: 'Volume',
      icon: '🥤',
      baseUnit: 'L',
      units: {
        'μL': { name: 'Microliter (μL)', factor: 1e-6 },
        'mL': { name: 'Milliliter (mL)', factor: 1e-3 },
        'L': { name: 'Liter (L)', factor: 1 },
        'gal': { name: 'Gallon (US)', factor: 3.78541 },
        'qt': { name: 'Quart (US)', factor: 0.946353 },
        'pt': { name: 'Pint (US)', factor: 0.473176 },
        'cup': { name: 'Cup (US)', factor: 0.236588 },
        'fl oz': { name: 'Fluid Ounce (US)', factor: 0.0295735 },
        'm³': { name: 'Cubic Meter (m³)', factor: 1000 },
        'cm³': { name: 'Cubic Centimeter (cm³)', factor: 1e-3 }
      }
    },
    pressure: {
      name: 'Pressure',
      icon: '🌬️',
      baseUnit: 'Pa',
      units: {
        'Pa': { name: 'Pascal (Pa)', factor: 1 },
        'kPa': { name: 'Kilopascal (kPa)', factor: 1000 },
        'MPa': { name: 'Megapascal (MPa)', factor: 1e6 },
        'bar': { name: 'Bar', factor: 100000 },
        'atm': { name: 'Atmosphere (atm)', factor: 101325 },
        'mmHg': { name: 'Millimeter Mercury (mmHg)', factor: 133.322 },
        'Torr': { name: 'Torr', factor: 133.322 },
        'psi': { name: 'Pounds per Square Inch (psi)', factor: 6894.76 }
      }
    },
    energy: {
      name: 'Energy',
      icon: '⚡',
      baseUnit: 'J',
      units: {
        'J': { name: 'Joule (J)', factor: 1 },
        'kJ': { name: 'Kilojoule (kJ)', factor: 1000 },
        'cal': { name: 'Calorie (cal)', factor: 4.184 },
        'kcal': { name: 'Kilocalorie (kcal)', factor: 4184 },
        'eV': { name: 'Electron Volt (eV)', factor: 1.60218e-19 },
        'Wh': { name: 'Watt Hour (Wh)', factor: 3600 },
        'kWh': { name: 'Kilowatt Hour (kWh)', factor: 3.6e6 },
        'BTU': { name: 'British Thermal Unit (BTU)', factor: 1055.06 }
      }
    },
    length: {
      name: 'Length',
      icon: '📏',
      baseUnit: 'm',
      units: {
        'pm': { name: 'Picometer (pm)', factor: 1e-12 },
        'nm': { name: 'Nanometer (nm)', factor: 1e-9 },
        'μm': { name: 'Micrometer (μm)', factor: 1e-6 },
        'mm': { name: 'Millimeter (mm)', factor: 1e-3 },
        'cm': { name: 'Centimeter (cm)', factor: 1e-2 },
        'm': { name: 'Meter (m)', factor: 1 },
        'km': { name: 'Kilometer (km)', factor: 1000 },
        'in': { name: 'Inch (in)', factor: 0.0254 },
        'ft': { name: 'Foot (ft)', factor: 0.3048 },
        'yd': { name: 'Yard (yd)', factor: 0.9144 },
        'mile': { name: 'Mile', factor: 1609.34 },
        'Å': { name: 'Angstrom (Å)', factor: 1e-10 }
      }
    },
    amount: {
      name: 'Amount of Substance',
      icon: '🧪',
      baseUnit: 'mol',
      units: {
        'mol': { name: 'Mole (mol)', factor: 1 },
        'kmol': { name: 'Kilomole (kmol)', factor: 1000 },
        'mmol': { name: 'Millimole (mmol)', factor: 1e-3 },
        'μmol': { name: 'Micromole (μmol)', factor: 1e-6 },
        'nmol': { name: 'Nanomole (nmol)', factor: 1e-9 },
        'pmol': { name: 'Picomole (pmol)', factor: 1e-12 }
      }
    }
  };

  const categoryList = Object.keys(unitCategories) as Array<keyof typeof unitCategories>;
  const currentCategory = unitCategories[selectedCategory as keyof typeof unitCategories];

  // Set default units when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const cat = unitCategories[category as keyof typeof unitCategories];
    const units = Object.keys(cat.units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setResult(null);
  };

  // Initialize default units when category changes
  useEffect(() => {
    if (!fromUnit && !toUnit && currentCategory) {
      const units = Object.keys(currentCategory.units);
      setFromUnit(units[0]);
      setToUnit(units[1] || units[0]);
    }
  }, [fromUnit, toUnit, currentCategory]);

  const performConversion = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || !fromUnit || !toUnit) return;

    const units = currentCategory.units;
    
    // Use type assertion to safely access unit data
    const fromFactor = (units as Record<string, { name: string; factor: number }>)[fromUnit]?.factor;
    const toFactor = (units as Record<string, { name: string; factor: number }>)[toUnit]?.factor;
    
    if (typeof fromFactor !== 'number' || typeof toFactor !== 'number') return;
    
    // Convert to base unit, then to target unit
    const baseValue = value * fromFactor;
    const convertedValue = baseValue / toFactor;

    const formula = `${value} ${fromUnit} × ${fromFactor} ÷ ${toFactor} = ${convertedValue} ${toUnit}`;

    setResult({
      value: convertedValue,
      unit: toUnit,
      formula
    });
  };

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (Math.abs(num) >= 1e6 || Math.abs(num) <= 1e-4) {
      return num.toExponential(6);
    }
    return num.toPrecision(8).replace(/\.?0+$/, '');
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result && inputValue) {
      setInputValue(formatNumber(result.value));
      performConversion();
    }
  };

  const clearAll = () => {
    setInputValue('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Select Unit Category</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryList.map((category) => {
            const cat = unitCategories[category];
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`p-3 text-center border rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-foreground/20 hover:bg-foreground/5'
                }`}
              >
                <div className="text-xl mb-1">{cat.icon}</div>
                <div className="text-sm font-medium">{cat.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversion Interface */}
      {currentCategory && (
        <div className="space-y-4">
          {/* Input Value */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Value to Convert
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              placeholder="Enter value..."
              step="any"
            />
          </div>

          {/* Unit Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Unit</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              >
                {Object.entries(currentCategory.units).map(([unit, data]) => (
                  <option key={unit} value={unit}>
                    {data.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">To Unit</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              >
                {Object.entries(currentCategory.units).map(([unit, data]) => (
                  <option key={unit} value={unit}>
                    {data.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={performConversion}
              disabled={!inputValue || !fromUnit || !toUnit}
              className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Convert
            </button>
            <button
              onClick={swapUnits}
              disabled={!fromUnit || !toUnit}
              className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⇄ Swap Units
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Conversion Result</h3>
          <div className="space-y-4">
            <div className="p-4 bg-background rounded-lg border border-foreground/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatNumber(result.value)} {result.unit}
                </div>
                <div className="text-sm text-foreground/60">
                  {inputValue} {fromUnit} = {formatNumber(result.value)} {result.unit}
                </div>
              </div>
            </div>

            {/* Conversion Formula */}
            <div className="p-3 bg-foreground/5 rounded-lg">
              <div className="text-sm text-foreground/60 mb-1">Conversion Formula:</div>
              <div className="font-mono text-sm">{result.formula}</div>
            </div>
          </div>
        </div>
      )}

      {/* Common Conversions Table */}
      {currentCategory && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4">
            Common {currentCategory.name} Conversions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(currentCategory.units).slice(0, 8).map(([unit, data]) => (
              <div key={unit} className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">{data.name}:</span>
                <span className="font-mono text-blue-900 dark:text-blue-100">
                  × {data.factor} {currentCategory.baseUnit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">💡 Tips</h4>
        <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
          <li>• Use scientific notation for very large or small numbers (e.g., 1.5e-6)</li>
          <li>• The swap button quickly reverses the conversion direction</li>
          <li>• All conversions use precise conversion factors for accuracy</li>
          <li>• Atomic mass units (u) are useful for molecular weight calculations</li>
          <li>• Pressure conversions are essential for gas law calculations</li>
        </ul>
      </div>
    </div>
  );
}
