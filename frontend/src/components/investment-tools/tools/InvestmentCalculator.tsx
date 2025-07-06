'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface InvestmentInputs {
  initialAmount: number;
  monthlyContribution: number;
  annualReturnRate: number;
  investmentLength: number;
  contributionTiming: 'beginning' | 'end';
  compoundFrequency: 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily';
  adjustForInflation: boolean;
  inflationRate: number;
  contributionGrowth: boolean;
  contributionGrowthRate: number;
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
    compoundFrequency: 'annually',
    adjustForInflation: false,
    inflationRate: 3,
    contributionGrowth: false,
    contributionGrowthRate: 3
  });

  const [inputStrings, setInputStrings] = useState({
    initialAmount: '20000',
    monthlyContribution: '1000',
    annualReturnRate: '6',
    investmentLength: '10',
    inflationRate: '3',
    contributionGrowthRate: '3'
  });

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
    const { initialAmount, monthlyContribution, annualReturnRate, investmentLength, contributionTiming, compoundFrequency, adjustForInflation, inflationRate, contributionGrowth, contributionGrowthRate } = inputs;
    
    const monthlyRate = annualReturnRate / 100 / 12;
    const compoundingPerYear = getCompoundFrequency(compoundFrequency);
    const effectiveRate = annualReturnRate / 100 / compoundingPerYear;
    
    const yearlyBreakdown: YearlyBreakdown[] = [];
    let currentBalance = initialAmount;
    let currentMonthlyContribution = monthlyContribution;
    let totalContributionsActual = 0;
    
    // Calculate year by year
    for (let year = 1; year <= investmentLength; year++) {
      const startingBalance = currentBalance;
      const currentAnnualContribution = currentMonthlyContribution * 12;
      let yearContributions = 0;
      let yearInterest = 0;
      
      if (contributionTiming === 'beginning') {
        // Add contribution at beginning of year
        currentBalance += currentAnnualContribution;
        yearContributions = currentAnnualContribution;
        
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
          currentBalance += currentMonthlyContribution;
          yearContributions += currentMonthlyContribution;
          
          // Apply monthly interest (simplified to monthly compounding for contributions)
          const monthlyInterest = currentBalance * monthlyRate;
          yearInterest += monthlyInterest;
          currentBalance += monthlyInterest;
        }
      }
      
      totalContributionsActual += yearContributions;
      
      yearlyBreakdown.push({
        year,
        startingBalance,
        contributions: yearContributions,
        interest: yearInterest,
        endingBalance: currentBalance
      });
      
      // Adjust contributions for growth if enabled (for next year)
      if (contributionGrowth) {
        currentMonthlyContribution *= (1 + contributionGrowthRate / 100);
      }
    }
    
    const endBalance = currentBalance;
    const totalInterest = endBalance - initialAmount - totalContributionsActual;
    
    // Apply inflation adjustment if enabled
    const inflationAdjustedResults = adjustForInflation ? {
      endBalance: endBalance / Math.pow(1 + inflationRate / 100, investmentLength),
      totalContributions: totalContributionsActual / Math.pow(1 + inflationRate / 100, investmentLength / 2), // Average adjustment
      totalInterest: totalInterest / Math.pow(1 + inflationRate / 100, investmentLength),
      initialAmount: initialAmount, // Initial amount is in today's dollars
      yearlyBreakdown: yearlyBreakdown.map(year => ({
        ...year,
        startingBalance: year.startingBalance / Math.pow(1 + inflationRate / 100, year.year - 1),
        contributions: year.contributions / Math.pow(1 + inflationRate / 100, year.year - 1),
        interest: year.interest / Math.pow(1 + inflationRate / 100, year.year - 1),
        endingBalance: year.endingBalance / Math.pow(1 + inflationRate / 100, year.year)
      }))
    } : {
      endBalance,
      totalContributions: totalContributionsActual,
      totalInterest,
      initialAmount,
      yearlyBreakdown
    };
    
    return inflationAdjustedResults;
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
              value={inputStrings.initialAmount}
              onChange={(e) => {
                const value = e.target.value.replace(',', '.');
                setInputStrings(prev => ({ ...prev, initialAmount: e.target.value }));
                setInputs(prev => ({ ...prev, initialAmount: value === '' ? 0 : parseFloat(value) || 0 }));
              }}
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
              value={inputStrings.monthlyContribution}
              onChange={(e) => {
                const value = e.target.value.replace(',', '.');
                setInputStrings(prev => ({ ...prev, monthlyContribution: e.target.value }));
                setInputs(prev => ({ ...prev, monthlyContribution: value === '' ? 0 : parseFloat(value) || 0 }));
              }}
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
              value={inputStrings.annualReturnRate}
              onChange={(e) => {
                const value = e.target.value.replace(',', '.');
                setInputStrings(prev => ({ ...prev, annualReturnRate: e.target.value }));
                setInputs(prev => ({ ...prev, annualReturnRate: value === '' ? 0 : parseFloat(value) || 0 }));
              }}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              max="50"
              step="0.1"
              lang="en-US"
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
              value={inputStrings.investmentLength}
              onChange={(e) => {
                setInputStrings(prev => ({ ...prev, investmentLength: e.target.value }));
                setInputs(prev => ({ ...prev, investmentLength: e.target.value === '' ? 1 : parseInt(e.target.value) || 1 }));
              }}
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
              onChange={(e) => setInputs(prev => ({ ...prev, compoundFrequency: e.target.value as InvestmentInputs['compoundFrequency'] }))}
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

          {/* Adjust for Inflation */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={inputs.adjustForInflation}
                onChange={(e) => setInputs(prev => ({ ...prev, adjustForInflation: e.target.checked }))}
                className={`w-5 h-5 rounded-full ${
                  isDark ? 'bg-blue-600 border-transparent' : 'bg-blue-50 border-blue-300'
                }`}
              />
              <label className={`ml-3 text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Adjust for Inflation
              </label>
            </div>

            {inputs.adjustForInflation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inflation Rate */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Inflation Rate (%)
                  </label>
                  <input
                    type="number"
                    value={inputStrings.inflationRate}
                    onChange={(e) => {
                      const value = e.target.value.replace(',', '.');
                      setInputStrings(prev => ({ ...prev, inflationRate: e.target.value }));
                      setInputs(prev => ({ ...prev, inflationRate: value === '' ? 0 : parseFloat(value) || 0 }));
                    }}
                    className={`w-full p-3 border rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    max="50"
                    step="0.1"
                    lang="en-US"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contribution Growth */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={inputs.contributionGrowth}
                onChange={(e) => setInputs(prev => ({ ...prev, contributionGrowth: e.target.checked }))}
                className={`w-5 h-5 rounded-full ${
                  isDark ? 'bg-blue-600 border-transparent' : 'bg-blue-50 border-blue-300'
                }`}
              />
              <label className={`ml-3 text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Enable Contribution Growth
              </label>
            </div>

            {inputs.contributionGrowth && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contribution Growth Rate */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Contribution Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    value={inputStrings.contributionGrowthRate}
                    onChange={(e) => {
                      const value = e.target.value.replace(',', '.');
                      setInputStrings(prev => ({ ...prev, contributionGrowthRate: e.target.value }));
                      setInputs(prev => ({ ...prev, contributionGrowthRate: value === '' ? 0 : parseFloat(value) || 0 }));
                    }}
                    className={`w-full p-3 border rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    max="50"
                    step="0.1"
                    lang="en-US"
                  />
                </div>
              </div>
            )}
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
              className="bg-blue-500"
              style={{ width: formatPercentage(results.initialAmount) }}
            />
            <div 
              className="bg-purple-500"
              style={{ width: formatPercentage(results.totalContributions) }}
            />
            <div 
              className="bg-orange-500"
              style={{ width: formatPercentage(results.totalInterest) }}
            />
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Starting Amount ({formatPercentage(results.initialAmount)})
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                Total Contributions ({formatPercentage(results.totalContributions)})
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                Total Interest ({formatPercentage(results.totalInterest)})
              </span>
            </div>
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

      {/* Investment Growth Chart */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Investment Growth Breakdown by Year</h2>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={results.yearlyBreakdown.map(year => {
              // Calculate cumulative contributions up to this year
              const cumulativeContributions = results.yearlyBreakdown
                .slice(0, year.year)
                .reduce((sum, y) => sum + y.contributions, 0);
              
              // Calculate cumulative interest up to this year
              const cumulativeInterest = results.yearlyBreakdown
                .slice(0, year.year)
                .reduce((sum, y) => sum + y.interest, 0);
              
              return {
                year: year.year,
                'Starting Amount': results.initialAmount,
                'Total Contributions': cumulativeContributions,
                'Total Interest': cumulativeInterest
              };
            })}
            style={{ cursor: 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" className={isDark ? 'stroke-gray-700' : 'stroke-gray-200'} />
            <XAxis 
              dataKey="year" 
              className={isDark ? 'text-gray-300' : 'text-gray-700'}
              tick={{ fill: isDark ? '#d1d5db' : '#374151' }}
            />
            <YAxis 
              className={isDark ? 'text-gray-300' : 'text-gray-700'}
              tick={{ fill: isDark ? '#d1d5db' : '#374151' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#374151' : '#ffffff',
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#000000'
              }}
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Year ${label}`}
              cursor={false}
            />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              iconType="rect"
            />
            <Bar 
              dataKey="Starting Amount" 
              stackId="a" 
              fill="#3b82f6"
              name="Starting Amount"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="Total Contributions" 
              stackId="a" 
              fill="#8b5cf6"
              name="Total Contributions"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="Total Interest" 
              stackId="a" 
              fill="#f59e0b"
              name="Total Interest"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
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
          <p>• <strong>Diversify:</strong> Don&apos;t put all your eggs in one basket - spread risk across different investments.</p>
          <p>• <strong>Consider inflation:</strong> Aim for returns that beat inflation to maintain purchasing power.</p>
          <p>• <strong>Review regularly:</strong> Reassess your strategy periodically and adjust as needed.</p>
        </div>
      </div>
    </div>
  );
}
