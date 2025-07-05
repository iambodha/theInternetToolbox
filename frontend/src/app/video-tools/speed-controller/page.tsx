import VideoSpeedController from '@/components/video-tools/tools/VideoSpeedController';
import VideoToolsHeader from '@/components/video-tools/VideoToolsHeader';

export default function VideoSpeedControllerPage() {
  return (
    <div className="min-h-screen bg-background">
      <VideoToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">⏱️</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Video Speed Controller
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Change video playback speed to create slow motion or time-lapse effects. Perfect for creative video editing.
          </p>
        </div>
        <VideoSpeedController />
      </main>
    </div>
  );
}