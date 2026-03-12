import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load .env files
  const env = loadEnv(mode, __dirname, 'ID_');

  // Build the define map matching the old esbuild ENV__* convention
  // These replace global constants at compile time
  const defines = {
    ENV__ID_PRESETS_CDN_URL: JSON.stringify(env.ID_PRESETS_CDN_URL || null),
    ENV__ID_OCI_CDN_URL: JSON.stringify(env.ID_OCI_CDN_URL || null),
    ENV__ID_NSI_CDN_URL: JSON.stringify(env.ID_NSI_CDN_URL || null),
    ENV__ID_WMF_SITEMATRIX_CDN_URL: JSON.stringify(env.ID_WMF_SITEMATRIX_CDN_URL || null),
    ENV__ID_API_CONNECTION_URL: JSON.stringify(env.ID_API_CONNECTION_URL || null),
    ENV__ID_API_CONNECTION_API_URL: JSON.stringify(env.ID_API_CONNECTION_API_URL || null),
    ENV__ID_API_CONNECTION_CLIENT_ID: JSON.stringify(env.ID_API_CONNECTION_CLIENT_ID || null),
    ENV__ID_API_CONNECTION: JSON.stringify(env.ID_API_CONNECTION || null),
    ENV__ID_TAGINFO_API_URL: JSON.stringify(env.ID_TAGINFO_API_URL || null),
    ENV__ID_NOMINATIM_API_URL: JSON.stringify(env.ID_NOMINATIM_API_URL || null),
    ENV__ID_SHOW_DONATION_MESSAGE: JSON.stringify(env.ID_SHOW_DONATION_MESSAGE || null),
  };

  return {
    // Use relative paths in production so iD can be deployed under any subdirectory
    base: './',

    plugins: [vue()],

    define: defines,

    // Dev server configuration (replaces scripts/server.js)
    server: {
      port: 8080,
      open: false,
      headers: {
        'Cache-Control': 'no-cache',
      },
    },

    // Build configuration (replaces config/esbuild.config.js)
    build: {
      outDir: 'dist',
      sourcemap: true,
      // Keep the dist directory (it has committed static files like locales, images)
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          // Match the old naming convention
          entryFileNames: 'iD.min.js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'iD.css';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },

    // Resolve configuration
    resolve: {
      extensions: ['.js', '.ts', '.json', '.vue'],
    },
  };
});
