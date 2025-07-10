import ForceCalculator from '@/components/physics-tools/tools/ForceCalculator';
import PhysicsToolsHeader from '@/components/physics-tools/PhysicsToolsHeader';

export default function ForceCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <PhysicsToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">⚡</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Force Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Calculate forces using Newton's laws, weight calculations, and friction forces. Essential for mechanics and force analysis.
          </p>
        </div>
        <ForceCalculator />
      </main>
    </div>
  );
}