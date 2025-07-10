import PhysicsToolsGrid from '@/components/physics-tools/PhysicsToolsGrid';
import PhysicsToolsHeader from '@/components/physics-tools/PhysicsToolsHeader';
import { ToolPageLayout, ToolPageMain, PageTitle } from '@/components/ui/ToolPageLayout';

export default function PhysicsToolsPage() {
  return (
    <ToolPageLayout>
      <PhysicsToolsHeader />
      <ToolPageMain>
        <PageTitle
          title="Physics Tools"
          description="Essential physics calculators and tools for experiments, research, and education. Calculate kinematics, forces, energy, waves, and more."
          variant="page"
        />
        <PhysicsToolsGrid />
      </ToolPageMain>
    </ToolPageLayout>
  );
}