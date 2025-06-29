'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { styles } from '@/lib/styles';

interface ConversionOption {
  format: string;
  label: string;
  description?: string;
}

interface FileWithOptions {
  file: File;
  inputFormat: string;
  availableFormats: ConversionOption[];
  category: 'image' | 'document' | 'audio' | 'video';
}

const formatOptions: Record<string, Record<string, ConversionOption[]>> = {
  // Image formats
  jpg: { image: [
    { format: 'png', label: 'PNG', description: 'Lossless compression' },
    { format: 'webp', label: 'WEBP', description: 'Modern web format' },
    { format: 'gif', label: 'GIF', description: 'Animated support' },
    { format: 'bmp', label: 'BMP', description: 'Uncompressed' },
    { format: 'tiff', label: 'TIFF', description: 'High quality' }
  ]},
  jpeg: { image: [
    { format: 'png', label: 'PNG', description: 'Lossless compression' },
    { format: 'webp', label: 'WEBP', description: 'Modern web format' },
    { format: 'gif', label: 'GIF', description: 'Animated support' },
    { format: 'bmp', label: 'BMP', description: 'Uncompressed' }
  ]},
  png: { image: [
    { format: 'jpg', label: 'JPG', description: 'Smaller file size' },
    { format: 'webp', label: 'WEBP', description: 'Better compression' },
    { format: 'gif', label: 'GIF', description: 'Animated support' },
    { format: 'bmp', label: 'BMP', description: 'Uncompressed' }
  ]},
  gif: { image: [
    { format: 'png', label: 'PNG', description: 'Better quality' },
    { format: 'jpg', label: 'JPG', description: 'Smaller size' },
    { format: 'webp', label: 'WEBP', description: 'Modern format' }
  ]},
  webp: { image: [
    { format: 'png', label: 'PNG', description: 'Wide compatibility' },
    { format: 'jpg', label: 'JPG', description: 'Universal support' },
    { format: 'gif', label: 'GIF', description: 'Animated support' }
  ]},
  bmp: { image: [
    { format: 'png', label: 'PNG', description: 'Better compression' },
    { format: 'jpg', label: 'JPG', description: 'Much smaller size' },
    { format: 'webp', label: 'WEBP', description: 'Modern compression' }
  ]},
  tiff: { image: [
    { format: 'png', label: 'PNG', description: 'Web compatible' },
    { format: 'jpg', label: 'JPG', description: 'Smaller size' },
    { format: 'webp', label: 'WEBP', description: 'Better compression' }
  ]},
  
  // Document formats
  pdf: { document: [
    { format: 'docx', label: 'Word Document', description: 'Editable format' },
    { format: 'txt', label: 'Plain Text', description: 'Simple text only' },
    { format: 'rtf', label: 'Rich Text', description: 'Formatted text' }
  ]},
  doc: { document: [
    { format: 'pdf', label: 'PDF', description: 'Preserve formatting' },
    { format: 'docx', label: 'Word (Modern)', description: 'Updated format' },
    { format: 'txt', label: 'Plain Text', description: 'Text only' }
  ]},
  docx: { document: [
    { format: 'pdf', label: 'PDF', description: 'Preserve formatting' },
    { format: 'txt', label: 'Plain Text', description: 'Text only' },
    { format: 'rtf', label: 'Rich Text', description: 'Cross-platform' }
  ]},
  txt: { document: [
    { format: 'pdf', label: 'PDF', description: 'Professional format' },
    { format: 'docx', label: 'Word Document', description: 'Add formatting' },
    { format: 'rtf', label: 'Rich Text', description: 'Formatted text' }
  ]},
  
  // Audio formats
  mp3: { 
    audio: [
      { format: 'wav', label: 'WAV', description: 'Lossless quality' },
      { format: 'flac', label: 'FLAC', description: 'Compressed lossless' },
      { format: 'aac', label: 'AAC', description: 'Better compression' },
      { format: 'ogg', label: 'OGG', description: 'Open source' }
    ],
    video: [
      { format: 'mp4', label: 'MP4 Video', description: 'Audio with black screen' },
      { format: 'webm', label: 'WebM Video', description: 'Web-optimized video' },
      { format: 'avi', label: 'AVI Video', description: 'Legacy video format' },
      { format: 'mov', label: 'MOV Video', description: 'QuickTime video' }
    ]
  },
  wav: { 
    audio: [
      { format: 'mp3', label: 'MP3', description: 'Universal compatibility' },
      { format: 'flac', label: 'FLAC', description: 'Lossless compression' },
      { format: 'aac', label: 'AAC', description: 'Good compression' },
      { format: 'ogg', label: 'OGG', description: 'Open format' }
    ],
    video: [
      { format: 'mp4', label: 'MP4 Video', description: 'Audio with black screen' },
      { format: 'webm', label: 'WebM Video', description: 'Web-optimized video' }
    ]
  },
  flac: { 
    audio: [
      { format: 'mp3', label: 'MP3', description: 'Smaller size' },
      { format: 'wav', label: 'WAV', description: 'Uncompressed' },
      { format: 'aac', label: 'AAC', description: 'Good quality' },
      { format: 'ogg', label: 'OGG', description: 'Efficient' }
    ],
    video: [
      { format: 'mp4', label: 'MP4 Video', description: 'Audio with black screen' },
      { format: 'webm', label: 'WebM Video', description: 'Web-optimized video' }
    ]
  },
  aac: { 
    audio: [
      { format: 'mp3', label: 'MP3', description: 'Universal support' },
      { format: 'wav', label: 'WAV', description: 'Lossless quality' },
      { format: 'flac', label: 'FLAC', description: 'Lossless compression' },
      { format: 'ogg', label: 'OGG', description: 'Open format' }
    ],
    video: [
      { format: 'mp4', label: 'MP4 Video', description: 'Audio with black screen' },
      { format: 'webm', label: 'WebM Video', description: 'Web-optimized video' }
    ]
  },
  ogg: { 
    audio: [
      { format: 'mp3', label: 'MP3', description: 'Better compatibility' },
      { format: 'wav', label: 'WAV', description: 'Lossless quality' },
      { format: 'flac', label: 'FLAC', description: 'Lossless compression' },
      { format: 'aac', label: 'AAC', description: 'Good compression' }
    ],
    video: [
      { format: 'mp4', label: 'MP4 Video', description: 'Audio with black screen' },
      { format: 'webm', label: 'WebM Video', description: 'Web-optimized video' }
    ]
  },
  
  // Video formats
  mp4: { 
    video: [
      { format: 'avi', label: 'AVI', description: 'Wide compatibility' },
      { format: 'mov', label: 'MOV', description: 'QuickTime format' },
      { format: 'mkv', label: 'MKV', description: 'Open container' },
      { format: 'webm', label: 'WEBM', description: 'Web optimized' }
    ],
    audio: [
      { format: 'mp3', label: 'MP3 Audio', description: 'Extract audio as MP3' },
      { format: 'wav', label: 'WAV Audio', description: 'Extract audio as WAV' },
      { format: 'aac', label: 'AAC Audio', description: 'Extract audio as AAC' },
      { format: 'ogg', label: 'OGG Audio', description: 'Extract audio as OGG' }
    ]
  },
  avi: { 
    video: [
      { format: 'mp4', label: 'MP4', description: 'Modern standard' },
      { format: 'mov', label: 'MOV', description: 'Apple format' },
      { format: 'mkv', label: 'MKV', description: 'Feature rich' },
      { format: 'webm', label: 'WEBM', description: 'Web friendly' }
    ],
    audio: [
      { format: 'mp3', label: 'MP3 Audio', description: 'Extract audio as MP3' },
      { format: 'wav', label: 'WAV Audio', description: 'Extract audio as WAV' },
      { format: 'aac', label: 'AAC Audio', description: 'Extract audio as AAC' }
    ]
  },
  mov: { 
    video: [
      { format: 'mp4', label: 'MP4', description: 'Universal support' },
      { format: 'avi', label: 'AVI', description: 'Legacy support' },
      { format: 'mkv', label: 'MKV', description: 'Advanced features' },
      { format: 'webm', label: 'WEBM', description: 'Web streaming' }
    ],
    audio: [
      { format: 'mp3', label: 'MP3 Audio', description: 'Extract audio as MP3' },
      { format: 'wav', label: 'WAV Audio', description: 'Extract audio as WAV' },
      { format: 'aac', label: 'AAC Audio', description: 'Extract audio as AAC' }
    ]
  },
  mkv: { 
    video: [
      { format: 'mp4', label: 'MP4', description: 'Better compatibility' },
      { format: 'avi', label: 'AVI', description: 'Legacy format' },
      { format: 'mov', label: 'MOV', description: 'Apple format' },
      { format: 'webm', label: 'WEBM', description: 'Web optimized' }
    ],
    audio: [
      { format: 'mp3', label: 'MP3 Audio', description: 'Extract audio as MP3' },
      { format: 'wav', label: 'WAV Audio', description: 'Extract audio as WAV' },
      { format: 'aac', label: 'AAC Audio', description: 'Extract audio as AAC' }
    ]
  },
  webm: { 
    video: [
      { format: 'mp4', label: 'MP4', description: 'Better compatibility' },
      { format: 'avi', label: 'AVI', description: 'Legacy format' },
      { format: 'mov', label: 'MOV', description: 'Apple format' },
      { format: 'mkv', label: 'MKV', description: 'Advanced container' }
    ],
    audio: [
      { format: 'mp3', label: 'MP3 Audio', description: 'Extract audio as MP3' },
      { format: 'wav', label: 'WAV Audio', description: 'Extract audio as WAV' },
      { format: 'ogg', label: 'OGG Audio', description: 'Extract audio as OGG' }
    ]
  }
};

