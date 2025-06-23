'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

export default function PDFPageExtractor() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

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
    setSelectedPages([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNum)
        ? prev.filter(p => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const extractPages = async () => {
    if (!file || selectedPages.length === 0) return;

    setIsProcessing(true);
    try {
      const extractedPDF = await PDFUtils.extractPages(file.file, selectedPages);
      const filename = selectedPages.length === 1
        ? `${file.name.replace('.pdf', '')}_page_${selectedPages[0]}.pdf`
        : `${file.name.replace('.pdf', '')}_extracted_pages.pdf`;
      PDFUtils.downloadFile(extractedPDF, filename);
    } catch (error) {
      console.error('Error extracting pages:', error);
      alert('Error extracting pages. Please try again.');
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
          <div className="text-4xl">📄</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Extract specific pages from PDF
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
            <h3 className="text-lg font-semibold">Select Pages to Extract</h3>
            <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 max-h-40 overflow-y-auto p-2 bg-foreground/5 rounded">
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
              {selectedPages.length === 0
                ? 'Select pages to extract'
                : `${selectedPages.length} page${selectedPages.length !== 1 ? 's' : ''} selected: ${selectedPages.join(', ')}`}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={extractPages}
              disabled={isProcessing || selectedPages.length === 0}
              className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Extracting...' : `Extract ${selectedPages.length} Page${selectedPages.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}