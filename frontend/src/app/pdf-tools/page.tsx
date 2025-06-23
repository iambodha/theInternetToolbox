import PDFToolsGrid from '@/components/pdf-tools/PDFToolsGrid';
import PDFToolsHeader from '@/components/pdf-tools/PDFToolsHeader';

export default function PDFToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PDFToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
            PDF Tools
          </h1>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Complete suite of PDF tools to merge, split, compress, convert, and edit your PDF files. 
            All tools work directly in your browser - no software installation required.
          </p>
        </div>
        <PDFToolsGrid />
      </main>
    </div>
  );
}