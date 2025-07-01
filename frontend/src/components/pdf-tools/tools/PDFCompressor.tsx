'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
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
            <div className="text-6xl animate-pulse">🗜️</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Compressing PDF</h3>
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

// File preview component
interface FilePreviewProps {
  file: PDFFile;
  onShowPreview: () => void;
  showingPreview: boolean;
}

function FilePreview({ file, onShowPreview, showingPreview }: FilePreviewProps) {
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const loadPreview = async () => {
    if (previewPages.length > 0 || isLoadingPreview) return;
    
    setIsLoadingPreview(true);
    try {
      const previews = await PDFUtils.generatePagePreviews(file.file, 4); // Load first 4 pages
      setPreviewPages(previews);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const togglePreview = () => {
    if (!showingPreview) {
      loadPreview();
    }
    onShowPreview();
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-foreground/5 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-foreground/60">
                {file.pageCount} pages • {PDFUtils.formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={togglePreview}
            className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 rounded text-sm transition-colors"
          >
            {showingPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {showingPreview && (
        <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Original PDF Preview</h4>
            <span className="text-xs text-foreground/60">
              File size: {PDFUtils.formatFileSize(file.size)}
            </span>
          </div>
          
          {isLoadingPreview ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
              <span className="ml-2 text-sm text-foreground/60">Loading preview...</span>
            </div>
          ) : previewPages.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                {previewPages.map((preview, pageIndex) => (
                  <div key={pageIndex} className="relative">
                    <div className="aspect-[3/4] relative bg-white rounded shadow-sm overflow-hidden">
                      <Image
                        src={preview}
                        alt={`Page ${pageIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="150px"
                      />
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-xs text-foreground/60">Page {pageIndex + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              {file.pageCount && file.pageCount > 4 && (
                <div className="text-center">
                  <span className="text-xs text-foreground/50">
                    ... and {file.pageCount - 4} more page{file.pageCount - 4 !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-foreground/60 text-sm">
              Preview not available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Result preview component
interface ResultPreviewProps {
  originalFile: PDFFile;
  compressedFile: { name: string; url: string; size: number };
  onDownload: () => void;
}

function ResultPreview({ originalFile, compressedFile, onDownload }: ResultPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const compressionRatio = ((originalFile.size - compressedFile.size) / originalFile.size * 100);
  const sizeReduction = originalFile.size - compressedFile.size;

  const loadPreview = async () => {
    if (previewPages.length > 0 || isLoadingPreview) return;
    
    setIsLoadingPreview(true);
    try {
      const response = await fetch(compressedFile.url);
      const blob = await response.blob();
      const file = new File([blob], compressedFile.name, { type: 'application/pdf' });
      const previews = await PDFUtils.generatePagePreviews(file, 4); // Load first 4 pages
      setPreviewPages(previews);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const togglePreview = () => {
    if (!showPreview) {
      loadPreview();
    }
    setShowPreview(!showPreview);
  };

  return (
    <div className="border border-foreground/20 rounded-lg p-6 bg-foreground/5 mt-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-foreground/10">
        <div>
          <h4 className="font-medium text-foreground">Compression Complete!</h4>
          <p className="text-sm text-foreground/60 mt-1">
            Successfully compressed your PDF file
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-green-600">
            -{compressionRatio.toFixed(1)}%
          </div>
          <div className="text-xs text-foreground/60">size reduction</div>
        </div>
      </div>

      {/* File size comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-background rounded-lg border border-foreground/10">
          <div className="text-sm text-foreground/60">Original Size</div>
          <div className="text-lg font-medium">{PDFUtils.formatFileSize(originalFile.size)}</div>
        </div>
        <div className="text-center p-3 bg-background rounded-lg border border-foreground/10">
          <div className="text-sm text-foreground/60">Compressed Size</div>
          <div className="text-lg font-medium text-green-600">{PDFUtils.formatFileSize(compressedFile.size)}</div>
        </div>
        <div className="text-center p-3 bg-background rounded-lg border border-foreground/10">
          <div className="text-sm text-foreground/60">Space Saved</div>
          <div className="text-lg font-medium text-blue-600">{PDFUtils.formatFileSize(sizeReduction)}</div>
        </div>
      </div>

      {/* File info and actions */}
      <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-foreground/10 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            ✓
          </div>
          <div>
            <p className="font-medium text-sm">{compressedFile.name}</p>
            <p className="text-xs text-foreground/60">
              {originalFile.pageCount} pages • Compressed PDF ready for download
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePreview}
            className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 rounded text-sm transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm font-medium"
          >
            Download
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="space-y-4">
          <h5 className="text-sm font-medium">Compressed PDF Preview</h5>
          
          {isLoadingPreview ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
              <span className="ml-2 text-sm text-foreground/60">Loading preview...</span>
            </div>
          ) : previewPages.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                {previewPages.map((preview, pageIndex) => (
                  <div key={pageIndex} className="relative">
                    <div className="aspect-[3/4] relative bg-white rounded shadow-sm overflow-hidden">
                      <Image
                        src={preview}
                        alt={`Page ${pageIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="150px"
                      />
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-xs text-foreground/60">Page {pageIndex + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              {originalFile.pageCount && originalFile.pageCount > 4 && (
                <div className="text-center">
                  <span className="text-xs text-foreground/50">
                    ... and {originalFile.pageCount - 4} more page{originalFile.pageCount - 4 !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-foreground/60 text-sm">
              Preview not available
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-foreground/10 text-center">
        <p className="text-sm text-foreground/60">
          💡 Quality maintained while reducing file size for easier sharing and storage
        </p>
      </div>
    </div>
  );
}

export default function PDFCompressor() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showOriginalPreview, setShowOriginalPreview] = useState(false);
  const [compressedResult, setCompressedResult] = useState<{ name: string; url: string; size: number } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf');
    if (!pdfFile) return;

    setIsLoadingFile(true);
    setLoadingStep('Reading PDF file...');
    setLoadingProgress(10);

    try {
      setLoadingStep('Analyzing document structure...');
      setLoadingProgress(50);
      
      const pageCount = await PDFUtils.getPageCount(pdfFile);
      
      setLoadingStep('Preparing for compression...');
      setLoadingProgress(90);
      
      setFile({
        file: pdfFile,
        name: pdfFile.name,
        size: pdfFile.size,
        pageCount,
      });
      
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsLoadingFile(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 300);
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
      setIsLoadingFile(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const compressPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLoadingStep('Preparing PDF for compression...');
    setLoadingProgress(10);
    
    try {
      setLoadingStep('Analyzing PDF structure...');
      setLoadingProgress(30);
      
      setLoadingStep('Applying compression algorithms...');
      setLoadingProgress(60);
      
      const compressedPDF = await PDFUtils.compressPDF(file.file);
      
      setLoadingStep('Generating compressed file...');
      setLoadingProgress(80);
      
      const blob = new Blob([compressedPDF], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = file.name.replace('.pdf', '_compressed.pdf');
      
      setCompressedResult({
        name: filename,
        url,
        size: blob.size
      });
      
      setLoadingStep('Compression complete!');
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Error compressing PDF. Please try again.');
      setIsProcessing(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  };

  const downloadCompressedFile = () => {
    if (compressedResult) {
      const a = document.createElement('a');
      a.href = compressedResult.url;
      a.download = compressedResult.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading Screen Overlay */}
      {(isLoadingFile || isProcessing) && (
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

      {/* File Preview and Compression */}
      {file && !compressedResult && (
        <div className="space-y-6">
          <FilePreview
            file={file}
            onShowPreview={() => setShowOriginalPreview(!showOriginalPreview)}
            showingPreview={showOriginalPreview}
          />

          <div className="flex justify-center pt-6 border-t border-foreground/10">
            <button
              onClick={compressPDF}
              disabled={isProcessing}
              className="px-8 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {isProcessing ? 'Compressing...' : 'Compress PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Result Preview */}
      {compressedResult && file && (
        <ResultPreview
          originalFile={file}
          compressedFile={compressedResult}
          onDownload={downloadCompressedFile}
        />
      )}
    </div>
  );
}