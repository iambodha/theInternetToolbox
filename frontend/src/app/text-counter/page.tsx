import TextCounter from '@/components/text-tools/tools/TextCounter';
import TextToolsHeader from '@/components/text-tools/TextToolsHeader';

export default function TextCounterPage() {
  return (
    <div className="min-h-screen bg-background">
      <TextToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🔢</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Text Counter
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Count words, characters, paragraphs, and lines in your text. Get detailed statistics and analysis.
          </p>
        </div>
        <TextCounter />
      </main>
    </div>
  );
}