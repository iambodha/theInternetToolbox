import PDFToolsGrid from '@/components/pdf-tools/PDFToolsGrid';
import PDFToolsHeader from '@/components/pdf-tools/PDFToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function PDFToolsPage() {
  return (
    <ToolPageLayout>
      <PDFToolsHeader />
      <ToolPageMain>
        <PageTitle
          title="PDF Tools"
          description="Complete suite of PDF tools to merge, split, compress, convert, and edit your PDF files. All tools work directly in your browser - no software installation required."
          variant="page"
        />
        <PDFToolsGrid />
      </ToolPageMain>
    </ToolPageLayout>
  );
}