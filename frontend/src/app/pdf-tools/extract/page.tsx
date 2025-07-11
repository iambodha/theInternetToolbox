import PDFPageExtractor from '@/components/pdf-tools/tools/PDFPageExtractor';
import PDFToolsHeader from '@/components/pdf-tools/PDFToolsHeader';

export default function PDFExtractPage() {
  return (
    <div className="min-h-screen bg-background">
      <PDFToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">📄</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Extract Pages
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Extract specific pages from PDF files. Select individual pages or ranges to create new PDF documents.
          </p>
        </div>
        <PDFPageExtractor />
      </main>
    </div>
  );
}