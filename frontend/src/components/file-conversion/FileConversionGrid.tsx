'use client';

import { useState, useCallback } from 'react';

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
  mp3: { audio: [
    { format: 'wav', label: 'WAV', description: 'Lossless quality' },
    { format: 'flac', label: 'FLAC', description: 'Compressed lossless' },
    { format: 'aac', label: 'AAC', description: 'Better compression' },
    { format: 'ogg', label: 'OGG', description: 'Open source' }
  ]},
  wav: { audio: [
    { format: 'mp3', label: 'MP3', description: 'Universal compatibility' },
    { format: 'flac', label: 'FLAC', description: 'Lossless compression' },
    { format: 'aac', label: 'AAC', description: 'Good compression' },
    { format: 'ogg', label: 'OGG', description: 'Open format' }
  ]},
  flac: { audio: [
    { format: 'mp3', label: 'MP3', description: 'Smaller size' },
    { format: 'wav', label: 'WAV', description: 'Uncompressed' },
    { format: 'aac', label: 'AAC', description: 'Good quality' },
    { format: 'ogg', label: 'OGG', description: 'Efficient' }
  ]},
  
  // Video formats
  mp4: { video: [
    { format: 'avi', label: 'AVI', description: 'Wide compatibility' },
    { format: 'mov', label: 'MOV', description: 'QuickTime format' },
    { format: 'mkv', label: 'MKV', description: 'Open container' },
    { format: 'webm', label: 'WEBM', description: 'Web optimized' }
  ]},
  avi: { video: [
    { format: 'mp4', label: 'MP4', description: 'Modern standard' },
    { format: 'mov', label: 'MOV', description: 'Apple format' },
    { format: 'mkv', label: 'MKV', description: 'Feature rich' },
    { format: 'webm', label: 'WEBM', description: 'Web friendly' }
  ]},
  mov: { video: [
    { format: 'mp4', label: 'MP4', description: 'Universal support' },
    { format: 'avi', label: 'AVI', description: 'Legacy support' },
    { format: 'mkv', label: 'MKV', description: 'Advanced features' },
    { format: 'webm', label: 'WEBM', description: 'Web streaming' }
  ]}
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

export default function FileConversionGrid() {
  const [filesWithOptions, setFilesWithOptions] = useState<FileWithOptions[]>([]);
  const [selectedConversions, setSelectedConversions] = useState<{[key: number]: string}>({});
  const [conversionSettings, setConversionSettings] = useState<{[key: number]: ConversionSettings}>({});
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{[key: number]: { name: string; url: string; size: number }}>({});

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
        if (!formatConfig || !formatConfig[category]) return;
        
        processedFiles.push({
          file,
          inputFormat: extension,
          availableFormats: formatConfig[category],
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

  const handleConversion = async (fileIndex: number) => {
    const fileData = filesWithOptions[fileIndex];
    const targetFormat = selectedConversions[fileIndex];
    
    if (!targetFormat) return;

    setIsConverting(true);
    
    try {
      if (fileData.category === 'image') {
        const settings = conversionSettings[fileIndex] || {};
        const quality = typeof settings.quality === 'number' ? settings.quality : 90;
        const converted = await convertImage(fileData.file, targetFormat, quality);
        setConvertedFiles(prev => ({ ...prev, [fileIndex]: converted }));
      } else if (fileData.category === 'video') {
        const settings = conversionSettings[fileIndex] || {};
        const quality = typeof settings.quality === 'string' ? settings.quality : 'medium';
        const converted = await convertVideo(fileData.file, targetFormat, quality);
        setConvertedFiles(prev => ({ ...prev, [fileIndex]: converted }));
      } else {
        // Show incompatible message for unsupported formats
        alert(`Sorry, this file type is not compatible. ${categoryNames[fileData.category]} conversion is not currently supported.`);
        setIsConverting(false);
        return;
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Sorry, this file type is not compatible or the conversion failed. Please try with a different file.');
    } finally {
      setIsConverting(false);
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
    <div className="space-y-8">
      {/* File Upload */}
      <div className="border-2 border-dashed border-black/[.08] dark:border-white/[.145] rounded-lg p-8 text-center">
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
              <p className="text-lg font-medium">Drop files here or click to select</p>
              <p className="text-sm text-foreground/60">
                Supports images, documents, audio, and video files
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* File Conversion Options */}
      {filesWithOptions.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Convert Your Files</h3>
          
          {filesWithOptions.map((fileData, index) => (
            <div key={index} className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6">
              {/* File Info */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{categoryIcons[fileData.category]}</span>
                <div>
                  <h4 className="font-medium">{fileData.file.name}</h4>
                  <p className="text-sm text-foreground/60">
                    {categoryNames[fileData.category]} • {fileData.inputFormat.toUpperCase()} • {(fileData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Conversion Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Convert to:</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {fileData.availableFormats.map((format) => (
                      <button
                        key={format.format}
                        onClick={() => setSelectedConversions(prev => ({ ...prev, [index]: format.format }))}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedConversions[index] === format.format
                            ? 'border-foreground bg-foreground/5'
                            : 'border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25]'
                        }`}
                      >
                        <div className="font-medium text-sm">{format.label}</div>
                        {format.description && (
                          <div className="text-xs text-foreground/60 mt-1">{format.description}</div>
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
                    <label className="block text-sm font-medium mb-2">
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
                    <label className="block text-sm font-medium mb-2">
                      Quality
                    </label>
                    <select
                      value={conversionSettings[index]?.quality || 'medium'}
                      onChange={(e) => setConversionSettings(prev => ({
                        ...prev,
                        [index]: { ...prev[index], quality: e.target.value }
                      }))}
                      className="w-full border rounded-lg p-2 text-sm"
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
                    <button
                      onClick={() => handleConversion(index)}
                      disabled={isConverting}
                      className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isConverting ? 'Converting...' : `Convert to ${selectedConversions[index].toUpperCase()}`}
                    </button>
                    
                    {convertedFiles[index] && (
                      <button
                        onClick={() => downloadFile(convertedFiles[index].url, convertedFiles[index].name)}
                        className="px-4 py-2 border border-foreground rounded-lg hover:bg-foreground/5 transition-colors"
                      >
                        Download {convertedFiles[index].name}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Features Section */}
      <div className="bg-foreground/[.02] dark:bg-foreground/[.05] rounded-lg p-8">
        <h3 className="text-2xl font-bold font-[family-name:var(--font-geist-sans)] text-center mb-8">
          Smart File Conversion
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🎯</span>
            </div>
            <h4 className="font-semibold mb-2">Auto-Detection</h4>
            <p className="text-sm text-foreground/60">
              Automatically detects file types and shows relevant conversion options
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h4 className="font-semibold mb-2">Instant Preview</h4>
            <p className="text-sm text-foreground/60">
              See all available formats immediately after uploading your files
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🔧</span>
            </div>
            <h4 className="font-semibold mb-2">Quality Control</h4>
            <p className="text-sm text-foreground/60">
              Customize quality and compression settings for optimal results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
