import TextFormatter from '@/components/text-tools/tools/TextFormatter';
import TextToolsHeader from '@/components/text-tools/TextToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function TextFormatterPage() {
  return (
    <ToolPageLayout>
      <TextToolsHeader />
      <ToolPageMain>
        <PageTitle
          icon="📝"
          title="Text Formatter"
          description="Format and style text content with various formatting options and transformations."
          variant="tool"
        />
        <TextFormatter />
      </ToolPageMain>
    </ToolPageLayout>
  );
}