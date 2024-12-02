import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'three': 'three'
    }
  },
  server: {
    open: true 
  },
  build: {
    outDir: 'dist',
    assetsDir: './',
  },
  base: '/blender-to-three/',
});