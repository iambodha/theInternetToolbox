'use client';

import { useState, useRef, useCallback } from 'react';

export default function VideoWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(70);
  const [watermarkSize, setWatermarkSize] = useState<number>(24);
  const [watermarkColor, setWatermarkColor] = useState<string>('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedVideo, setWatermarkedVideo] = useState<{ name: string; url: string; size: number } | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{ duration: number; width: number; height: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const positionOptions = [
    { value: 'top-left', label: 'Top Left', icon: '↖️' },
    { value: 'top-right', label: 'Top Right', icon: '↗️' },
    { value: 'center', label: 'Center', icon: '⏺️' },
    { value: 'bottom-left', label: 'Bottom Left', icon: '↙️' },
    { value: 'bottom-right', label: 'Bottom Right', icon: '↘️' },
  ];

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setWatermarkedVideo(null);
      
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

  const getWatermarkPosition = (canvasWidth: number, canvasHeight: number, textWidth: number) => {
    const padding = 20;
    const textHeight = watermarkSize;

    switch (watermarkPosition) {
      case 'top-left':
        return { x: padding, y: padding + textHeight };
      case 'top-right':
        return { x: canvasWidth - textWidth - padding, y: padding + textHeight };
      case 'center':
        return { x: (canvasWidth - textWidth) / 2, y: (canvasHeight + textHeight) / 2 };
      case 'bottom-left':
        return { x: padding, y: canvasHeight - padding };
      case 'bottom-right':
        return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding };
      default:
        return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding };
    }
  };

  const addWatermark = async () => {
    if (!file || !videoRef.current || !canvasRef.current || !videoMetadata || !watermarkText.trim()) return;

    setIsProcessing(true);
    
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

      // Set canvas dimensions
      canvas.width = videoMetadata.width;
      canvas.height = videoMetadata.height;

      const fps = 30;
      
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
        // Clean up audio context
        audioContext.close();
        
        const recordedBlob = new Blob(chunks, { type: supportedMimeType });
        
        // If we recorded in WebM but want original format, convert it
        if (supportedMimeType.includes('webm') && originalExtension !== 'webm') {
          try {
            const convertedBlob = await convertWebMToFormat(recordedBlob, originalExtension);
            const url = URL.createObjectURL(convertedBlob);
            const name = file.name.replace(/\.[^/.]+$/, `_watermarked.${originalExtension}`);
            
            setWatermarkedVideo({ name, url, size: convertedBlob.size });
          } catch (conversionError) {
            console.warn('Format conversion failed, keeping WebM:', conversionError);
            // Fall back to WebM if conversion fails
            const url = URL.createObjectURL(recordedBlob);
            const name = file.name.replace(/\.[^/.]+$/, '_watermarked.webm');
            
            setWatermarkedVideo({ name, url, size: recordedBlob.size });
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
          const name = file.name.replace(/\.[^/.]+$/, `_watermarked.${outputExtension}`);
          
          setWatermarkedVideo({ name, url, size: recordedBlob.size });
        }
        
        setIsProcessing(false);
      };

      // Start recording
      mediaRecorder.start();
      
      // Start both videos simultaneously for proper audio/video sync
      const startTime = Date.now();
      
      // Start audio video
      audioVideo.currentTime = 0;
      await audioVideo.play();

      // Process video frames
      let currentTime = 0;
      const totalFrames = Math.floor(videoMetadata.duration * fps);
      let frameCount = 0;

      const processFrame = () => {
        if (frameCount >= totalFrames || currentTime >= videoMetadata.duration) {
          mediaRecorder.stop();
          return;
        }

        // Sync both video elements to the same time
        const targetTime = currentTime;
        video.currentTime = targetTime;
        audioVideo.currentTime = targetTime;
        
        video.onseeked = () => {
          // Draw video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Add watermark
          ctx.save();
          
          // Set font and measure text
          ctx.font = `${watermarkSize}px Arial`;
          ctx.fillStyle = watermarkColor;
          ctx.globalAlpha = watermarkOpacity / 100;
          
          const textMetrics = ctx.measureText(watermarkText);
          const textWidth = textMetrics.width;
          const position = getWatermarkPosition(canvas.width, canvas.height, textWidth);
          
          // Add text shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.shadowBlur = 4;
          
          ctx.fillText(watermarkText, position.x, position.y);
          
          ctx.restore();
          
          frameCount++;
          currentTime += 1 / fps;
          
          // Continue with next frame
          setTimeout(processFrame, 1000 / fps); // Maintain proper timing
        };
      };

      // Start processing
      video.currentTime = 0;
      video.onseeked = () => {
        processFrame();
      };

    } catch (error) {
      console.error('Watermark addition failed:', error);
      alert('Watermark addition failed. Please try with a different video file.');
      setIsProcessing(false);
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
            <div className="text-4xl">💧</div>
            <div>
              <p className="text-lg font-medium mb-2">Drag & drop a video here</p>
              <p className="text-sm text-foreground/60">
                or click to select a file • Add text watermarks to protect your videos
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

          {/* Watermark Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Watermark Settings</h3>

            {/* Watermark Text */}
            <div>
              <label className="block text-sm font-medium mb-2">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter your watermark text..."
                className="w-full p-3 border border-foreground/20 rounded-lg bg-background"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {positionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setWatermarkPosition(option.value as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      watermarkPosition === option.value
                        ? 'border-foreground bg-foreground/5'
                        : 'border-foreground/20 hover:border-foreground/30'
                    }`}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-xs">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Opacity: {watermarkOpacity}%</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Size: {watermarkSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={watermarkSize}
                  onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="w-12 h-10 border border-foreground/20 rounded"
                  />
                  <input
                    type="text"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="flex-1 p-2 border border-foreground/20 rounded bg-background text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {watermarkText.trim() && (
              <div className="p-4 bg-foreground/5 rounded-lg">
                <div className="text-sm font-medium mb-2">Preview</div>
                <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                    Video Content
                  </div>
                  <div 
                    className="absolute"
                    style={{
                      color: watermarkColor,
                      opacity: watermarkOpacity / 100,
                      fontSize: `${Math.max(12, watermarkSize * 0.5)}px`,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      ...(() => {
                        const padding = 8;
                        switch (watermarkPosition) {
                          case 'top-left':
                            return { top: padding, left: padding };
                          case 'top-right':
                            return { top: padding, right: padding };
                          case 'center':
                            return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
                          case 'bottom-left':
                            return { bottom: padding, left: padding };
                          case 'bottom-right':
                            return { bottom: padding, right: padding };
                          default:
                            return { bottom: padding, right: padding };
                        }
                      })()
                    }}
                  >
                    {watermarkText}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Watermark Button */}
          <button
            onClick={addWatermark}
            disabled={isProcessing || !watermarkText.trim()}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Adding Watermark...' : 'Add Watermark'}
          </button>
        </>
      )}

      {/* Watermarked Video */}
      {watermarkedVideo && (
        <div className="space-y-4">
          <h3 className="font-medium">Watermarked Video</h3>
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{watermarkedVideo.name}</p>
                <p className="text-xs text-foreground/60">{formatFileSize(watermarkedVideo.size)}</p>
              </div>
              <button
                onClick={() => downloadFile(watermarkedVideo.url, watermarkedVideo.name)}
                className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-cyan-600 dark:text-cyan-400 text-xl">💧</div>
          <div>
            <h4 className="font-medium text-cyan-900 dark:text-cyan-100 mb-1">Video Watermarking</h4>
            <p className="text-sm text-cyan-700 dark:text-cyan-300">
              Protect your videos with customizable text watermarks. Choose position, opacity, size, and color to match your branding needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}