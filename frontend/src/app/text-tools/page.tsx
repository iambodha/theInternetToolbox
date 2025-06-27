import TextToolsGrid from '@/components/text-tools/TextToolsGrid';
import TextToolsHeader from '@/components/text-tools/TextToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function TextToolsPage() {
  return (
    <ToolPageLayout>
      <TextToolsHeader />
      <ToolPageMain>
        <PageTitle
          title="Text Tools"
          description="Complete suite of text processing tools to format, convert, analyze, and transform your text. All tools work directly in your browser - no software installation required."
          variant="page"
        />
        <TextToolsGrid />
      </ToolPageMain>
    </ToolPageLayout>
  );
}