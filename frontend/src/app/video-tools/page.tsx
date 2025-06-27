import VideoToolsHeader from '@/components/video-tools/VideoToolsHeader';
import VideoToolsGrid from '@/components/video-tools/VideoToolsGrid';
import { ToolPageLayout, ToolPageMain } from '@/components/ui/ToolPageLayout';

export default function VideoToolsPage() {
  return (
    <ToolPageLayout>
      <VideoToolsHeader />
      <ToolPageMain>
        <VideoToolsGrid />
      </ToolPageMain>
    </ToolPageLayout>
  );
}