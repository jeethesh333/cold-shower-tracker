export const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;

if (!COHERE_API_KEY) {
  console.warn('Cohere API key is not set. Chat assistant functionality will be limited.');
}

// Validate API key format
export const isValidApiKey = (key: string): boolean => {
  return typeof key === 'string' && key.length > 0;
}; 