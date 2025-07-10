import KinematicsCalculator from '@/components/physics-tools/tools/KinematicsCalculator';
import PhysicsToolsHeader from '@/components/physics-tools/PhysicsToolsHeader';

export default function KinematicsCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <PhysicsToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🚀</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Kinematics Calculator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Calculate motion parameters including displacement, velocity, acceleration, and time using kinematic equations for constant acceleration.
          </p>
        </div>
        <KinematicsCalculator />
      </main>
    </div>
  );
}