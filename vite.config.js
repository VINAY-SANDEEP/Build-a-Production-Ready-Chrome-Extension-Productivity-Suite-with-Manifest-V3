import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';

// Custom plugin to copy manifest.json to dist after build
function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      if (!existsSync('dist')) {
        mkdirSync('dist');
      }
      const manifestPath = resolve(__dirname, 'manifest.json');
      const distManifestPath = resolve(__dirname, 'dist/manifest.json');
      if (existsSync(manifestPath)) {
        const manifest = readFileSync(manifestPath, 'utf-8');
        writeFileSync(distManifestPath, manifest);
        console.log('Copied manifest.json to dist/manifest.json');
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        newtab: resolve(__dirname, 'newtab.html'),
        background: resolve(__dirname, 'src/background/background.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
