declare module 'compactor' {
  interface CompactorFileInput {
    bytes: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }

  interface CompactorFileOutput {
    bytes: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }

  interface CompactorOptions {
    pageScale?: number;
    pageQuality?: number;
  }

  export function compressFile(
    fileInput: CompactorFileInput,
    callback: (result: CompactorFileOutput | null) => void,
    options?: CompactorOptions
  ): void;
} 