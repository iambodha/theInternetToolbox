'use client';

import { useState, useRef, useCallback } from 'react';

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
            <div className="text-6xl animate-pulse">✂️</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Trimming Video</h3>
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
                  className="bg-orange-500 h-full rounded-full transition-all duration-100"
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

export default function VideoTrimmer() {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [trimmedVideo, setTrimmedVideo] = useState<{ name: string; url: string; size: number } | null>(null);
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
      setTrimmedVideo(null);
      
      // Get video metadata
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const duration = video.duration;
        setVideoMetadata({
          duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
        setStartTime(0);
        setEndTime(duration);
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  }, []);

  // Helper function to get original file extension
  const getOriginalExtension = (filename: string) => {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : 'mp4';
  };

  // Helper function to get MIME type for the original format
  const getOriginalMimeType = (extension: string) => {
    const mimeTypes: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'flv': 'video/x-flv',
      '3gp': 'video/3gpp',
      'wmv': 'video/x-ms-wmv'
    };
    return mimeTypes[extension] || 'video/mp4';
  };

  // Helper function to check MediaRecorder support for format
  const getSupportedMimeType = (preferredType: string) => {
    const supportedTypes = [
      preferredType,
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264',
      'video/mp4'
    ];
    
    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm'; // fallback
  };

  const trimVideo = async () => {
    if (!file || !videoRef.current || !videoMetadata) return;

    setIsProcessing(true);
    setLoadingStep('Initializing video trimming...');
    setLoadingProgress(5);
    
    try {
      // Get original format information
      const originalExtension = getOriginalExtension(file.name);
      const preferredMimeType = getOriginalMimeType(originalExtension);
      
      setLoadingStep(`Preparing to trim ${originalExtension.toUpperCase()} video...`);
      setLoadingProgress(10);

      // Validate trim duration
      const trimDuration = endTime - startTime;
      if (trimDuration <= 0) {
        throw new Error('Invalid trim duration');
      }

      setLoadingStep('Creating video and audio streams...');
      setLoadingProgress(15);

      // Create a new video element for the trimmed portion
      const trimmedVideoElement = document.createElement('video');
      trimmedVideoElement.src = URL.createObjectURL(file);
      trimmedVideoElement.muted = false; // Ensure audio is captured
      
      await new Promise<void>((resolve, reject) => {
        trimmedVideoElement.onloadedmetadata = () => resolve();
        trimmedVideoElement.onerror = () => reject(new Error('Failed to load video for trimming'));
      });

      setLoadingStep('Setting up MediaRecorder with audio...');
      setLoadingProgress(20);

      // Create canvas for video processing
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = videoMetadata.width;
      canvas.height = videoMetadata.height;

      // Set up MediaRecorder with both video and audio
      const videoStream = canvas.captureStream(30);
      
      // Create audio context to capture audio from the video
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(trimmedVideoElement);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination); // Also connect to speakers for monitoring

      // Combine video and audio streams
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      // Determine the best supported format
      const supportedMimeType = getSupportedMimeType(preferredMimeType);
      
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: supportedMimeType,
          videoBitsPerSecond: 5000000,
          audioBitsPerSecond: 128000 // Add audio bitrate
        });
      } catch {
        mediaRecorder = new MediaRecorder(combinedStream, {
          videoBitsPerSecond: 5000000
        });
      }

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setLoadingStep('Finalizing trimmed video with audio...');
        setLoadingProgress(95);
        
        // Clean up audio context
        audioContext.close();
        
        // Determine output format
        let outputExtension = originalExtension;
        let blobMimeType = supportedMimeType;
        
        if (!supportedMimeType.includes(originalExtension) && !supportedMimeType.includes('mp4')) {
          outputExtension = 'webm';
          blobMimeType = 'video/webm';
        }
        
        const blob = new Blob(chunks, { type: blobMimeType });
        const url = URL.createObjectURL(blob);
        const startTimeStr = formatTimestamp(startTime);
        const endTimeStr = formatTimestamp(endTime);
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const name = `${baseName}_trimmed_${startTimeStr}-${endTimeStr}.${outputExtension}`;
        
        setTrimmedVideo({ name, url, size: blob.size });
        setLoadingProgress(100);
        setLoadingStep(`Video trimming complete! Duration: ${formatDuration(trimDuration)}`);
        
        setTimeout(() => {
          setIsProcessing(false);
          setLoadingStep('');
          setLoadingProgress(0);
          setProcessedFrames(0);
          setTotalFrames(0);
        }, 1000);
      };

      setLoadingStep(`Trimming ${formatDuration(trimDuration)} from video...`);
      setLoadingProgress(25);

      // Start recording
      mediaRecorder.start();

      // Set video to start time and play
      trimmedVideoElement.currentTime = startTime;
      
      await new Promise<void>((resolve) => {
        trimmedVideoElement.onseeked = () => {
          resolve();
        };
      });

      // Start playing the video for the trimmed duration
      setLoadingStep('Processing trimmed segment...');
      setLoadingProgress(30);
      
      let frameCount = 0;
      const totalFramesToProcess = Math.ceil(trimDuration * 30); // 30 FPS estimate
      setTotalFrames(totalFramesToProcess);
      
      trimmedVideoElement.play();

      // Update canvas with video frames during playback
      const updateCanvas = () => {
        if (trimmedVideoElement.currentTime >= endTime) {
          // Stop recording when we reach the end time
          setLoadingStep('Finishing video encoding...');
          setLoadingProgress(90);
          mediaRecorder.stop();
          return;
        }

        if (!trimmedVideoElement.paused && !trimmedVideoElement.ended) {
          ctx.drawImage(trimmedVideoElement, 0, 0, canvas.width, canvas.height);
          frameCount++;
          setProcessedFrames(frameCount);
          
          // Update progress based on time elapsed
          const timeProgress = ((trimmedVideoElement.currentTime - startTime) / trimDuration) * 60; // 60% for processing
          setLoadingProgress(30 + timeProgress);
        }

        if (trimmedVideoElement.currentTime < endTime && !trimmedVideoElement.ended) {
          requestAnimationFrame(updateCanvas);
        } else {
          setLoadingStep('Finishing video encoding...');
          setLoadingProgress(90);
          mediaRecorder.stop();
        }
      };

      // Start the canvas update loop
      requestAnimationFrame(updateCanvas);

      // Safety timeout to stop recording
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, (trimDuration + 2) * 1000); // Add 2 seconds buffer

    } catch (error) {
      console.error('Video trimming failed:', error);
      alert(`Video trimming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
      setLoadingStep('');
      setLoadingProgress(0);
      setProcessedFrames(0);
      setTotalFrames(0);
    }
  };

  const downloadFile = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}m${secs.toString().padStart(2, '0')}s`;
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

  const trimDuration = endTime - startTime;

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
            <div className="text-4xl">✂️</div>
            <div>
              <p className="text-lg font-medium">Click to select a video</p>
              <p className="text-sm text-foreground/60">
                Cut and trim video segments to exact timestamps
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

          {/* Trim Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trim Settings</h3>

            {/* Video Timeline */}
            <div className="p-4 bg-foreground/5 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Original Duration: {formatDuration(videoMetadata.duration)}</span>
                  <span>Trimmed Duration: {formatDuration(trimDuration)}</span>
                </div>

                {/* Timeline visualization */}
                <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded">
                  <div
                    className="absolute h-full bg-blue-500 rounded"
                    style={{
                      left: `${(startTime / videoMetadata.duration) * 100}%`,
                      width: `${(trimDuration / videoMetadata.duration) * 100}%`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                    Selected: {formatDuration(startTime)} - {formatDuration(endTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Start Time: {formatDuration(startTime)}
              </label>
              <input
                type="range"
                min="0"
                max={videoMetadata.duration}
                step="0.1"
                value={startTime}
                onChange={(e) => {
                  const newStart = parseFloat(e.target.value);
                  setStartTime(newStart);
                  if (newStart >= endTime) {
                    setEndTime(Math.min(newStart + 1, videoMetadata.duration));
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground/60">
                <span>0:00</span>
                <span>{formatDuration(videoMetadata.duration)}</span>
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                End Time: {formatDuration(endTime)}
              </label>
              <input
                type="range"
                min="0"
                max={videoMetadata.duration}
                step="0.1"
                value={endTime}
                onChange={(e) => {
                  const newEnd = parseFloat(e.target.value);
                  setEndTime(newEnd);
                  if (newEnd <= startTime) {
                    setStartTime(Math.max(newEnd - 1, 0));
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground/60">
                <span>0:00</span>
                <span>{formatDuration(videoMetadata.duration)}</span>
              </div>
            </div>

            {/* Quick presets */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Quick Actions</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setStartTime(0);
                    setEndTime(Math.min(30, videoMetadata.duration));
                  }}
                  className="px-3 py-2 text-xs border border-foreground/20 rounded hover:bg-foreground/5 transition-colors"
                >
                  First 30s
                </button>
                <button
                  onClick={() => {
                    setStartTime(Math.max(0, videoMetadata.duration - 30));
                    setEndTime(videoMetadata.duration);
                  }}
                  className="px-3 py-2 text-xs border border-foreground/20 rounded hover:bg-foreground/5 transition-colors"
                >
                  Last 30s
                </button>
                <button
                  onClick={() => {
                    const quarter = videoMetadata.duration / 4;
                    setStartTime(quarter);
                    setEndTime(quarter * 3);
                  }}
                  className="px-3 py-2 text-xs border border-foreground/20 rounded hover:bg-foreground/5 transition-colors"
                >
                  Middle 50%
                </button>
                <button
                  onClick={() => {
                    setStartTime(0);
                    setEndTime(videoMetadata.duration);
                  }}
                  className="px-3 py-2 text-xs border border-foreground/20 rounded hover:bg-foreground/5 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Duration info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Original:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                    {formatDuration(videoMetadata.duration)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Trimmed:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                    {formatDuration(trimDuration)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trim Button */}
          <button
            onClick={trimVideo}
            disabled={isProcessing || trimDuration <= 0}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Trimming Video...' : `Trim Video (${formatDuration(trimDuration)})`}
          </button>
        </>
      )}

      {/* Trimmed Video */}
      {trimmedVideo && (
        <div className="space-y-4">
          <h3 className="font-medium">Trimmed Video</h3>
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{trimmedVideo.name}</p>
                <p className="text-xs text-foreground/60">{formatFileSize(trimmedVideo.size)}</p>
              </div>
              <button
                onClick={() => downloadFile(trimmedVideo.url, trimmedVideo.name)}
                className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-orange-600 dark:text-orange-400 text-xl">✂️</div>
          <div>
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Video Trimming</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Cut specific segments from videos with precise timestamp control. Perfect for creating clips, removing unwanted sections, or extracting highlights.
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
