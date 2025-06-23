'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFUtils, PDFFile } from '@/lib/pdf-utils';

export default function PDFProtector() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf');
    if (!pdfFile) return;

    const pageCount = await PDFUtils.getPageCount(pdfFile);
    setFile({
      file: pdfFile,
      name: pdfFile.name,
      size: pdfFile.size,
      pageCount,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const protectPDF = async () => {
    if (!file || !password || password !== confirmPassword) return;

    setIsProcessing(true);
    try {
      const protectedPDF = await PDFUtils.addPasswordProtection(file.file, password);
      const filename = file.name.replace('.pdf', '_protected.pdf');
      PDFUtils.downloadFile(protectedPDF, filename);
    } catch (error) {
      console.error('Error protecting PDF:', error);
      alert('Error protecting PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const canProtect = file && password.length >= 4 && passwordsMatch;

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-foreground/50 bg-foreground/5'
            : 'border-foreground/20 hover:border-foreground/30'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">🔒</div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop PDF file here' : 'Drag & drop a PDF file here'}
            </p>
            <p className="text-sm text-foreground/60">
              or click to select a file • Add password protection to your PDF
            </p>
          </div>
        </div>
      </div>

      {file && (
        <div className="space-y-6">
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xl">📄</span>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-foreground/60">
                  {file.pageCount} pages • {PDFUtils.formatFileSize(file.size)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Set Password Protection</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (minimum 4 characters)"
                className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50"
                minLength={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 ${
                  confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                }`}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="p-4 bg-foreground/5 rounded-lg">
              <h4 className="font-medium mb-2">Security Features</h4>
              <ul className="text-sm text-foreground/70 space-y-1">
                <li>• Prevents unauthorized opening of the PDF</li>
                <li>• Restricts printing and copying</li>
                <li>• Disables content modification</li>
                <li>• Maintains document accessibility</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={protectPDF}
              disabled={isProcessing || !canProtect}
              className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Protecting...' : 'Protect PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}