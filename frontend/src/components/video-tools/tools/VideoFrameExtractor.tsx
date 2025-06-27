'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface VideoLoadingScreenProps {
  fileName: string;
  currentStep: string;
  progress?: number;
  duration?: number;
  processedFrames?: number;
  totalFrames?: number;
}

function VideoLoadingScreen({ fileName, currentStep, progress, duration, processedFrames, totalFrames }: VideoLoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-foreground/20 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Video Icon Animation */}
          <div className="relative">
            <div className="text-6xl animate-pulse">🖼️</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Extracting Frames</h3>
            <p className="text-sm text-foreground/70 truncate">{fileName}</p>
            {duration && (
              <p className="text-xs text-foreground/50">
                Duration: {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
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

          {/* Frame Progress */}
          {processedFrames !== undefined && totalFrames !== undefined && (
            <div className="space-y-1">
              <p className="text-xs text-foreground/60">
                Frame {processedFrames} of {totalFrames}
              </p>
              <div className="w-full bg-foreground/10 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all duration-100"
                  style={{ width: `${(processedFrames / totalFrames) * 100}%` }}
                />
              </div>
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

export default function VideoFrameExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [extractionType, setExtractionType] = useState<'single' | 'multiple' | 'thumbnail'>('single');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [frameCount, setFrameCount] = useState<number>(10);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpg'>('png');
  const [quality, setQuality] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<{ name: string; url: string; size: number; timestamp: number }[]>([]);
  const [videoMetadata, setVideoMetadata] = useState<{ duration: number; width: number; height: number } | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setExtractedFrames([]);
      
      // Get video metadata
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setVideoMetadata({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
        setCurrentTime(0);
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  }, []);

  const captureFrame = async (timestamp: number): Promise<{ name: string; url: string; size: number; timestamp: number }> => {
    if (!videoRef.current || !canvasRef.current || !file) {
      throw new Error('Video or canvas not available');
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    return new Promise((resolve, reject) => {
      video.currentTime = timestamp;
      
      video.onseeked = () => {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          const mimeType = imageFormat === 'jpg' ? 'image/jpeg' : 'image/png';
          const qualityValue = imageFormat === 'jpg' ? quality / 100 : undefined;

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const timeString = formatTimestamp(timestamp);
              const name = file.name.replace(/\.[^/.]+$/, `_frame_${timeString}.${imageFormat}`);
              resolve({ name, url, size: blob.size, timestamp });
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, mimeType, qualityValue);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => reject(new Error('Video seek failed'));
    });
  };

  const extractFrames = async () => {
    if (!file || !videoMetadata) return;

    setIsProcessing(true);
    setExtractedFrames([]);
    setLoadingStep('Initializing frame extraction...');
    setLoadingProgress(5);

    try {
      const frames: { name: string; url: string; size: number; timestamp: number }[] = [];
      let framesToExtract: number[] = [];

      // Determine which frames to extract
      if (extractionType === 'single') {
        framesToExtract = [1];
        setTotalFrames(1);
        setLoadingStep('Preparing to extract single frame...');
      } else if (extractionType === 'multiple') {
        framesToExtract = Array.from({ length: frameCount }, (_, i) => i + 1);
        setTotalFrames(frameCount);
        setLoadingStep(`Preparing to extract ${frameCount} frames...`);
      } else if (extractionType === 'thumbnail') {
        framesToExtract = [1, 2, 3, 4, 5];
        setTotalFrames(5);
        setLoadingStep('Preparing to extract thumbnail frames...');
      }

      setLoadingProgress(10);

      for (let i = 0; i < framesToExtract.length; i++) {
        const frameIndex = framesToExtract[i];
        let timestamp: number;

        if (extractionType === 'single') {
          timestamp = currentTime;
        } else if (extractionType === 'multiple') {
          const interval = videoMetadata.duration / frameCount;
          timestamp = (frameIndex - 1) * interval;
        } else if (extractionType === 'thumbnail') {
          // Extract thumbnails at key moments (beginning, 25%, 50%, 75%, end)
          const keyMoments = [0, 0.25, 0.5, 0.75, 1.0];
          timestamp = keyMoments[frameIndex - 1] * videoMetadata.duration;
        } else {
          timestamp = 0;
        }

        setLoadingStep(`Extracting frame ${i + 1} of ${framesToExtract.length}...`);
        setProcessedFrames(i + 1);
        
        const frame = await captureFrame(timestamp);
        frames.push(frame);
        
        // Update progress
        const frameProgress = ((i + 1) / framesToExtract.length) * 80; // 80% for frame extraction
        setLoadingProgress(10 + frameProgress);
      }

      setLoadingStep('Finalizing extracted frames...');
      setLoadingProgress(95);

      setExtractedFrames(frames);
      
      setLoadingStep('Frame extraction complete!');
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setLoadingStep('');
        setLoadingProgress(0);
        setProcessedFrames(0);
        setTotalFrames(0);
      }, 1000);

    } catch (error) {
      console.error('Frame extraction failed:', error);
      alert('Frame extraction failed. Please try with a different video file.');
      setIsProcessing(false);
      setLoadingStep('');
      setLoadingProgress(0);
      setProcessedFrames(0);
      setTotalFrames(0);
    }
  };

  const downloadFrame = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllFrames = () => {
    extractedFrames.forEach((frame, index) => {
      setTimeout(() => {
        downloadFrame(frame.url, frame.name);
      }, index * 100); // Stagger downloads
    });
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}m${secs.toString().padStart(2, '0')}s${ms.toString().padStart(3, '0')}ms`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border-2 border-dashed border-black/[.08] dark:border-white/[.145] rounded-lg p-8 text-center">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          id="video-upload"
        />
        <label htmlFor="video-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-4xl">🖼️</div>
            <div>
              <p className="text-lg font-medium">Click to select a video</p>
              <p className="text-sm text-foreground/60">
                Extract frames as PNG or JPEG images
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Hidden elements */}
      {file && (
        <>
          <video
            ref={videoRef}
            src={URL.createObjectURL(file)}
            className="hidden"
            preload="metadata"
          />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}

      {file && videoMetadata && (
        <>
          {/* Video Info */}
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🎬</span>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-foreground/60">
                  {videoMetadata.width}x{videoMetadata.height} • {formatDuration(videoMetadata.duration)} • {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          </div>

          {/* Extraction Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Frame Extraction Settings</h3>

            {/* Extraction Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Extraction Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setExtractionType('single')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    extractionType === 'single'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-foreground/20 hover:border-foreground/30'
                  }`}
                >
                  <div className="font-medium text-sm">Single Frame</div>
                  <div className="text-xs text-foreground/60">Extract one frame at specific time</div>
                </button>
                <button
                  onClick={() => setExtractionType('multiple')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    extractionType === 'multiple'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-foreground/20 hover:border-foreground/30'
                  }`}
                >
                  <div className="font-medium text-sm">Multiple Frames</div>
                  <div className="text-xs text-foreground/60">Extract frames at regular intervals</div>
                </button>
                <button
                  onClick={() => setExtractionType('thumbnail')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    extractionType === 'thumbnail'
                      ? 'border-foreground bg-foreground/5'
                      : 'border-foreground/20 hover:border-foreground/30'
                  }`}
                >
                  <div className="font-medium text-sm">Thumbnails</div>
                  <div className="text-xs text-foreground/60">5 key frames for preview</div>
                </button>
              </div>
            </div>

            {/* Single Frame Time Selection */}
            {extractionType === 'single' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Frame Time: {formatDuration(currentTime)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={videoMetadata.duration}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60">
                  <span>0:00</span>
                  <span>{formatDuration(videoMetadata.duration)}</span>
                </div>
              </div>
            )}

            {/* Multiple Frames Count */}
            {extractionType === 'multiple' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Number of Frames: {frameCount}
                </label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={frameCount}
                  onChange={(e) => setFrameCount(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60">
                  <span>2 frames</span>
                  <span>50 frames</span>
                </div>
              </div>
            )}

            {/* Output Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image Format</label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpg')}
                  className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                >
                  <option value="png">PNG (Lossless)</option>
                  <option value="jpg">JPEG (Smaller file size)</option>
                </select>
              </div>

              {imageFormat === 'jpg' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Quality: {quality}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Extract Button */}
          <button
            onClick={extractFrames}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Extracting Frames...' : 'Extract Frames'}
          </button>
        </>
      )}

      {/* Extracted Frames */}
      {extractedFrames.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Extracted Frames ({extractedFrames.length})</h3>
            <button
              onClick={downloadAllFrames}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
            >
              Download All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {extractedFrames.map((frame, index) => (
              <div key={index} className="bg-foreground/5 rounded-lg p-3">
                <div className="aspect-video bg-background rounded mb-2 overflow-hidden">
                  <Image
                    src={frame.url}
                    alt={`Frame at ${formatDuration(frame.timestamp)}`}
                    className="w-full h-full object-cover"
                    width={videoMetadata?.width || 1920}
                    height={videoMetadata?.height || 1080}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium truncate">{frame.name}</p>
                  <p className="text-xs text-foreground/60">
                    {formatDuration(frame.timestamp)} • {formatFileSize(frame.size)}
                  </p>
                  <button
                    onClick={() => downloadFrame(frame.url, frame.name)}
                    className="w-full px-2 py-1 bg-foreground text-background rounded text-xs hover:bg-foreground/90 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-green-600 dark:text-green-400 text-xl">🖼️</div>
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Frame Extraction</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Extract high-quality frames from videos for thumbnails, analysis, or creating image sequences. Supports both PNG and JPEG formats.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Screen */}
      {isProcessing && file && (
        <VideoLoadingScreen
          fileName={file.name}
          currentStep={loadingStep}
          progress={loadingProgress}
          duration={videoMetadata?.duration}
          processedFrames={processedFrames}
          totalFrames={totalFrames}
        />
      )}
    </div>
  );
}