import GasLawsCalculator from '@/components/chemistry-tools/tools/GasLawsCalculator';
import ChemistryToolsHeader from '@/components/chemistry-tools/ChemistryToolsHeader';

export default function GasLawsCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <ChemistryToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🎈</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Gas Laws Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Apply ideal gas law, Boyle&apos;s, Charles&apos;, Gay-Lussac&apos;s, and combined gas laws. Calculate pressure, volume, temperature, and moles relationships.
          </p>
        </div>
        <GasLawsCalculator />
      </main>
    </div>
  );
}