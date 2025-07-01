'use client';

import { useState, useRef, useCallback } from 'react';
import VideoPreview from '../VideoPreview';

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
      video.muted = true; // Mute to prevent audio during metadata loading
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
    // Prioritize MP4 for better QuickTime compatibility on macOS
    const supportedTypes = [
      'video/mp4;codecs=h264,aac', // Best for QuickTime
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // H.264 baseline + AAC
      'video/mp4;codecs=h264', // H.264 only
      'video/mp4', // Generic MP4
      preferredType, // User's original format
      'video/webm;codecs=vp9,opus', // VP9 + Opus
      'video/webm;codecs=vp8,vorbis', // VP8 + Vorbis
      'video/webm;codecs=vp9', // VP9 only
      'video/webm;codecs=vp8', // VP8 only
      'video/webm' // Generic WebM fallback
    ];
    
    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Using MIME type: ${type}`);
        return type;
      }
    }
    return 'video/webm'; // Final fallback
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

      setLoadingStep('Setting up video and audio processing...');
      setLoadingProgress(15);

      // Create canvas for video processing
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = videoMetadata.width;
      canvas.height = videoMetadata.height;

      // Create video element for frame processing
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);
      videoElement.crossOrigin = 'anonymous';
      
      // Create separate audio video element for audio capture
      const audioVideoElement = document.createElement('video');
      audioVideoElement.src = URL.createObjectURL(file);
      audioVideoElement.crossOrigin = 'anonymous';
      audioVideoElement.muted = false;
      audioVideoElement.volume = 1; // Keep full volume for audio capture
      
      // Wait for both videos to load
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          videoElement.onloadedmetadata = () => resolve();
          videoElement.onerror = () => reject(new Error('Failed to load video for frame processing'));
        }),
        new Promise<void>((resolve, reject) => {
          audioVideoElement.onloadedmetadata = () => resolve();
          audioVideoElement.onerror = () => reject(new Error('Failed to load video for audio processing'));
        })
      ]);

      setLoadingStep('Setting up audio context and MediaRecorder...');
      setLoadingProgress(20);

      // Set up audio context for audio capture
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const audioSource = audioContext.createMediaElementSource(audioVideoElement);
      const audioDestination = audioContext.createMediaStreamDestination();
      audioSource.connect(audioDestination);

      // Set up video stream from canvas
      const fps = 30;
      const videoStream = canvas.captureStream(fps);
      
      // Combine video and audio streams
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);

      // Determine the best supported format
      const supportedMimeType = getSupportedMimeType(preferredMimeType);
      
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: supportedMimeType,
          videoBitsPerSecond: 5000000,
          audioBitsPerSecond: 128000
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

      mediaRecorder.onstop = async () => {
        setLoadingStep('Finalizing trimmed video with audio...');
        setLoadingProgress(95);
        
        // Clean up audio context
        audioContext.close();
        
        const recordedBlob = new Blob(chunks, { type: supportedMimeType });
        
        // If we recorded in WebM but want original format, convert it
        if (supportedMimeType.includes('webm') && originalExtension !== 'webm') {
          setLoadingStep('Converting to original format...');
          setLoadingProgress(97);
          
          try {
            const convertedBlob = await convertWebMToFormat(recordedBlob, originalExtension);
            const url = URL.createObjectURL(convertedBlob);
            const startTimeStr = formatTimestamp(startTime);
            const endTimeStr = formatTimestamp(endTime);
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const name = `${baseName}_trimmed_${startTimeStr}-${endTimeStr}.${originalExtension}`;
            
            setTrimmedVideo({ name, url, size: convertedBlob.size });
            setLoadingStep(`Video trimming complete! Duration: ${formatDuration(trimDuration)} (${originalExtension.toUpperCase()})`);
          } catch (conversionError) {
            console.warn('Format conversion failed, keeping WebM:', conversionError);
            // Fall back to WebM if conversion fails
            const url = URL.createObjectURL(recordedBlob);
            const startTimeStr = formatTimestamp(startTime);
            const endTimeStr = formatTimestamp(endTime);
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const name = `${baseName}_trimmed_${startTimeStr}-${endTimeStr}.webm`;
            
            setTrimmedVideo({ name, url, size: recordedBlob.size });
            setLoadingStep(`Video trimming complete! Duration: ${formatDuration(trimDuration)} (WebM - conversion failed)`);
          }
        } else {
          // Use the recorded format as-is
          let outputExtension = originalExtension;
          let blobMimeType = supportedMimeType;
          
          if (supportedMimeType.includes('mp4')) {
            outputExtension = 'mp4';
            blobMimeType = 'video/mp4';
          } else if (supportedMimeType.includes('webm')) {
            outputExtension = 'webm';
            blobMimeType = 'video/webm';
          }
          
          const finalBlob = new Blob(chunks, { type: blobMimeType });
          const url = URL.createObjectURL(finalBlob);
          const startTimeStr = formatTimestamp(startTime);
          const endTimeStr = formatTimestamp(endTime);
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const name = `${baseName}_trimmed_${startTimeStr}-${endTimeStr}.${outputExtension}`;
          
          setTrimmedVideo({ name, url, size: finalBlob.size });
          setLoadingStep(`Video trimming complete! Duration: ${formatDuration(trimDuration)} (${outputExtension.toUpperCase()})`);
        }
        
        setLoadingProgress(100);
        
        setTimeout(() => {
          setIsProcessing(false);
          setLoadingStep('');
          setLoadingProgress(0);
          setProcessedFrames(0);
          setTotalFrames(0);
        }, 1000);
      };

      setLoadingStep(`Starting trimming process...`);
      setLoadingProgress(25);

      // Calculate total frames for progress tracking
      const totalFramesToProcess = Math.ceil(trimDuration * fps);
      setTotalFrames(totalFramesToProcess);

      // Start recording
      mediaRecorder.start();

      // Set both videos to start time
      videoElement.currentTime = startTime;
      audioVideoElement.currentTime = startTime;
      
      // Wait for both to seek
      await Promise.all([
        new Promise<void>((resolve) => {
          videoElement.onseeked = () => resolve();
        }),
        new Promise<void>((resolve) => {
          audioVideoElement.onseeked = () => resolve();
        })
      ]);

      setLoadingStep('Processing trimmed segment with audio...');
      setLoadingProgress(30);

      // Start audio playback (this drives the audio stream)
      await audioVideoElement.play();

      // Process video frames manually to maintain sync
      let frameCount = 0;
      let currentFrameTime = startTime;

      const processFrame = () => {
        if (currentFrameTime >= endTime || frameCount >= totalFramesToProcess) {
          setLoadingStep('Finishing video encoding...');
          setLoadingProgress(90);
          mediaRecorder.stop();
          audioVideoElement.pause();
          return;
        }

        // Update video element time and draw frame
        videoElement.currentTime = currentFrameTime;
        
        videoElement.onseeked = () => {
          // Draw current frame to canvas
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          frameCount++;
          setProcessedFrames(frameCount);
          
          // Update progress
          const timeProgress = ((currentFrameTime - startTime) / trimDuration) * 60; // 60% for processing
          setLoadingProgress(30 + timeProgress);
          
          // Move to next frame
          currentFrameTime += 1 / fps;
          
          // Continue processing
          setTimeout(processFrame, 1000 / fps);
        };
      };

      // Start frame processing
      processFrame();

      // Safety timeout to stop recording
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          audioVideoElement.pause();
        }
      }, (trimDuration + 3) * 1000); // Add 3 seconds buffer

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
      <div className="border-2 border-dashed border-foreground/20 hover:border-foreground/30 rounded-lg p-8 text-center cursor-pointer transition-colors">
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
              <p className="text-lg font-medium mb-2">Drag & drop a video here</p>
              <p className="text-sm text-foreground/60">
                or click to select a file • Supports all video formats
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
                <div className="text-sm font-medium">Video Timeline</div>
                <div className="relative h-2 bg-foreground/10 rounded-full">
                  <div
                    className="absolute h-full bg-blue-500 rounded-full"
                    style={{
                      left: `${(startTime / videoMetadata.duration) * 100}%`,
                      width: `${((endTime - startTime) / videoMetadata.duration) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-foreground/60">
                  <span>0:00</span>
                  <span>{formatDuration(videoMetadata.duration)}</span>
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
            </div>

            {/* Trim Duration */}
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Trim Duration:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{formatDuration(trimDuration)}</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="p-3 bg-foreground/5 border border-foreground/10 rounded-lg">
              <div className="text-sm font-medium mb-2">Quick Actions:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setStartTime(0);
                    setEndTime(Math.min(30, videoMetadata.duration));
                  }}
                  className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded text-xs transition-colors"
                >
                  First 30s
                </button>
                <button
                  onClick={() => {
                    const mid = videoMetadata.duration / 2;
                    setStartTime(Math.max(0, mid - 15));
                    setEndTime(Math.min(videoMetadata.duration, mid + 15));
                  }}
                  className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded text-xs transition-colors"
                >
                  Middle 30s
                </button>
                <button
                  onClick={() => {
                    setStartTime(Math.max(0, videoMetadata.duration - 30));
                    setEndTime(videoMetadata.duration);
                  }}
                  className="px-3 py-1 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded text-xs transition-colors"
                >
                  Last 30s
                </button>
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
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Trimmed Video</h3>
            <button
              onClick={() => downloadFile(trimmedVideo.url, trimmedVideo.name)}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
            >
              Download
            </button>
          </div>
          <VideoPreview
            file={trimmedVideo}
            onDownload={downloadFile}
            title={`Trimmed Video: ${trimmedVideo.name}`}
            subtitle={`Trimmed from ${formatTimestamp(startTime)} to ${formatTimestamp(endTime)} (${formatTimestamp(trimDuration)} duration)`}
          />
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
  
  // Helper function to convert WebM to other formats using a video element and canvas
  const convertWebMToFormat = async (webmBlob: Blob, targetFormat: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available for conversion'));
        return;
      }

      video.muted = true;
      video.src = URL.createObjectURL(webmBlob);
      
      video.onloadedmetadata = async () => {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Try to use a format closer to the target
          let targetMimeType = 'video/mp4';
          if (targetFormat === 'mov') targetMimeType = 'video/mp4'; // MOV uses similar encoding
          if (targetFormat === 'avi') targetMimeType = 'video/mp4'; // Convert AVI to MP4
          
          // Check if target format is supported for recording
          const formatSupported = MediaRecorder.isTypeSupported(targetMimeType);
          if (!formatSupported) {
            // If target format not supported, try MP4 as universal fallback
            targetMimeType = 'video/mp4';
            if (!MediaRecorder.isTypeSupported(targetMimeType)) {
              reject(new Error('No suitable target format supported'));
              return;
            }
          }

          const outputStream = canvas.captureStream(30);
          const recorder = new MediaRecorder(outputStream, {
            mimeType: targetMimeType,
            videoBitsPerSecond: 5000000
          });

          const outputChunks: BlobPart[] = [];
          
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              outputChunks.push(event.data);
            }
          };

          recorder.onstop = () => {
            const convertedBlob = new Blob(outputChunks, { type: targetMimeType });
            URL.revokeObjectURL(video.src);
            resolve(convertedBlob);
          };

          recorder.start();
          video.play();

          // Process frames
          const processFrames = () => {
            if (video.ended || video.paused) {
              recorder.stop();
              return;
            }
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(processFrames);
          };

          video.onended = () => {
            recorder.stop();
          };

          requestAnimationFrame(processFrames);

        } catch (error) {
          URL.revokeObjectURL(video.src);
          reject(error);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load WebM video for conversion'));
      };
    });
  };
}
