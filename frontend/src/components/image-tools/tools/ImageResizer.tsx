'use client';

import { useState, useCallback } from 'react';

export default function ImageResizer() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [resizeMode, setResizeMode] = useState<'pixels' | 'percentage'>('pixels');
  const [percentage, setPercentage] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedFiles, setResizedFiles] = useState<{ name: string; url: string; size: number }[]>([]);

  const supportedFormats = {
    input: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'],
    output: ['jpg', 'jpeg', 'png', 'webp']
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension && supportedFormats.input.includes(extension);
      });
      setFiles(selectedFiles);
      setResizedFiles([]);
    }
  }, []);

  const resizeImage = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let newWidth: number;
        let newHeight: number;

        if (resizeMode === 'percentage') {
          newWidth = Math.round(img.width * (percentage / 100));
          newHeight = Math.round(img.height * (percentage / 100));
        } else {
          if (maintainAspectRatio) {
            const aspectRatio = img.width / img.height;
            if (width / height > aspectRatio) {
              newWidth = Math.round(height * aspectRatio);
              newHeight = height;
            } else {
              newWidth = width;
              newHeight = Math.round(width / aspectRatio);
            }
          } else {
            newWidth = width;
            newHeight = height;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        const outputFormat = file.name.split('.').pop()?.toLowerCase() === 'png' ? 'png' : 'jpeg';
        const mimeType = `image/${outputFormat}`;

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const name = file.name.replace(/\.[^/.]+$/, `_resized_${newWidth}x${newHeight}.${outputFormat}`);
            resolve({ name, url, size: blob.size });
          }
        }, mimeType, 0.9);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleResize = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const resized = await Promise.all(files.map(resizeImage));
      setResizedFiles(resized);
    } catch (error) {
      console.error('Resize failed:', error);
      alert('Sorry, image resizing failed. Please try with different files.');
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
    resizedFiles.forEach(file => {
      downloadFile(file.url, file.name);
    });
  };

  const updateHeightFromWidth = (newWidth: number) => {
    if (maintainAspectRatio && files.length > 0) {
      // Use the first file's aspect ratio as reference
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setHeight(Math.round(newWidth / aspectRatio));
      };
      img.src = URL.createObjectURL(files[0]);
    }
    setWidth(newWidth);
  };

  const updateWidthFromHeight = (newHeight: number) => {
    if (maintainAspectRatio && files.length > 0) {
      // Use the first file's aspect ratio as reference
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setWidth(Math.round(newHeight * aspectRatio));
      };
      img.src = URL.createObjectURL(files[0]);
    }
    setHeight(newHeight);
  };

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
            <div className="text-4xl">📏</div>
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
                  <span className="text-xs text-foreground/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resize Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Resize Settings</h3>
            
            {/* Resize Mode */}
            <div className="flex space-x-1 bg-foreground/5 p-1 rounded-lg">
              <button
                onClick={() => setResizeMode('pixels')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  resizeMode === 'pixels'
                    ? 'bg-foreground text-background'
                    : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
                }`}
              >
                Exact Dimensions
              </button>
              <button
                onClick={() => setResizeMode('percentage')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  resizeMode === 'percentage'
                    ? 'bg-foreground text-background'
                    : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
                }`}
              >
                Percentage
              </button>
            </div>

            {resizeMode === 'pixels' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => updateHeightFromWidth(parseInt(e.target.value) || 800)}
                    className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                    min="1"
                    max="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => updateWidthFromHeight(parseInt(e.target.value) || 600)}
                    className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                    min="1"
                    max="10000"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Maintain aspect ratio</span>
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Scale ({percentage}%)</label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60 mt-1">
                  <span>10%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>
            )}
          </div>

          {/* Resize Button */}
          <button
            onClick={handleResize}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Resizing...' : `Resize ${files.length} Image${files.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Resized Files */}
      {resizedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Resized Images</h3>
            <button
              onClick={downloadAll}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
            >
              Download All
            </button>
          </div>
          <div className="space-y-2">
            {resizedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-foreground/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
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
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">📏</div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Smart Image Resizing</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Resize images by exact dimensions or percentage. Maintain aspect ratio to prevent distortion, or set custom dimensions for specific requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}