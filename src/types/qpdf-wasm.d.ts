declare module '@neslinesli93/qpdf-wasm' {
  export interface EmscriptenModuleOptions {
    locateFile?: (path: string) => string;
    noInitialRun?: boolean;
    preRun?: ((module: EmscriptenModule) => void)[];
    onRuntimeInitialized?: () => void;
  }

  export interface EmscriptenFS {
    mkdir(path: string): void;
    writeFile(path: string, data: Uint8Array): void;
    readFile(path: string): Uint8Array;
    unlink(path: string): void;
  }

  export interface EmscriptenModule {
    FS: EmscriptenFS;
    callMain(args: string[]): number;
  }

  function createModule(options?: EmscriptenModuleOptions): Promise<EmscriptenModule>;
  export default createModule;
} 