'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface InvestmentInputs {
  initialAmount: number;
  monthlyContribution: number;
  annualReturnRate: number;
  investmentLength: number;
  contributionTiming: 'beginning' | 'end';
  compoundFrequency: 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily';
}

interface YearlyBreakdown {
  year: number;
  startingBalance: number;
  contributions: number;
  interest: number;
  endingBalance: number;
}

export default function InvestmentCalculator() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [inputs, setInputs] = useState<InvestmentInputs>({
    initialAmount: 20000,
    monthlyContribution: 1000,
    annualReturnRate: 6,
    investmentLength: 10,
    contributionTiming: 'end',
    compoundFrequency: 'annually'
  });

  const [calculationMode, setCalculationMode] = useState<'end-amount' | 'contribution' | 'return-rate' | 'time'>('end-amount');

  // Get compound frequency multiplier
  const getCompoundFrequency = (frequency: string): number => {
    switch (frequency) {
      case 'annually': return 1;
      case 'semiannually': return 2;
      case 'quarterly': return 4;
      case 'monthly': return 12;
      case 'daily': return 365;
      default: return 1;
    }
  };

  // Calculate investment results
  const results = useMemo(() => {
    const { initialAmount, monthlyContribution, annualReturnRate, investmentLength, contributionTiming, compoundFrequency } = inputs;
    
    const monthlyRate = annualReturnRate / 100 / 12;
    const totalMonths = investmentLength * 12;
    const annualContribution = monthlyContribution * 12;
    const compoundingPerYear = getCompoundFrequency(compoundFrequency);
    const effectiveRate = annualReturnRate / 100 / compoundingPerYear;
    
    let yearlyBreakdown: YearlyBreakdown[] = [];
    let currentBalance = initialAmount;
    let totalContributions = annualContribution * investmentLength;
    
    // Calculate year by year
    for (let year = 1; year <= investmentLength; year++) {
      const startingBalance = currentBalance;
      let yearContributions = 0;
      let yearInterest = 0;
      
      if (contributionTiming === 'beginning') {
        // Add contribution at beginning of year
        currentBalance += annualContribution;
        yearContributions = annualContribution;
        
        // Compound for the year
        const periodsInYear = compoundingPerYear;
        for (let period = 0; period < periodsInYear; period++) {
          const periodInterest = currentBalance * effectiveRate;
          yearInterest += periodInterest;
          currentBalance += periodInterest;
        }
      } else {
        // Add contributions monthly throughout the year and compound
        for (let month = 0; month < 12; month++) {
          // Add monthly contribution
          currentBalance += monthlyContribution;
          yearContributions += monthlyContribution;
          
          // Apply monthly interest (simplified to monthly compounding for contributions)
          const monthlyInterest = currentBalance * monthlyRate;
          yearInterest += monthlyInterest;
          currentBalance += monthlyInterest;
        }
      }
      
      yearlyBreakdown.push({
        year,
        startingBalance,
        contributions: yearContributions,
        interest: yearInterest,
        endingBalance: currentBalance
      });
    }
    
    const endBalance = currentBalance;
    const totalInterest = endBalance - initialAmount - totalContributions;
    
    return {
      endBalance,
      totalContributions,
      totalInterest,
      yearlyBreakdown,
      initialAmount
    };
  }, [inputs]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${((value / results.endBalance) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Investment Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Initial Amount */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Starting Amount ($)
            </label>
            <input
              type="number"
              value={inputs.initialAmount}
              onChange={(e) => setInputs(prev => ({ ...prev, initialAmount: parseFloat(e.target.value) || 0 }))}
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

          {/* Annual Return Rate */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Annual Return Rate (%)
            </label>
            <input
              type="number"
              value={inputs.annualReturnRate}
              onChange={(e) => setInputs(prev => ({ ...prev, annualReturnRate: parseFloat(e.target.value) || 0 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              max="50"
              step="0.1"
            />
          </div>

          {/* Investment Length */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Investment Length (years)
            </label>
            <input
              type="number"
              value={inputs.investmentLength}
              onChange={(e) => setInputs(prev => ({ ...prev, investmentLength: parseInt(e.target.value) || 1 }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="1"
              max="50"
            />
          </div>

          {/* Contribution Timing */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Contribution Timing
            </label>
            <select
              value={inputs.contributionTiming}
              onChange={(e) => setInputs(prev => ({ ...prev, contributionTiming: e.target.value as 'beginning' | 'end' }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="end">End of period</option>
              <option value="beginning">Beginning of period</option>
            </select>
          </div>

          {/* Compound Frequency */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Compound Frequency
            </label>
            <select
              value={inputs.compoundFrequency}
              onChange={(e) => setInputs(prev => ({ ...prev, compoundFrequency: e.target.value as any }))}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="annually">Annually</option>
              <option value="semiannually">Semi-annually</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Investment Results</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              isDark ? 'text-green-400' : 'text-green-700'
            }`}>
              {formatCurrency(results.endBalance)}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-green-300' : 'text-green-600'
            }`}>Final Balance</div>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              isDark ? 'text-blue-400' : 'text-blue-700'
            }`}>
              {formatCurrency(results.initialAmount)}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-blue-300' : 'text-blue-600'
            }`}>Starting Amount</div>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              isDark ? 'text-purple-400' : 'text-purple-700'
            }`}>
              {formatCurrency(results.totalContributions)}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-purple-300' : 'text-purple-600'
            }`}>Total Contributions</div>
          </div>

          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              isDark ? 'text-orange-400' : 'text-orange-700'
            }`}>
              {formatCurrency(results.totalInterest)}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-orange-300' : 'text-orange-600'
            }`}>Total Interest</div>
          </div>
        </div>

        {/* Composition Chart */}
        <div className="mb-6">
          <h3 className={`text-lg font-medium mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Balance Composition</h3>
          <div className="flex rounded-lg overflow-hidden h-8">
            <div 
              className="bg-blue-500 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: formatPercentage(results.initialAmount) }}
            >
              {formatPercentage(results.initialAmount)}
            </div>
            <div 
              className="bg-purple-500 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: formatPercentage(results.totalContributions) }}
            >
              {formatPercentage(results.totalContributions)}
            </div>
            <div 
              className="bg-orange-500 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: formatPercentage(results.totalInterest) }}
            >
              {formatPercentage(results.totalInterest)}
            </div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>Starting Amount</span>
            <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>Contributions</span>
            <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>Interest</span>
          </div>
        </div>
      </div>

      {/* Yearly Breakdown */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Yearly Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <th className={`text-left py-3 px-4 font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Year</th>
                <th className={`text-right py-3 px-4 font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Starting Balance</th>
                <th className={`text-right py-3 px-4 font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Contributions</th>
                <th className={`text-right py-3 px-4 font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Interest Earned</th>
                <th className={`text-right py-3 px-4 font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Ending Balance</th>
              </tr>
            </thead>
            <tbody>
              {results.yearlyBreakdown.map((year) => (
                <tr key={year.year} className={`border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <td className={`py-3 px-4 font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{year.year}</td>
                  <td className={`py-3 px-4 text-right ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>{formatCurrency(year.startingBalance)}</td>
                  <td className={`py-3 px-4 text-right ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`}>{formatCurrency(year.contributions)}</td>
                  <td className={`py-3 px-4 text-right ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>{formatCurrency(year.interest)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{formatCurrency(year.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment Tips */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-blue-950/20 border-blue-800' : 'bg-blue-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-blue-200' : 'text-blue-900'
        }`}>💡 Investment Tips</h3>
        <div className={`space-y-2 text-sm ${
          isDark ? 'text-blue-300' : 'text-blue-700'
        }`}>
          <p>• <strong>Start early:</strong> Time is your greatest ally in building wealth through compound interest.</p>
          <p>• <strong>Be consistent:</strong> Regular contributions, even small ones, can lead to significant growth over time.</p>
          <p>• <strong>Diversify:</strong> Don't put all your eggs in one basket - spread risk across different investments.</p>
          <p>• <strong>Consider inflation:</strong> Aim for returns that beat inflation to maintain purchasing power.</p>
          <p>• <strong>Review regularly:</strong> Reassess your strategy periodically and adjust as needed.</p>
        </div>
      </div>
    </div>
  );
}
