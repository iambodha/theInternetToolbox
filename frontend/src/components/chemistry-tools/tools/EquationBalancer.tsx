'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Compound {
  formula: string;
  coefficient: number;
}

interface BalancedEquation {
  reactants: Compound[];
  products: Compound[];
  isBalanced: boolean;
  error?: string;
}

export default function EquationBalancer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [reactantsInput, setReactantsInput] = useState('H2 + O2');
  const [productsInput, setProductsInput] = useState('H2O');
  const [balancedEquation, setBalancedEquation] = useState<BalancedEquation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simple chemical equation parser
  const parseFormula = (formula: string): { [element: string]: number } => {
    const elements: { [element: string]: number } = {};
    
    // Remove spaces and handle parentheses (simplified approach)
    const cleanFormula = formula.replace(/\s/g, '');
    
    // Match element symbols with optional counts
    const matches = cleanFormula.match(/([A-Z][a-z]?)(\d*)/g) || [];
    
    matches.forEach(match => {
      const elementMatch = match.match(/([A-Z][a-z]?)(\d*)/);
      if (elementMatch) {
        const element = elementMatch[1];
        const count = parseInt(elementMatch[2]) || 1;
        elements[element] = (elements[element] || 0) + count;
      }
    });
    
    return elements;
  };

  // Get all unique elements from the equation
  const getAllElements = (reactants: string[], products: string[]): string[] => {
    const elements = new Set<string>();
    
    [...reactants, ...products].forEach(compound => {
      const parsedFormula = parseFormula(compound);
      Object.keys(parsedFormula).forEach(element => elements.add(element));
    });
    
    return Array.from(elements).sort();
  };

  // Simple balancing algorithm using trial and error for small equations
  const balanceEquation = (reactants: string[], products: string[]): BalancedEquation => {
    try {
      const allElements = getAllElements(reactants, products);
      const maxCoefficient = 10; // Limit search space
      
      // Try different coefficient combinations
      for (let r1 = 1; r1 <= maxCoefficient; r1++) {
        for (let r2 = 1; r2 <= maxCoefficient; r2++) {
          for (let p1 = 1; p1 <= maxCoefficient; p1++) {
            for (let p2 = 1; p2 <= maxCoefficient; p2++) {
              const coefficients = {
                reactants: reactants.length === 1 ? [r1] : [r1, r2],
                products: products.length === 1 ? [p1] : [p1, p2]
              };
              
              if (isEquationBalanced(reactants, products, coefficients, allElements)) {
                return {
                  reactants: reactants.map((formula, i) => ({
                    formula,
                    coefficient: coefficients.reactants[i] || 1
                  })),
                  products: products.map((formula, i) => ({
                    formula,
                    coefficient: coefficients.products[i] || 1
                  })),
                  isBalanced: true
                };
              }
            }
          }
        }
      }
      
      return {
        reactants: reactants.map(formula => ({ formula, coefficient: 1 })),
        products: products.map(formula => ({ formula, coefficient: 1 })),
        isBalanced: false,
        error: 'Could not balance equation automatically. Try a simpler equation or check for errors.'
      };
    } catch (error) {
      return {
        reactants: reactants.map(formula => ({ formula, coefficient: 1 })),
        products: products.map(formula => ({ formula, coefficient: 1 })),
        isBalanced: false,
        error: 'Error parsing chemical formulas. Please check your input.'
      };
    }
  };

  // Check if equation is balanced with given coefficients
  const isEquationBalanced = (
    reactants: string[], 
    products: string[], 
    coefficients: { reactants: number[], products: number[] },
    elements: string[]
  ): boolean => {
    for (const element of elements) {
      let reactantCount = 0;
      let productCount = 0;
      
      // Count atoms on reactant side
      reactants.forEach((compound, i) => {
        const parsedFormula = parseFormula(compound);
        const count = parsedFormula[element] || 0;
        reactantCount += count * (coefficients.reactants[i] || 1);
      });
      
      // Count atoms on product side
      products.forEach((compound, i) => {
        const parsedFormula = compound;
        const parsedFormula2 = parseFormula(parsedFormula);
        const count = parsedFormula2[element] || 0;
        productCount += count * (coefficients.products[i] || 1);
      });
      
      if (reactantCount !== productCount) {
        return false;
      }
    }
    
    return true;
  };

  const handleBalance = () => {
    setIsLoading(true);
    
    // Parse input
    const reactants = reactantsInput.split('+').map(r => r.trim()).filter(r => r);
    const products = productsInput.split('+').map(p => p.trim()).filter(p => p);
    
    if (reactants.length === 0 || products.length === 0) {
      setBalancedEquation({
        reactants: [],
        products: [],
        isBalanced: false,
        error: 'Please enter both reactants and products'
      });
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      const result = balanceEquation(reactants, products);
      setBalancedEquation(result);
      setIsLoading(false);
    }, 500);
  };

  const clearAll = () => {
    setReactantsInput('');
    setProductsInput('');
    setBalancedEquation(null);
  };

  const loadExample = (reactants: string, products: string) => {
    setReactantsInput(reactants);
    setProductsInput(products);
    setBalancedEquation(null);
  };

  const formatEquation = (equation: BalancedEquation) => {
    const reactantsPart = equation.reactants
      .map(r => `${r.coefficient > 1 ? r.coefficient : ''}${r.formula}`)
      .join(' + ');
    
    const productsPart = equation.products
      .map(p => `${p.coefficient > 1 ? p.coefficient : ''}${p.formula}`)
      .join(' + ');
    
    return `${reactantsPart} → ${productsPart}`;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Reactants (separate with +)
          </label>
          <input
            type="text"
            value={reactantsInput}
            onChange={(e) => setReactantsInput(e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="e.g., H2 + O2"
          />
          <p className="text-xs text-foreground/60 mt-1">
            Enter chemical formulas separated by + signs
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Products (separate with +)
          </label>
          <input
            type="text"
            value={productsInput}
            onChange={(e) => setProductsInput(e.target.value)}
            className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
            placeholder="e.g., H2O"
          />
          <p className="text-xs text-foreground/60 mt-1">
            Enter chemical formulas separated by + signs
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleBalance}
          disabled={isLoading}
          className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Balancing...' : 'Balance Equation'}
        </button>
        <button
          onClick={clearAll}
          className="px-6 py-3 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Example Equations */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📝 Try These Examples</h4>
        <div className="space-y-2">
          {[
            { reactants: 'H2 + O2', products: 'H2O', name: 'Water Formation' },
            { reactants: 'CH4 + O2', products: 'CO2 + H2O', name: 'Methane Combustion' },
            { reactants: 'Fe + O2', products: 'Fe2O3', name: 'Iron Oxidation' },
            { reactants: 'C2H6 + O2', products: 'CO2 + H2O', name: 'Ethane Combustion' },
            { reactants: 'Al + HCl', products: 'AlCl3 + H2', name: 'Aluminum & Acid' }
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example.reactants, example.products)}
              className="text-left w-full p-2 rounded text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <span className="font-medium">{example.name}:</span> {example.reactants} → {example.products}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {balancedEquation && (
        <div className={`p-6 rounded-lg border ${
          balancedEquation.isBalanced 
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            balancedEquation.isBalanced 
              ? 'text-green-900 dark:text-green-100'
              : 'text-red-900 dark:text-red-100'
          }`}>
            {balancedEquation.isBalanced ? '✅ Balanced Equation' : '❌ Balancing Failed'}
          </h3>
          
          {balancedEquation.isBalanced ? (
            <div className="space-y-4">
              <div className={`text-2xl font-mono font-bold text-center p-4 rounded-lg ${
                isDark ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                {formatEquation(balancedEquation)}
              </div>
              
              {/* Atom Count Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Reactants</h4>
                  <div className="space-y-1">
                    {balancedEquation.reactants.map((compound, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="font-mono">
                          {compound.coefficient > 1 && compound.coefficient}{compound.formula}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Products</h4>
                  <div className="space-y-1">
                    {balancedEquation.products.map((compound, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="font-mono">
                          {compound.coefficient > 1 && compound.coefficient}{compound.formula}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-700 dark:text-red-300">
              {balancedEquation.error}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">💡 How to Use</h4>
        <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
          <li>• Enter reactants and products using standard chemical formulas</li>
          <li>• Separate multiple compounds with + signs</li>
          <li>• Use proper capitalization (H2O, not h2o)</li>
          <li>• The tool works best with simple equations (2-4 compounds)</li>
          <li>• Examples: H2, O2, H2O, CH4, CO2, Fe2O3, NaCl</li>
        </ul>
      </div>

      {/* Limitations */}
      <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">⚠️ Limitations</h4>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>• This is a simplified balancer for basic equations</li>
          <li>• Complex equations with many compounds may not balance</li>
          <li>• Parentheses in formulas have limited support</li>
          <li>• For complex organic reactions, use specialized chemistry software</li>
        </ul>
      </div>
    </div>
  );
}