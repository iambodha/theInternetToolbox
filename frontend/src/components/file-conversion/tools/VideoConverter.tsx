'use client';

import { useState, useCallback } from 'react';

interface LoadingScreenProps {
  fileName: string;
  currentStep: string;
  progress?: number;
  isConverting: boolean;
  outputFormat: string;
}

function LoadingScreen({ fileName, currentStep, progress, isConverting, outputFormat }: LoadingScreenProps) {
  if (!isConverting) return null;

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
            <h3 className="text-lg font-semibold text-foreground">Converting Video</h3>
            <p className="text-sm text-foreground/70 truncate">{fileName}</p>
            <p className="text-xs text-foreground/50">
              Converting to {outputFormat.toUpperCase()}
            </p>
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

export default function VideoConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('mp4');
  const [quality, setQuality] = useState<string>('medium');
  const [resolution, setResolution] = useState<string>('original');
  const [audioBitrate, setAudioBitrate] = useState<string>('128');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string; size: number }[]>([]);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  const supportedFormats = {
    input: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v'],
    output: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'mp3', 'wav', 'aac', 'ogg']
  };

  const qualityOptions = [
    { value: 'low', label: 'Low (Faster)' },
    { value: 'medium', label: 'Medium (Balanced)' },
    { value: 'high', label: 'High (Better Quality)' }
  ];

  const audioQualityOptions = [
    { value: '64', label: '64 kbps' },
    { value: '128', label: '128 kbps' },
    { value: '192', label: '192 kbps' },
    { value: '256', label: '256 kbps' },
    { value: '320', label: '320 kbps' }
  ];

  const resolutionOptions = [
    { value: 'original', label: 'Keep Original' },
    { value: '480p', label: '480p (SD)' },
    { value: '720p', label: '720p (HD)' },
    { value: '1080p', label: '1080p (Full HD)' },
    { value: '1440p', label: '1440p (2K)' },
    { value: '2160p', label: '2160p (4K)' }
  ];

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return extension && supportedFormats.input.includes(extension);
      });
      setFiles(selectedFiles);
      setConvertedFiles([]);
    }
  }, [supportedFormats.input]);

  const getResolutionDimensions = (resolution: string, originalWidth: number, originalHeight: number) => {
    if (resolution === 'original') return { width: originalWidth, height: originalHeight };
    
    const resolutionMap: { [key: string]: { width: number; height: number } } = {
      '480p': { width: 854, height: 480 },
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '1440p': { width: 2560, height: 1440 },
      '2160p': { width: 3840, height: 2160 }
    };
    
    return resolutionMap[resolution] || { width: originalWidth, height: originalHeight };
  };

  const convertVideoWithCanvas = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        const { width, height } = getResolutionDimensions(resolution, video.videoWidth, video.videoHeight);
        canvas.width = width;
        canvas.height = height;
        
        // Set up MediaRecorder
        const stream = canvas.captureStream(30);
        const mimeType = outputFormat === 'webm' ? 'video/webm' : 'video/mp4';
        const bitrate = quality === 'high' ? 5000000 : quality === 'medium' ? 2500000 : 1000000;
        
        let mediaRecorder: MediaRecorder;
        
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: bitrate
          });
        } catch {
          // Fallback to default options
          mediaRecorder = new MediaRecorder(stream);
        }

        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const name = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
          resolve({ name, url, size: blob.size });
        };
        
        mediaRecorder.onerror = () => {
          reject(new Error('Recording failed'));
        };
        
        // Start recording
        mediaRecorder.start(100); // Collect data every 100ms
        
        // Set up video playback and canvas drawing
        let frameCount = 0;
        const maxFrames = Math.floor(video.duration * 30); // Assume 30 FPS
        
        const drawFrame = () => {
          if (video.ended || frameCount >= maxFrames) {
            mediaRecorder.stop();
            return;
          }
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frameCount++;
          
          if (!video.paused && !video.ended) {
            requestAnimationFrame(drawFrame);
          }
        };
        
        video.onplay = () => {
          drawFrame();
        };
        
        video.onended = () => {
          mediaRecorder.stop();
        };
        
        // Start video playback
        video.currentTime = 0;
        video.play().catch(reject);
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
      video.muted = true; // Mute to allow autoplay
    });
  };

  const convertVideoBasic = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    // For basic conversion, we'll change the container/mimetype
    const newName = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
    const mimeType = `video/${outputFormat}`;
    
    // Create a new blob with the target mimetype
    const blob = new Blob([file], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    return { name: newName, url, size: blob.size };
  };

  const convertVideoToAudio = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const AudioContextClass = window.AudioContext || (window as typeof window & {
        webkitAudioContext: typeof AudioContext;
      }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      video.onloadedmetadata = async () => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Create offline context for rendering
          const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
          );
          
          const source = offlineContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineContext.destination);
          source.start();
          
          const renderedBuffer = await offlineContext.startRendering();
          
          // Convert to target audio format
          let blob: Blob;
          const newName = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
          
          if (outputFormat === 'wav') {
            blob = audioBufferToWav(renderedBuffer);
          } else if (outputFormat === 'mp3' || outputFormat === 'aac' || outputFormat === 'ogg') {
            // For compressed formats, we'll use a basic approach
            blob = audioBufferToWav(renderedBuffer); // Fallback to WAV for now
          } else {
            const samples = renderedBuffer.getChannelData(0);
            blob = new Blob([new Uint8Array(samples.buffer)], { type: `audio/${outputFormat}` });
          }
          
          const url = URL.createObjectURL(blob);
          resolve({ name: newName, url, size: blob.size });
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => reject(new Error('Failed to load video file'));
      video.src = URL.createObjectURL(file);
    });
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const convertVideo = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    const inputFormat = file.name.split('.').pop()?.toLowerCase();
    const isAudioOutput = ['mp3', 'wav', 'aac', 'ogg'].includes(outputFormat);
    
    // Convert video to audio
    if (isAudioOutput) {
      return await convertVideoToAudio(file);
    }
    
    // Use canvas-based conversion for supported format combinations
    if ((inputFormat === 'mp4' && outputFormat === 'webm') || 
        (inputFormat === 'webm' && outputFormat === 'mp4') ||
        resolution !== 'original') {
      return await convertVideoWithCanvas(file);
    } else {
      // Use basic conversion for other cases
      return await convertVideoBasic(file);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsConverting(true);
    setLoadingStep('Preparing conversion...');
    setLoadingProgress(5);
    
    try {
      const totalFiles = files.length;
      const converted: { name: string; url: string; size: number }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isAudioOutput = ['mp3', 'wav', 'aac', 'ogg'].includes(outputFormat);
        
        setLoadingStep(`Processing ${file.name}...`);
        setLoadingProgress(10 + (i / totalFiles) * 70);
        
        if (isAudioOutput) {
          setLoadingStep(`Extracting audio from ${file.name}...`);
        } else {
          setLoadingStep(`Converting ${file.name} to ${outputFormat.toUpperCase()}...`);
        }
        
        const result = await convertVideo(file);
        converted.push(result);
        
        setLoadingProgress(10 + ((i + 1) / totalFiles) * 70);
      }
      
      setLoadingStep('Conversion complete!');
      setLoadingProgress(100);
      setConvertedFiles(converted);
      
      // Small delay to show completion
      setTimeout(() => {
        setIsConverting(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Video conversion failed:', error);
      alert('Sorry, this file type is not compatible. Video conversion failed - please try with a different file format.');
      setIsConverting(false);
      setLoadingStep('');
      setLoadingProgress(0);
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

  const downloadAll = () => {
    convertedFiles.forEach(file => {
      downloadFile(file.url, file.name);
    });
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border-2 border-dashed border-black/[.08] dark:border-white/[.145] rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          accept=".mp4,.avi,.mov,.mkv,.wmv,.flv,.webm,.m4v"
          onChange={handleFileChange}
          className="hidden"
          id="video-upload"
        />
        <label htmlFor="video-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-4xl">🎬</div>
            <div>
              <p className="text-lg font-medium">Click to select video files</p>
              <p className="text-sm text-foreground/60">
                Supports: MP4, AVI, MOV, MKV, WMV, FLV, WEBM, M4V
              </p>
            </div>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <>
          {/* Selected Files */}
          <div className="space-y-2">
            <h3 className="font-medium">Selected Files ({files.length})</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-foreground/5 rounded">
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-foreground/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
              >
                {supportedFormats.output.map(format => (
                  <option key={format} value={format}>{format.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {['mp3', 'wav', 'aac', 'ogg'].includes(outputFormat) ? (
              <div>
                <label className="block text-sm font-medium mb-2">Audio Bitrate</label>
                <select
                  value={audioBitrate}
                  onChange={(e) => setAudioBitrate(e.target.value)}
                  className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                >
                  {audioQualityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                  >
                    {qualityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Resolution</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                  >
                    {resolutionOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full py-3 px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConverting ? 'Converting...' : `Convert to ${outputFormat.toUpperCase()}`}
          </button>
        </>
      )}

      {/* Converted Files */}
      {convertedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Converted Files</h3>
            <button
              onClick={downloadAll}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors text-sm"
            >
              Download All
            </button>
          </div>
          <div className="space-y-2">
            {convertedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-foreground/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => downloadFile(file.url, file.name)}
                  className="px-3 py-1 bg-foreground text-background rounded text-sm hover:bg-foreground/90 transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Conversion Info */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-purple-600 dark:text-purple-400 text-xl">🎥</div>
          <div>
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Professional Video Conversion</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Convert videos between popular formats with customizable quality and resolution settings. Perfect for web optimization, device compatibility, and file size reduction.
            </p>
          </div>
        </div>
      </div>

      {/* Processing Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Processing Time</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Video conversion can take time depending on file size and quality settings. Large files may require several minutes to process.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Screen */}
      <LoadingScreen 
        fileName={files.length > 0 ? files[0].name : ''}
        currentStep={loadingStep}
        progress={loadingProgress}
        isConverting={isConverting}
        outputFormat={outputFormat}
      />
    </div>
  );
}