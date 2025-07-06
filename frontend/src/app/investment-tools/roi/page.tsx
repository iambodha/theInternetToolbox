import ROICalculator from '@/components/investment-tools/tools/ROICalculator';
import InvestmentToolsHeader from '@/components/investment-tools/InvestmentToolsHeader';

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <InvestmentToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">💰</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              ROI Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Calculate return on investment with detailed metrics and compare multiple investment options side by side.
          </p>
        </div>
        <ROICalculator />
      </main>
    </div>
  );
}