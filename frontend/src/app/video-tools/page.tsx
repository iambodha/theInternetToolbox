import VideoToolsHeader from '@/components/video-tools/VideoToolsHeader';
import VideoToolsGrid from '@/components/video-tools/VideoToolsGrid';

export default function VideoToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <VideoToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VideoToolsGrid />
      </main>
    </div>
  );
}