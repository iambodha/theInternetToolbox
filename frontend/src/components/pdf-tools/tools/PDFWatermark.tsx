'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

export default function PDFWatermark() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [options, setOptions] = useState({
    opacity: 0.3,
    fontSize: 50,
    color: '#808080',
    position: 'center' as const,
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf');
    if (!pdfFile) return;

    const pageCount = await PDFUtils.getPageCount(pdfFile);
    setFile({
      file: pdfFile,
      name: pdfFile.name,
      size: pdfFile.size,
      pageCount,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const addWatermark = async () => {
    if (!file || !watermarkText.trim()) return;

    setIsProcessing(true);
    try {
      const watermarkedPDF = await PDFUtils.addWatermark(file.file, watermarkText, options);
      const filename = file.name.replace('.pdf', '_watermarked.pdf');
      PDFUtils.downloadFile(watermarkedPDF, filename);
    } catch (error) {
      console.error('Error adding watermark:', error);
      alert('Error adding watermark. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-foreground/50 bg-foreground/5'
            : 'border-foreground/20 hover:border-foreground/30'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">💧</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Add text watermarks to your PDF
            </p>
          </div>
        </div>
      </div>

      {file && (
        <div className="space-y-6">
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xl">📄</span>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-foreground/60">
                  {file.pageCount} pages • {PDFUtils.formatFileSize(file.size)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text..."
                className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <select
                  value={options.position}
                  onChange={(e) => setOptions(prev => ({ ...prev, position: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                >
                  <option value="center">Center</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={options.fontSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-foreground/60 mt-1">{options.fontSize}px</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Opacity</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={options.opacity}
                  onChange={(e) => setOptions(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-foreground/60 mt-1">{Math.round(options.opacity * 100)}%</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={options.color}
                  onChange={(e) => setOptions(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 bg-background border rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={addWatermark}
              disabled={isProcessing || !watermarkText.trim()}
              className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Adding Watermark...' : 'Add Watermark'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}