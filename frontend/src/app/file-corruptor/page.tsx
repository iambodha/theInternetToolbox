'use client';

import { useState, useRef } from 'react';

interface FileCorruptorProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onReset: () => void;
}

function FileUploader({ file, onFileSelect, onReset }: FileCorruptorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    onFileSelect(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (file) {
    return (
      <div className="p-6 bg-foreground/5 rounded-lg border border-foreground/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📁</span>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-foreground/60">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm bg-foreground/10 hover:bg-foreground/20 rounded-md transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-foreground/50 bg-foreground/5'
          : 'border-foreground/20 hover:border-foreground/30'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        className="hidden"
        accept="*/*"
      />
      <div className="space-y-4">
        <div className="text-4xl">📁</div>
        <div>
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop file here' : 'Drag & drop any file here'}
          </p>
          <p className="text-sm text-foreground/60">
            or click to select a file • Any file type supported
          </p>
        </div>
      </div>
    </div>
  );
}

interface FileTypeOption {
  extension: string;
  name: string;
  icon: string;
  mimeType: string;
  header?: number[];
}

const FILE_TYPES: FileTypeOption[] = [
  // Documents
  { extension: 'pdf', name: 'PDF Document', icon: '📄', mimeType: 'application/pdf', header: [0x25, 0x50, 0x44, 0x46] },
  { extension: 'docx', name: 'Word Document', icon: '📝', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', header: [0x50, 0x4B, 0x03, 0x04] },
  { extension: 'xlsx', name: 'Excel Spreadsheet', icon: '📊', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', header: [0x50, 0x4B, 0x03, 0x04] },
  { extension: 'pptx', name: 'PowerPoint Presentation', icon: '📽️', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', header: [0x50, 0x4B, 0x03, 0x04] },
  { extension: 'doc', name: 'Word Document (Legacy)', icon: '📝', mimeType: 'application/msword', header: [0xD0, 0xCF, 0x11, 0xE0] },
  { extension: 'xls', name: 'Excel Spreadsheet (Legacy)', icon: '📊', mimeType: 'application/vnd.ms-excel', header: [0xD0, 0xCF, 0x11, 0xE0] },
  { extension: 'ppt', name: 'PowerPoint (Legacy)', icon: '📽️', mimeType: 'application/vnd.ms-powerpoint', header: [0xD0, 0xCF, 0x11, 0xE0] },
  { extension: 'txt', name: 'Text File', icon: '📄', mimeType: 'text/plain' },
  { extension: 'rtf', name: 'Rich Text Format', icon: '📄', mimeType: 'application/rtf' },
  { extension: 'odt', name: 'OpenDocument Text', icon: '📝', mimeType: 'application/vnd.oasis.opendocument.text', header: [0x50, 0x4B, 0x03, 0x04] },
  
  // Images
  { extension: 'jpg', name: 'JPEG Image', icon: '🖼️', mimeType: 'image/jpeg', header: [0xFF, 0xD8, 0xFF] },
  { extension: 'jpeg', name: 'JPEG Image', icon: '🖼️', mimeType: 'image/jpeg', header: [0xFF, 0xD8, 0xFF] },
  { extension: 'png', name: 'PNG Image', icon: '🖼️', mimeType: 'image/png', header: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { extension: 'gif', name: 'GIF Image', icon: '🖼️', mimeType: 'image/gif', header: [0x47, 0x49, 0x46, 0x38] },
  { extension: 'bmp', name: 'Bitmap Image', icon: '🖼️', mimeType: 'image/bmp', header: [0x42, 0x4D] },
  { extension: 'svg', name: 'SVG Vector', icon: '🖼️', mimeType: 'image/svg+xml' },
  { extension: 'webp', name: 'WebP Image', icon: '🖼️', mimeType: 'image/webp', header: [0x52, 0x49, 0x46, 0x46] },
  { extension: 'tiff', name: 'TIFF Image', icon: '🖼️', mimeType: 'image/tiff', header: [0x49, 0x49, 0x2A, 0x00] },
  
  // Video
  { extension: 'mp4', name: 'MP4 Video', icon: '🎬', mimeType: 'video/mp4', header: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70] },
  { extension: 'avi', name: 'AVI Video', icon: '🎬', mimeType: 'video/x-msvideo', header: [0x52, 0x49, 0x46, 0x46] },
  { extension: 'mov', name: 'QuickTime Video', icon: '🎬', mimeType: 'video/quicktime' },
  { extension: 'wmv', name: 'Windows Media Video', icon: '🎬', mimeType: 'video/x-ms-wmv' },
  { extension: 'flv', name: 'Flash Video', icon: '🎬', mimeType: 'video/x-flv', header: [0x46, 0x4C, 0x56] },
  { extension: 'webm', name: 'WebM Video', icon: '🎬', mimeType: 'video/webm' },
  { extension: 'mkv', name: 'Matroska Video', icon: '🎬', mimeType: 'video/x-matroska' },
  
  // Audio
  { extension: 'mp3', name: 'MP3 Audio', icon: '🎵', mimeType: 'audio/mpeg', header: [0xFF, 0xFB] },
  { extension: 'wav', name: 'WAV Audio', icon: '🎵', mimeType: 'audio/wav', header: [0x52, 0x49, 0x46, 0x46] },
  { extension: 'flac', name: 'FLAC Audio', icon: '🎵', mimeType: 'audio/flac', header: [0x66, 0x4C, 0x61, 0x43] },
  { extension: 'aac', name: 'AAC Audio', icon: '🎵', mimeType: 'audio/aac' },
  { extension: 'ogg', name: 'OGG Audio', icon: '🎵', mimeType: 'audio/ogg', header: [0x4F, 0x67, 0x67, 0x53] },
  { extension: 'm4a', name: 'M4A Audio', icon: '🎵', mimeType: 'audio/mp4' },
  
  // Archives
  { extension: 'zip', name: 'ZIP Archive', icon: '🗜️', mimeType: 'application/zip', header: [0x50, 0x4B, 0x03, 0x04] },
  { extension: 'rar', name: 'RAR Archive', icon: '🗜️', mimeType: 'application/vnd.rar', header: [0x52, 0x61, 0x72, 0x21] },
  { extension: '7z', name: '7-Zip Archive', icon: '🗜️', mimeType: 'application/x-7z-compressed', header: [0x37, 0x7A, 0xBC, 0xAF] },
  { extension: 'tar', name: 'TAR Archive', icon: '🗜️', mimeType: 'application/x-tar' },
  { extension: 'gz', name: 'Gzip Archive', icon: '🗜️', mimeType: 'application/gzip', header: [0x1F, 0x8B] },
  
  // Code
  { extension: 'html', name: 'HTML File', icon: '🌐', mimeType: 'text/html' },
  { extension: 'css', name: 'CSS File', icon: '🎨', mimeType: 'text/css' },
  { extension: 'js', name: 'JavaScript File', icon: '⚡', mimeType: 'application/javascript' },
  { extension: 'ts', name: 'TypeScript File', icon: '⚡', mimeType: 'application/typescript' },
  { extension: 'json', name: 'JSON File', icon: '📋', mimeType: 'application/json' },
  { extension: 'xml', name: 'XML File', icon: '📋', mimeType: 'application/xml' },
  { extension: 'py', name: 'Python File', icon: '🐍', mimeType: 'text/x-python' },
  { extension: 'java', name: 'Java File', icon: '☕', mimeType: 'text/x-java-source' },
  { extension: 'cpp', name: 'C++ File', icon: '⚙️', mimeType: 'text/x-c++src' },
  { extension: 'c', name: 'C File', icon: '⚙️', mimeType: 'text/x-csrc' },
  
  // Other
  { extension: 'exe', name: 'Executable File', icon: '⚙️', mimeType: 'application/vnd.microsoft.portable-executable', header: [0x4D, 0x5A] },
  { extension: 'dll', name: 'Dynamic Library', icon: '⚙️', mimeType: 'application/x-msdownload', header: [0x4D, 0x5A] },
  { extension: 'iso', name: 'ISO Image', icon: '💿', mimeType: 'application/x-iso9660-image' },
  { extension: 'dmg', name: 'macOS Disk Image', icon: '💿', mimeType: 'application/x-apple-diskimage' },
];

interface FileTypeSelectorProps {
  selectedFileType: FileTypeOption | null;
  onFileTypeSelect: (fileType: FileTypeOption) => void;
}

function FileTypeSelector({ selectedFileType, onFileTypeSelect }: FileTypeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customExtension, setCustomExtension] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Filter file types based on search query
  const filteredFileTypes = FILE_TYPES.filter(fileType =>
    fileType.extension.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fileType.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomExtensionSubmit = () => {
    const cleanExtension = customExtension.replace(/^\./, '').toLowerCase().trim();
    if (cleanExtension && cleanExtension.length > 0) {
      const customFileType: FileTypeOption = {
        extension: cleanExtension,
        name: `${cleanExtension.toUpperCase()} File`,
        icon: '📄',
        mimeType: 'application/octet-stream'
      };
      onFileTypeSelect(customFileType);
      setCustomExtension('');
      setShowCustomInput(false);
    }
  };

  const handleCustomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomExtensionSubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomExtension('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose File Type</h3>
        <span className="text-sm text-foreground/60">
          {filteredFileTypes.length} file types
        </span>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-foreground/40">🔍</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search file types... (e.g. 'pdf', 'image', 'video')"
          className="block w-full pl-10 pr-3 py-2 border border-foreground/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30"
        />
      </div>

      {/* Custom Extension Input */}
      <div className="space-y-2">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full p-3 border-2 border-dashed border-foreground/20 rounded-lg hover:border-foreground/30 hover:bg-foreground/5 transition-all"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">➕</span>
              <span className="font-medium">Add Custom File Extension</span>
            </div>
          </button>
        ) : (
          <div className="p-4 border border-foreground/20 rounded-lg bg-foreground/2">
            <div className="space-y-3">
              <h4 className="font-medium">Custom File Extension</h4>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60">.</span>
                  <input
                    type="text"
                    value={customExtension}
                    onChange={(e) => setCustomExtension(e.target.value)}
                    onKeyDown={handleCustomKeyPress}
                    placeholder="abc"
                    className="w-full pl-6 pr-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleCustomExtensionSubmit}
                  disabled={!customExtension.trim()}
                  className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomExtension('');
                  }}
                  className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-foreground/60">
                Enter any file extension (e.g., &apos;xyz&apos;, &apos;custom&apos;, &apos;test&apos;). Press Enter to add.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Types Grid */}
      {filteredFileTypes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
          {filteredFileTypes.map((fileType) => (
            <button
              key={fileType.extension}
              onClick={() => onFileTypeSelect(fileType)}
              className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                selectedFileType?.extension === fileType.extension
                  ? 'border-foreground bg-foreground/10 shadow-sm'
                  : 'border-foreground/20 hover:border-foreground/30 hover:bg-foreground/5'
              }`}
            >
              <div className="text-xl mb-1">{fileType.icon}</div>
              <div className="text-sm font-medium">.{fileType.extension}</div>
              <div className="text-xs text-foreground/60 mt-1 leading-tight">{fileType.name}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-foreground/60">No file types found for &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-sm text-foreground/40 mt-1">Try a different search term or add a custom extension</p>
        </div>
      )}
    </div>
  );
}

interface FileCorruptorPageState {
  selectedFile: File | null;
  selectedFileType: FileTypeOption | null;
  targetSize: string;
  isGenerating: boolean;
  downloadUrl: string | null;
  generatedFileName: string;
}

export default function FileCorruptor() {
  const [state, setState] = useState<FileCorruptorPageState>({
    selectedFile: null,
    selectedFileType: null,
    targetSize: '5',
    isGenerating: false,
    downloadUrl: null,
    generatedFileName: ''
  });

  const handleFileSelect = (file: File) => {
    setState(prev => ({ ...prev, selectedFile: file }));
  };

  const handleFileReset = () => {
    setState(prev => ({ ...prev, selectedFile: null }));
  };

  const handleFileTypeSelect = (fileType: FileTypeOption) => {
    setState(prev => ({ ...prev, selectedFileType: fileType }));
  };

  const handleTargetSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, targetSize: e.target.value }));
  };

  const generateCorruptedFile = async () => {
    if (!state.selectedFileType) return;

    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const targetSizeBytes = Math.max(1, parseInt(state.targetSize) || 1) * 1024 * 1024; // Convert MB to bytes
      const corruptedData = new Uint8Array(targetSizeBytes);
      
      // Fill with random data to simulate corruption
      crypto.getRandomValues(corruptedData);
      
      // Add file header if available
      if (state.selectedFileType.header) {
        for (let i = 0; i < Math.min(state.selectedFileType.header.length, corruptedData.length); i++) {
          corruptedData[i] = state.selectedFileType.header[i];
        }
      }

      const blob = new Blob([corruptedData], { type: state.selectedFileType.mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = `corrupted_file.${state.selectedFileType.extension}`;

      setState(prev => ({
        ...prev,
        downloadUrl,
        generatedFileName: fileName,
        isGenerating: false
      }));
    } catch (error) {
      console.error('Error generating corrupted file:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const downloadFile = () => {
    if (state.downloadUrl) {
      const link = document.createElement('a');
      link.href = state.downloadUrl;
      link.download = state.generatedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetAll = () => {
    if (state.downloadUrl) {
      URL.revokeObjectURL(state.downloadUrl);
    }
    setState({
      selectedFile: null,
      selectedFileType: null,
      targetSize: '5',
      isGenerating: false,
      downloadUrl: null,
      generatedFileName: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-black/[.08] dark:border-white/[.145]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-4xl">🔧</span>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-geist-sans)]">
                File Corruptor
              </h1>
            </div>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Create corrupted files with custom sizes for testing purposes. Useful for assignments that require specific file sizes.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Step 1: File Upload (Optional) */}
          <div className="bg-foreground/[.02] dark:bg-foreground/[.05] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <span className="bg-foreground text-background rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <span>Upload Reference File (Optional)</span>
            </h2>
            <p className="text-foreground/60 mb-4 text-sm">
              Upload a file to use as reference, or skip this step to create a file from scratch.
            </p>
            <FileUploader
              file={state.selectedFile}
              onFileSelect={handleFileSelect}
              onReset={handleFileReset}
            />
          </div>

          {/* Step 2: File Type Selection */}
          <div className="bg-foreground/[.02] dark:bg-foreground/[.05] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <span className="bg-foreground text-background rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <span>Select File Type</span>
            </h2>
            <FileTypeSelector
              selectedFileType={state.selectedFileType}
              onFileTypeSelect={handleFileTypeSelect}
            />
          </div>

          {/* Step 3: Size Configuration */}
          {state.selectedFileType && (
            <div className="bg-foreground/[.02] dark:bg-foreground/[.05] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <span className="bg-foreground text-background rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <span>Set Target File Size</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label htmlFor="targetSize" className="text-sm font-medium">
                    Target Size (MB):
                  </label>
                  <input
                    id="targetSize"
                    type="number"
                    min="1"
                    max="100"
                    value={state.targetSize}
                    onChange={handleTargetSizeChange}
                    className="w-24 px-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                  <span className="text-sm text-foreground/60">MB</span>
                </div>
                <p className="text-xs text-foreground/50">
                  File size will be approximately {state.targetSize} MB ({(parseInt(state.targetSize) * 1024 * 1024).toLocaleString()} bytes)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Generate */}
          {state.selectedFileType && (
            <div className="bg-foreground/[.02] dark:bg-foreground/[.05] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <span className="bg-foreground text-background rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <span>Generate Corrupted File</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{state.selectedFileType.icon}</span>
                  <div>
                    <p className="font-medium">{state.selectedFileType.name}</p>
                    <p className="text-sm text-foreground/60">
                      Extension: .{state.selectedFileType.extension} • Size: {state.targetSize} MB
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={generateCorruptedFile}
                    disabled={state.isGenerating}
                    className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {state.isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      'Generate Corrupted File'
                    )}
                  </button>

                  {state.downloadUrl && (
                    <button
                      onClick={downloadFile}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Download File
                    </button>
                  )}

                  {(state.selectedFile || state.selectedFileType || state.downloadUrl) && (
                    <button
                      onClick={resetAll}
                      className="px-6 py-3 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors font-medium"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {state.downloadUrl && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      ✅ File generated successfully!
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                      Your corrupted {state.selectedFileType.name} file is ready for download.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ℹ️ How it works
            </h3>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• Files are generated with random data and proper file headers when available</li>
              <li>• The generated file will appear corrupted when opened in normal applications</li>
              <li>• File size will match your specified target size (±1 byte)</li>
              <li>• Perfect for assignments requiring specific file sizes</li>
              <li>• All processing happens locally in your browser</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
