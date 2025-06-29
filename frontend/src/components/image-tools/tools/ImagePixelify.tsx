'use client';

import { useState, useCallback } from 'react';
import NextImage from 'next/image';

const supportedFormats = {
  input: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'],
  output: ['png', 'jpg', 'webp']
};

export default function ImagePixelify() {
  const [files, setFiles] = useState<File[]>([]);
  const [pixelSize, setPixelSize] = useState<number>(8);
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [smoothing, setSmoothing] = useState<boolean>(false);
  const [colorReduction, setColorReduction] = useState<boolean>(false);
  const [colorLevels, setColorLevels] = useState<number>(32);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixelifiedFiles, setPixelifiedFiles] = useState<{ name: string; url: string; size: number; preview?: string }[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension && supportedFormats.input.includes(extension);
      });
      setFiles(selectedFiles);
      setPixelifiedFiles([]);
    }
  }, []);

  const pixelifyImage = async (file: File): Promise<{ name: string; url: string; size: number; preview: string }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        const { width, height } = img;
        canvas.width = width;
        canvas.height = height;
        
        // First, draw the original image
        ctx?.drawImage(img, 0, 0);
        
        if (!ctx) return;

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Pixelify process
        for (let y = 0; y < height; y += pixelSize) {
          for (let x = 0; x < width; x += pixelSize) {
            // Sample the center pixel of each block
            const sampleX = Math.min(x + Math.floor(pixelSize / 2), width - 1);
            const sampleY = Math.min(y + Math.floor(pixelSize / 2), height - 1);
            const sampleIndex = (sampleY * width + sampleX) * 4;
            
            let r = data[sampleIndex];
            let g = data[sampleIndex + 1];
            let b = data[sampleIndex + 2];
            const a = data[sampleIndex + 3];

            // Color reduction
            if (colorReduction) {
              r = Math.round(r / (256 / colorLevels)) * (256 / colorLevels);
              g = Math.round(g / (256 / colorLevels)) * (256 / colorLevels);
              b = Math.round(b / (256 / colorLevels)) * (256 / colorLevels);
            }

            // Fill the pixel block with the sampled color
            for (let py = y; py < Math.min(y + pixelSize, height); py++) {
              for (let px = x; px < Math.min(x + pixelSize, width); px++) {
                const pixelIndex = (py * width + px) * 4;
                data[pixelIndex] = r;
                data[pixelIndex + 1] = g;
                data[pixelIndex + 2] = b;
                data[pixelIndex + 3] = a;
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);

        // Apply smoothing if enabled
        if (smoothing) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        } else {
          ctx.imageSmoothingEnabled = false;
        }

        // Create preview (smaller version for display)
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        const previewSize = Math.min(300, Math.max(width, height));
        const scale = previewSize / Math.max(width, height);
        previewCanvas.width = width * scale;
        previewCanvas.height = height * scale;
        
        if (previewCtx) {
          previewCtx.imageSmoothingEnabled = false;
          previewCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
        }

        const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
        const quality = outputFormat === 'jpg' ? 0.9 : undefined;

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const preview = previewCanvas.toDataURL();
            const extension = outputFormat === 'jpg' ? 'jpg' : outputFormat;
            const name = file.name.replace(/\.[^/.]+$/, `_pixelified_${pixelSize}px.${extension}`);
            resolve({ name, url, size: blob.size, preview });
          }
        }, mimeType, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handlePixelify = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const pixelified = await Promise.all(files.map(pixelifyImage));
      setPixelifiedFiles(pixelified);
    } catch (error) {
      console.error('Pixelify failed:', error);
      alert('Sorry, image pixelify failed. Please try with different files.');
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
    pixelifiedFiles.forEach(file => {
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

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border-2 border-dashed border-foreground/20 hover:border-foreground/30 rounded-lg p-8 text-center cursor-pointer transition-colors">
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
            <div className="text-4xl">🎮</div>
            <div>
              <p className="text-lg font-medium mb-2">Drag & drop images here</p>
              <p className="text-sm text-foreground/60">
                or click to select files • Supports: JPG, PNG, GIF, BMP, WEBP, TIFF
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

          {/* Pixelify Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Pixelify Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pixel Size ({pixelSize}px)</label>
                <input
                  type="range"
                  min="2"
                  max="32"
                  value={pixelSize}
                  onChange={(e) => setPixelSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60 mt-1">
                  <span>Fine (2px)</span>
                  <span>Medium (16px)</span>
                  <span>Large (32px)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-2 border border-foreground/20 rounded bg-background"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={smoothing}
                  onChange={(e) => setSmoothing(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Apply smoothing</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={colorReduction}
                  onChange={(e) => setColorReduction(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Reduce color palette</span>
              </label>

              {colorReduction && (
                <div className="ml-6">
                  <label className="block text-sm font-medium mb-2">Color Levels ({colorLevels})</label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={colorLevels}
                    onChange={(e) => setColorLevels(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-foreground/60 mt-1">
                    <span>8 colors</span>
                    <span>32 colors</span>
                    <span>64 colors</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pixelify Button */}
          <button
            onClick={handlePixelify}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Pixelifying...' : `Pixelify ${files.length} Image${files.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Pixelified Files */}
      {pixelifiedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Pixelified Images</h3>
            <button
              onClick={downloadAll}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
            >
              Download All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pixelifiedFiles.map((file, index) => (
              <div key={index} className="border border-foreground/20 rounded-lg p-3">
                {file.preview && (
                  <div className="mb-3">
                    <NextImage
                      src={file.preview}
                      alt={`Pixelified ${file.name}`}
                      width={400}
                      height={128}
                      className="w-full h-32 object-contain bg-gray-100 dark:bg-gray-800 rounded"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-foreground/60">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => downloadFile(file.url, file.name)}
                    className="px-3 py-1 bg-foreground text-background rounded text-sm hover:bg-foreground/90 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-purple-600 dark:text-purple-400 text-xl">🎮</div>
          <div>
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Image Pixelify</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Transform your images into retro pixel art. Perfect for creating 8-bit style graphics, game assets, or artistic effects. Adjust pixel size and color palette for different styles.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">💡</div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Tips for Best Results</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use smaller pixel sizes (2-8px) for detailed pixel art</li>
              <li>• Use larger pixel sizes (16-32px) for retro game aesthetics</li>
              <li>• Enable color reduction for authentic 8-bit look</li>
              <li>• Disable smoothing to maintain sharp pixel edges</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}