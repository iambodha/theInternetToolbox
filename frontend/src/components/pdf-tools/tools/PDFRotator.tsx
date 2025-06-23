'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

export default function PDFRotator() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(true);

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

    // Initialize with all pages selected
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => {
      const newSelection = prev.includes(pageNum)
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b);
      
      setSelectAll(newSelection.length === (file?.pageCount || 0));
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPages([]);
    } else {
      setSelectedPages(Array.from({ length: file?.pageCount || 0 }, (_, i) => i + 1));
    }
    setSelectAll(!selectAll);
  };

  const rotatePDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const pagesToRotate = selectAll ? undefined : selectedPages.map(p => p - 1);
      const rotatedPDF = await PDFUtils.rotatePDF(file.file, rotation, pagesToRotate);
      const filename = file.name.replace('.pdf', `_rotated_${rotation}deg.pdf`);
      PDFUtils.downloadFile(rotatedPDF, filename);
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('Error rotating PDF. Please try again.');
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
          <div className="text-4xl">🔄</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Rotate pages to correct orientation
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
            <h3 className="text-lg font-semibold">Rotation Angle</h3>
            <div className="flex gap-4">
              {[90, 180, 270].map((angle) => (
                <button
                  key={angle}
                  onClick={() => setRotation(angle as 90 | 180 | 270)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    rotation === angle
                      ? 'bg-foreground text-background'
                      : 'bg-foreground/5 hover:bg-foreground/10'
                  }`}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pages to Rotate</h3>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 max-h-32 overflow-y-auto p-2 bg-foreground/5 rounded">
              {Array.from({ length: file.pageCount || 0 }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => togglePageSelection(pageNum)}
                  className={`aspect-square text-xs font-medium rounded transition-colors ${
                    selectedPages.includes(pageNum)
                      ? 'bg-foreground text-background'
                      : 'bg-background border hover:bg-foreground/10'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <p className="text-sm text-foreground/60">
              {selectedPages.length === (file.pageCount || 0)
                ? 'All pages selected'
                : `${selectedPages.length} of ${file.pageCount} pages selected`}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={rotatePDF}
              disabled={isProcessing || selectedPages.length === 0}
              className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Rotating...' : `Rotate ${selectedPages.length} Page${selectedPages.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}