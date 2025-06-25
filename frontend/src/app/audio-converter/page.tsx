import AudioConverter from '@/components/file-conversion/tools/AudioConverter';
import FileConversionHeader from '@/components/file-conversion/FileConversionHeader';

export default function AudioConverterPage() {
  return (
    <div className="min-h-screen bg-background">
      <FileConversionHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">🎵</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              Audio Converter
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Convert audio files to different formats including MP3, WAV, FLAC, OGG, and more.
          </p>
        </div>
        <AudioConverter />
      </main>
    </div>
  );
}