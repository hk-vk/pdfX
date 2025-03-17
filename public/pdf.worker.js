// PDF.js worker shim - redirects to unpkg CDN
self.importScripts(`https://unpkg.com/pdfjs-dist@${self.pdfjsVersion || '5.0.375'}/build/pdf.worker.min.js`); 