import PDFMerger from '@/components/pdf-tools/tools/PDFMerger';
import PDFToolsHeader from '@/components/pdf-tools/PDFToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function PDFMergerPage() {
  return (
    <ToolPageLayout>
      <PDFToolsHeader />
      <ToolPageMain>
        <PageTitle
          icon="🔗"
          title="PDF Merger"
          description="Combine multiple PDF files into one document. Drag and drop to reorder files before merging."
          variant="tool"
        />
        <PDFMerger />
      </ToolPageMain>
    </ToolPageLayout>
  );
}