import ImagePixelify from '@/components/image-tools/tools/ImagePixelify';
import ImageToolsHeader from '@/components/image-tools/ImageToolsHeader';

export default function ImagePixelifyPage() {
  return (
    <div className="min-h-screen bg-background">
      <ImageToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🎮</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Image Pixelify
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Transform images into retro pixel art with customizable effects. Create 8-bit style graphics and nostalgic visuals.
          </p>
        </div>
        <ImagePixelify />
      </main>
    </div>
  );
}