import VideoRotator from '@/components/video-tools/tools/VideoRotator';
import VideoToolsHeader from '@/components/video-tools/VideoToolsHeader';

export default function VideoRotatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <VideoToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🔄</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Video Rotator
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Rotate videos by 90°, 180°, or 270° to correct orientation. Fix videos recorded in the wrong direction.
          </p>
        </div>
        <VideoRotator />
      </main>
    </div>
  );
}