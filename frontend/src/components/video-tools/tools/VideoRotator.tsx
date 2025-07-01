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
      video.muted = true; // Mute to prevent audio during metadata loading
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
      // Get original format information
      const originalExtension = getOriginalExtension(file.name);
      const preferredMimeType = getOriginalMimeType(originalExtension);
      
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

      // Determine the best supported format
      const supportedMimeType = getSupportedMimeType(preferredMimeType);

      // Create a separate video element for audio capture (NOT muted to preserve audio)
      const audioVideo = document.createElement('video');
      audioVideo.src = URL.createObjectURL(file);
      audioVideo.muted = false; // Keep audio for processing
      audioVideo.volume = 0; // Silent for user but audio data preserved
      
      // Set up audio context to capture original audio
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const audioSource = audioContext.createMediaElementSource(audioVideo);
      const audioDestination = audioContext.createMediaStreamDestination();
      audioSource.connect(audioDestination);
      // Don't connect to speakers to keep processing silent

      // Setup MediaRecorder with both video and audio streams
      const videoStream = canvas.captureStream(fps);
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);
      
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: supportedMimeType,
          videoBitsPerSecond: 2500000,
          audioBitsPerSecond: 128000 // Include audio bitrate
        });
      } catch {
        mediaRecorder = new MediaRecorder(combinedStream, {
          videoBitsPerSecond: 2500000
        });
      }

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setLoadingStep('Finalizing rotated video...');
        setLoadingProgress(95);
        
        // Clean up audio context
        audioContext.close();
        
        const recordedBlob = new Blob(chunks, { type: supportedMimeType });
        
        // If we recorded in WebM but want original format, convert it
        if (supportedMimeType.includes('webm') && originalExtension !== 'webm') {
          try {
            const convertedBlob = await convertWebMToFormat(recordedBlob, originalExtension);
            const url = URL.createObjectURL(convertedBlob);
            const rotationSuffix = rotation === 0 ? '' : `_rotated_${rotation}deg`;
            const name = file.name.replace(/\.[^/.]+$/, `${rotationSuffix}.${originalExtension}`);
            
            setRotatedVideo({ name, url, size: convertedBlob.size });
          } catch (conversionError) {
            console.warn('Format conversion failed, keeping WebM:', conversionError);
            // Fall back to WebM if conversion fails
            const url = URL.createObjectURL(recordedBlob);
            const rotationSuffix = rotation === 0 ? '' : `_rotated_${rotation}deg`;
            const name = file.name.replace(/\.[^/.]+$/, `${rotationSuffix}.webm`);
            
            setRotatedVideo({ name, url, size: recordedBlob.size });
          }
        } else {
          // Use the recorded format as-is
          let outputExtension = originalExtension;
          if (supportedMimeType.includes('mp4')) {
            outputExtension = 'mp4';
          } else if (supportedMimeType.includes('webm')) {
            outputExtension = 'webm';
          }
          
          const url = URL.createObjectURL(recordedBlob);
          const rotationSuffix = rotation === 0 ? '' : `_rotated_${rotation}deg`;
          const name = file.name.replace(/\.[^/.]+$/, `${rotationSuffix}.${outputExtension}`);
          
          setRotatedVideo({ name, url, size: recordedBlob.size });
        }
        
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
      
      // Start audio video for audio capture
      audioVideo.currentTime = 0;
      audioVideo.play();

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

  // Helper function to convert WebM to other formats
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
                or click to select a file • Rotate videos in 90° increments
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
            muted={true}
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

          {/* Rotation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rotation Settings</h3>

            {/* Rotation Options */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Rotation</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {rotationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRotation(option.value as 0 | 90 | 180 | 270)}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      rotation === option.value
                        ? 'border-foreground bg-foreground/5'
                        : 'border-foreground/20 hover:border-foreground/30'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium text-sm mb-1">{option.label}</div>
                    <div className="text-xs text-foreground/60">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {rotation !== 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm font-medium mb-2">Rotation Preview</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Current:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                      {videoMetadata.width}x{videoMetadata.height}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">After {rotation}° rotation:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                      {rotation === 90 || rotation === 270 
                        ? `${videoMetadata.height}x${videoMetadata.width}`
                        : `${videoMetadata.width}x${videoMetadata.height}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rotate Button */}
          <button
            onClick={rotateVideo}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Rotating Video...' : `Rotate Video ${rotation}°`}
          </button>
        </>
      )}

      {/* Rotated Video */}
      {rotatedVideo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Rotated Video</h3>
            <button
              onClick={() => downloadFile(rotatedVideo.url, rotatedVideo.name)}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
            >
              Download
            </button>
          </div>
          <VideoPreview
            file={rotatedVideo}
            onDownload={downloadFile}
            title={`Rotated Video: ${rotatedVideo.name}`}
            subtitle={`Video rotated ${rotation}°`}
          />
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-indigo-600 dark:text-indigo-400 text-xl">🔄</div>
          <div>
            <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-1">Video Rotation</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Rotate videos in 90-degree increments to fix orientation issues. Perfect for mobile videos that were recorded in the wrong orientation.
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