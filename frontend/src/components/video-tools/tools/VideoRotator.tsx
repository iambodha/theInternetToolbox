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
            <div className="text-6xl animate-pulse">🔄</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Rotating Video</h3>
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
                  className="bg-indigo-500 h-full rounded-full transition-all duration-100"
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

export default function VideoRotator() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotatedVideo, setRotatedVideo] = useState<{ name: string; url: string; size: number } | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{ duration: number; width: number; height: number } | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rotationOptions = [
    { value: 0, label: 'No Rotation', description: 'Keep original orientation', icon: '⬜' },
    { value: 90, label: '90° Clockwise', description: 'Rotate right', icon: '↻' },
    { value: 180, label: '180°', description: 'Upside down', icon: '↑↓' },
    { value: 270, label: '270° Clockwise', description: 'Rotate left', icon: '↺' },
  ];

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setRotatedVideo(null);
      
      // Get video metadata
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setVideoMetadata({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  }, []);

  const rotateVideo = async () => {
    if (!file || !videoRef.current || !canvasRef.current || !videoMetadata) return;

    setIsProcessing(true);
    setLoadingStep('Initializing video rotation...');
    setLoadingProgress(5);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      setLoadingStep('Calculating new dimensions for rotation...');
      setLoadingProgress(10);

      // Calculate canvas dimensions based on rotation
      let canvasWidth, canvasHeight;
      if (rotation === 90 || rotation === 270) {
        canvasWidth = videoMetadata.height;
        canvasHeight = videoMetadata.width;
      } else {
        canvasWidth = videoMetadata.width;
        canvasHeight = videoMetadata.height;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const fps = 30;
      const totalFramesToProcess = Math.floor(videoMetadata.duration * fps);
      setTotalFrames(totalFramesToProcess);
      
      setLoadingStep('Setting up video encoder with rotation...');
      setLoadingProgress(15);

      // Setup MediaRecorder
      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 2500000
      });

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setLoadingStep('Finalizing rotated video...');
        setLoadingProgress(95);
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const rotationSuffix = rotation === 0 ? '' : `_rotated_${rotation}deg`;
        const name = file.name.replace(/\.[^/.]+$/, `${rotationSuffix}.webm`);
        
        setRotatedVideo({ name, url, size: blob.size });
        setLoadingProgress(100);
        setLoadingStep('Video rotation complete!');
        
        setTimeout(() => {
          setIsProcessing(false);
          setLoadingStep('');
          setLoadingProgress(0);
          setProcessedFrames(0);
          setTotalFrames(0);
        }, 1000);
      };

      setLoadingStep('Starting video recording...');
      setLoadingProgress(20);

      // Start recording
      mediaRecorder.start();

      // Process video frames
      let currentTime = 0;
      let frameCount = 0;

      setLoadingStep(`Applying ${rotation}° rotation to video frames...`);

      const processFrame = () => {
        if (frameCount >= totalFramesToProcess || currentTime >= videoMetadata.duration) {
          setLoadingStep('Finishing video encoding...');
          setLoadingProgress(90);
          mediaRecorder.stop();
          return;
        }

        video.currentTime = currentTime;
        
        video.onseeked = () => {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Set up rotation transformation
          ctx.save();
          
          switch (rotation) {
            case 90:
              ctx.translate(canvas.width, 0);
              ctx.rotate(Math.PI / 2);
              break;
            case 180:
              ctx.translate(canvas.width, canvas.height);
              ctx.rotate(Math.PI);
              break;
            case 270:
              ctx.translate(0, canvas.height);
              ctx.rotate(-Math.PI / 2);
              break;
            // 0 degrees - no transformation needed
          }
          
          // Draw the video frame
          ctx.drawImage(video, 0, 0, videoMetadata.width, videoMetadata.height);
          ctx.restore();
          
          frameCount++;
          setProcessedFrames(frameCount);
          currentTime += 1 / fps;
          
          // Update progress based on frame processing
          const frameProgress = (frameCount / totalFramesToProcess) * 70; // 70% for frame processing
          setLoadingProgress(20 + frameProgress);
          
          // Continue with next frame
          setTimeout(processFrame, 16);
        };
      };

      // Start processing
      video.currentTime = 0;
      video.onseeked = () => {
        processFrame();
      };

    } catch (error) {
      console.error('Video rotation failed:', error);
      alert('Video rotation failed. Please try with a different video file.');
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

  const getNewDimensions = () => {
    if (!videoMetadata) return null;
    if (rotation === 90 || rotation === 270) {
      return `${videoMetadata.height}x${videoMetadata.width}`;
    }
    return `${videoMetadata.width}x${videoMetadata.height}`;
  };

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
            <div className="text-4xl">🔄</div>
            <div>
              <p className="text-lg font-medium mb-2">Drag & drop a video here</p>
              <p className="text-sm text-foreground/60">
                or click to select a file • Rotate videos to correct orientation
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

          {/* Rotation Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rotation Settings</h3>

            {/* Rotation Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rotationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRotation(option.value as 0 | 90 | 180 | 270)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    rotation === option.value
                      ? 'border-foreground bg-foreground/5'
                      : 'border-foreground/20 hover:border-foreground/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-foreground/60">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Preview Info */}
            {rotation !== 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Original Dimensions:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {videoMetadata.width}x{videoMetadata.height}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 dark:text-blue-300">New Dimensions:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {getNewDimensions()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Rotation:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {rotation}° clockwise
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Preview */}
            <div className="p-4 bg-foreground/5 rounded-lg">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-xs text-foreground/60 mb-2">Original</div>
                  <div className="w-16 h-12 bg-blue-200 dark:bg-blue-800 rounded flex items-center justify-center">
                    <span className="text-xs font-mono">16:9</span>
                  </div>
                </div>
                <div className="text-foreground/40">→</div>
                <div className="text-center">
                  <div className="text-xs text-foreground/60 mb-2">After Rotation</div>
                  <div 
                    className={`bg-green-200 dark:bg-green-800 rounded flex items-center justify-center transition-transform ${
                      rotation === 90 || rotation === 270 ? 'w-12 h-16' : 'w-16 h-12'
                    }`}
                    style={{ 
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    <span className="text-xs font-mono">
                      {rotation === 90 || rotation === 270 ? '9:16' : '16:9'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rotate Button */}
          <button
            onClick={rotateVideo}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Rotating Video...' : rotation === 0 ? 'No Rotation Needed' : `Rotate ${rotation}°`}
          </button>
        </>
      )}

      {/* Rotated Video */}
      {rotatedVideo && (
        <div className="space-y-4">
          <h3 className="font-medium">Rotated Video</h3>
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{rotatedVideo.name}</p>
                <p className="text-xs text-foreground/60">{formatFileSize(rotatedVideo.size)}</p>
              </div>
              <button
                onClick={() => downloadFile(rotatedVideo.url, rotatedVideo.name)}
                className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-indigo-600 dark:text-indigo-400 text-xl">🔄</div>
          <div>
            <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">Video Rotation</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Fix video orientation by rotating 90°, 180°, or 270°. Perfect for correcting videos recorded in wrong orientation or creating artistic effects.
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