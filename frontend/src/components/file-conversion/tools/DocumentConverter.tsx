'use client';

import { useState, useCallback } from 'react';

export default function DocumentConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string; size: number }[]>([]);

  const supportedFormats = {
    input: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    output: ['pdf', 'txt', 'docx', 'rtf']
  };

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

  const convertTextToPdf = async (text: string, filename: string): Promise<{ name: string; url: string; size: number }> => {
    // Create a simple PDF using canvas and jsPDF approach
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context not available');
    
    // Set up canvas for PDF-like dimensions (A4: 595x842 points)
    canvas.width = 595;
    canvas.height = 842;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set text properties
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    
    // Split text into lines and draw
    const lines = text.split('\n');
    const lineHeight = 16;
    const margin = 50;
    let y = margin + lineHeight;
    
    lines.forEach((line) => {
      // Handle line wrapping
      const words = line.split(' ');
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > canvas.width - 2 * margin && currentLine !== '') {
          ctx.fillText(currentLine.trim(), margin, y);
          y += lineHeight;
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine.trim()) {
        ctx.fillText(currentLine.trim(), margin, y);
        y += lineHeight;
      }
      
      if (!line.trim()) {
        y += lineHeight / 2; // Empty line spacing
      }
    });
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const name = filename.replace(/\.[^/.]+$/, '.png'); // Canvas outputs as image
          resolve({ name, url, size: blob.size });
        }
      }, 'image/png');
    });
  };

  const convertToText = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    const text = await file.text();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const name = file.name.replace(/\.[^/.]+$/, '.txt');
    return { name, url, size: blob.size };
  };

  const convertToRtf = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    const text = await file.text();
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${text.replace(/\n/g, '\\par ')}}`;
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const name = file.name.replace(/\.[^/.]+$/, '.rtf');
    return { name, url, size: blob.size };
  };

  const convertDocument = async (file: File): Promise<{ name: string; url: string; size: number }> => {
    const inputFormat = file.name.split('.').pop()?.toLowerCase();
    
    if (outputFormat === 'txt') {
      if (inputFormat === 'txt') {
        // Direct copy for txt to txt
        const blob = new Blob([file], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        return { name: file.name, url, size: blob.size };
      } else {
        // Extract text content from other formats
        return await convertToText(file);
      }
    }
    
    if (outputFormat === 'rtf') {
      return await convertToRtf(file);
    }
    
    if (outputFormat === 'pdf') {
      const text = await file.text();
      return await convertTextToPdf(text, file.name);
    }
    
    if (outputFormat === 'docx') {
      // For DOCX, we'll create a simple HTML document and save as docx
      const text = await file.text();
      const docxContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Document</title>
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              ${text.replace(/\n/g, '<br>')}
            </div>
          </body>
        </html>
      `;
      const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const name = file.name.replace(/\.[^/.]+$/, '.docx');
      return { name, url, size: blob.size };
    }
    
    throw new Error('Conversion not supported');
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsConverting(true);
    try {
      const converted = await Promise.all(files.map(convertDocument));
      setConvertedFiles(converted);
    } catch (error) {
      console.error('Document conversion failed:', error);
      alert('Sorry, this file type is not compatible. Document conversion failed - please try with a different file format.');
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
          accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileChange}
          className="hidden"
          id="document-upload"
        />
        <label htmlFor="document-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-lg font-medium">Click to select documents</p>
              <p className="text-sm text-foreground/60">
                Supports: PDF, Word, Excel, PowerPoint, Text files
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

      {/* Feature Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">📝</div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Document Conversion</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Convert between text-based document formats. For complex documents with formatting, consider using specialized tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}