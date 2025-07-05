import PDFCompressor from '@/components/pdf-tools/tools/PDFCompressor';
import PDFToolsHeader from '@/components/pdf-tools/PDFToolsHeader';

export default function PDFCompressPage() {
  return (
    <div className="min-h-screen bg-background">
      <PDFToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🗜️</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Compress PDF
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Reduce PDF file size while maintaining quality. Choose compression level to balance file size and document quality.
          </p>
        </div>
        <PDFCompressor />
      </main>
    </div>
  );
}