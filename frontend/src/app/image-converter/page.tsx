import ImageConverter from '@/components/file-conversion/tools/ImageConverter';
import FileConversionHeader from '@/components/file-conversion/FileConversionHeader';

export default function ImageConverterPage() {
  return (
    <div className="min-h-screen bg-background">
      <FileConversionHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🖼️</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Image Converter
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Convert between different image formats including JPG, PNG, WebP, GIF, and more.
          </p>
        </div>
        <ImageConverter />
      </main>
    </div>
  );
}