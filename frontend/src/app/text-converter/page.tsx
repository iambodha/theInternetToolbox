import TextConverter from '@/components/text-tools/tools/TextConverter';
import TextToolsHeader from '@/components/text-tools/TextToolsHeader';

export default function TextConverterPage() {
  return (
    <div className="min-h-screen bg-background">
      <TextToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🔄</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Text Converter
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Convert text between different formats and cases. Transform uppercase, lowercase, title case, and more.
          </p>
        </div>
        <TextConverter />
      </main>
    </div>
  );
}