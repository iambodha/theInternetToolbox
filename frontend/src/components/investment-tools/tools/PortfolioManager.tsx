'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PortfolioAsset {
  id: string;
  name: string;
  targetWeight: number;
  currentValue: number;
  symbol?: string;
}

interface RebalanceStep {
  type: 'buy' | 'sell';
  asset: string;
  amount: number;
  reason: string;
}

interface PortfolioAnalysis {
  totalValue: number;
  currentWeights: { [key: string]: number };
  targetWeights: { [key: string]: number };
  deviations: { [key: string]: number };
  rebalanceSteps: RebalanceStep[];
  afterRebalanceWeights: { [key: string]: number };
  afterRebalanceValues: { [key: string]: number };
}

export default function PortfolioManager() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [assets, setAssets] = useState<PortfolioAsset[]>([
    { id: '1', name: 'Stocks', targetWeight: 70, currentValue: 7000, symbol: 'STOCKS' },
    { id: '2', name: 'Bonds', targetWeight: 20, currentValue: 1500, symbol: 'BONDS' },
    { id: '3', name: 'Gold', targetWeight: 10, currentValue: 800, symbol: 'GOLD' },
  ]);

  const [newInvestment, setNewInvestment] = useState(1000);
  const [allowRebalancing, setAllowRebalancing] = useState(false);
  const [rebalanceThreshold, setRebalanceThreshold] = useState(5); // 5% threshold

  const analysis = useMemo((): PortfolioAnalysis => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalTargetWeight = assets.reduce((sum, asset) => sum + asset.targetWeight, 0);
    
    // Normalize target weights to 100%
    const normalizedTargets = assets.reduce((acc, asset) => {
      acc[asset.id] = (asset.targetWeight / totalTargetWeight) * 100;
      return acc;
    }, {} as { [key: string]: number });

    // Calculate current weights
    const currentWeights = assets.reduce((acc, asset) => {
      acc[asset.id] = totalValue > 0 ? (asset.currentValue / totalValue) * 100 : 0;
      return acc;
    }, {} as { [key: string]: number });

    // Calculate deviations
    const deviations = assets.reduce((acc, asset) => {
      acc[asset.id] = currentWeights[asset.id] - normalizedTargets[asset.id];
      return acc;
    }, {} as { [key: string]: number });

    // Calculate rebalance steps
    const rebalanceSteps: RebalanceStep[] = [];
    const newTotalValue = totalValue + newInvestment;
    
    // Target values after new investment
    const targetValues = assets.reduce((acc, asset) => {
      acc[asset.id] = (normalizedTargets[asset.id] / 100) * newTotalValue;
      return acc;
    }, {} as { [key: string]: number });

    // Calculate required adjustments
    const adjustments = assets.reduce((acc, asset) => {
      acc[asset.id] = targetValues[asset.id] - asset.currentValue;
      return acc;
    }, {} as { [key: string]: number });

    // If rebalancing is allowed, consider selling overweight assets
    if (allowRebalancing) {
      // Find assets that need selling (overweight beyond threshold)
      const assetsToSell = assets.filter(asset => 
        deviations[asset.id] > rebalanceThreshold && adjustments[asset.id] < 0
      );
      
      // Find assets that need buying (underweight beyond threshold)
      const assetsToBuy = assets.filter(asset => 
        deviations[asset.id] < -rebalanceThreshold && adjustments[asset.id] > 0
      );

      // Create sell steps
      assetsToSell.forEach(asset => {
        const sellAmount = Math.min(
          Math.abs(adjustments[asset.id]),
          asset.currentValue * (Math.abs(deviations[asset.id]) / 100)
        );
        if (sellAmount > 10) { // Only if meaningful amount
          rebalanceSteps.push({
            type: 'sell',
            asset: asset.name,
            amount: sellAmount,
            reason: `Reduce overweight position (${deviations[asset.id].toFixed(1)}% over target)`
          });
        }
      });

      // Calculate total funds available (new investment + sales)
      const totalAvailable = newInvestment + rebalanceSteps
        .filter(step => step.type === 'sell')
        .reduce((sum, step) => sum + step.amount, 0);

      // Distribute available funds based on how underweight each asset is
      const totalUnderweight = assetsToBuy.reduce((sum, asset) => 
        sum + Math.max(0, -adjustments[asset.id]), 0
      );

      if (totalUnderweight > 0) {
        assetsToBuy.forEach(asset => {
          const buyAmount = (Math.max(0, -adjustments[asset.id]) / totalUnderweight) * totalAvailable;
          if (buyAmount > 10) {
            rebalanceSteps.push({
              type: 'buy',
              asset: asset.name,
              amount: buyAmount,
              reason: `Increase underweight position (${Math.abs(deviations[asset.id]).toFixed(1)}% under target)`
            });
          }
        });
      }

      // If there's remaining investment after targeted buys, distribute proportionally
      const totalBuyAmount = rebalanceSteps
        .filter(step => step.type === 'buy')
        .reduce((sum, step) => sum + step.amount, 0);
      
      const remainingInvestment = totalAvailable - totalBuyAmount;
      if (remainingInvestment > 10) {
        const totalNormalizedTargets = Object.values(normalizedTargets).reduce((sum, weight) => sum + weight, 0);
        assets.forEach(asset => {
          const proportionalAmount = (normalizedTargets[asset.id] / totalNormalizedTargets) * remainingInvestment;
          if (proportionalAmount > 1) {
            rebalanceSteps.push({
              type: 'buy',
              asset: asset.name,
              amount: proportionalAmount,
              reason: 'Proportional investment based on target allocation'
            });
          }
        });
      }
    } else {
      // Simple approach: just buy based on how underweight each asset is
      const underweightAssets = assets.filter(asset => adjustments[asset.id] > 0);
      const totalNeeded = underweightAssets.reduce((sum, asset) => sum + adjustments[asset.id], 0);
      
      if (totalNeeded > 0) {
        underweightAssets.forEach(asset => {
          const buyAmount = (adjustments[asset.id] / totalNeeded) * newInvestment;
          if (buyAmount > 0) {
            rebalanceSteps.push({
              type: 'buy',
              asset: asset.name,
              amount: buyAmount,
              reason: `Bring allocation closer to target (${Math.abs(deviations[asset.id]).toFixed(1)}% under target)`
            });
          }
        });
      } else {
        // If all assets are at or above target, distribute proportionally
        assets.forEach(asset => {
          const proportionalAmount = (normalizedTargets[asset.id] / 100) * newInvestment;
          rebalanceSteps.push({
            type: 'buy',
            asset: asset.name,
            amount: proportionalAmount,
            reason: 'Proportional investment based on target allocation'
          });
        });
      }
    }

    // Calculate final values and weights after rebalancing
    const afterRebalanceValues = assets.reduce((acc, asset) => {
      const buyAmount = rebalanceSteps
        .filter(step => step.type === 'buy' && step.asset === asset.name)
        .reduce((sum, step) => sum + step.amount, 0);
      const sellAmount = rebalanceSteps
        .filter(step => step.type === 'sell' && step.asset === asset.name)
        .reduce((sum, step) => sum + step.amount, 0);
      
      acc[asset.id] = asset.currentValue + buyAmount - sellAmount;
      return acc;
    }, {} as { [key: string]: number });

    const finalTotalValue = Object.values(afterRebalanceValues).reduce((sum, value) => sum + value, 0);
    const afterRebalanceWeights = assets.reduce((acc, asset) => {
      acc[asset.id] = finalTotalValue > 0 ? (afterRebalanceValues[asset.id] / finalTotalValue) * 100 : 0;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalValue,
      currentWeights,
      targetWeights: normalizedTargets,
      deviations,
      rebalanceSteps,
      afterRebalanceWeights,
      afterRebalanceValues
    };
  }, [assets, newInvestment, allowRebalancing, rebalanceThreshold]);

  const addAsset = () => {
    const newId = (assets.length + 1).toString();
    setAssets(prev => [...prev, {
      id: newId,
      name: `Asset ${newId}`,
      targetWeight: 0,
      currentValue: 0,
      symbol: `ASSET${newId}`
    }]);
  };

  const removeAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const updateAsset = (id: string, field: keyof PortfolioAsset, value: string | number) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getDeviationColor = (deviation: number) => {
    if (Math.abs(deviation) <= 2) return isDark ? 'text-green-400' : 'text-green-600';
    if (Math.abs(deviation) <= 5) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getDeviationBg = (deviation: number) => {
    if (Math.abs(deviation) <= 2) return isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200';
    if (Math.abs(deviation) <= 5) return isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200';
    return isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Setup */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Portfolio Assets</h2>
          <button
            onClick={addAsset}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Add Asset
          </button>
        </div>

        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.id} className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Asset Name</label>
                  <input
                    type="text"
                    value={asset.name}
                    onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                    className={`w-full p-2 border rounded-lg text-sm ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Target Weight (%)</label>
                  <input
                    type="number"
                    value={asset.targetWeight}
                    onChange={(e) => updateAsset(asset.id, 'targetWeight', parseFloat(e.target.value) || 0)}
                    className={`w-full p-2 border rounded-lg text-sm ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Current Value ($)</label>
                  <input
                    type="number"
                    value={asset.currentValue}
                    onChange={(e) => updateAsset(asset.id, 'currentValue', parseFloat(e.target.value) || 0)}
                    className={`w-full p-2 border rounded-lg text-sm ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    min="0"
                    step="100"
                  />
                </div>
                <div className="flex items-end">
                  {assets.length > 1 && (
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDark ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Total Target Weight: {assets.reduce((sum, asset) => sum + asset.targetWeight, 0).toFixed(1)}%
            </span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              Current Portfolio Value: {formatCurrency(analysis.totalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Investment Settings */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Investment Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>New Investment Amount ($)</label>
            <input
              type="number"
              value={newInvestment}
              onChange={(e) => setNewInvestment(parseFloat(e.target.value) || 0)}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>Rebalance Threshold (%)</label>
            <input
              type="number"
              value={rebalanceThreshold}
              onChange={(e) => setRebalanceThreshold(parseFloat(e.target.value) || 0)}
              className={`w-full p-3 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              max="20"
              step="0.5"
            />
          </div>

          <div className="flex items-end">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowRebalancing"
                checked={allowRebalancing}
                onChange={(e) => setAllowRebalancing(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="allowRebalancing" className={`ml-2 text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Allow Rebalancing
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Current Allocation */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Current vs Target Allocation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const deviation = analysis.deviations[asset.id];
            return (
              <div key={asset.id} className={`p-4 rounded-lg border ${getDeviationBg(deviation)}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {asset.name}
                  </h3>
                  <span className={`text-sm ${getDeviationColor(deviation)}`}>
                    {deviation > 0 ? '+' : ''}{formatPercentage(deviation)}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Current:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatPercentage(analysis.currentWeights[asset.id])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Target:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatPercentage(analysis.targetWeights[asset.id])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Value:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(asset.currentValue)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rebalancing Steps */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Rebalancing Plan</h2>

        {analysis.rebalanceSteps.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  isDark ? 'text-blue-200' : 'text-blue-900'
                }`}>Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Investment:</span>
                    <span className="font-medium">{formatCurrency(newInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Actions:</span>
                    <span className="font-medium">{analysis.rebalanceSteps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buy Orders:</span>
                    <span className="font-medium text-green-600">
                      {analysis.rebalanceSteps.filter(s => s.type === 'buy').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sell Orders:</span>
                    <span className="font-medium text-red-600">
                      {analysis.rebalanceSteps.filter(s => s.type === 'sell').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  isDark ? 'text-green-200' : 'text-green-900'
                }`}>After Rebalancing</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>New Portfolio Value:</span>
                    <span className="font-medium">
                      {formatCurrency(Object.values(analysis.afterRebalanceValues).reduce((sum, value) => sum + value, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Deviation:</span>
                    <span className="font-medium">
                      {formatPercentage(Math.max(...assets.map(asset => 
                        Math.abs(analysis.afterRebalanceWeights[asset.id] - analysis.targetWeights[asset.id])
                      )))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Step-by-Step Instructions:
              </h3>
              {analysis.rebalanceSteps.map((step, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  step.type === 'buy'
                    ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                    : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.type === 'buy'
                          ? isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                          : isDark ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className={`font-medium ${
                          step.type === 'buy'
                            ? isDark ? 'text-green-200' : 'text-green-800'
                            : isDark ? 'text-red-200' : 'text-red-800'
                        }`}>
                          {step.type === 'buy' ? 'BUY' : 'SELL'} {formatCurrency(step.amount)} of {step.asset}
                        </div>
                        <div className={`text-sm ${
                          step.type === 'buy'
                            ? isDark ? 'text-green-300' : 'text-green-600'
                            : isDark ? 'text-red-300' : 'text-red-600'
                        }`}>
                          {step.reason}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      step.type === 'buy'
                        ? isDark ? 'text-green-200' : 'text-green-800'
                        : isDark ? 'text-red-200' : 'text-red-800'
                    }`}>
                      {step.type === 'buy' ? '+' : '-'}{formatCurrency(step.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No rebalancing needed. Your portfolio is well-balanced according to your target allocation.
            </p>
          </div>
        )}
      </div>

      {/* Final Allocation Preview */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Final Allocation Preview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const finalDeviation = analysis.afterRebalanceWeights[asset.id] - analysis.targetWeights[asset.id];
            return (
              <div key={asset.id} className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {asset.name}
                  </h3>
                  <span className={`text-sm ${getDeviationColor(finalDeviation)}`}>
                    {finalDeviation > 0 ? '+' : ''}{formatPercentage(finalDeviation)}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>New Weight:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatPercentage(analysis.afterRebalanceWeights[asset.id])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Target:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatPercentage(analysis.targetWeights[asset.id])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>New Value:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatCurrency(analysis.afterRebalanceValues[asset.id])}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Information Panel */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-blue-950/20 border-blue-800' : 'bg-blue-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-blue-200' : 'text-blue-900'
        }`}>📊 Portfolio Management Tips</h3>
        <div className={`space-y-2 text-sm ${
          isDark ? 'text-blue-300' : 'text-blue-700'
        }`}>
          <p>• <strong>Rebalancing:</strong> Enable rebalancing to sell overweight assets and buy underweight ones for optimal allocation.</p>
          <p>• <strong>Threshold:</strong> Set a deviation threshold (e.g., 5%) to avoid frequent small adjustments.</p>
          <p>• <strong>Target Weights:</strong> Ensure your target weights add up to 100% for proper allocation.</p>
          <p>• <strong>Regular Review:</strong> Review and rebalance your portfolio quarterly or semi-annually.</p>
          <p>• <strong>Tax Considerations:</strong> Consider tax implications when selling assets in taxable accounts.</p>
        </div>
      </div>
    </div>
  );
}
