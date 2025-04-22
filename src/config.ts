export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Gemini API key is not set. Chat assistant functionality will be limited.');
}

// Validate API key format
export const isValidApiKey = (key: string): boolean => {
  return typeof key === 'string' && key.length > 0;
}; 