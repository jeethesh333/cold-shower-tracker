import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Validate environment variables
const validateEnv = () => {
  const required = ['VITE_GEMINI_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Required environment variables are missing:', missing.join(', '));
    console.error('Please check your .env file or deployment environment variables.');
    process.exit(1);
  }
};

// Call validation during build
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === 'development' ? basicSsl() : null],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3002,
    strictPort: true,
  },
}))
