import PortfolioManager from '@/components/investment-tools/tools/PortfolioManager';
import InvestmentToolsHeader from '@/components/investment-tools/InvestmentToolsHeader';

export default function PortfolioManagerPage() {
  return (
    <div className="min-h-screen bg-background">
      <InvestmentToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">📊</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Portfolio Manager
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Manage your investment portfolio allocation and get step-by-step rebalancing instructions to optimize your asset distribution.
          </p>
        </div>
        <PortfolioManager />
      </main>
    </div>
  );
}