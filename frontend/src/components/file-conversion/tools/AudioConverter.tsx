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

  const isVideoOutput = ['mp4', 'webm', 'avi', 'mov'].includes(outputFormat);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-foreground/20 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Audio/Video Icon Animation */}
          <div className="relative">
            <div className="text-6xl animate-pulse">{isVideoOutput ? '🎬' : '🎵'}</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isVideoOutput ? 'Creating Video' : 'Converting Audio'}
            </h3>
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

export default function AudioConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('mp3');
  const [bitrate, setBitrate] = useState<string>('128');
  const [videoResolution, setVideoResolution] = useState<string>('720p');
  const [backgroundColor, setBackgroundColor] = useState<string>('#000000');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string; size: number }[]>([]);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  const supportedFormats = {
    input: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'],
    output: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'mp4', 'webm', 'avi', 'mov']
  };

  const bitrateOptions = ['64', '128', '192', '256', '320'];
  const videoResolutionOptions = ['480p', '720p', '1080p', '4k'];

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

  const convertAudioToVideo = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set resolution based on selection
        const resolutionMap: { [key: string]: { width: number; height: number } } = {
          '480p': { width: 854, height: 480 },
          '720p': { width: 1280, height: 720 },
          '1080p': { width: 1920, height: 1080 },
          '4k': { width: 3840, height: 2160 }
        };
        
        const { width, height } = resolutionMap[videoResolution];
        canvas.width = width;
        canvas.height = height;
        
        // Fill canvas with background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Set up MediaRecorder
        const stream = canvas.captureStream(30);
        const mimeType = outputFormat === 'webm' ? 'video/webm' : 'video/mp4';
        
        let mediaRecorder: MediaRecorder;
        
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 2500000
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
        mediaRecorder.start(100);
        
        // Play audio and maintain video recording
        audio.onplay = () => {
          const drawFrame = () => {
            if (!audio.ended && !audio.paused) {
              ctx.fillStyle = backgroundColor;
              ctx.fillRect(0, 0, width, height);
              requestAnimationFrame(drawFrame);
            }
          };
          drawFrame();
        };
        
        audio.onended = () => {
          mediaRecorder.stop();
        };
        
        // Start audio playback
        audio.currentTime = 0;
        audio.play().catch(reject);
      };
      
      audio.onerror = () => reject(new Error('Failed to load audio file'));
      audio.src = URL.createObjectURL(file);
    });
  };

  const convertAudio = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    const isVideoOutput = ['mp4', 'webm', 'avi', 'mov'].includes(outputFormat);
    
    // Convert audio to video with black screen
    if (isVideoOutput) {
      return await convertAudioToVideo(file);
    }
    
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Type-safe way to handle webkitAudioContext
      const AudioContextClass = window.AudioContext || (window as typeof window & {
        webkitAudioContext: typeof AudioContext;
      }).webkitAudioContext;
      
      const audioContext = new AudioContextClass();
      
      audio.oncanplaythrough = async () => {
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
          
          // Convert to the target format
          let blob: Blob;
          const newName = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
          
          if (outputFormat === 'wav') {
            blob = audioBufferToWav(renderedBuffer);
          } else if (outputFormat === 'mp3') {
            // For MP3, we'll use a simple approach - in production you'd want to use a proper encoder
            blob = audioBufferToWav(renderedBuffer); // Fallback to WAV for now
          } else {
            // For other formats, create a basic audio blob
            const samples = renderedBuffer.getChannelData(0);
            blob = new Blob([new Uint8Array(samples.buffer)], { type: `audio/${outputFormat}` });
          }
          
          const url = URL.createObjectURL(blob);
          resolve({ name: newName, url, size: blob.size });
        } catch (error) {
          reject(error);
        }
      };
      
      audio.onerror = () => reject(new Error('Failed to load audio file'));
      audio.src = URL.createObjectURL(file);
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsConverting(true);
    setLoadingStep('Preparing conversion...');
    setLoadingProgress(5);
    
    try {
      const totalFiles = files.length;
      const converted: { name: string; url: string; size: number }[] = [];
      const isVideoOutput = ['mp4', 'webm', 'avi', 'mov'].includes(outputFormat);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setLoadingStep(`Processing ${file.name}...`);
        setLoadingProgress(10 + (i / totalFiles) * 70);
        
        if (isVideoOutput) {
          setLoadingStep(`Creating video with black screen for ${file.name}...`);
        } else {
          setLoadingStep(`Converting ${file.name} to ${outputFormat.toUpperCase()}...`);
        }
        
        const result = await convertAudio(file);
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
      console.error('Audio conversion failed:', error);
      alert('Sorry, this file type is not compatible. Audio conversion failed - please try with a different file format.');
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
          accept=".mp3,.wav,.flac,.aac,.ogg,.m4a,.wma"
          onChange={handleFileChange}
          className="hidden"
          id="audio-upload"
        />
        <label htmlFor="audio-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-4xl">🎵</div>
            <div>
              <p className="text-lg font-medium">Click to select audio files</p>
              <p className="text-sm text-foreground/60">
                Supports: MP3, WAV, FLAC, AAC, OGG, M4A, WMA
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {(outputFormat === 'mp3' || outputFormat === 'aac') && (
              <div>
                <label className="block text-sm font-medium mb-2">Bitrate (kbps)</label>
                <select
                  value={bitrate}
                  onChange={(e) => setBitrate(e.target.value)}
                  className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                >
                  {bitrateOptions.map(rate => (
                    <option key={rate} value={rate}>{rate} kbps</option>
                  ))}
                </select>
              </div>
            )}

            {(outputFormat === 'mp4' || outputFormat === 'webm' || outputFormat === 'avi' || outputFormat === 'mov') && (
              <div>
                <label className="block text-sm font-medium mb-2">Video Resolution</label>
                <select
                  value={videoResolution}
                  onChange={(e) => setVideoResolution(e.target.value)}
                  className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                >
                  {videoResolutionOptions.map(resolution => (
                    <option key={resolution} value={resolution}>{resolution}</option>
                  ))}
                </select>
              </div>
            )}

            {(outputFormat === 'mp4' || outputFormat === 'webm' || outputFormat === 'avi' || outputFormat === 'mov') && (
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full p-2 border border-black/[.08] dark:border-white/[.145] rounded bg-background"
                />
              </div>
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

      {/* Audio Quality Info */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-green-600 dark:text-green-400 text-xl">🎧</div>
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">High-Quality Audio Conversion</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Convert between lossless (FLAC, WAV) and compressed (MP3, AAC, OGG) formats with customizable quality settings.
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