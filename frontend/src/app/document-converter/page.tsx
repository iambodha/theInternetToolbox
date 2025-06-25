import DocumentConverter from '@/components/file-conversion/tools/DocumentConverter';
import FileConversionHeader from '@/components/file-conversion/FileConversionHeader';

export default function DocumentConverterPage() {
  return (
    <div className="min-h-screen bg-background">
      <FileConversionHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">📄</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Document Converter
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Convert documents between formats like PDF, Word, Excel, PowerPoint, and more.
          </p>
        </div>
        <DocumentConverter />
      </main>
    </div>
  );
}