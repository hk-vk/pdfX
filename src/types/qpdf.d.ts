interface EncryptOptions {
  arrayBuffer: ArrayBuffer;
  userPassword: string;
  ownerPassword: string;
  keyLength?: 40 | 128 | 256;
  userProtectionFlag?: number;
  callback: (err: Error | null, encryptedBuffer: ArrayBuffer) => void;
}

interface QPDF {
  path?: string;
  encrypt: (options: EncryptOptions) => void;
  arrayBufferToBase64: (buffer: ArrayBuffer) => string;
  base64ToArrayBuffer: (base64: string) => ArrayBuffer;
}

declare global {
  interface Window {
    QPDF: QPDF;
  }
}

export {}; 