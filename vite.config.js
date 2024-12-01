import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'three': 'three'
    }
  },
  server: {
    open: true 
  }
});