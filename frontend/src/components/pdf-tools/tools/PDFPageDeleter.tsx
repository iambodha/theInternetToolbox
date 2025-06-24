'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

interface LoadingScreenProps {
  fileName: string;
  pageCount?: number;
  currentStep: string;
  progress?: number;
}

function LoadingScreen({ fileName, pageCount, currentStep, progress }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-foreground/20 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* PDF Icon Animation */}
          <div className="relative">
            <div className="text-6xl animate-pulse">🗑️</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Processing PDF</h3>
            <p className="text-sm text-foreground/70 truncate">{fileName}</p>
            {pageCount && (
              <p className="text-xs text-foreground/50">{pageCount} pages</p>
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

interface PagePreviewProps {
  pageNumber: number;
  preview: string;
  isSelected: boolean;
  onClick: () => void;
}

function PagePreview({ pageNumber, preview, isSelected, onClick }: PagePreviewProps) {
  return (
    <div 
      className={`relative cursor-pointer group transition-all duration-200 ${
        isSelected ? 'ring-2 ring-red-500 ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:border-red-300">
        <div className="aspect-[3/4] relative">
          <img
            src={preview}
            alt={`Page ${pageNumber}`}
            className="w-full h-full object-contain bg-gray-50"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-20 border-2 border-red-500 border-dashed">
              <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✗
              </div>
            </div>
          )}
        </div>
        <div className="p-2 text-center">
          <span className="text-sm font-medium text-gray-700">
            Page {pageNumber}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PDFPageDeleter() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf');
    if (!pdfFile) return;

    setIsLoadingPreviews(true);
    setLoadingStep('Reading PDF file...');
    setLoadingProgress(10);

    try {
      setLoadingStep('Analyzing document structure...');
      setLoadingProgress(25);
      
      const pageCount = await PDFUtils.getPageCount(pdfFile);
      
      setLoadingStep(`Generating previews for ${pageCount} pages...`);
      setLoadingProgress(40);
      
      const previews = await PDFUtils.generatePagePreviews(pdfFile);
      
      setLoadingStep('Finalizing setup...');
      setLoadingProgress(90);
      
      setFile({
        file: pdfFile,
        name: pdfFile.name,
        size: pdfFile.size,
        pageCount,
        pagePreviews: previews,
      });
      
      setPagePreviews(previews);
      setSelectedPages([]);
      
      setLoadingProgress(100);
      
      // Small delay to show completion
      setTimeout(() => {
        setIsLoadingPreviews(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 300);
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
      setIsLoadingPreviews(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
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

  const deletePages = async () => {
    if (!file || selectedPages.length === 0) return;

    setIsProcessing(true);
    setLoadingStep('Preparing page deletion...');
    setLoadingProgress(10);

    try {
      setLoadingStep(`Deleting ${selectedPages.length} pages...`);
      setLoadingProgress(50);
      
      const resultPDF = await PDFUtils.deletePages(file.file, selectedPages);
      
      setLoadingStep('Generating download file...');
      setLoadingProgress(80);
      
      const filename = `${file.name.replace('.pdf', '')}_pages_deleted.pdf`;
      PDFUtils.downloadFile(resultPDF, filename);

      setLoadingStep('Download complete!');
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error deleting pages:', error);
      alert('Error deleting pages. Please try again.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);
    }
  };

  const remainingPages = (file?.pageCount || 0) - selectedPages.length;

  return (
    <div className="space-y-6">
      {/* Loading Screen Overlay */}
      {(isLoadingPreviews || isProcessing) && (
        <LoadingScreen
          fileName={file?.name || 'PDF Document'}
          pageCount={file?.pageCount}
          currentStep={loadingStep}
          progress={loadingProgress}
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
          <div className="text-4xl">🗑️</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Remove unwanted pages from PDF
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

          {/* Loading State */}
          {isLoadingPreviews && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              <p className="mt-2 text-foreground/60">Generating page previews...</p>
            </div>
          )}

          {/* Page Selection */}
          {!isLoadingPreviews && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Pages to Delete</h3>
                <div className="flex items-center space-x-2 text-sm text-foreground/60">
                  <span>Click pages to select/deselect</span>
                </div>
              </div>

              {/* Page Previews */}
              {pagePreviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 max-h-96 overflow-y-auto border border-foreground/10 rounded-lg p-4 bg-foreground/5">
                    {pagePreviews.map((preview, index) => {
                      const pageNumber = index + 1;
                      
                      return (
                        <PagePreview
                          key={pageNumber}
                          pageNumber={pageNumber}
                          preview={preview}
                          isSelected={selectedPages.includes(pageNumber)}
                          onClick={() => togglePageSelection(pageNumber)}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 max-h-40 overflow-y-auto p-2 bg-foreground/5 rounded">
                  {Array.from({ length: file.pageCount || 0 }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => togglePageSelection(pageNum)}
                      className={`aspect-square text-xs font-medium rounded transition-colors ${
                        selectedPages.includes(pageNum)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-background border hover:bg-foreground/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-foreground/60">
                  {selectedPages.length === 0
                    ? 'Select pages to delete'
                    : `${selectedPages.length} page${selectedPages.length !== 1 ? 's' : ''} selected for deletion: ${selectedPages.join(', ')}`}
                </p>
                {selectedPages.length > 0 && (
                  <p className="text-sm text-foreground/80">
                    <strong>Result:</strong> {remainingPages} page{remainingPages !== 1 ? 's' : ''} will remain
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Warning for deleting all pages */}
          {remainingPages === 0 && selectedPages.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ Warning: You cannot delete all pages. At least one page must remain.
              </p>
            </div>
          )}

          {/* Delete Button */}
          {!isLoadingPreviews && (
            <div className="flex justify-center pt-6 border-t border-foreground/10">
              <button
                onClick={deletePages}
                disabled={isProcessing || selectedPages.length === 0 || remainingPages === 0}
                className="px-8 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {isProcessing ? 'Deleting...' : `Delete ${selectedPages.length} Page${selectedPages.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}