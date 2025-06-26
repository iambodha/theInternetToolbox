'use client';

import { useState, useCallback } from 'react';

const supportedFormats = {
  input: ['jpg', 'jpeg', 'png', 'bmp', 'webp'],
  output: ['png'] // Always PNG to support transparency
};

export default function BackgroundRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [threshold, setThreshold] = useState<number>(20);
  const [targetColor, setTargetColor] = useState<string>('#ffffff');
  const [removeMode, setRemoveMode] = useState<'white' | 'color' | 'auto'>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<{ name: string; url: string; size: number }[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension && supportedFormats.input.includes(extension);
      });
      setFiles(selectedFiles);
      setProcessedFiles([]);
    }
  }, []);

  const removeBackground = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert hex color to RGB
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : { r: 255, g: 255, b: 255 };
        };

        const target = hexToRgb(targetColor);

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let shouldRemove = false;

          switch (removeMode) {
            case 'white':
              // Remove white/light backgrounds
              shouldRemove = r > 255 - threshold && g > 255 - threshold && b > 255 - threshold;
              break;
            case 'color':
              // Remove specific color
              const colorDistance = Math.sqrt(
                Math.pow(r - target.r, 2) + 
                Math.pow(g - target.g, 2) + 
                Math.pow(b - target.b, 2)
              );
              shouldRemove = colorDistance < threshold;
              break;
            case 'auto':
              // Auto-detect dominant background color (simple edge detection)
              const corners = [
                // Top-left corner
                data[0], data[1], data[2],
                // Top-right corner  
                data[(canvas.width - 1) * 4], data[(canvas.width - 1) * 4 + 1], data[(canvas.width - 1) * 4 + 2],
                // Bottom-left corner
                data[(canvas.height - 1) * canvas.width * 4], 
                data[(canvas.height - 1) * canvas.width * 4 + 1], 
                data[(canvas.height - 1) * canvas.width * 4 + 2],
                // Bottom-right corner
                data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4],
                data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 1],
                data[((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 2]
              ];
              
              // Use top-left corner as reference
              const refR = corners[0];
              const refG = corners[1];
              const refB = corners[2];
              
              const autoDistance = Math.sqrt(
                Math.pow(r - refR, 2) + 
                Math.pow(g - refG, 2) + 
                Math.pow(b - refB, 2)
              );
              shouldRemove = autoDistance < threshold;
              break;
          }

          if (shouldRemove) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const name = file.name.replace(/\.[^/.]+$/, '_no_bg.png');
            resolve({ name, url, size: blob.size });
          }
        }, 'image/png');
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const processed = await Promise.all(files.map(removeBackground));
      setProcessedFiles(processed);
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Sorry, background removal failed. Please try with different files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    processedFiles.forEach(file => {
      downloadFile(file.url, file.name);
    });
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border-2 border-dashed border-black/[.08] dark:border-white/[.145] rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.bmp,.webp"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-4xl">🖼️</div>
            <div>
              <p className="text-lg font-medium">Click to select images</p>
              <p className="text-sm text-foreground/60">
                Supports: JPG, PNG, BMP, WEBP
              </p>
            </div>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <>
          {/* Selected Files */}
          <div className="space-y-2">
            <h3 className="font-medium">Selected Files ({files.length})</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-foreground/5 rounded">
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-foreground/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Background Removal Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Background Removal Settings</h3>
            
            {/* Remove Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">Removal Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                  onClick={() => setRemoveMode('auto')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    removeMode === 'auto'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25]'
                  }`}
                >
                  <div className="font-medium text-sm">Auto Detect</div>
                  <div className="text-xs text-foreground/60 mt-1">Automatically detect background</div>
                </button>
                <button
                  onClick={() => setRemoveMode('white')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    removeMode === 'white'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25]'
                  }`}
                >
                  <div className="font-medium text-sm">White Background</div>
                  <div className="text-xs text-foreground/60 mt-1">Remove white/light backgrounds</div>
                </button>
                <button
                  onClick={() => setRemoveMode('color')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    removeMode === 'color'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25]'
                  }`}
                >
                  <div className="font-medium text-sm">Custom Color</div>
                  <div className="text-xs text-foreground/60 mt-1">Remove specific color</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Threshold */}
              <div>
                <label className="block text-sm font-medium mb-2">Sensitivity ({threshold})</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60 mt-1">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Color Picker */}
              {removeMode === 'color' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Target Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={targetColor}
                      onChange={(e) => setTargetColor(e.target.value)}
                      className="w-12 h-10 rounded border border-black/[.08] dark:border-white/[.145]"
                    />
                    <input
                      type="text"
                      value={targetColor}
                      onChange={(e) => setTargetColor(e.target.value)}
                      className="flex-1 p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Removing Backgrounds...' : `Remove Background from ${files.length} Image${files.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Processed Files */}
      {processedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Processed Images</h3>
            <button
              onClick={downloadAll}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
            >
              Download All
            </button>
          </div>
          <div className="space-y-2">
            {processedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-foreground/60">{(file.size / (1024 * 1024)).toFixed(2)} MB • PNG with transparency</p>
                </div>
                <button
                  onClick={() => downloadFile(file.url, file.name)}
                  className="px-3 py-1 bg-foreground text-background rounded text-sm hover:bg-foreground/90 transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-purple-600 dark:text-purple-400 text-xl">✨</div>
          <div>
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Background Removal</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Remove backgrounds from images automatically or by targeting specific colors. Perfect for creating transparent PNGs for logos, product photos, and graphics.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600 dark:text-yellow-400 text-xl">💡</div>
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Tips for Best Results</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Use images with clear contrast between subject and background</li>
              <li>• Start with lower sensitivity and increase if needed</li>
              <li>• White/solid color backgrounds work best with this tool</li>
              <li>• For complex backgrounds, try professional AI tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}