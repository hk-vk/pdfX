declare module 'qpdf.js' {
  interface EncryptOptions {
    arrayBuffer: ArrayBuffer;
    userPassword: string;
    ownerPassword: string;
    keyLength?: 40 | 128 | 256;
    userProtectionFlag?: number;
    callback: (err: Error | null, encryptedBuffer: ArrayBuffer) => void;
  }

  interface QPDF {
    path: string;
    encrypt: (options: EncryptOptions) => void;
    base64ToArrayBuffer: (base64: string) => ArrayBuffer;
    arrayBufferToBase64: (arrayBuffer: ArrayBuffer) => string;
  }

  const QPDF: QPDF;
  
  export default QPDF;
} 