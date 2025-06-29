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
  processingPage?: number;
}

function LoadingScreen({ fileName, pageCount, currentStep, progress, processingPage }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-foreground/20 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* OCR Icon Animation */}
          <div className="relative">
            <div className="text-6xl animate-pulse">🔍</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Processing PDF with OCR</h3>
            <p className="text-sm text-foreground/70 truncate">{fileName}</p>
            {pageCount && (
              <p className="text-xs text-foreground/50">{pageCount} pages</p>
            )}
            {processingPage && pageCount && (
              <p className="text-xs text-foreground/50">
                Processing page {processingPage} of {pageCount}
              </p>
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
  hasText?: string;
  onClick: () => void;
}

function PagePreview({ pageNumber, preview, isSelected, hasText, onClick }: PagePreviewProps) {
  return (
    <div 
      className={`relative cursor-pointer group transition-all duration-200 ${
        isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:border-green-300">
        <div className="aspect-[3/4] relative">
          <Image
            src={preview}
            alt={`Page ${pageNumber}`}
            fill
            className="object-contain bg-gray-50"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 border-2 border-green-500 border-dashed">
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            </div>
          )}
          {hasText && (
            <div className="absolute bottom-2 left-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              T
            </div>
          )}
        </div>
        <div className="p-2 text-center">
          <span className="text-sm font-medium text-gray-700">
            Page {pageNumber}
          </span>
          {hasText && (
            <div className="text-xs text-green-600 font-medium">Text detected</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PDFOCR() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [extractedText, setExtractedText] = useState<{ [pageNumber: number]: string }>({});
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [processingPage, setProcessingPage] = useState<number>();
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [ocrMode, setOcrMode] = useState<'accurate' | 'fast'>('accurate');
  const [createSearchablePdf, setCreateSearchablePdf] = useState(true);
  const [searchablePdfData, setSearchablePdfData] = useState<Uint8Array | null>(null);

  const languages = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'rus', name: 'Russian' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'kor', name: 'Korean' },
  ];

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
      setExtractedText({});
      
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

  const selectAllPages = () => {
    if (!file) return;
    setSelectedPages(Array.from({ length: file.pageCount || 0 }, (_, i) => i + 1));
  };

  const clearSelection = () => {
    setSelectedPages([]);
  };

  // Convert PDF page to canvas for OCR processing
  const convertPageToCanvas = async (pageIndex: number): Promise<HTMLCanvasElement> => {
    if (!file) throw new Error('No file available');

    // Ensure PDF.js is initialized
    await PDFUtils.initializePDFJS();
    
    if (!window.pdfjsLib) {
      throw new Error('PDF.js not available');
    }

    const arrayBuffer = await file.file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageIndex + 1); // PDF.js uses 1-based indexing

    const scale = 2.0; // Higher scale for better OCR accuracy
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas;
  };

  const performOCR = async () => {
    if (!file || selectedPages.length === 0) return;

    setIsProcessing(true);
    setLoadingStep('Initializing OCR engine...');
    setLoadingProgress(5);

    try {
      // Dynamically import Tesseract.js to avoid SSR issues
      const Tesseract = await import('tesseract.js');
      
      setLoadingStep('Loading OCR language models...');
      setLoadingProgress(10);

      const results: { [pageNumber: number]: string } = {};
      const totalPages = selectedPages.length;

      for (let i = 0; i < selectedPages.length; i++) {
        const pageNumber = selectedPages[i];
        const pageIndex = pageNumber - 1;
        
        setProcessingPage(pageNumber);
        setLoadingStep(`Converting page ${pageNumber} to image...`);
        setLoadingProgress(15 + (i / totalPages) * 70);

        // Convert PDF page to canvas
        const canvas = convertPageToCanvas(pageIndex);
        
        setLoadingStep(`Extracting text from page ${pageNumber}...`);
        
        // Perform OCR on the canvas
        const { data: { text } } = await Tesseract.recognize(
          await canvas,
          ocrLanguage,
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                const pageProgress = (m.progress || 0) * 100;
                const totalProgress = 15 + (i / totalPages) * 70 + (pageProgress / totalPages) * 0.7;
                setLoadingProgress(Math.min(85, totalProgress));
              }
            },
            tessedit_pageseg_mode: ocrMode === 'accurate' ? '1' : '6', // Auto or uniform block
            tessedit_char_whitelist: undefined, // Allow all characters
          }
        );

        results[pageNumber] = text.trim();
        
        setLoadingProgress(15 + ((i + 1) / totalPages) * 70);
      }

      setExtractedText(results);
      setLoadingStep('OCR processing complete!');
      setLoadingProgress(100);
      
      // Create searchable PDF if option is enabled
      if (createSearchablePdf && Object.keys(results).length > 0) {
        setLoadingStep('Creating searchable PDF...');
        setLoadingProgress(85);
        
        try {
          const searchablePdf = await PDFUtils.addOCRTextLayer(file.file, results);
          setSearchablePdfData(searchablePdf);
          setLoadingStep('Searchable PDF created successfully!');
        } catch (error) {
          console.error('Error creating searchable PDF:', error);
          // Continue without failing the entire process
          setLoadingStep('OCR complete (searchable PDF creation failed)');
        }
      }
      
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
        setProcessingPage(undefined);
      }, 1000);

    } catch (error) {
      console.error('Error performing OCR:', error);
      alert('Error performing OCR. Please try again.');
      setIsProcessing(false);
      setLoadingStep('');
      setLoadingProgress(0);
      setProcessingPage(undefined);
    }
  };

  const copyAllText = () => {
    const allText = selectedPages
      .map(pageNum => `--- Page ${pageNum} ---\n${extractedText[pageNum] || 'No text extracted'}\n`)
      .join('\n');
    navigator.clipboard.writeText(allText);
  };

  const downloadText = () => {
    const allText = selectedPages
      .map(pageNum => `--- Page ${pageNum} ---\n${extractedText[pageNum] || 'No text extracted'}\n`)
      .join('\n');
    
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '')}_ocr_text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasExtractedText = Object.keys(extractedText).length > 0;

  return (
    <div className="space-y-6">
      {/* Loading Screen Overlay */}
      {(isLoadingPreviews || isProcessing) && (
        <LoadingScreen
          fileName={file?.name || 'PDF Document'}
          pageCount={file?.pageCount}
          currentStep={loadingStep}
          progress={loadingProgress}
          processingPage={processingPage}
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
          <div className="text-4xl">🔍</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Extract text from scanned documents using OCR
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

          {/* OCR Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">OCR Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value)}
                  className="w-full p-2 border border-foreground/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Processing Mode</label>
                <select
                  value={ocrMode}
                  onChange={(e) => setOcrMode(e.target.value as 'accurate' | 'fast')}
                  className="w-full p-2 border border-foreground/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="accurate">Accurate (Slower)</option>
                  <option value="fast">Fast (Less accurate)</option>
                </select>
              </div>
            </div>

            {/* Searchable PDF Option */}
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="searchable-pdf"
                  checked={createSearchablePdf}
                  onChange={(e) => setCreateSearchablePdf(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="searchable-pdf" className="block text-sm font-medium text-green-900 dark:text-green-100 cursor-pointer">
                    Create Searchable PDF
                  </label>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Embed extracted text as an invisible layer in the PDF, making it searchable and selectable while preserving the original appearance.
                  </p>
                </div>
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
                <h3 className="text-lg font-semibold">Select Pages for OCR</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllPages}
                    className="px-3 py-1 text-sm bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 text-sm bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
                  >
                    Clear
                  </button>
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
                          hasText={extractedText[pageNumber]}
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
                          ? 'bg-green-500 text-white'
                          : 'bg-background border hover:bg-foreground/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-sm text-foreground/60">
                {selectedPages.length === 0
                  ? 'Select pages to extract text from'
                  : `${selectedPages.length} page${selectedPages.length !== 1 ? 's' : ''} selected: ${selectedPages.join(', ')}`}
              </p>
            </div>
          )}

          {/* OCR Button */}
          {!isLoadingPreviews && (
            <div className="flex justify-center pt-6 border-t border-foreground/10">
              <button
                onClick={performOCR}
                disabled={isProcessing || selectedPages.length === 0}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {isProcessing ? 'Extracting Text...' : `Extract Text from ${selectedPages.length} Page${selectedPages.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Extracted Text Results */}
          {hasExtractedText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Extracted Text</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyAllText}
                    className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                  >
                    Copy All Text
                  </button>
                  <button
                    onClick={downloadText}
                    className="px-4 py-2 bg-foreground/10 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/20 transition-colors"
                  >
                    Download as TXT
                  </button>
                </div>
              </div>

              {/* Searchable PDF Download */}
              {searchablePdfData && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-green-600 dark:text-green-400 text-xl">📄</div>
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">Searchable PDF Created</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your PDF now contains invisible text layers that make it searchable and text-selectable.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const filename = `${file?.name.replace('.pdf', '')}_searchable.pdf`;
                        PDFUtils.downloadFile(searchablePdfData, filename);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Download Searchable PDF
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedPages.map(pageNum => (
                  <div key={pageNum} className="p-4 border border-foreground/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Page {pageNum}</h4>
                      <button
                        onClick={() => navigator.clipboard.writeText(extractedText[pageNum] || '')}
                        className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-sm bg-foreground/5 p-3 rounded max-h-32 overflow-y-auto font-mono">
                      {extractedText[pageNum] || 'No text extracted from this page'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* OCR Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">🔍</div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Optical Character Recognition (OCR)</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Extract text from scanned documents and images within PDFs. Works best with clear, high-quality scans. 
              Processing time depends on image quality and document complexity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
