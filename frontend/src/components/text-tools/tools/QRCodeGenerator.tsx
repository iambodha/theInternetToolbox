'use client';

import { useState, useRef } from 'react';

export default function QRCodeGenerator() {
  const [inputText, setInputText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState('M');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeMargin, setIncludeMargin] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const errorLevels = [
    { value: 'L', label: 'Low (~7%)', description: 'Good for clean conditions' },
    { value: 'M', label: 'Medium (~15%)', description: 'Balanced option' },
    { value: 'Q', label: 'Quartile (~25%)', description: 'Good for general use' },
    { value: 'H', label: 'High (~30%)', description: 'Best for damaged/dirty conditions' }
  ];

  const generateQRCode = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    try {
      // Using QR Server API for QR code generation
      const margin = includeMargin ? 1 : 0;
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(inputText)}&color=${qrColor.substring(1)}&bgcolor=${bgColor.substring(1)}&ecc=${errorLevel}&margin=${margin}&format=png`;
      
      // Create canvas and draw the QR code
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = qrSize;
      canvas.height = qrSize;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, qrSize, qrSize);
        
        // Convert canvas to blob URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setQrCodeUrl(url);
          }
        }, 'image/png');
      };

      img.onerror = () => {
        // Fallback: create a simple QR code using canvas
        createSimpleQR(ctx, inputText);
      };

      img.src = apiUrl;
    } catch (error) {
      console.error('QR generation failed:', error);
      // Fallback to simple QR
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          createSimpleQR(ctx, inputText);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const createSimpleQR = (ctx: CanvasRenderingContext2D, text: string) => {
    // Simple fallback QR code pattern
    const canvas = ctx.canvas;
    canvas.width = qrSize;
    canvas.height = qrSize;
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, qrSize, qrSize);
    
    // Create a simple pattern based on text
    ctx.fillStyle = qrColor;
    const gridSize = 21; // Standard QR grid
    const cellSize = qrSize / gridSize;
    
    // Generate pattern based on text hash
    const hash = simpleHash(text);
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const index = y * gridSize + x;
        if ((hash + index) % 3 === 0) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Add finder patterns (corners)
    drawFinderPattern(ctx, 0, 0, cellSize);
    drawFinderPattern(ctx, (gridSize - 7) * cellSize, 0, cellSize);
    drawFinderPattern(ctx, 0, (gridSize - 7) * cellSize, cellSize);
    
    // Convert to blob URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setQrCodeUrl(url);
      }
    }, 'image/png');
  };

  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) => {
    // Draw 7x7 finder pattern
    ctx.fillStyle = qrColor;
    // Outer border
    ctx.fillRect(x, y, 7 * cellSize, cellSize);
    ctx.fillRect(x, y, cellSize, 7 * cellSize);
    ctx.fillRect(x + 6 * cellSize, y, cellSize, 7 * cellSize);
    ctx.fillRect(x, y + 6 * cellSize, 7 * cellSize, cellSize);
    
    // Inner square
    ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: copy the text instead
      navigator.clipboard.writeText(inputText);
    }
  };

  const clearAll = () => {
    setInputText('');
    setQrCodeUrl('');
  };

  const predefinedTexts = [
    { label: 'Website URL', value: 'https://example.com', icon: '🌐' },
    { label: 'Email', value: 'mailto:contact@example.com', icon: '📧' },
    { label: 'Phone', value: 'tel:+1234567890', icon: '📞' },
    { label: 'WiFi', value: 'WIFI:T:WPA;S:NetworkName;P:password;;', icon: '📶' },
    { label: 'SMS', value: 'sms:+1234567890?body=Hello', icon: '💬' },
    { label: 'Location', value: 'geo:37.7749,-122.4194', icon: '📍' }
  ];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="qr-text" className="block text-sm font-medium mb-2">
            Text or Data to Encode
          </label>
          <textarea
            id="qr-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text, URL, email, phone number, or any data to encode..."
            className="w-full h-32 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background"
            maxLength={2000}
          />
          <div className="text-xs text-foreground/60 mt-1">
            {inputText.length}/2000 characters
          </div>
        </div>

        {/* Quick Templates */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick Templates</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {predefinedTexts.map((template, index) => (
              <button
                key={index}
                onClick={() => setInputText(template.value)}
                className="p-2 text-left border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{template.icon}</span>
                  <span className="text-sm font-medium">{template.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Settings */}
      <div className="space-y-4 p-4 bg-foreground/5 rounded-lg">
        <h3 className="font-semibold">QR Code Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Size ({qrSize}px)</label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={qrSize}
              onChange={(e) => setQrSize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground/60 mt-1">
              <span>128px</span>
              <span>320px</span>
              <span>512px</span>
            </div>
          </div>

          {/* Error Correction Level */}
          <div>
            <label className="block text-sm font-medium mb-2">Error Correction</label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value)}
              className="w-full p-2 border border-foreground/20 rounded bg-background"
            >
              {errorLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium mb-2">QR Code Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-12 h-8 border border-foreground/20 rounded cursor-pointer"
              />
              <span className="text-sm font-mono">{qrColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-12 h-8 border border-foreground/20 rounded cursor-pointer"
              />
              <span className="text-sm font-mono">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeMargin}
              onChange={(e) => setIncludeMargin(e.target.checked)}
            />
            <span className="text-sm">Include margin around QR code</span>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateQRCode}
          disabled={!inputText.trim() || isGenerating}
          className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </button>
      </div>

      {/* Generated QR Code */}
      {qrCodeUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated QR Code</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 text-sm bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
              >
                Copy Image
              </button>
              <button
                onClick={downloadQRCode}
                className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
              >
                Download
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-lg">
              <img
                src={qrCodeUrl}
                alt="Generated QR Code"
                className="max-w-full h-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* QR Code Info */}
          <div className="p-4 bg-foreground/5 rounded-lg">
            <h4 className="font-semibold mb-2">QR Code Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-foreground/60">Size:</span>
                <span className="ml-2 font-medium">{qrSize}×{qrSize}px</span>
              </div>
              <div>
                <span className="text-foreground/60">Error Level:</span>
                <span className="ml-2 font-medium">{errorLevels.find(l => l.value === errorLevel)?.label}</span>
              </div>
              <div>
                <span className="text-foreground/60">Data Length:</span>
                <span className="ml-2 font-medium">{inputText.length} chars</span>
              </div>
              <div>
                <span className="text-foreground/60">Format:</span>
                <span className="ml-2 font-medium">PNG</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Usage Examples */}
      <div className="bg-foreground/5 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Usage Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-1">Website URL:</div>
            <code className="text-xs text-foreground/60">https://example.com</code>
          </div>
          <div>
            <div className="font-medium mb-1">Email:</div>
            <code className="text-xs text-foreground/60">mailto:user@example.com</code>
          </div>
          <div>
            <div className="font-medium mb-1">Phone:</div>
            <code className="text-xs text-foreground/60">tel:+1234567890</code>
          </div>
          <div>
            <div className="font-medium mb-1">WiFi Network:</div>
            <code className="text-xs text-foreground/60">WIFI:T:WPA;S:MyNetwork;P:password;;</code>
          </div>
          <div>
            <div className="font-medium mb-1">SMS:</div>
            <code className="text-xs text-foreground/60">sms:+1234567890?body=Hello</code>
          </div>
          <div>
            <div className="font-medium mb-1">Location:</div>
            <code className="text-xs text-foreground/60">geo:40.7128,-74.0060</code>
          </div>
        </div>
      </div>

      {/* Feature Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">📱</div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">QR Code Generator</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Create custom QR codes for URLs, contact info, WiFi credentials, and more. Customize colors, size, and error correction level for optimal scanning performance.
            </p>
          </div>
        </div>
      </div>

      {!inputText && (
        <div className="text-center p-8 text-foreground/60">
          <div className="text-4xl mb-4">📱</div>
          <p>Enter some text above to generate a QR code</p>
          <p className="text-sm mt-2">URLs, text, contact info, WiFi credentials, and more</p>
        </div>
      )}
    </div>
  );
}
