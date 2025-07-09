import PHCalculator from '@/components/chemistry-tools/tools/pHCalculator';
import ChemistryToolsHeader from '@/components/chemistry-tools/ChemistryToolsHeader';

export default function pHCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <ChemistryToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🔬</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              pH Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Calculate pH, pOH, and ion concentrations. Essential for acid-base chemistry, buffer solutions, and laboratory work.
          </p>
        </div>
        <PHCalculator />
      </main>
    </div>
  );
}