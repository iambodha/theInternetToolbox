import BufferCalculator from '@/components/chemistry-tools/tools/BufferCalculator';
import ChemistryToolsHeader from '@/components/chemistry-tools/ChemistryToolsHeader';

export default function BufferCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <ChemistryToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">⚗️</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Buffer Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Calculate buffer pH using Henderson-Hasselbalch equation. Design buffer systems and determine optimal acid/base ratios for desired pH values.
          </p>
        </div>
        <BufferCalculator />
      </main>
    </div>
  );
}