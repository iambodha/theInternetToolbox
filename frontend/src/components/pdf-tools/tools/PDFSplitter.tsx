'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

interface SplitRange {
  id: number;
  start: number;
  end: number;
  name: string;
}

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
            <div className="text-6xl animate-pulse">📄</div>
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
  inRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  rangeColor: string;
  onClick: () => void;
}

function PagePreview({ 
  pageNumber, 
  preview, 
  isSelected, 
  inRange,
  isRangeStart, 
  isRangeEnd, 
  rangeColor,
  onClick 
}: PagePreviewProps) {
  return (
    <div 
      className={`relative cursor-pointer group transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:border-blue-300">
        <div className="aspect-[3/4] relative">
          <img
            src={preview}
            alt={`Page ${pageNumber}`}
            className="w-full h-full object-contain bg-gray-50"
          />
          {inRange && (
            <div 
              className={`absolute inset-0 bg-opacity-20 border-2 ${
                isRangeStart || isRangeEnd ? 'border-dashed' : 'border-solid'
              }`}
              style={{ 
                backgroundColor: rangeColor + '33', 
                borderColor: rangeColor 
              }}
            />
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

export default function PDFSplitter() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [splitRanges, setSplitRanges] = useState<SplitRange[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('range');
  const [numberOfParts, setNumberOfParts] = useState(2);
  const [splitMode, setSplitMode] = useState<'parts' | 'single'>('parts');
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Color palette for different ranges
  const rangeColors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
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
      
      // Initialize with 2-part split by default
      const pagesPerPart = Math.ceil(pageCount / 2);
      const ranges: SplitRange[] = [
        {
          id: 1,
          start: 1,
          end: pagesPerPart,
          name: 'Part 1',
        },
        {
          id: 2,
          start: pagesPerPart + 1,
          end: pageCount,  
          name: 'Part 2',
        }
      ];
      setSplitRanges(ranges);
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

  const handlePageClick = (pageNumber: number) => {
    if (selectionMode === 'single') {
      setSelectedPages([pageNumber]);
    } else {
      setSelectedPages(prev => {
        if (prev.includes(pageNumber)) {
          return prev.filter(p => p !== pageNumber);
        } else {
          return [...prev, pageNumber].sort((a, b) => a - b);
        }
      });
    }
  };

  const createRangeFromSelection = () => {
    if (selectedPages.length === 0) return;
    
    const sortedPages = [...selectedPages].sort((a, b) => a - b);
    const newRange: SplitRange = {
      id: Date.now(),
      start: sortedPages[0],
      end: sortedPages[sortedPages.length - 1],
      name: sortedPages.length === 1 
        ? `Page ${sortedPages[0]}` 
        : `Pages ${sortedPages[0]}-${sortedPages[sortedPages.length - 1]}`,
    };

    setSplitRanges(prev => {
      // Remove any existing ranges that overlap with the new range
      const filtered = prev.filter(range => 
        range.end < newRange.start || range.start > newRange.end
      );
      return [...filtered, newRange].sort((a, b) => a.start - b.start);
    });

    setSelectedPages([]);
  };

  const clearAllRanges = () => {
    setSplitRanges([]);
    setSelectedPages([]);
  };

  const getPageRangeInfo = (pageNumber: number) => {
    const range = splitRanges.find(r => pageNumber >= r.start && pageNumber <= r.end);
    if (!range) return { inRange: false, rangeColor: '', isStart: false, isEnd: false };
    
    const colorIndex = splitRanges.indexOf(range) % rangeColors.length;
    return {
      inRange: true,
      rangeColor: rangeColors[colorIndex],
      isStart: pageNumber === range.start,
      isEnd: pageNumber === range.end,
    };
  };

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
    setLoadingStep('Preparing to split PDF...');
    setLoadingProgress(5);

    try {
      const validRanges = splitRanges.filter(range => 
        range.start > 0 && 
        range.end <= (file.pageCount || 0) && 
        range.start <= range.end
      );

      setLoadingStep(`Processing ${validRanges.length} file ranges...`);
      setLoadingProgress(20);

      const splitPDFs = await PDFUtils.splitPDF(file.file, validRanges);
      
      setLoadingStep('Generating download files...');
      setLoadingProgress(80);
      
      splitPDFs.forEach((pdfData, index) => {
        const range = validRanges[index];
        const filename = range.start === range.end 
          ? `${file.name.replace('.pdf', '')}_page_${range.start}.pdf`
          : `${file.name.replace('.pdf', '')}_pages_${range.start}-${range.end}.pdf`;
        PDFUtils.downloadFile(pdfData, filename);
      });

      setLoadingStep('Downloads complete!');
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF. Please try again.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);
    }
  };

  const splitIntoSinglePages = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setLoadingStep('Preparing individual page split...');
    setLoadingProgress(5);

    try {
      const ranges: { start: number; end: number }[] = [];
      for (let i = 1; i <= (file.pageCount || 0); i++) {
        ranges.push({
          start: i,
          end: i,
        });
      }
      
      setLoadingStep(`Processing ${file.pageCount} individual pages...`);
      setLoadingProgress(20);
      
      const splitPDFs = await PDFUtils.splitPDF(file.file, ranges);
      
      setLoadingStep('Generating download files...');
      setLoadingProgress(70);
      
      splitPDFs.forEach((pdfData, index) => {
        const pageNumber = index + 1;
        const filename = `${file.name.replace('.pdf', '')}_page_${pageNumber}.pdf`;
        PDFUtils.downloadFile(pdfData, filename);
      });

      setLoadingStep('Downloads complete!');
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF. Please try again.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);
    }
  };

  const splitIntoParts = () => {
    if (!file || numberOfParts < 1) return;
    
    const totalPages = file.pageCount || 0;
    const pagesPerPart = Math.ceil(totalPages / numberOfParts);
    const ranges: SplitRange[] = [];
    
    for (let i = 0; i < numberOfParts; i++) {
      const start = i * pagesPerPart + 1;
      const end = Math.min((i + 1) * pagesPerPart, totalPages);
      
      if (start <= totalPages) {
        ranges.push({
          id: Date.now() + i,
          start,
          end,
          name: `Part ${i + 1}`,
        });
      }
    }
    
    setSplitRanges(ranges);
  };

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

          {/* Loading State */}
          {isLoadingPreviews && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              <p className="mt-2 text-foreground/60">Generating page previews...</p>
            </div>
          )}

          {/* Split Mode Selection - Only show when not loading */}
          {!isLoadingPreviews && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">How would you like to split your PDF?</h3>
                
                {/* Split Mode Tabs */}
                <div className="flex space-x-1 bg-foreground/5 p-1 rounded-lg">
                  <button
                    onClick={() => setSplitMode('parts')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      splitMode === 'parts'
                        ? 'bg-foreground text-background'
                        : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
                    }`}
                  >
                    Split into Parts
                  </button>
                  <button
                    onClick={() => setSplitMode('single')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      splitMode === 'single'
                        ? 'bg-foreground text-background'
                        : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
                    }`}
                  >
                    Single Pages
                  </button>
                </div>

                {/* Split into Parts */}
                {splitMode === 'parts' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Number of parts:</label>
                        <input
                          type="number"
                          value={numberOfParts}
                          onChange={(e) => setNumberOfParts(Math.max(1, Math.min(parseInt(e.target.value) || 1, file.pageCount || 1)))}
                          className="w-20 px-3 py-2 bg-background border border-foreground/20 rounded-lg text-sm text-center"
                          min="1"
                          max={file.pageCount}
                        />
                        <button
                          onClick={splitIntoParts}
                          className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-sm font-medium transition-colors"
                        >
                          Update Split
                        </button>
                      </div>
                      <p className="text-sm text-foreground/60">
                        Split your PDF into {numberOfParts} equal parts. Pages will be distributed evenly.
                      </p>
                    </div>

                    {/* Page Previews for Parts Mode */}
                    {pagePreviews.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-md font-medium">Page Previews</h4>
                        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 max-h-96 overflow-y-auto border border-foreground/10 rounded-lg p-4 bg-foreground/5">
                          {pagePreviews.map((preview, index) => {
                            const pageNumber = index + 1;
                            const rangeInfo = getPageRangeInfo(pageNumber);
                            
                            return (
                              <PagePreview
                                key={pageNumber}
                                pageNumber={pageNumber}
                                preview={preview}
                                isSelected={false}
                                inRange={rangeInfo.inRange}
                                isRangeStart={rangeInfo.isStart}
                                isRangeEnd={rangeInfo.isEnd}
                                rangeColor={rangeInfo.rangeColor}
                                onClick={() => {}} // No click interaction in parts mode
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Single Pages */}
                {splitMode === 'single' && (
                  <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Split into individual pages</p>
                        <p className="text-sm text-foreground/60">
                          Each page will be saved as a separate PDF file ({file.pageCount} files total)
                        </p>
                      </div>
                      <button
                        onClick={splitIntoSinglePages}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? 'Splitting...' : 'Split Now'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Split Ranges Display */}
              {splitRanges.length > 0 && splitMode === 'parts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium">Split Ranges ({splitRanges.length} files will be created)</h4>
                    <button
                      onClick={() => setSplitRanges([])}
                      className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-lg text-sm transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {splitRanges.map((range, index) => {
                      const colorIndex = index % rangeColors.length;
                      const rangeColor = rangeColors[colorIndex];
                      
                      return (
                        <div key={range.id} className="flex items-center space-x-3 p-3 bg-foreground/5 border border-foreground/10 rounded-lg border-l-4" style={{ borderLeftColor: rangeColor }}>
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: rangeColor }}></div>
                          <input
                            type="text"
                            value={range.name}
                            onChange={(e) => updateRange(range.id, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 bg-background border border-foreground/20 rounded-lg text-sm"
                            placeholder="Range name"
                          />
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-foreground/60">Pages:</span>
                            <input
                              type="number"
                              value={range.start}
                              onChange={(e) => updateRange(range.id, 'start', parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 bg-background border border-foreground/20 rounded text-sm text-center"
                              min="1"
                              max={file.pageCount}
                            />
                            <span className="text-foreground/60">-</span>
                            <input
                              type="number"
                              value={range.end}
                              onChange={(e) => updateRange(range.id, 'end', parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 bg-background border border-foreground/20 rounded text-sm text-center"
                              min="1"
                              max={file.pageCount}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Split Button */}
              {splitMode === 'parts' && (
                <div className="flex justify-center pt-6 border-t border-foreground/10">
                  <button
                    onClick={splitPDF}
                    disabled={splitRanges.length === 0 || isProcessing}
                    className="px-8 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                  >
                    {isProcessing ? 'Splitting PDF...' : `Split into ${splitRanges.length} Files`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}