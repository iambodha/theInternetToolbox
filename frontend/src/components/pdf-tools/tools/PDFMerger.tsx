'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

interface LoadingScreenProps {
  fileName: string;
  fileCount?: number;
  currentStep: string;
  progress?: number;
}

function LoadingScreen({ fileName, fileCount, currentStep, progress }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-foreground/20 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* PDF Icon Animation */}
          <div className="relative">
            <div className="text-6xl animate-pulse">📁</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Merging PDFs</h3>
            <p className="text-sm text-foreground/70 truncate">{fileName}</p>
            {fileCount && (
              <p className="text-xs text-foreground/50">{fileCount} files to merge</p>
            )}
          </div>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-foreground h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(5, progress)}%` }}
                />
              </div>
              <p className="text-sm text-foreground/60">{Math.round(progress)}% complete</p>
            </div>
          )}

          {/* Current Step */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{currentStep}</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>

          {/* Cancel Button */}
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-foreground/60 hover:text-foreground underline transition-colors"
          >
            Cancel and reload page
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PDFMerger() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingState, setLoadingState] = useState<{
    fileName: string;
    currentStep: string;
    progress: number;
  } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      alert('Please select PDF files only.');
      return;
    }

    setLoadingState({
      fileName: pdfFiles.length > 1 ? `${pdfFiles.length} files` : pdfFiles[0].name,
      currentStep: 'Processing files...',
      progress: 0
    });

    try {
      const processedFiles = await Promise.all(
        pdfFiles.map(async (file, index) => {
          setLoadingState(prev => prev ? {
            ...prev,
            currentStep: `Processing ${file.name}...`,
            progress: ((index + 1) / pdfFiles.length) * 100
          } : null);

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
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing PDF files. Please try again.');
    } finally {
      setLoadingState(null);
    }
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
    if (fromIndex === toIndex) return;
    
    setFiles(prev => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });
  };

  const moveFileUp = (index: number) => {
    if (index > 0) {
      moveFile(index, index - 1);
    }
  };

  const moveFileDown = (index: number) => {
    if (index < files.length - 1) {
      moveFile(index, index + 1);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveFile(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      alert('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setLoadingState({
      fileName: 'merged-document.pdf',
      currentStep: 'Preparing merge...',
      progress: 0
    });

    try {
      const fileObjects = files.map(f => f.file);
      
      // Update progress during merge
      setLoadingState(prev => prev ? {
        ...prev,
        currentStep: 'Merging PDF files...',
        progress: 50
      } : null);

      const mergedPDF = await PDFUtils.mergePDFs(fileObjects);
      
      setLoadingState(prev => prev ? {
        ...prev,
        currentStep: 'Preparing download...',
        progress: 90
      } : null);

      PDFUtils.downloadFile(mergedPDF, 'merged-document.pdf');
      
      setLoadingState(prev => prev ? {
        ...prev,
        currentStep: 'Complete!',
        progress: 100
      } : null);

      // Clear files after successful merge
      setTimeout(() => {
        setFiles([]);
        setLoadingState(null);
      }, 1500);

    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDFs. Please try again.');
      setLoadingState(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const totalPages = files.reduce((sum, file) => sum + (file.pageCount || 0), 0);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6">
      {loadingState && (
        <LoadingScreen
          fileName={loadingState.fileName}
          fileCount={files.length}
          currentStep={loadingState.currentStep}
          progress={loadingState.progress}
        />
      )}

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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Files to merge ({files.length})</h3>
            <button
              onClick={clearAllFiles}
              className="text-sm text-foreground/60 hover:text-foreground underline"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 bg-foreground/5 rounded-lg border hover:bg-foreground/10 transition-colors cursor-move ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-foreground/60">
                      {file.pageCount} pages • {PDFUtils.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-foreground/60 bg-foreground/10 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  
                  {/* Move buttons */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => moveFileUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-foreground/10 rounded text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveFileDown(index)}
                      disabled={index === files.length - 1}
                      className="p-1 hover:bg-foreground/10 rounded text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-foreground/10 rounded text-foreground/60 hover:text-foreground"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary and Merge Button */}
          <div className="flex justify-between items-center pt-4 border-t border-foreground/10">
            <div className="text-sm text-foreground/60">
              <div>Total: {totalPages} pages</div>
              <div>Size: {PDFUtils.formatFileSize(totalSize)}</div>
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

      {/* Help text when only one file is added */}
      {files.length === 1 && (
        <div className="text-center p-4 bg-foreground/5 rounded-lg border border-foreground/10">
          <p className="text-sm text-foreground/60">
            Add at least one more PDF file to merge
          </p>
        </div>
      )}

      {/* Instructions */}
      {files.length === 0 && (
        <div className="text-center p-6 bg-foreground/5 rounded-lg border border-foreground/10">
          <h4 className="font-medium mb-2">How to use PDF Merger:</h4>
          <ul className="text-sm text-foreground/60 space-y-1">
            <li>• Upload 2 or more PDF files</li>
            <li>• Drag and drop to reorder files</li>
            <li>• Click &quot;Merge PDFs&quot; to combine them</li>
            <li>• Download will start automatically</li>
          </ul>
        </div>
      )}
    </div>
  );
}