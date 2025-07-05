import PDFRotator from '@/components/pdf-tools/tools/PDFRotator';
import PDFToolsHeader from '@/components/pdf-tools/PDFToolsHeader';

export default function PDFRotatePage() {
  return (
    <div className="min-h-screen bg-background">
      <PDFToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🔄</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Rotate PDF
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Rotate PDF pages to correct orientation. Rotate individual pages or entire documents by 90°, 180°, or 270°.
          </p>
        </div>
        <PDFRotator />
      </main>
    </div>
  );
}