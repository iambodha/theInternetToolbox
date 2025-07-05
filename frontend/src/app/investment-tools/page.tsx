import InvestmentToolsGrid from '@/components/investment-tools/InvestmentToolsGrid';
import InvestmentToolsHeader from '@/components/investment-tools/InvestmentToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function InvestmentToolsPage() {
  return (
    <ToolPageLayout>
      <InvestmentToolsHeader />
      <ToolPageMain>
        <PageTitle
          title="Investment Tools"
          description="Comprehensive suite of investment calculators and planning tools to help you make informed financial decisions and plan for your future."
          variant="page"
        />
        <InvestmentToolsGrid />
      </ToolPageMain>
    </ToolPageLayout>
  );
}