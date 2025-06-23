'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

export default function PDFMerger() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    const processedFiles = await Promise.all(
      pdfFiles.map(async (file) => {
        const pageCount = await PDFUtils.getPageCount(file);
        return {
          file,
          name: file.name,
          size: file.size,
          pageCount,
        };
      })
    );

    setFiles(prev => [...prev, ...processedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveFile(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    try {
      const fileObjects = files.map(f => f.file);
      const mergedPDF = await PDFUtils.mergePDFs(fileObjects);
      PDFUtils.downloadFile(mergedPDF, 'merged-document.pdf');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF files here' : 'Drag & drop PDF files here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select files • Only PDF files are supported
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Files to merge ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 bg-foreground/5 rounded-lg border hover:bg-foreground/10 transition-colors cursor-move ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-foreground/60">
                      {file.pageCount} pages • {PDFUtils.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-foreground/60">#{index + 1}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-foreground/10 rounded text-foreground/60 hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-foreground/60">
              Total: {files.reduce((sum, file) => sum + (file.pageCount || 0), 0)} pages
            </div>
            <button
              onClick={mergePDFs}
              disabled={files.length < 2 || isProcessing}
              className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Merging...' : 'Merge PDFs'}
            </button>
          </div>
        </div>
      )}

      {files.length === 1 && (
        <div className="text-center p-4 bg-foreground/5 rounded-lg">
          <p className="text-sm text-foreground/60">
            Add at least one more PDF file to merge
          </p>
        </div>
      )}
    </div>
  );
}