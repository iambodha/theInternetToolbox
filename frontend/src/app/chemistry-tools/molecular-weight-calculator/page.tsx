import MolecularWeightCalculator from '@/components/chemistry-tools/tools/MolecularWeightCalculator';
import ChemistryToolsHeader from '@/components/chemistry-tools/ChemistryToolsHeader';

export default function MolecularWeightCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <ChemistryToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">⚛️</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Molecular Weight Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Calculate molecular weight from chemical formulas. Enter any chemical formula and get precise molecular weight calculations.
          </p>
        </div>
        <MolecularWeightCalculator />
      </main>
    </div>
  );
}