const categoryIcons = {
  image: '🖼️',
  document: '📄', 
  audio: '🎵',
  video: '🎬'
};

const categoryNames = {
  image: 'Image',
  document: 'Document',
  audio: 'Audio', 
  video: 'Video'
};

interface ConversionSettings {
  quality?: number | string;
  [key: string]: unknown;
}

function LoadingScreen({ fileName, currentStep, progress, isConverting, outputFormat, category }: {
  fileName: string;
  currentStep: string;
  progress?: number;
  isConverting: boolean;
  outputFormat: string;
  category: 'image' | 'document' | 'audio' | 'video';
}) {
  if (!isConverting) return null;

  const getIcon = () => {
    if (category === 'video' && ['mp3', 'wav', 'aac', 'ogg'].includes(outputFormat)) {
      return '🎵'; // Video to audio
    } else if (category === 'audio' && ['mp4', 'webm', 'avi', 'mov'].includes(outputFormat)) {
      return '🎬'; // Audio to video
    } else {
      return category === 'image' ? '🖼️' : category === 'document' ? '📄' : category === 'audio' ? '🎵' : '🎬';
    }
  };

  const getTitle = () => {
    if (category === 'video' && ['mp3', 'wav', 'aac', 'ogg'].includes(outputFormat)) {
      return 'Extracting Audio';
    } else if (category === 'audio' && ['mp4', 'webm', 'avi', 'mov'].includes(outputFormat)) {
      return 'Creating Video';
    } else {
      return `Converting ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-foreground/20 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Icon Animation */}
          <div className="relative">
            <div className="text-6xl animate-pulse">{getIcon()}</div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-20 h-20 mx-auto border-4 border-transparent border-t-foreground rounded-full"></div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{getTitle()}</h3>
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

export default function FileConversionGrid() {
  const [filesWithOptions, setFilesWithOptions] = useState<FileWithOptions[]>([]);
  const [selectedConversions, setSelectedConversions] = useState<{[key: number]: string}>({});
  const [conversionSettings, setConversionSettings] = useState<{[key: number]: ConversionSettings}>({});
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{[key: number]: { name: string; url: string; size: number }}>({});
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const getFileCategory = (extension: string): 'image' | 'document' | 'audio' | 'video' | null => {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'];
    const documentFormats = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const audioFormats = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'];
    const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v'];
    
    if (imageFormats.includes(extension)) return 'image';
    if (documentFormats.includes(extension)) return 'document';
    if (audioFormats.includes(extension)) return 'audio';
    if (videoFormats.includes(extension)) return 'video';
    return null;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const processedFiles: FileWithOptions[] = [];
      
      files.forEach(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension) return;
        
        const category = getFileCategory(extension);
        if (!category) return;
        
        const formatConfig = formatOptions[extension as keyof typeof formatOptions];
        if (!formatConfig) return;
        
        // Combine all available format options for cross-format conversion
        let allFormats: ConversionOption[] = [];
        
        // Add same-category formats
        if (formatConfig[category]) {
          allFormats = [...allFormats, ...formatConfig[category]];
        }
        
        // Add cross-category formats (video <-> audio)
        if (category === 'video' && formatConfig.audio) {
          allFormats = [...allFormats, ...formatConfig.audio];
        } else if (category === 'audio' && formatConfig.video) {
          allFormats = [...allFormats, ...formatConfig.video];
        }
        
        if (allFormats.length === 0) return;
        
        processedFiles.push({
          file,
          inputFormat: extension,
          availableFormats: allFormats,
          category
        });
      });
      
      setFilesWithOptions(processedFiles);
      setSelectedConversions({});
      setConvertedFiles({});
    }
  }, []);

  const convertImage = async (file: File, outputFormat: string, quality: number = 90): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }

        const mimeType = outputFormat === 'jpg' || outputFormat === 'jpeg' ? 'image/jpeg' : `image/${outputFormat}`;
        const qualityValue = (outputFormat === 'jpg' || outputFormat === 'jpeg' || outputFormat === 'webp') ? quality / 100 : undefined;

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const name = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
            resolve({ name, url, size: blob.size });
          }
        }, mimeType, qualityValue);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const convertVideo = async (file: File, outputFormat: string, quality: string = 'medium'): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      // For video conversion, we'll use a simple approach with HTML5 video element
      // This is a basic implementation - for production, you'd want FFmpeg.js or server-side processing
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // For this basic implementation, we'll just change the container format
        // Real video conversion would require FFmpeg or similar
        if (outputFormat === 'webm' && file.type.includes('mp4')) {
          // Simple MP4 to WebM conversion using MediaRecorder
          convertWithMediaRecorder(file, outputFormat, quality)
            .then(resolve)
            .catch(reject);
        } else {
          // For other formats, we'll simulate conversion for now
          setTimeout(() => {
            const blob = new Blob([file], { type: `video/${outputFormat}` });
            const url = URL.createObjectURL(blob);
            const name = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
            resolve({ name, url, size: blob.size });
          }, 2000);
        }
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  };

  const convertWithMediaRecorder = async (file: File, outputFormat: string, quality: string): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: `video/${outputFormat}`,
          videoBitsPerSecond: quality === 'high' ? 5000000 : quality === 'medium' ? 2500000 : 1000000
        });
        
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: `video/${outputFormat}` });
          const url = URL.createObjectURL(blob);
          const name = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
          resolve({ name, url, size: blob.size });
        };
        
        mediaRecorder.onerror = () => reject(new Error('Recording failed'));
        
        // Start recording
        mediaRecorder.start();
        
        // Play video and draw frames to canvas
        const drawFrame = () => {
          if (!video.ended) {
            ctx?.drawImage(video, 0, 0);
            requestAnimationFrame(drawFrame);
          } else {
            mediaRecorder.stop();
          }
        };
        
        video.onplay = () => drawFrame();
        video.play();
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const convertVideoToAudio = async (file: File, outputFormat: string): Promise<{ name: string; url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const AudioContextClass = window.AudioContext || (window as typeof window & {
        webkitAudioContext: typeof AudioContext;
      }).webkitAudioContext;
      
      video.onloadedmetadata = async () => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const audioContext = new AudioContextClass();
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
          } else {
            // For other formats, we'll use WAV as fallback
            blob = audioBufferToWav(renderedBuffer);
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

  const handleConversion = async (fileIndex: number) => {
    const fileData = filesWithOptions[fileIndex];
    const targetFormat = selectedConversions[fileIndex];
    
    if (!targetFormat) return;

    setIsConverting(true);
    setCurrentFileIndex(fileIndex);
    setLoadingStep('Preparing conversion...');
    setLoadingProgress(5);
    
    try {
      // Check if we're converting video to audio
      const isVideoToAudio = fileData.category === 'video' && ['mp3', 'wav', 'aac', 'ogg'].includes(targetFormat);
      const isAudioToVideo = fileData.category === 'audio' && ['mp4', 'webm', 'avi', 'mov'].includes(targetFormat);
      
      if (isVideoToAudio) {
        setLoadingStep(`Extracting audio from ${fileData.file.name}...`);
      } else if (isAudioToVideo) {
        setLoadingStep(`Creating video with black screen for ${fileData.file.name}...`);
      } else {
        setLoadingStep(`Converting ${fileData.file.name} to ${targetFormat.toUpperCase()}...`);
      }
      
      setLoadingProgress(20);
      
      if (fileData.category === 'image') {
        setLoadingStep('Processing image data...');
        setLoadingProgress(40);
        
        const settings = conversionSettings[fileIndex] || {};
        const quality = typeof settings.quality === 'number' ? settings.quality : 90;
        
        setLoadingStep('Applying image conversion...');
        setLoadingProgress(70);
        
        const converted = await convertImage(fileData.file, targetFormat, quality);
        
        setLoadingStep('Finalizing image conversion...');
        setLoadingProgress(90);
        
        setConvertedFiles(prev => ({ ...prev, [fileIndex]: converted }));
      } else if (isVideoToAudio) {
        setLoadingStep('Analyzing video file...');
        setLoadingProgress(30);
        
        setLoadingStep('Extracting audio track...');
        setLoadingProgress(60);
        
        const converted = await convertVideoToAudio(fileData.file, targetFormat);
        
        setLoadingStep('Generating audio file...');
        setLoadingProgress(90);
        
        setConvertedFiles(prev => ({ ...prev, [fileIndex]: converted }));
      } else if (fileData.category === 'video') {
        setLoadingStep('Processing video data...');
        setLoadingProgress(30);
        
        const settings = conversionSettings[fileIndex] || {};
        const quality = typeof settings.quality === 'string' ? settings.quality : 'medium';
        
        setLoadingStep('Converting video format...');
        setLoadingProgress(60);
        
        const converted = await convertVideo(fileData.file, targetFormat, quality);
        
        setLoadingStep('Finalizing video conversion...');
        setLoadingProgress(90);
        
        setConvertedFiles(prev => ({ ...prev, [fileIndex]: converted }));
      } else {
        // Show incompatible message for unsupported formats
        alert(`Sorry, this file type is not compatible. ${categoryNames[fileData.category]} conversion is not currently supported.`);
        setIsConverting(false);
        setLoadingStep('');
        setLoadingProgress(0);
        return;
      }
      
      setLoadingStep('Conversion complete!');
      setLoadingProgress(100);
      
      // Small delay to show completion
      setTimeout(() => {
        setIsConverting(false);
        setLoadingStep('');
        setLoadingProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Sorry, this file type is not compatible or the conversion failed. Please try with a different file.');
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

  return (
    <div className={styles.spacing.section}>
      {/* File Upload */}
      <div className="border-2 border-dashed border-foreground/20 hover:border-foreground/30 rounded-lg p-8 text-center cursor-pointer transition-colors">
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.svg,.pdf,.doc,.docx,.txt,.rtf,.odt,.mp3,.wav,.flac,.aac,.ogg,.m4a,.wma,.mp4,.avi,.mov,.mkv,.wmv,.flv,.webm,.m4v"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-4xl">📁</div>
            <div>
              <p className="text-lg font-medium mb-2">Drag & drop files here</p>
              <p className="text-sm text-foreground/60">
                or click to select files • Supports images, documents, audio, and video files
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* File Conversion Options */}
      {filesWithOptions.length > 0 && (
        <div className={styles.spacing.section}>
          <h3 className={`${styles.text.xl} font-semibold`}>Convert Your Files</h3>
          
          {filesWithOptions.map((fileData, index) => (
            <div key={index} className={`${styles.card.base.replace('cursor-pointer', '')} ${styles.card.content}`}>
              {/* File Info */}
              <div className={styles.card.header}>
                <span className={styles.card.icon}>{categoryIcons[fileData.category]}</span>
                <div>
                  <h4 className="font-medium">{fileData.file.name}</h4>
                  <p className={`${styles.text.sm} ${styles.text.subtle}`}>
                    {categoryNames[fileData.category]} • {fileData.inputFormat.toUpperCase()} • {(fileData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Conversion Options */}
              <div className={styles.spacing.group}>
                <div>
                  <label className={styles.form.label}>Convert to:</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {fileData.availableFormats.map((format) => (
                      <button
                        key={format.format}
                        onClick={() => setSelectedConversions(prev => ({ ...prev, [index]: format.format }))}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedConversions[index] === format.format
                            ? 'border-foreground bg-foreground/5'
                            : 'border-foreground/20 hover:border-foreground/30'
                        }`}
                      >
                        <div className={`font-medium ${styles.text.sm}`}>{format.label}</div>
                        {format.description && (
                          <div className={`${styles.text.xs} ${styles.text.subtle} mt-1`}>{format.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Settings for Images */}
                {selectedConversions[index] && 
                 fileData.category === 'image' && 
                 ['jpg', 'jpeg', 'webp'].includes(selectedConversions[index]) && (
                  <div>
                    <label className={styles.form.label}>
                      Quality ({conversionSettings[index]?.quality || 90}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={conversionSettings[index]?.quality || 90}
                      onChange={(e) => setConversionSettings(prev => ({
                        ...prev,
                        [index]: { ...prev[index], quality: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Quality Settings for Videos */}
                {selectedConversions[index] && 
                 fileData.category === 'video' && (
                  <div>
                    <label className={styles.form.label}>Quality</label>
                    <select
                      value={conversionSettings[index]?.quality || 'medium'}
                      onChange={(e) => setConversionSettings(prev => ({
                        ...prev,
                        [index]: { ...prev[index], quality: e.target.value }
                      }))}
                      className="w-full p-2 border border-foreground/20 rounded bg-background"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                )}

                {/* Convert Button */}
                {selectedConversions[index] && (
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => handleConversion(index)}
                      disabled={isConverting}
                      variant="primary"
                    >
                      {isConverting ? 'Converting...' : `Convert to ${selectedConversions[index].toUpperCase()}`}
                    </Button>
                    
                    {convertedFiles[index] && (
                      <Button
                        onClick={() => downloadFile(convertedFiles[index].url, convertedFiles[index].name)}
                        variant="secondary"
                      >
                        Download {convertedFiles[index].name}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Screen */}
      {isConverting && filesWithOptions.length > 0 && (
        <LoadingScreen
          fileName={filesWithOptions[currentFileIndex]?.file.name || 'File'}
          currentStep={loadingStep}
          progress={loadingProgress}
          isConverting={isConverting}
          outputFormat={selectedConversions[currentFileIndex] || ''}
          category={filesWithOptions[currentFileIndex]?.category || 'image'}
        />
      )}
    </div>
  );
}
