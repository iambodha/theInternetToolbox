import PDFOCR from '@/components/pdf-tools/tools/PDFOCR';
import PDFToolsHeader from '@/components/pdf-tools/PDFToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function PDFOCRPage() {
  return (
    <ToolPageLayout>
      <PDFToolsHeader />
      <ToolPageMain>
        <PageTitle
          icon="🔍"
          title="PDF OCR"
          description="Extract text from scanned documents and images within PDFs using advanced Optical Character Recognition technology."
          variant="tool"
        />
        <PDFOCR />
      </ToolPageMain>
    </ToolPageLayout>
  );
}