import TemperatureConverter from '@/components/chemistry-tools/tools/TemperatureConverter';
import ChemistryToolsHeader from '@/components/chemistry-tools/ChemistryToolsHeader';

export default function TemperatureConverterPage() {
  return (
    <div className="min-h-screen bg-background">
      <ChemistryToolsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🌡️</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Temperature Converter
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Convert between Celsius, Fahrenheit, and Kelvin temperature scales with precise calculations and formulas.
          </p>
        </div>
        <TemperatureConverter />
      </main>
    </div>
  );
}