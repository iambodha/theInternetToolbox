'use client';

import { useState, useCallback } from 'react';

export default function ImageOptimizer() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [outputFormat, setOutputFormat] = useState<string>('auto');
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [enableResize, setEnableResize] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizedFiles, setOptimizedFiles] = useState<{ name: string; url: string; size: number; originalSize: number; savings: number }[]>([]);

  const supportedFormats = {
    input: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'],
    output: ['auto', 'jpeg', 'png', 'webp']
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension && supportedFormats.input.includes(extension);
      });
      setFiles(selectedFiles);
      setOptimizedFiles([]);
    }
  }, []);

  const optimizeImage = async (file: File): Promise<{ name: string; url: string; size: number; originalSize: number; savings: number }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Resize if enabled and image is larger than max dimensions
        if (enableResize && (width > maxWidth || height > maxHeight)) {
          const aspectRatio = width / height;
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Determine output format
        let format = outputFormat;
        if (format === 'auto') {
          const inputFormat = file.name.split('.').pop()?.toLowerCase();
          // Use JPEG for photos, PNG for graphics with transparency
          format = inputFormat === 'png' ? 'png' : 'jpeg';
        }

        const mimeType = `image/${format}`;
        const qualityValue = format === 'jpeg' || format === 'webp' ? quality / 100 : undefined;

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const savings = ((file.size - blob.size) / file.size) * 100;
            const extension = format === 'jpeg' ? 'jpg' : format;
            const name = file.name.replace(/\.[^/.]+$/, `_optimized.${extension}`);
            resolve({ 
              name, 
              url, 
              size: blob.size, 
              originalSize: file.size,
              savings: Math.max(0, savings)
            });
          }
        }, mimeType, qualityValue);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleOptimize = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const optimized = await Promise.all(files.map(optimizeImage));
      setOptimizedFiles(optimized);
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Sorry, image optimization failed. Please try with different files.');
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
    optimizedFiles.forEach(file => {
      downloadFile(file.url, file.name);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSavings = optimizedFiles.reduce((acc, file) => acc + (file.originalSize - file.size), 0);
  const averageSavings = optimizedFiles.length > 0 ? optimizedFiles.reduce((acc, file) => acc + file.savings, 0) / optimizedFiles.length : 0;

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border-2 border-dashed border-black/[.08] dark:border-white/[.145] rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-4xl">⚡</div>
            <div>
              <p className="text-lg font-medium">Click to select images</p>
              <p className="text-sm text-foreground/60">
                Supports: JPG, PNG, GIF, BMP, WEBP, TIFF
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
                  <span className="text-xs text-foreground/60">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Optimization Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quality ({quality}%)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60 mt-1">
                  <span>Smaller</span>
                  <span>Balanced</span>
                  <span>Higher Quality</span>
                </div>
              </div>
            </div>

            {/* Resize Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enableResize}
                  onChange={(e) => setEnableResize(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Resize large images</span>
              </label>

              {enableResize && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Width (px)</label>
                    <input
                      type="number"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(parseInt(e.target.value) || 1920)}
                      className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                      min="100"
                      max="4000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Height (px)</label>
                    <input
                      type="number"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(parseInt(e.target.value) || 1080)}
                      className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                      min="100"
                      max="4000"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Optimizing...' : `Optimize ${files.length} Image${files.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Optimized Files */}
      {optimizedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Optimized Images</h3>
              <p className="text-sm text-foreground/60">
                Total savings: {formatFileSize(totalSavings)} ({averageSavings.toFixed(1)}% average)
              </p>
            </div>
            <button
              onClick={downloadAll}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
            >
              Download All
            </button>
          </div>
          <div className="space-y-2">
            {optimizedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <div className="flex items-center space-x-4 text-xs text-foreground/60">
                    <span>{formatFileSize(file.originalSize)} → {formatFileSize(file.size)}</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      -{file.savings.toFixed(1)}%
                    </span>
                  </div>
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
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-green-600 dark:text-green-400 text-xl">⚡</div>
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Smart Image Optimization</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Reduce image file sizes without losing visual quality. Perfect for web optimization, email attachments, and faster loading times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}