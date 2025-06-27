import ImageResizer from '@/components/image-tools/tools/ImageResizer';
import ImageToolsHeader from '@/components/image-tools/ImageToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function ImageResizerPage() {
  return (
    <ToolPageLayout>
      <ImageToolsHeader />
      <ToolPageMain>
        <PageTitle
          icon="📏"
          title="Image Resizer"
          description="Resize images by exact dimensions or percentage while maintaining quality and aspect ratio."
          variant="tool"
        />
        <ImageResizer />
      </ToolPageMain>
    </ToolPageLayout>
  );
}