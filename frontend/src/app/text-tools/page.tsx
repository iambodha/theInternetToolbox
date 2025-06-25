import TextToolsGrid from '@/components/text-tools/TextToolsGrid';
import TextToolsHeader from '@/components/text-tools/TextToolsHeader';

export default function TextToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TextToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
            Text Tools
          </h1>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Complete suite of text processing tools to format, convert, analyze, and transform your text. 
            All tools work directly in your browser - no software installation required.
          </p>
        </div>
        <TextToolsGrid />
      </main>
    </div>
  );
}