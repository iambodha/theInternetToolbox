'use client';

import { useState, useCallback } from 'react';
import NextImage from 'next/image';

const supportedFormats = {
  input: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff']
};

interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  percentage: number;
  count: number;
}

interface PaletteResult {
  fileName: string;
  colors: ColorInfo[];
  dominantColor: ColorInfo;
  totalPixels: number;
  preview: string;
}

export default function ColorPaletteExtractor() {
  const [files, setFiles] = useState<File[]>([]);
  const [colorCount, setColorCount] = useState<number>(8);
  const [extractionMethod, setExtractionMethod] = useState<'dominant' | 'kmeans' | 'histogram'>('kmeans');
  const [includeTransparent, setIncludeTransparent] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paletteResults, setPaletteResults] = useState<PaletteResult[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension && supportedFormats.input.includes(extension);
      });
      setFiles(selectedFiles);
      setPaletteResults([]);
    }
  }, []);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const extractColorsByHistogram = (imageData: ImageData, numColors: number): ColorInfo[] => {
    const data = imageData.data;
    const colorMap = new Map<string, number>();
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      if (!includeTransparent && a < 128) continue;
      
      // Reduce color precision for better grouping
      const reducedR = Math.round(r / 8) * 8;
      const reducedG = Math.round(g / 8) * 8;
      const reducedB = Math.round(b / 8) * 8;
      
      const colorKey = `${reducedR},${reducedG},${reducedB}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
    
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, numColors);
    
    const totalPixels = imageData.width * imageData.height;
    
    return sortedColors.map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return {
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: rgbToHsl(r, g, b),
        percentage: (count / totalPixels) * 100,
        count
      };
    });
  };

  const extractColorsByKMeans = (imageData: ImageData, k: number): ColorInfo[] => {
    const data = imageData.data;
    const pixels: [number, number, number][] = [];
    
    // Sample pixels (use every 4th pixel for performance)
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      if (!includeTransparent && a < 128) continue;
      pixels.push([r, g, b]);
    }
    
    if (pixels.length === 0) return [];
    
    // Initialize centroids randomly
    const centroids: [number, number, number][] = [];
    for (let i = 0; i < k; i++) {
      const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
      centroids.push([...randomPixel]);
    }
    
    // Initialize clusters outside the loop
    let clusters: [number, number, number][][] = Array(k).fill(null).map(() => []);
    
    // K-means iterations
    for (let iter = 0; iter < 20; iter++) {
      clusters = Array(k).fill(null).map(() => []);
      
      // Assign pixels to clusters
      pixels.forEach(pixel => {
        let minDistance = Infinity;
        let closestCentroid = 0;
        
        centroids.forEach((centroid, index) => {
          const distance = Math.sqrt(
            Math.pow(pixel[0] - centroid[0], 2) +
            Math.pow(pixel[1] - centroid[1], 2) +
            Math.pow(pixel[2] - centroid[2], 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = index;
          }
        });
        
        clusters[closestCentroid].push(pixel);
      });
      
      // Update centroids
      let changed = false;
      centroids.forEach((centroid, index) => {
        if (clusters[index].length > 0) {
          const newCentroid: [number, number, number] = [
            Math.round(clusters[index].reduce((sum, p) => sum + p[0], 0) / clusters[index].length),
            Math.round(clusters[index].reduce((sum, p) => sum + p[1], 0) / clusters[index].length),
            Math.round(clusters[index].reduce((sum, p) => sum + p[2], 0) / clusters[index].length)
          ];
          
          if (centroid[0] !== newCentroid[0] || centroid[1] !== newCentroid[1] || centroid[2] !== newCentroid[2]) {
            changed = true;
            centroids[index] = newCentroid;
          }
        }
      });
      
      if (!changed) break;
    }
    
    const totalPixels = pixels.length;
    
    return centroids
      .map((centroid, index) => ({
        hex: rgbToHex(centroid[0], centroid[1], centroid[2]),
        rgb: `rgb(${centroid[0]}, ${centroid[1]}, ${centroid[2]})`,
        hsl: rgbToHsl(centroid[0], centroid[1], centroid[2]),
        percentage: clusters[index] ? (clusters[index].length / totalPixels) * 100 : 0,
        count: clusters[index] ? clusters[index].length : 0
      }))
      .filter(color => color.count > 0)
      .sort((a, b) => b.percentage - a.percentage);
  };

  const extractPalette = async (file: File): Promise<PaletteResult> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let colors: ColorInfo[] = [];
        
        switch (extractionMethod) {
          case 'histogram':
            colors = extractColorsByHistogram(imageData, colorCount);
            break;
          case 'kmeans':
            colors = extractColorsByKMeans(imageData, colorCount);
            break;
          case 'dominant':
            colors = extractColorsByHistogram(imageData, colorCount);
            break;
        }

        // Create preview image
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        const previewSize = 200;
        const scale = previewSize / Math.max(img.width, img.height);
        previewCanvas.width = img.width * scale;
        previewCanvas.height = img.height * scale;
        
        if (previewCtx) {
          previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
        }

        const result: PaletteResult = {
          fileName: file.name,
          colors,
          dominantColor: colors[0] || { hex: '#000000', rgb: 'rgb(0, 0, 0)', hsl: 'hsl(0, 0%, 0%)', percentage: 0, count: 0 },
          totalPixels: imageData.width * imageData.height,
          preview: previewCanvas.toDataURL()
        };

        resolve(result);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleExtract = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const results = await Promise.all(files.map(extractPalette));
      setPaletteResults(results);
    } catch (error) {
      console.error('Palette extraction failed:', error);
      alert('Sorry, color palette extraction failed. Please try with different files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportPalette = (result: PaletteResult, format: 'css' | 'json' | 'ase' | 'hex') => {
    let content = '';
    let fileName = '';
    let mimeType = 'text/plain';

    switch (format) {
      case 'css':
        content = `:root {\n${result.colors.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join('\n')}\n}`;
        fileName = `${result.fileName}_palette.css`;
        mimeType = 'text/css';
        break;
      case 'json':
        content = JSON.stringify({
          fileName: result.fileName,
          colors: result.colors,
          dominantColor: result.dominantColor,
          extractionMethod,
          timestamp: new Date().toISOString()
        }, null, 2);
        fileName = `${result.fileName}_palette.json`;
        mimeType = 'application/json';
        break;
      case 'hex':
        content = result.colors.map(color => color.hex).join('\n');
        fileName = `${result.fileName}_palette.txt`;
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <div className="text-4xl">🎨</div>
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
                  <span className="text-xs text-foreground/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extraction Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Extraction Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Colors ({colorCount})</label>
                <input
                  type="range"
                  min="3"
                  max="16"
                  value={colorCount}
                  onChange={(e) => setColorCount(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60 mt-1">
                  <span>3</span>
                  <span>8</span>
                  <span>16</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Extraction Method</label>
                <select
                  value={extractionMethod}
                  onChange={(e) => setExtractionMethod(e.target.value as 'dominant' | 'kmeans' | 'histogram')}
                  className="w-full p-2 border border-foreground/20 rounded bg-background"
                >
                  <option value="kmeans">K-Means Clustering</option>
                  <option value="histogram">Color Histogram</option>
                  <option value="dominant">Dominant Colors</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeTransparent}
                  onChange={(e) => setIncludeTransparent(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include transparent pixels</span>
              </label>
            </div>
          </div>

          {/* Extract Button */}
          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Extracting Palettes...' : `Extract Color Palette${files.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Palette Results */}
      {paletteResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Extracted Color Palettes</h3>
          {paletteResults.map((result, index) => (
            <div key={index} className="border border-foreground/20 rounded-lg p-4">
              <div className="flex items-start space-x-4 mb-4">
                <NextImage
                  src={result.preview}
                  alt={result.fileName}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{result.fileName}</h4>
                  <p className="text-sm text-foreground/60">
                    {result.colors.length} colors extracted • Dominant: {result.dominantColor.hex}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => exportPalette(result, 'css')}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Export CSS
                    </button>
                    <button
                      onClick={() => exportPalette(result, 'json')}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => exportPalette(result, 'hex')}
                      className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Export HEX
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Palette Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {result.colors.map((color, colorIndex) => (
                  <div key={colorIndex} className="group">
                    <div
                      className="w-full h-16 rounded-lg cursor-pointer transition-transform hover:scale-105 border border-foreground/20"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex)}
                      title={`Click to copy ${color.hex}`}
                    />
                    <div className="mt-2 text-center">
                      <div className="text-xs font-mono text-foreground/80">{color.hex}</div>
                      <div className="text-xs text-foreground/60">{color.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Color Information */}
              <div className="mt-4">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                    Show detailed color information
                  </summary>
                  <div className="mt-3 space-y-2 text-xs">
                    {result.colors.map((color, colorIndex) => (
                      <div key={colorIndex} className="flex items-center space-x-4 p-2 bg-foreground/5 rounded">
                        <div
                          className="w-8 h-8 rounded border border-foreground/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                          <span className="font-mono">{color.hex}</span>
                          <span className="font-mono">{color.rgb}</span>
                          <span className="font-mono">{color.hsl}</span>
                          <span>{color.percentage.toFixed(2)}% ({color.count} pixels)</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(color.hex)}
                          className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-orange-600 dark:text-orange-400 text-xl">🎨</div>
          <div>
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Color Palette Extraction</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Extract dominant colors from images using advanced algorithms. Perfect for design inspiration, brand color matching, and creating cohesive color schemes.
            </p>
          </div>
        </div>
      </div>

      {/* Method Explanation */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">🔬</div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Extraction Methods</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>K-Means:</strong> Groups similar colors using clustering algorithm (best overall)</li>
              <li>• <strong>Histogram:</strong> Finds most frequent colors in the image</li>
              <li>• <strong>Dominant:</strong> Extracts the most prominent colors by frequency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

