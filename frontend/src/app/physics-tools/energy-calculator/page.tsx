import EnergyCalculator from '@/components/physics-tools/tools/EnergyCalculator';
import PhysicsToolsHeader from '@/components/physics-tools/PhysicsToolsHeader';

export default function EnergyCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <PhysicsToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🔋</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Energy Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Calculate kinetic, potential, and mechanical energy. Analyze work, power, and energy transformations in physical systems.
          </p>
        </div>
        <EnergyCalculator />
      </main>
    </div>
  );
}