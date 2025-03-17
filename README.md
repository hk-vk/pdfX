# PDF Toolkit

A fully client-side and offline web application that provides a comprehensive set of PDF manipulation tools. Built with React, TypeScript, and Material-UI, this application performs all operations entirely in the browser without any server interaction.

## Features

- **Merge PDFs**: Combine multiple PDF files into a single PDF document
- **Split PDFs**: Split a PDF into multiple files based on page ranges
- **Compress PDFs**: Reduce PDF file size by optimizing embedded images
- **Convert PDF to Images**: Convert PDF pages to PNG or JPEG images

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pdf-toolkit.git
   cd pdf-toolkit
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Build for production:
   ```bash
   pnpm build
   ```

## Technical Details

### Libraries Used

- **pdf-lib**: Core PDF manipulation (creating, modifying, merging, splitting)
- **PDF.js**: PDF rendering and content extraction
- **Compressor.js**: Image compression
- **FileSaver.js**: Saving generated files
- **JSZip**: Bundling multiple output files
- **Material-UI**: UI components and styling
- **React**: UI framework
- **TypeScript**: Type safety and better developer experience

### Architecture

The application is structured as a single-page application with modular components for each PDF tool:

- `PDFMerger`: Handles combining multiple PDFs
- `PDFSplitter`: Manages PDF splitting functionality
- `PDFCompressor`: Handles PDF compression
- `PDFToImages`: Converts PDF pages to images

### Performance Considerations

- All processing is done client-side using Web Workers where available
- Large files are processed in chunks to maintain responsiveness
- Progress indicators for all operations
- Efficient memory management for large PDF files

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [pdf-lib](https://github.com/Hopding/pdf-lib)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Material-UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
