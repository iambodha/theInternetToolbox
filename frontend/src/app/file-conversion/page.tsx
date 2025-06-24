import FileConversionGrid from '@/components/file-conversion/FileConversionGrid';
import FileConversionHeader from '@/components/file-conversion/FileConversionHeader';

export default function FileConversionPage() {
  return (
    <div className="min-h-screen bg-background">
      <FileConversionHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
            File Conversion Tools
          </h1>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Convert between different file formats with ease. Transform images, documents, audio, and video files 
            directly in your browser - no software installation required.
          </p>
        </div>
        <FileConversionGrid />
      </main>
    </div>
  );
}