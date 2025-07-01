'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

interface ImagePreviewProps {
  file: { name: string; url: string; size: number };
  onDownload: (url: string, name: string) => void;
  showDownload?: boolean;
  title?: string;
  subtitle?: string;
}

export default function ImagePreview({ 
  file, 
  onDownload, 
  showDownload = true, 
  title, 
  subtitle 
}: ImagePreviewProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const openFullscreen = () => {
    window.open(file.url, '_blank');
  };

  return (
    <div className="border border-foreground/20 rounded-lg p-4 bg-foreground/5 mt-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-foreground/10">
        <div>
          <h4 className="font-medium text-foreground">
            {title || `Preview: ${file.name}`}
          </h4>
          <div className="flex items-center space-x-4 text-sm text-foreground/60 mt-1">
            <span>{formatFileSize(file.size)}</span>
            {imageDimensions && (
              <span>{imageDimensions.width} × {imageDimensions.height}px</span>
            )}
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
          {subtitle && (
            <p className="text-xs text-foreground/50 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={openFullscreen}
            variant="secondary"
            className="text-sm"
          >
            Open Full
          </Button>
          {showDownload && (
            <Button
              onClick={() => onDownload(file.url, file.name)}
              variant="secondary"
              className="text-sm"
            >
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Image Preview */}
      <div className="space-y-3">
        <div className="relative bg-foreground/5 rounded-lg overflow-hidden flex items-center justify-center min-h-[200px] max-h-[400px]">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          )}
          <Image
            ref={imageRef}
            src={file.url}
            alt={file.name}
            width={800}
            height={600}
            onLoad={handleImageLoad}
            className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoom})`,
              opacity: imageLoaded ? 1 : 0
            }}
            draggable={false}
            unoptimized
          />
        </div>
        
        {/* Image Zoom Controls */}
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 rounded text-sm transition-colors"
          >
            −
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 rounded text-sm transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleZoomIn}
            className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 rounded text-sm transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}