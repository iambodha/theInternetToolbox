'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ROIInput {
  id: string;
  name: string;
  initialInvestment: number;
  finalValue: number;
  additionalCosts: number;
  timeHorizon: number;
  timeUnit: 'months' | 'years';
}

interface ROIResult {
  totalROI: number;
  annualizedROI: number;
  totalGain: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
}

export default function ROICalculator() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [investments, setInvestments] = useState<ROIInput[]>([
    {
      id: '1',
      name: 'Investment A',
      initialInvestment: 10000,
      finalValue: 12500,
      additionalCosts: 250,
      timeHorizon: 2,
      timeUnit: 'years'
    }
  ]);

  const [comparisonMode, setComparisonMode] = useState(false);

  const calculateROI = (investment: ROIInput): ROIResult => {
    const totalCost = investment.initialInvestment + investment.additionalCosts;
    const netProfit = investment.finalValue - totalCost;
    const totalROI = (netProfit / totalCost) * 100;
    
    // Convert time to years for annualized calculation
    const timeInYears = investment.timeUnit === 'months' 
      ? investment.timeHorizon / 12 
      : investment.timeHorizon;
    
    // Annualized ROI using compound annual growth rate formula
    const annualizedROI = timeInYears > 0 
      ? (Math.pow(investment.finalValue / totalCost, 1 / timeInYears) - 1) * 100
      : totalROI;
    
    const totalGain = investment.finalValue - investment.initialInvestment;
    const profitMargin = (netProfit / investment.finalValue) * 100;

    return {
      totalROI,
      annualizedROI,
      totalGain,
      totalCost,
      netProfit,
      profitMargin
    };
  };

  const results = useMemo(() => {
    return investments.map(investment => ({
      investment,
      result: calculateROI(investment)
    }));
  }, [investments]);

  const addInvestment = () => {
    const newId = (investments.length + 1).toString();
    setInvestments(prev => [...prev, {
      id: newId,
      name: `Investment ${String.fromCharCode(64 + investments.length + 1)}`,
      initialInvestment: 10000,
      finalValue: 12000,
      additionalCosts: 0,
      timeHorizon: 1,
      timeUnit: 'years'
    }]);
    setComparisonMode(true);
  };

  const removeInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    if (investments.length <= 2) {
      setComparisonMode(false);
    }
  };

  const updateInvestment = (id: string, field: keyof ROIInput, value: string | number) => {
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getBestInvestment = () => {
    if (results.length <= 1) return null;
    return results.reduce((best, current) => 
      current.result.annualizedROI > best.result.annualizedROI ? current : best
    );
  };

  const bestInvestment = getBestInvestment();

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>ROI Calculator</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                comparisonMode
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {comparisonMode ? 'Single Mode' : 'Compare Mode'}
            </button>
            {comparisonMode && (
              <button
                onClick={addInvestment}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Add Investment
              </button>
            )}
          </div>
        </div>

        {/* Investment Inputs */}
        <div className="space-y-6">
          {investments.map((investment) => (
            <div key={investment.id} className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={investment.name}
                  onChange={(e) => updateInvestment(investment.id, 'name', e.target.value)}
                  className={`text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                />
                {comparisonMode && investments.length > 1 && (
                  <button
                    onClick={() => removeInvestment(investment.id)}
                    className={`text-sm px-2 py-1 rounded transition-colors ${
                      isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Initial Investment ($)
                  </label>
                  <input
                    type="number"
                    value={investment.initialInvestment}
                    onChange={(e) => updateInvestment(investment.id, 'initialInvestment', parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 border rounded-lg ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Final Value ($)
                  </label>
                  <input
                    type="number"
                    value={investment.finalValue}
                    onChange={(e) => updateInvestment(investment.id, 'finalValue', parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 border rounded-lg ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Additional Costs ($)
                  </label>
                  <input
                    type="number"
                    value={investment.additionalCosts}
                    onChange={(e) => updateInvestment(investment.id, 'additionalCosts', parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 border rounded-lg ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    step="10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Time Horizon
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={investment.timeHorizon}
                      onChange={(e) => updateInvestment(investment.id, 'timeHorizon', parseFloat(e.target.value) || 0)}
                      className={`flex-1 p-3 border rounded-lg ${
                        isDark 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={investment.timeUnit}
                      onChange={(e) => updateInvestment(investment.id, 'timeUnit', e.target.value)}
                      className={`p-3 border rounded-lg ${
                        isDark 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {results.map(({ investment, result }) => (
          <div key={investment.id} className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } ${bestInvestment && bestInvestment.investment.id === investment.id ? 
            isDark ? 'ring-2 ring-green-500' : 'ring-2 ring-green-400' : ''
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {investment.name} Results
              </h3>
              {bestInvestment && bestInvestment.investment.id === investment.id && comparisonMode && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                }`}>
                  Best ROI
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg border ${
                result.totalROI >= 0
                  ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                  : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              }`}>
                <div className={`text-2xl font-bold mb-1 ${
                  result.totalROI >= 0
                    ? isDark ? 'text-green-400' : 'text-green-700'
                    : isDark ? 'text-red-400' : 'text-red-700'
                }`}>
                  {formatPercentage(result.totalROI)}
                </div>
                <div className={`text-sm ${
                  result.totalROI >= 0
                    ? isDark ? 'text-green-300' : 'text-green-600'
                    : isDark ? 'text-red-300' : 'text-red-600'
                }`}>Total ROI</div>
              </div>

              <div className={`p-4 rounded-lg border ${
                result.annualizedROI >= 0
                  ? isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                  : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              }`}>
                <div className={`text-2xl font-bold mb-1 ${
                  result.annualizedROI >= 0
                    ? isDark ? 'text-blue-400' : 'text-blue-700'
                    : isDark ? 'text-red-400' : 'text-red-700'
                }`}>
                  {formatPercentage(result.annualizedROI)}
                </div>
                <div className={`text-sm ${
                  result.annualizedROI >= 0
                    ? isDark ? 'text-blue-300' : 'text-blue-600'
                    : isDark ? 'text-red-300' : 'text-red-600'
                }`}>Annualized ROI</div>
              </div>

              <div className={`p-4 rounded-lg border ${
                result.netProfit >= 0
                  ? isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
                  : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              }`}>
                <div className={`text-2xl font-bold mb-1 ${
                  result.netProfit >= 0
                    ? isDark ? 'text-purple-400' : 'text-purple-700'
                    : isDark ? 'text-red-400' : 'text-red-700'
                }`}>
                  {formatCurrency(result.netProfit)}
                </div>
                <div className={`text-sm ${
                  result.netProfit >= 0
                    ? isDark ? 'text-purple-300' : 'text-purple-600'
                    : isDark ? 'text-red-300' : 'text-red-600'
                }`}>Net Profit</div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className={`text-2xl font-bold mb-1 ${
                  isDark ? 'text-orange-400' : 'text-orange-700'
                }`}>
                  {formatPercentage(result.profitMargin)}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-orange-300' : 'text-orange-600'
                }`}>Profit Margin</div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`text-md font-medium mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Investment Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Initial Investment:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(investment.initialInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Additional Costs:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(investment.additionalCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Cost:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(result.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Final Value:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(investment.finalValue)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`text-md font-medium mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Gain:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(result.totalGain)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Time Period:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {investment.timeHorizon} {investment.timeUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Investment Multiple:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {(investment.finalValue / result.totalCost).toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ROI Information */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-blue-950/20 border-blue-800' : 'bg-blue-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-blue-200' : 'text-blue-900'
        }`}>💰 Understanding ROI</h3>
        <div className={`space-y-2 text-sm ${
          isDark ? 'text-blue-300' : 'text-blue-700'
        }`}>
          <p>• <strong>Total ROI:</strong> The overall return on your investment as a percentage of total cost.</p>
          <p>• <strong>Annualized ROI:</strong> The yearly return rate, useful for comparing investments of different durations.</p>
          <p>• <strong>Net Profit:</strong> The actual dollar amount gained after all costs are subtracted.</p>
          <p>• <strong>Profit Margin:</strong> The percentage of the final value that represents profit.</p>
          <p>• <strong>Additional Costs:</strong> Include fees, taxes, maintenance, or other investment-related expenses.</p>
        </div>
      </div>
    </div>
  );
}