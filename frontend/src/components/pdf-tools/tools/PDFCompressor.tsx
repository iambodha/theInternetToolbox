'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

export default function PDFCompressor() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');

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

  const compressPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const qualityMap = {
        low: 0.3,
        medium: 0.7,
        high: 0.9,
      };

      const compressedPDF = await PDFUtils.compressPDF(file.file, qualityMap[compressionLevel]);
      const filename = file.name.replace('.pdf', '_compressed.pdf');
      PDFUtils.downloadFile(compressedPDF, filename);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Error compressing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCompressionDescription = () => {
    switch (compressionLevel) {
      case 'low':
        return 'Maximum compression, lower quality';
      case 'medium':
        return 'Balanced compression and quality';
      case 'high':
        return 'Minimal compression, high quality';
      default:
        return '';
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
          <div className="text-4xl">🗜️</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Reduce file size while maintaining quality
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
            <h3 className="text-lg font-semibold">Compression Level</h3>
            <div className="space-y-3">
              {[
                { level: 'low' as const, label: 'Maximum Compression', desc: 'Smallest file size, lower quality' },
                { level: 'medium' as const, label: 'Balanced', desc: 'Good balance of size and quality' },
                { level: 'high' as const, label: 'Minimal Compression', desc: 'Larger file size, best quality' },
              ].map((option) => (
                <label key={option.level} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="compression"
                    value={option.level}
                    checked={compressionLevel === option.level}
                    onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-foreground/60">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={compressPDF}
              disabled={isProcessing}
              className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Compressing...' : 'Compress PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}