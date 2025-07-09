import ChemistryToolsGrid from '@/components/chemistry-tools/ChemistryToolsGrid';
import ChemistryToolsHeader from '@/components/chemistry-tools/ChemistryToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function ChemistryToolsPage() {
  return (
    <ToolPageLayout>
      <ChemistryToolsHeader />
      <ToolPageMain>
        <PageTitle
          title="Chemistry Tools"
          description="Essential chemistry calculators and tools for experiments, research, and education. Calculate molarity, pH, gas laws, balance equations, and more."
          variant="page"
        />
        <ChemistryToolsGrid />
      </ToolPageMain>
    </ToolPageLayout>
  );
}