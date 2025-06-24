'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

interface SplitRange {
  id: number;
  start: number;
  end: number;
  name: string;
}

export default function PDFSplitter() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [splitRanges, setSplitRanges] = useState<SplitRange[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

    // Initialize with single page splits
    const ranges: SplitRange[] = [];
    for (let i = 1; i <= pageCount; i++) {
      ranges.push({
        id: i,
        start: i,
        end: i,
        name: `Page ${i}`,
      });
    }
    setSplitRanges(ranges);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const addRange = () => {
    const lastRange = splitRanges[splitRanges.length - 1];
    const newStart = lastRange ? lastRange.end + 1 : 1;
    const newEnd = Math.min(newStart + 10, file?.pageCount || 1);
    
    setSplitRanges(prev => [...prev, {
      id: Date.now(),
      start: newStart,
      end: newEnd,
      name: `Part ${prev.length + 1}`,
    }]);
  };

  const updateRange = (id: number, field: keyof SplitRange, value: string | number) => {
    setSplitRanges(prev => prev.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  const removeRange = (id: number) => {
    setSplitRanges(prev => prev.filter(range => range.id !== id));
  };

  const splitPDF = async () => {
    if (!file || splitRanges.length === 0) return;

    setIsProcessing(true);
    try {
      const validRanges = splitRanges.filter(range => 
        range.start > 0 && 
        range.end <= (file.pageCount || 0) && 
        range.start <= range.end
      );

      const splitPDFs = await PDFUtils.splitPDF(file.file, validRanges);
      
      splitPDFs.forEach((pdfData, index) => {
        const range = validRanges[index];
        const filename = range.start === range.end 
          ? `${file.name.replace('.pdf', '')}_page_${range.start}.pdf`
          : `${file.name.replace('.pdf', '')}_pages_${range.start}-${range.end}.pdf`;
        PDFUtils.downloadFile(pdfData, filename);
      });
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const splitIntoSinglePages = () => {
    if (!file) return;
    const ranges: SplitRange[] = [];
    for (let i = 1; i <= (file.pageCount || 0); i++) {
      ranges.push({
        id: i,
        start: i,
        end: i,
        name: `Page ${i}`,
      });
    }
    setSplitRanges(ranges);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
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
              or click to select a file • Only one PDF file at a time
            </p>
          </div>
        </div>
      </div>

      {file && (
        <div className="space-y-6">
          {/* File Info */}
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

          {/* Split Mode Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Split Options</h3>
            <div className="flex gap-4">
              <button
                onClick={splitIntoSinglePages}
                className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-sm transition-colors"
              >
                Split into Single Pages
              </button>
              <button
                onClick={() => setSplitRanges([
                  { id: 1, start: 1, end: Math.ceil((file.pageCount || 0) / 2), name: 'Part 1' },
                  { id: 2, start: Math.ceil((file.pageCount || 0) / 2) + 1, end: file.pageCount || 0, name: 'Part 2' },
                ])}
                className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-sm transition-colors"
              >
                Split in Half
              </button>
            </div>
          </div>

          {/* Custom Ranges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Page Ranges</h3>
              <button
                onClick={addRange}
                className="px-3 py-1 bg-foreground text-background rounded text-sm hover:bg-foreground/90 transition-colors"
              >
                Add Range
              </button>
            </div>

            <div className="space-y-3">
              {splitRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-3 p-3 bg-foreground/5 rounded-lg">
                  <input
                    type="text"
                    value={range.name}
                    onChange={(e) => updateRange(range.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-1 bg-background border rounded text-sm"
                    placeholder="Range name"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-foreground/60">Pages:</span>
                    <input
                      type="number"
                      value={range.start}
                      onChange={(e) => updateRange(range.id, 'start', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 bg-background border rounded text-sm text-center"
                      min="1"
                      max={file.pageCount}
                    />
                    <span className="text-foreground/60">-</span>
                    <input
                      type="number"
                      value={range.end}
                      onChange={(e) => updateRange(range.id, 'end', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 bg-background border rounded text-sm text-center"
                      min="1"
                      max={file.pageCount}
                    />
                  </div>
                  <button
                    onClick={() => removeRange(range.id)}
                    className="p-1 hover:bg-foreground/10 rounded text-foreground/60 hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Split Button */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-foreground/60">
              {splitRanges.length} file{splitRanges.length !== 1 ? 's' : ''} will be created
            </div>
            <button
              onClick={splitPDF}
              disabled={splitRanges.length === 0 || isProcessing}
              className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Splitting...' : 'Split PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}