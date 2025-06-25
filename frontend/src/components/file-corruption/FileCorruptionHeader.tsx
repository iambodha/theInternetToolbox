import Link from "next/link";

export default function FileCorruptionHeader() {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <span className="text-5xl">🔧</span>
        <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
          File Corruption Tools
        </h1>
      </div>
      <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
        Create corrupted files with custom sizes for testing and assignment purposes. 
        Generate files that appear broken but meet specific size requirements.
      </p>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/file-corruptor"
          className="inline-flex items-center px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
        >
          <span className="mr-2">🔧</span>
          Start Corrupting Files
        </Link>
      </div>
    </div>
  );
}