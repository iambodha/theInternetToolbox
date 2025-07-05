import ReactionTime from '@/components/human-benchmarks/tools/ReactionTime';
import HumanBenchmarksHeader from '@/components/human-benchmarks/HumanBenchmarksHeader';

export default function ReactionTimePage() {
  return (
    <div className="min-h-screen bg-background">
      <HumanBenchmarksHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">⚡</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Reaction Time Test
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Test how quickly you can react to visual stimuli. Click as fast as you can when the screen changes!
          </p>
        </div>
        <ReactionTime />
      </main>
    </div>
  );
}