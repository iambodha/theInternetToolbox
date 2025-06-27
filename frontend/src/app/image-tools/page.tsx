import ImageToolsGrid from '@/components/image-tools/ImageToolsGrid';
import ImageToolsHeader from '@/components/image-tools/ImageToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function ImageToolsPage() {
  return (
    <ToolPageLayout>
      <ImageToolsHeader />
      <ToolPageMain>
        <PageTitle
          title="Image Tools"
          description="Complete suite of image processing tools to convert, resize, optimize, and edit your images. All tools work directly in your browser - no software installation required."
          variant="page"
        />
        <ImageToolsGrid />
      </ToolPageMain>
    </ToolPageLayout>
  );
}