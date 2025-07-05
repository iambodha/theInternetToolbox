import ColorStrength from '@/components/human-benchmarks/tools/ColorStrength';
import HumanBenchmarksHeader from '@/components/human-benchmarks/HumanBenchmarksHeader';

export default function ColorStrengthPage() {
  return (
    <div className="min-h-screen bg-background">
      <HumanBenchmarksHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🎨</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Color Strength Test
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Test your color discrimination by finding the odd color out. Challenge your color perception skills!
          </p>
        </div>
        <ColorStrength />
      </main>
    </div>
  );
}