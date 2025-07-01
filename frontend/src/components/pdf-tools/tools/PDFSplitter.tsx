'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
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
            <div className="text-6xl animate-pulse">✂️</div>
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
          <Image
            src={preview}
            alt={`Page ${pageNumber}`}
            fill
            className="object-contain bg-gray-50"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
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

// Preview component for final result
interface ResultPreviewProps {
  splitRanges: SplitRange[];
  fileName: string;
  onDownload: (rangeId: number) => void;
}

function ResultPreview({ splitRanges, fileName, onDownload }: ResultPreviewProps) {
  return (
    <div className="border border-foreground/20 rounded-lg p-6 bg-foreground/5 mt-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-foreground/10">
        <div>
          <h4 className="font-medium text-foreground">Split Result Preview</h4>
          <p className="text-sm text-foreground/60 mt-1">
            {splitRanges.length} files will be created from {fileName}
          </p>
        </div>
        <div className="text-sm text-foreground/60">
          Total pages: {splitRanges.reduce((sum, range) => sum + (range.end - range.start + 1), 0)}
        </div>
      </div>

      <div className="space-y-3">
        {splitRanges.map((range, index) => (
          <div
            key={range.id}
            className="flex items-center justify-between p-3 bg-background rounded-lg border border-foreground/10 hover:bg-foreground/5 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-foreground/10 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {range.name}
                </p>
                <p className="text-xs text-foreground/60">
                  Pages {range.start}-{range.end} ({range.end - range.start + 1} page{range.end - range.start + 1 !== 1 ? 's' : ''})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-foreground/50">
                {fileName.replace('.pdf', '')}_pages_{range.start}-{range.end}.pdf
              </span>
              <button
                onClick={() => onDownload(range.id)}
                className="px-3 py-1 bg-foreground text-background rounded text-xs hover:bg-foreground/90 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-foreground/10 text-center">
        <p className="text-sm text-foreground/60">
          💡 Tip: You can drag and drop files after splitting to reorder them
        </p>
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
  const [numberOfParts, setNumberOfParts] = useState(2);
  const [splitMode, setSplitMode] = useState<'parts' | 'single'>('parts');
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [splitResults, setSplitResults] = useState<{[key: number]: Uint8Array}>({});

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

  const getPageRangeInfo = (pageNumber: number) => {
    for (let i = 0; i < splitRanges.length; i++) {
      const range = splitRanges[i];
      if (pageNumber >= range.start && pageNumber <= range.end) {
        return {
          inRange: true,
          isStart: pageNumber === range.start,
          isEnd: pageNumber === range.end,
          rangeColor: rangeColors[i % rangeColors.length],
        };
      }
    }
    return {
      inRange: false,
      isStart: false,
      isEnd: false,
      rangeColor: '#gray',
    };
  };

  const updateRange = (id: number, field: 'start' | 'end', value: number) => {
    setSplitRanges(prev => prev.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  const addRange = () => {
    const newId = Math.max(...splitRanges.map(r => r.id), 0) + 1;
    const lastRange = splitRanges[splitRanges.length - 1];
    const newStart = lastRange ? lastRange.end + 1 : 1;
    const maxEnd = file?.pageCount || 1;
    
    if (newStart <= maxEnd) {
      const newRange: SplitRange = {
        id: newId,
        start: newStart,
        end: Math.min(newStart + 9, maxEnd), // Default 10-page range
        name: `Part ${splitRanges.length + 1}`,
      };
      setSplitRanges(prev => [...prev, newRange]);
    }
  };

  const removeRange = (id: number) => {
    if (splitRanges.length > 1) {
      setSplitRanges(prev => prev.filter(range => range.id !== id));
    }
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
      
      // Store results for preview
      const results: {[key: number]: Uint8Array} = {};
      splitPDFs.forEach((pdfData, index) => {
        const range = validRanges[index];
        results[range.id] = pdfData;
      });
      setSplitResults(results);
      
      setLoadingStep('Split complete!');
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

  const downloadSplitFile = (rangeId: number) => {
    const range = splitRanges.find(r => r.id === rangeId);
    const pdfData = splitResults[rangeId];
    
    if (range && pdfData && file) {
      const filename = range.start === range.end 
        ? `${file.name.replace('.pdf', '')}_page_${range.start}.pdf`
        : `${file.name.replace('.pdf', '')}_pages_${range.start}-${range.end}.pdf`;
      PDFUtils.downloadFile(pdfData, filename);
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
          <div className="text-4xl">✂️</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Split PDF into multiple files
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
                    Individual Pages
                  </button>
                </div>

                {/* Parts Mode */}
                {splitMode === 'parts' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Split into:</label>
                        <input
                          type="number"
                          value={numberOfParts}
                          onChange={(e) => setNumberOfParts(Math.max(1, parseInt(e.target.value) || 1))}
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
                    <h4 className="text-md font-medium">Split Configuration</h4>
                    <button
                      onClick={addRange}
                      className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 rounded text-sm transition-colors"
                    >
                      Add Range
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {splitRanges.map((range, index) => {
                      const rangeColor = rangeColors[index % rangeColors.length];
                      return (
                        <div
                          key={range.id}
                          className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg border border-foreground/10"
                          style={{ borderLeftColor: rangeColor, borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-sm font-medium">{range.name}</div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span>Pages:</span>
                              <input
                                type="number"
                                value={range.start}
                                onChange={(e) => updateRange(range.id, 'start', parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 bg-background border border-foreground/20 rounded text-sm text-center"
                                min="1"
                                max={file.pageCount}
                              />
                              <span>to</span>
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
                          <button
                            onClick={() => removeRange(range.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            disabled={splitRanges.length === 1}
                          >
                            ✕
                          </button>
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

              {/* Result Preview */}
              {Object.keys(splitResults).length > 0 && (
                <ResultPreview
                  splitRanges={splitRanges}
                  fileName={file.name}
                  onDownload={downloadSplitFile}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}