# pdfX - Your All-in-One PDF Toolkit

A modern web application for working with PDF files. Merge, split, compress, and convert PDFs to images - all in your browser with no data sent to servers.

## Features

- PDF Merger: Combine multiple PDFs into a single document
- PDF Splitter: Extract specific pages from a PDF
- PDF Compressor: Reduce PDF file size
- PDF to Images: Convert PDF pages to high-quality PNG images

## Deployment to Cloudflare Pages

### Manual Deployment

1. Build the project:
   ```bash
   npm install
   npm run build
   ```

2. The build output will be in the `dist` directory.

3. Deploy to Cloudflare Pages:
   - Log in to your Cloudflare dashboard
   - Go to Pages > Create a project
   - Connect your GitHub repository or upload the `dist` directory
   - Configure the build settings:
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Deploy!

### GitHub Actions Deployment (Recommended)

This project includes a GitHub Actions workflow for automatic deployment to Cloudflare Pages.

To set it up:

1. In your Cloudflare dashboard, create an API token with the "Edit Cloudflare Pages" permission.

2. In your GitHub repository settings, add the following secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

3. Push to the main branch, and GitHub Actions will automatically deploy to Cloudflare Pages.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technologies Used

- React
- TypeScript
- Vite
- Material UI
- PDF.js
- pdf-lib

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
