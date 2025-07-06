import RetirementCalculator from '@/components/investment-tools/tools/RetirementCalculator';
import InvestmentToolsHeader from '@/components/investment-tools/InvestmentToolsHeader';

export default function RetirementCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <InvestmentToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🏖️</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Retirement Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Plan for your retirement with comprehensive calculations including inflation, expenses, and income projections.
          </p>
        </div>
        <RetirementCalculator />
      </main>
    </div>
  );
}