'use client';

import { useEffect } from 'react';
import { PDFUtils } from '@/lib/pdf-utils';

export default function PDFInitializer() {
  useEffect(() => {
    // Initialize PDF.js as early as possible
    PDFUtils.initializePDFJS().catch(error => {
      console.error('Failed to initialize PDF.js:', error);
    });
  }, []);

  return null; // This component doesn't render anything
}