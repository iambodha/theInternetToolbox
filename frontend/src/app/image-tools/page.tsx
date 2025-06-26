import ImageToolsGrid from '@/components/image-tools/ImageToolsGrid';
import ImageToolsHeader from '@/components/image-tools/ImageToolsHeader';

export default function ImageToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ImageToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
            Image Tools
          </h1>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Complete suite of image processing tools to convert, resize, optimize, and edit your images. 
            All tools work directly in your browser - no software installation required.
          </p>
        </div>
        <ImageToolsGrid />
      </main>
    </div>
  );
}