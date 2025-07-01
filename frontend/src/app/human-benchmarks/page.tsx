import HumanBenchmarksGrid from '@/components/human-benchmarks/HumanBenchmarksGrid';
import HumanBenchmarksHeader from '@/components/human-benchmarks/HumanBenchmarksHeader';

export default function HumanBenchmarksPage() {
  return (
    <div className="min-h-screen bg-background">
      <HumanBenchmarksHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🧠</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Human Benchmarks
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Test your cognitive abilities with precision-timed challenges. Measure your reaction time, memory capacity, and mental performance.
          </p>
        </div>
        <HumanBenchmarksGrid />
      </main>
    </div>
  );
}