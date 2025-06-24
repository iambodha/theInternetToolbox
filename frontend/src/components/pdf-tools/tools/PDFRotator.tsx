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
            <div className="text-6xl animate-pulse">🔄</div>
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

type RotationType = 0 | 90 | 180 | 270;

interface PagePreviewProps {
  pageNumber: number;
  preview: string;
  rotation: RotationType;
  onClick: () => void;
}

function PagePreview({ pageNumber, preview, rotation, onClick }: PagePreviewProps) {
  const getRotationStyle = () => {
    if (rotation === 0) return {};
    return {
      transform: `rotate(${rotation}deg)`,
      transition: 'transform 0.3s ease-in-out'
    };
  };

  const getRotationConfig = () => {
    switch (rotation) {
      case 90:
        return {
          color: 'bg-blue-500',
          ring: 'ring-blue-500',
          border: 'border-blue-300',
          icon: '↻',
          label: '90°'
        };
      case 180:
        return {
          color: 'bg-green-500',
          ring: 'ring-green-500',
          border: 'border-green-300',
          icon: '↑↓',
          label: '180°'
        };
      case 270:
        return {
          color: 'bg-purple-500',
          ring: 'ring-purple-500',
          border: 'border-purple-300',
          icon: '↺',
          label: '270°'
        };
      default:
        return {
          color: 'bg-gray-500',
          ring: 'ring-gray-300',
          border: 'border-gray-200',
          icon: '',
          label: 'No rotation'
        };
    }
  };

  const config = getRotationConfig();

  return (
    <div 
      className={`relative cursor-pointer group transition-all duration-200 ${
        rotation !== 0 ? `ring-2 ${config.ring} ring-offset-2` : ''
      }`}
      onClick={onClick}
    >
      <div className={`bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:${config.border}`}>
        <div className="aspect-[3/4] relative flex items-center justify-center bg-gray-50">
          <div 
            className="w-full h-full flex items-center justify-center"
            style={getRotationStyle()}
          >
            <Image
              src={preview}
              alt={`Page ${pageNumber}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
            />
          </div>
          {rotation !== 0 && (
            <div className={`absolute inset-0 ${config.color} bg-opacity-20 border-2 ${config.color.replace('bg-', 'border-')} border-dashed`}>
              <div className={`absolute top-2 right-2 ${config.color} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}>
                {config.icon}
              </div>
            </div>
          )}
        </div>
        <div className="p-2 text-center">
          <span className="text-sm font-medium text-gray-700">
            Page {pageNumber}
          </span>
          {rotation !== 0 && (
            <div className={`mt-1 text-xs ${config.color.replace('bg-', 'text-')} font-medium`}>
              {config.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PDFRotator() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [pageRotations, setPageRotations] = useState<{ [pageNumber: number]: RotationType }>({});
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
      
      // Initialize with no rotations
      setPageRotations({});
      
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

  const cyclePageRotation = (pageNumber: number) => {
    const currentRotation = pageRotations[pageNumber] || 0;
    const nextRotation: RotationType = currentRotation === 0 ? 90 : currentRotation === 90 ? 180 : currentRotation === 180 ? 270 : 0;
    
    setPageRotations(prev => ({
      ...prev,
      [pageNumber]: nextRotation
    }));
  };

  const applyRotationToAll = (rotation: RotationType) => {
    if (!file || !file.pageCount) return;
    const newRotations: { [pageNumber: number]: RotationType } = {};
    for (let i = 1; i <= file.pageCount; i++) {
      newRotations[i] = rotation;
    }
    setPageRotations(newRotations);
  };

  const clearAllRotations = () => {
    setPageRotations({});
  };

  const rotatePDF = async () => {
    if (!file || Object.keys(pageRotations).length === 0) return;

    setIsProcessing(true);
    setLoadingStep('Preparing page rotations...');
    setLoadingProgress(10);

    try {
      const rotatedPagesCount = Object.values(pageRotations).filter(r => r !== 0).length;
      setLoadingStep(`Applying rotations to ${rotatedPagesCount} pages...`);
      setLoadingProgress(50);
      
      // Group pages by rotation angle for efficient processing
      const rotationGroups: { [angle in 90 | 180 | 270]?: number[] } = {};
      
      Object.entries(pageRotations).forEach(([pageStr, rotation]) => {
        if (rotation !== 0) {
          const pageNum = parseInt(pageStr) - 1; // Convert to 0-based index
          if (!rotationGroups[rotation as 90 | 180 | 270]) {
            rotationGroups[rotation as 90 | 180 | 270] = [];
          }
          rotationGroups[rotation as 90 | 180 | 270]!.push(pageNum);
        }
      });

      let currentPDFData: Uint8Array | File = file.file;
      
      // Apply rotations for each angle
      for (const [angle, pages] of Object.entries(rotationGroups)) {
        if (pages && pages.length > 0) {
          // Convert Uint8Array back to File if needed
          if (currentPDFData instanceof Uint8Array) {
            const blob = new Blob([currentPDFData], { type: 'application/pdf' });
            currentPDFData = new File([blob], file.name, { type: 'application/pdf' });
          }
          
          currentPDFData = await PDFUtils.rotatePDF(currentPDFData, parseInt(angle) as 90 | 180 | 270, pages);
        }
      }
      
      setLoadingStep('Generating download file...');
      setLoadingProgress(80);
      
      const filename = file.name.replace('.pdf', '_rotated_pages.pdf');
      PDFUtils.downloadFile(currentPDFData as Uint8Array, filename);

      setLoadingStep('Download complete!');
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('Error rotating PDF. Please try again.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);
    }
  };

  const rotatedPagesCount = Object.values(pageRotations).filter(r => r !== 0).length;

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
          <div className="text-4xl">🔄</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Rotate pages individually to correct orientation
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

          {/* Rotation Legend & Bulk Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Page Rotation Controls</h3>
            
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-foreground/5 rounded-lg">
              <span className="text-sm font-medium">Rotation colors:</span>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">90° ↻</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">180° ↑↓</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm">270° ↺</span>
              </div>
              <span className="text-sm text-foreground/60">• Click pages to cycle through rotations</span>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyRotationToAll(90)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <span>All 90°</span>
                <span>↻</span>
              </button>
              <button
                onClick={() => applyRotationToAll(180)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <span>All 180°</span>
                <span>↑↓</span>
              </button>
              <button
                onClick={() => applyRotationToAll(270)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center space-x-2"
              >
                <span>All 270°</span>
                <span>↺</span>
              </button>
              <button
                onClick={clearAllRotations}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
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
                <h3 className="text-lg font-semibold">Click Pages to Rotate</h3>
                <div className="text-sm text-foreground/60">
                  {rotatedPagesCount === 0 
                    ? 'No pages selected for rotation'
                    : `${rotatedPagesCount} page${rotatedPagesCount !== 1 ? 's' : ''} will be rotated`
                  }
                </div>
              </div>

              {/* Page Previews */}
              {pagePreviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto border border-foreground/10 rounded-lg p-4 bg-foreground/5">
                    {pagePreviews.map((preview, index) => {
                      const pageNumber = index + 1;
                      const rotation = pageRotations[pageNumber] || 0;
                      
                      return (
                        <PagePreview
                          key={pageNumber}
                          pageNumber={pageNumber}
                          preview={preview}
                          rotation={rotation}
                          onClick={() => cyclePageRotation(pageNumber)}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 max-h-32 overflow-y-auto p-2 bg-foreground/5 rounded">
                  {Array.from({ length: file.pageCount || 0 }, (_, i) => i + 1).map((pageNum) => {
                    const rotation = pageRotations[pageNum] || 0;
                    const isRotated = rotation !== 0;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => cyclePageRotation(pageNum)}
                        className={`aspect-square text-xs font-medium rounded transition-colors ${
                          isRotated
                            ? rotation === 90 ? 'bg-blue-500 text-white'
                            : rotation === 180 ? 'bg-green-500 text-white'
                            : 'bg-purple-500 text-white'
                            : 'bg-background border hover:bg-foreground/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Rotate Button */}
          {!isLoadingPreviews && (
            <div className="flex justify-center pt-6 border-t border-foreground/10">
              <button
                onClick={rotatePDF}
                disabled={isProcessing || rotatedPagesCount === 0}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg flex items-center space-x-2"
              >
                <span>
                  {isProcessing 
                    ? 'Rotating...' 
                    : rotatedPagesCount === 0 
                      ? 'Select pages to rotate'
                      : `Apply Rotations to ${rotatedPagesCount} Page${rotatedPagesCount !== 1 ? 's' : ''}`
                  }
                </span>
                <span className="text-lg">🔄</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
