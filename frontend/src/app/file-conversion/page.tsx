import FileConversionGrid from '@/components/file-conversion/FileConversionGrid';
import FileConversionHeader from '@/components/file-conversion/FileConversionHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function FileConversionPage() {
  return (
    <ToolPageLayout>
      <FileConversionHeader />
      <ToolPageMain>
        <PageTitle
          title="File Conversion Tools"
          description="Convert between different file formats with ease. Transform images, documents, audio, and video files directly in your browser - no software installation required."
          variant="page"
        />
        <FileConversionGrid />
      </ToolPageMain>
    </ToolPageLayout>
  );
}