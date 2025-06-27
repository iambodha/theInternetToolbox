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
            <div className="text-6xl animate-pulse">🎬</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Processing Video</h3>
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
                  className="bg-blue-500 h-full rounded-full transition-all duration-100"
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

export default function VideoSpeedController() {
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideo, setProcessedVideo] = useState<{ name: string; url: string; size: number } | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{ duration: number; width: number; height: number } | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const speedPresets = [
    { value: 0.25, label: '0.25x (Ultra Slow)', description: '4x slower' },
    { value: 0.5, label: '0.5x (Slow Motion)', description: '2x slower' },
    { value: 0.75, label: '0.75x (Slightly Slow)', description: '1.33x slower' },
    { value: 1.0, label: '1x (Normal Speed)', description: 'Original speed' },
    { value: 1.25, label: '1.25x (Slightly Fast)', description: '1.25x faster' },
    { value: 1.5, label: '1.5x (Fast)', description: '1.5x faster' },
    { value: 2.0, label: '2x (Time-lapse)', description: '2x faster' },
    { value: 4.0, label: '4x (Ultra Fast)', description: '4x faster' },
  ];

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setProcessedVideo(null);
      
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

  const processVideoSpeed = async () => {
    if (!file || !videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setLoadingStep('Initializing video processing...');
    setLoadingProgress(5);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || !videoMetadata) {
        throw new Error('Canvas context or metadata not available');
      }

      setLoadingStep('Setting up canvas and video parameters...');
      setLoadingProgress(10);

      // Set canvas dimensions
      canvas.width = videoMetadata.width;
      canvas.height = videoMetadata.height;

      // Calculate new duration based on speed
      const newDuration = videoMetadata.duration / speed;
      const fps = 30; // Target FPS
      const totalFramesToProcess = Math.floor(newDuration * fps);
      setTotalFrames(totalFramesToProcess);
      
      setLoadingStep('Configuring video encoder...');
      setLoadingProgress(15);

      // Setup MediaRecorder
      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setLoadingStep('Finalizing video file...');
        setLoadingProgress(95);
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const speedSuffix = speed < 1 ? `_slow_${speed}x` : speed > 1 ? `_fast_${speed}x` : '_normal';
        const name = file.name.replace(/\.[^/.]+$/, `${speedSuffix}.webm`);
        
        setProcessedVideo({ name, url, size: blob.size });
        setLoadingProgress(100);
        setLoadingStep('Video processing complete!');
        
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

      setLoadingStep(`Processing frames at ${speed}x speed...`);

      const processFrame = () => {
        if (frameCount >= totalFramesToProcess) {
          setLoadingStep('Finishing video encoding...');
          setLoadingProgress(90);
          mediaRecorder.stop();
          return;
        }

        // Calculate source time based on speed
        const sourceTime = currentTime * speed;
        
        if (sourceTime <= videoMetadata.duration) {
          video.currentTime = sourceTime;
          
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frameCount++;
            setProcessedFrames(frameCount);
            currentTime += 1 / fps;
            
            // Update progress based on frame processing
            const frameProgress = (frameCount / totalFramesToProcess) * 70; // 70% for frame processing
            setLoadingProgress(20 + frameProgress);
            
            // Continue with next frame
            setTimeout(processFrame, 16); // ~60fps processing
          };
        } else {
          mediaRecorder.stop();
        }
      };

      setLoadingStep('Processing video frames...');

      // Start processing
      video.currentTime = 0;
      video.onseeked = () => {
        processFrame();
      };

    } catch (error) {
      console.error('Speed adjustment failed:', error);
      alert('Speed adjustment failed. Please try with a different video file.');
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
            <div className="text-4xl">⏱️</div>
            <div>
              <p className="text-lg font-medium">Click to select a video</p>
              <p className="text-sm text-foreground/60">
                Supports MP4, WEBM, MOV, AVI and other video formats
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Hidden video element for processing */}
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
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">🎬</span>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-foreground/60">
                  {videoMetadata.width}x{videoMetadata.height} • {formatDuration(videoMetadata.duration)} • {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          </div>

          {/* Speed Control */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Speed Control</h3>
            
            {/* Speed Presets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {speedPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setSpeed(preset.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    speed === preset.value
                      ? 'border-foreground bg-foreground/5'
                      : 'border-foreground/20 hover:border-foreground/30'
                  }`}
                >
                  <div className="font-medium text-sm">{preset.label}</div>
                  <div className="text-xs text-foreground/60">{preset.description}</div>
                </button>
              ))}
            </div>

            {/* Custom Speed */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Custom Speed: {speed}x</label>
              <input
                type="range"
                min="0.1"
                max="8"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground/60">
                <span>0.1x (10x slower)</span>
                <span>1x (normal)</span>
                <span>8x (8x faster)</span>
              </div>
            </div>

            {/* Duration Preview */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">Original Duration:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">{formatDuration(videoMetadata.duration)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-blue-700 dark:text-blue-300">New Duration:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">{formatDuration(videoMetadata.duration / speed)}</span>
              </div>
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={processVideoSpeed}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing Video...' : `Apply ${speed}x Speed`}
          </button>
        </>
      )}

      {/* Processed Video */}
      {processedVideo && (
        <div className="space-y-4">
          <h3 className="font-medium">Processed Video</h3>
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{processedVideo.name}</p>
                <p className="text-xs text-foreground/60">{formatFileSize(processedVideo.size)}</p>
              </div>
              <button
                onClick={() => downloadFile(processedVideo.url, processedVideo.name)}
                className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-purple-600 dark:text-purple-400 text-xl">⏱️</div>
          <div>
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Video Speed Control</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Create stunning slow-motion effects or time-lapse videos. Supports speeds from 0.1x to 8x for maximum creative control.
            </p>
          </div>
        </div>
      </div>

      {/* Processing Loading Screen */}
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