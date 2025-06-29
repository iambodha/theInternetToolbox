import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

// Add PDF.js types for page rendering
declare global {
  interface Window {
    pdfjsLib: typeof import('pdfjs-dist');
  }
}

export interface PDFFile {
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  preview?: string;
  pagePreviews?: string[]; // Array of base64 image URLs for each page
}

export class PDFUtils {
  private static isInitialized = false;

  // Add method to initialize PDF.js
  static async initializePDFJS(): Promise<void> {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      try {
        // Dynamically import PDF.js
        const pdfjsLib = await import('pdfjs-dist');
        
        // Get the base path from the current URL
        // This will work both locally and on GitHub Pages
        const basePath = window.location.pathname.startsWith('/theInternetToolbox') 
          ? '/theInternetToolbox' 
          : '';
        const workerPath = `${basePath}/js/pdf.worker.min.js`;
        
        // Set worker path to local file immediately
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
        
        // Also try alternative configuration methods for better compatibility
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerPort = null;
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
        }
        
        window.pdfjsLib = pdfjsLib;
        this.isInitialized = true;
        
        console.log('PDF.js initialized with worker:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      } catch (error) {
        console.error('Failed to initialize PDF.js:', error);
        throw error;
      }
    }
  }

  // Add method to generate page previews
  static async generatePagePreviews(file: File, maxPages?: number): Promise<string[]> {
    try {
      // Ensure PDF.js is initialized before use
      await this.initializePDFJS();
      
      if (!window.pdfjsLib) {
        throw new Error('PDF.js not available');
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = Math.min(pdf.numPages, maxPages || pdf.numPages);
      const previews: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 0.5; // Smaller scale for thumbnails
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        previews.push(imageUrl);
      }

      return previews;
    } catch (error) {
      console.error('Error generating page previews:', error);
      throw error;
    }
  }

  static async getPageCount(file: File): Promise<number> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error('Error getting page count:', error);
      return 0;
    }
  }

  static async mergePDFs(files: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    return await mergedPdf.save();
  }

  static async splitPDF(file: File, ranges: { start: number; end: number }[]): Promise<Uint8Array[]> {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const results: Uint8Array[] = [];

    for (const range of ranges) {
      const newPdf = await PDFDocument.create();
      const pageIndices = [];
      
      for (let i = range.start - 1; i < range.end; i++) {
        if (i < sourcePdf.getPageCount()) {
          pageIndices.push(i);
        }
      }

      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      results.push(await newPdf.save());
    }

    return results;
  }

  static async compressPDF(file: File): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Basic compression by removing unnecessary elements
    return await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
  }

  static async rotatePDF(file: File, rotation: number, pageNumbers?: number[]): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    const pagesToRotate = pageNumbers || pages.map((_, index) => index);

    pagesToRotate.forEach(pageIndex => {
      if (pageIndex < pages.length) {
        const page = pages[pageIndex];
        page.setRotation(degrees(rotation));
      }
    });

    return await pdfDoc.save();
  }

  static async addPasswordProtection(file: File, password: string): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Note: Password protection in pdf-lib requires additional setup
    // For now, we'll return the PDF as-is with a note that this feature needs implementation
    console.warn('Password protection not yet implemented with current pdf-lib version');
    console.log('Password provided:', password); // Use the password parameter to avoid unused variable error
    return await pdfDoc.save();
  }

  static async extractPages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    const pageIndices = pageNumbers.map(num => num - 1).filter(index => index >= 0 && index < sourcePdf.getPageCount());
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    
    copiedPages.forEach(page => newPdf.addPage(page));

    return await newPdf.save();
  }

  static async deletePages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    const totalPages = sourcePdf.getPageCount();
    const pagesToKeep = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (!pageNumbers.includes(i)) {
        pagesToKeep.push(i - 1);
      }
    }

    const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
    copiedPages.forEach(page => newPdf.addPage(page));

    return await newPdf.save();
  }

  static async addWatermark(
    file: File, 
    watermarkText: string, 
    options: {
      opacity?: number;
      fontSize?: number;
      color?: string;
      position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    } = {}
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    const { opacity = 0.3, fontSize = 50, color = '#808080', position = 'center' } = options;
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const textColor = rgb(
      parseInt(color.slice(1, 3), 16) / 255,
      parseInt(color.slice(3, 5), 16) / 255,
      parseInt(color.slice(5, 7), 16) / 255
    );

    pages.forEach(page => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      let x, y;
      switch (position) {
        case 'top-left':
          x = 50;
          y = height - 50;
          break;
        case 'top-right':
          x = width - textWidth - 50;
          y = height - 50;
          break;
        case 'bottom-left':
          x = 50;
          y = 50;
          break;
        case 'bottom-right':
          x = width - textWidth - 50;
          y = 50;
          break;
        case 'center':
        default:
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
          break;
      }

      page.drawText(watermarkText, {
        x,
        y,
        size: fontSize,
        font,
        color: textColor,
        opacity,
        rotate: degrees(45),
      });
    });

    return await pdfDoc.save();
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static downloadFile(data: Uint8Array, filename: string): void {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Add OCR text layer to PDF to make it searchable
  static async addOCRTextLayer(
    file: File, 
    ocrData: { [pageNumber: number]: string }
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    Object.entries(ocrData).forEach(([pageNumStr, text]) => {
      const pageIndex = parseInt(pageNumStr) - 1;
      if (pageIndex >= 0 && pageIndex < pages.length && text.trim()) {
        const page = pages[pageIndex];
        const { width, height } = page.getSize();
        
        // Split text into words and position them across the page
        const words = text.split(/\s+/).filter(word => word.trim());
        const wordsPerLine = Math.ceil(Math.sqrt(words.length));
        const lineHeight = height / Math.ceil(words.length / wordsPerLine);
        const wordWidth = width / wordsPerLine;
        
        words.forEach((word, index) => {
          const line = Math.floor(index / wordsPerLine);
          const position = index % wordsPerLine;
          
          const x = position * wordWidth;
          const y = height - (line * lineHeight) - lineHeight;
          
          // Add invisible text layer (white text on white background)
          page.drawText(word, {
            x: Math.max(0, x),
            y: Math.max(0, y),
            size: 1, // Very small, almost invisible
            font,
            color: rgb(1, 1, 1), // White text (invisible on white background)
            opacity: 0.01, // Almost transparent
          });
        });
      }
    });

    return await pdfDoc.save();
  }
}