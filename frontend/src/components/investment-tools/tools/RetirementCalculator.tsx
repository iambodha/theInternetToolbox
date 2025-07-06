'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  retirementExpenses: number;
  inflationRate: number;
  lifeExpectancy: number;
}

interface RetirementResults {
  totalSavingsAtRetirement: number;
  totalContributions: number;
  totalInterest: number;
  yearsInRetirement: number;
  monthlyIncomeInRetirement: number;
  shortfallOrSurplus: number;
  recommendedContribution: number;
}

export default function RetirementCalculator() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [inputs, setInputs] = useState<RetirementInputs>({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1500,
    expectedReturn: 7,
    retirementExpenses: 5000,
    inflationRate: 2.5,
    lifeExpectancy: 85
  });

  const results = useMemo((): RetirementResults => {
    const {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      expectedReturn,
      retirementExpenses,
      inflationRate,
      lifeExpectancy
    } = inputs;

    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    const monthlyReturn = expectedReturn / 100 / 12;
    const monthsToRetirement = yearsToRetirement * 12;

    // Calculate future value of current savings
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement);

    // Calculate future value of monthly contributions (annuity)
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);

    const totalSavingsAtRetirement = futureValueCurrentSavings + futureValueContributions;
    const totalContributions = monthlyContribution * monthsToRetirement;
    const totalInterest = totalSavingsAtRetirement - currentSavings - totalContributions;

    // Calculate inflation-adjusted retirement expenses
    const inflationAdjustedExpenses = retirementExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

    // Calculate required retirement savings (4% rule with inflation adjustment)
    const requiredSavings = inflationAdjustedExpenses * 12 * 25; // 4% withdrawal rule = 25x annual expenses

    // Calculate monthly income from savings (4% annual withdrawal)
    const monthlyIncomeInRetirement = (totalSavingsAtRetirement * 0.04) / 12;

    const shortfallOrSurplus = totalSavingsAtRetirement - requiredSavings;

    // Calculate recommended monthly contribution to meet goals
    const recommendedSavingsNeeded = Math.max(0, requiredSavings - futureValueCurrentSavings);
    const recommendedContribution = recommendedSavingsNeeded / 
      ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);

    return {
      totalSavingsAtRetirement,
      totalContributions,
      totalInterest,
      yearsInRetirement,
      monthlyIncomeInRetirement,
      shortfallOrSurplus,
      recommendedContribution
    };
  }, [inputs]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyPrecise = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Retirement Planning Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Age */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Current Age
            </label>
            <input
              type="number"
              value={inputs.currentAge}
              onChange={(e) => setInputs(prev => ({ ...prev, currentAge: parseInt(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="18"
              max="100"
            />
          </div>

          {/* Retirement Age */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Retirement Age
            </label>
            <input
              type="number"
              value={inputs.retirementAge}
              onChange={(e) => setInputs(prev => ({ ...prev, retirementAge: parseInt(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="50"
              max="80"
            />
          </div>

          {/* Current Savings */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Current Retirement Savings ($)
            </label>
            <input
              type="number"
              value={inputs.currentSavings}
              onChange={(e) => setInputs(prev => ({ ...prev, currentSavings: parseFloat(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              step="1000"
            />
          </div>

          {/* Monthly Contribution */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Monthly Contribution ($)
            </label>
            <input
              type="number"
              value={inputs.monthlyContribution}
              onChange={(e) => setInputs(prev => ({ ...prev, monthlyContribution: parseFloat(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              step="100"
            />
          </div>

          {/* Expected Return */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Expected Annual Return (%)
            </label>
            <input
              type="number"
              value={inputs.expectedReturn}
              onChange={(e) => setInputs(prev => ({ ...prev, expectedReturn: parseFloat(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              max="20"
              step="0.1"
            />
          </div>

          {/* Monthly Retirement Expenses */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Monthly Retirement Expenses ($)
            </label>
            <input
              type="number"
              value={inputs.retirementExpenses}
              onChange={(e) => setInputs(prev => ({ ...prev, retirementExpenses: parseFloat(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              step="100"
            />
          </div>

          {/* Inflation Rate */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Inflation Rate (%)
            </label>
            <input
              type="number"
              value={inputs.inflationRate}
              onChange={(e) => setInputs(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              max="10"
              step="0.1"
            />
          </div>

          {/* Life Expectancy */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Life Expectancy
            </label>
            <input
              type="number"
              value={inputs.lifeExpectancy}
              onChange={(e) => setInputs(prev => ({ ...prev, lifeExpectancy: parseInt(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="70"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Retirement Projection</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              isDark ? 'text-green-400' : 'text-green-700'
            }`}>
              {formatCurrency(results.totalSavingsAtRetirement)}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-green-300' : 'text-green-600'
            }`}>Total at Retirement</div>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              isDark ? 'text-blue-400' : 'text-blue-700'
            }`}>
              {formatCurrencyPrecise(results.monthlyIncomeInRetirement)}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-blue-300' : 'text-blue-600'
            }`}>Monthly Income</div>
          </div>

          <div className={`p-4 rounded-lg border ${
            results.shortfallOrSurplus >= 0
              ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
              : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              results.shortfallOrSurplus >= 0
                ? isDark ? 'text-green-400' : 'text-green-700'
                : isDark ? 'text-red-400' : 'text-red-700'
            }`}>
              {results.shortfallOrSurplus >= 0 ? '+' : ''}{formatCurrency(results.shortfallOrSurplus)}
            </div>
            <div className={`text-sm ${
              results.shortfallOrSurplus >= 0
                ? isDark ? 'text-green-300' : 'text-green-600'
                : isDark ? 'text-red-300' : 'text-red-600'
            }`}>
              {results.shortfallOrSurplus >= 0 ? 'Surplus' : 'Shortfall'}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {results.shortfallOrSurplus < 0 && (
          <div className={`p-4 rounded-lg border mb-6 ${
            isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
          }`}>
            <h3 className={`text-lg font-medium mb-2 ${
              isDark ? 'text-orange-200' : 'text-orange-900'
            }`}>💡 Recommendation</h3>
            <p className={`text-sm ${
              isDark ? 'text-orange-300' : 'text-orange-700'
            }`}>
              To meet your retirement goals, consider increasing your monthly contribution to{' '}
              <strong>{formatCurrencyPrecise(results.recommendedContribution)}</strong>.
            </p>
          </div>
        )}

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className={`text-lg font-medium mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Savings Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Current Savings Growth:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {formatCurrency(results.totalSavingsAtRetirement - results.totalContributions - results.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Contributions:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {formatCurrency(results.totalContributions)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Investment Growth:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {formatCurrency(results.totalInterest)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-lg font-medium mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Years to Retirement:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {inputs.retirementAge - inputs.currentAge} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Years in Retirement:</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {results.yearsInRetirement} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Monthly Expenses (Today):</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                  {formatCurrencyPrecise(inputs.retirementExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Retirement Tips */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-blue-950/20 border-blue-800' : 'bg-blue-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-blue-200' : 'text-blue-900'
        }`}>🏖️ Retirement Planning Tips</h3>
        <div className={`space-y-2 text-sm ${
          isDark ? 'text-blue-300' : 'text-blue-700'
        }`}>
          <p>• <strong>Start early:</strong> The power of compound interest works best over long periods.</p>
          <p>• <strong>Use tax-advantaged accounts:</strong> 401(k), IRA, and Roth IRA can significantly boost your savings.</p>
          <p>• <strong>Consider employer matching:</strong> Always contribute enough to get the full employer match - it&apos;s free money!</p>
          <p>• <strong>Plan for healthcare:</strong> Healthcare costs often increase in retirement.</p>
          <p>• <strong>Review annually:</strong> Adjust your contributions and strategy as your income and goals change.</p>
        </div>
      </div>
    </div>
  );
}
