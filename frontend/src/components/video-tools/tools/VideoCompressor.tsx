'use client';

import { useState, useRef, useCallback } from 'react';

export default function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetSize, setTargetSize] = useState<number>(50); // percentage of original
  const [quality, setQuality] = useState<number>(75);
  const [resolution, setResolution] = useState<string>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedVideo, setCompressedVideo] = useState<{ name: string; url: string; size: number; compressionRatio: number } | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{ duration: number; width: number; height: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const compressionPresets = [
    { 
      value: 'low', 
      label: 'Low Compression', 
      description: 'Better quality, larger file size',
      bitrate: 3000000,
      quality: 85
    },
    { 
      value: 'medium', 
      label: 'Medium Compression', 
      description: 'Balanced quality and size',
      bitrate: 1500000,
      quality: 75
    },
    { 
      value: 'high', 
      label: 'High Compression', 
      description: 'Smaller file size, lower quality',
      bitrate: 800000,
      quality: 60
    },
  ];

  const resolutionOptions = [
    { value: 'original', label: 'Keep Original', scale: 1 },
    { value: '720p', label: '720p (HD)', scale: 0.75 },
    { value: '480p', label: '480p (SD)', scale: 0.5 },
    { value: '360p', label: '360p (Low)', scale: 0.375 },
  ];

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setCompressedVideo(null);
      
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

  const getNewDimensions = () => {
    if (!videoMetadata) return { width: 0, height: 0 };
    
    const selectedResolution = resolutionOptions.find(r => r.value === resolution);
    const scale = selectedResolution?.scale || 1;
    
    return {
      width: Math.floor(videoMetadata.width * scale),
      height: Math.floor(videoMetadata.height * scale)
    };
  };

  const compressVideo = async () => {
    if (!file || !videoRef.current || !canvasRef.current || !videoMetadata) return;

    setIsProcessing(true);
    
    try {
      // Get original format information
      const originalExtension = getOriginalExtension(file.name);
      const preferredMimeType = getOriginalMimeType(originalExtension);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      const newDimensions = getNewDimensions();
      canvas.width = newDimensions.width;
      canvas.height = newDimensions.height;

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

      // Set up audio context for audio capture
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const audioSource = audioContext.createMediaElementSource(audioVideoElement);
      const audioDestination = audioContext.createMediaStreamDestination();
      audioSource.connect(audioDestination);

      const preset = compressionPresets.find(p => p.value === compressionLevel);
      const bitrate = preset?.bitrate || 1500000;
      const fps = 24; // Reduced FPS for compression
      
      // Determine the best supported format
      const supportedMimeType = getSupportedMimeType(preferredMimeType);
      
      // Setup MediaRecorder with compression settings and audio
      const videoStream = canvas.captureStream(fps);
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);
      
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: supportedMimeType,
          videoBitsPerSecond: bitrate,
          audioBitsPerSecond: 128000
        });
      } catch {
        // Fallback without specific codec
        mediaRecorder = new MediaRecorder(combinedStream, {
          videoBitsPerSecond: bitrate
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
            const compressionRatio = ((file.size - convertedBlob.size) / file.size) * 100;
            const name = file.name.replace(/\.[^/.]+$/, `_compressed_${compressionLevel}.${originalExtension}`);
            
            setCompressedVideo({ 
              name, 
              url, 
              size: convertedBlob.size, 
              compressionRatio: Math.max(0, compressionRatio)
            });
          } catch (conversionError) {
            console.warn('Format conversion failed, keeping WebM:', conversionError);
            // Fall back to WebM if conversion fails
            const url = URL.createObjectURL(recordedBlob);
            const compressionRatio = ((file.size - recordedBlob.size) / file.size) * 100;
            const name = file.name.replace(/\.[^/.]+$/, `_compressed_${compressionLevel}.webm`);
            
            setCompressedVideo({ 
              name, 
              url, 
              size: recordedBlob.size, 
              compressionRatio: Math.max(0, compressionRatio)
            });
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
          const compressionRatio = ((file.size - recordedBlob.size) / file.size) * 100;
          const name = file.name.replace(/\.[^/.]+$/, `_compressed_${compressionLevel}.${outputExtension}`);
          
          setCompressedVideo({ 
            name, 
            url, 
            size: recordedBlob.size, 
            compressionRatio: Math.max(0, compressionRatio)
          });
        }
        
        setIsProcessing(false);
      };

      // Start recording
      mediaRecorder.start();

      // Start audio playback for audio capture
      await audioVideoElement.play();

      // Process video frames with reduced quality for compression
      let currentTime = 0;
      const frameSkip = compressionLevel === 'high' ? 2 : 1; // Skip frames for higher compression
      const totalFrames = Math.floor(videoMetadata.duration * fps / frameSkip);
      let frameCount = 0;

      const processFrame = () => {
        if (frameCount >= totalFrames || currentTime >= videoMetadata.duration) {
          mediaRecorder.stop();
          audioVideoElement.pause();
          return;
        }

        // Sync both video elements
        videoElement.currentTime = currentTime;
        audioVideoElement.currentTime = currentTime;
        
        videoElement.onseeked = () => {
          // Apply additional quality reduction for compression
          if (compressionLevel === 'high') {
            ctx.imageSmoothingEnabled = false;
          }
          
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          frameCount++;
          currentTime += (1 / fps) * frameSkip;
          
          // Continue with next frame
          setTimeout(processFrame, compressionLevel === 'high' ? 50 : 33);
        };
      };

      // Start processing
      videoElement.currentTime = 0;
      videoElement.onseeked = () => {
        processFrame();
      };

    } catch (error) {
      console.error('Video compression failed:', error);
      alert('Video compression failed. Please try with a different video file.');
      setIsProcessing(false);
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

  const estimatedSize = file ? (file.size * (targetSize / 100)) : 0;

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
            <div className="text-4xl">🗜️</div>
            <div>
              <p className="text-lg font-medium mb-2">Drag & drop a video here</p>
              <p className="text-sm text-foreground/60">
                or click to select a file • Reduce video file sizes while maintaining quality
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

          {/* Compression Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compression Settings</h3>

            {/* Compression Presets */}
            <div>
              <label className="block text-sm font-medium mb-2">Compression Level</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {compressionPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setCompressionLevel(preset.value as 'low' | 'medium' | 'high')}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      compressionLevel === preset.value
                        ? 'border-foreground bg-foreground/5'
                        : 'border-foreground/20 hover:border-foreground/30'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{preset.label}</div>
                    <div className="text-xs text-foreground/60">{preset.description}</div>
                    <div className="text-xs text-foreground/50 mt-1">
                      ~{Math.round(preset.bitrate / 1000000)}Mbps
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Settings */}
            <div>
              <label className="block text-sm font-medium mb-2">Output Resolution</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {resolutionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setResolution(option.value)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      resolution === option.value
                        ? 'border-foreground bg-foreground/5'
                        : 'border-foreground/20 hover:border-foreground/30'
                    }`}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.value !== 'original' && (
                      <div className="text-xs text-foreground/60">
                        {Math.floor(videoMetadata.width * option.scale)}x{Math.floor(videoMetadata.height * option.scale)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Size: {targetSize}% of original</label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={targetSize}
                  onChange={(e) => setTargetSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60 mt-1">
                  <span>10% (High compression)</span>
                  <span>90% (Low compression)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quality: {quality}%</label>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/60 mt-1">
                  <span>30% (Lowest)</span>
                  <span>95% (Highest)</span>
                </div>
              </div>
            </div>

            {/* Compression Preview */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Original Size:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Estimated Size:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                    {formatFileSize(estimatedSize)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Original Resolution:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                    {videoMetadata.width}x{videoMetadata.height}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">New Resolution:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                    {getNewDimensions().width}x{getNewDimensions().height}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Compress Button */}
          <button
            onClick={compressVideo}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Compressing Video...' : `Compress Video (${compressionLevel})`}
          </button>
        </>
      )}

      {/* Compressed Video */}
      {compressedVideo && (
        <div className="space-y-4">
          <h3 className="font-medium">Compressed Video</h3>
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">{compressedVideo.name}</p>
                <p className="text-xs text-foreground/60">{formatFileSize(compressedVideo.size)}</p>
              </div>
              <button
                onClick={() => downloadFile(compressedVideo.url, compressedVideo.name)}
                className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
              >
                Download
              </button>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ Reduced by {compressedVideo.compressionRatio.toFixed(1)}% 
              ({formatFileSize(file!.size - compressedVideo.size)} saved)
            </div>
          </div>
        </div>
      )}

      {/* Feature Info */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-red-600 dark:text-red-400 text-xl">🗜️</div>
          <div>
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Smart Video Compression</h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              Reduce video file sizes significantly while maintaining visual quality. Perfect for sharing, storage optimization, and faster uploads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}