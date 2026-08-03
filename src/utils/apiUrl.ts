const envApiUrl = ((import.meta as any).env?.VITE_API_URL as string || '').trim().replace(/\/$/, '');

// Ignore dummy placeholders, Google Apps Script macros, or external default URLs so relative calls work seamlessly
const isPlaceholder = !envApiUrl || 
  envApiUrl.includes('tu-backend') || 
  envApiUrl.includes('onrender.co') || 
  envApiUrl.includes('MY_APP_URL') || 
  envApiUrl.includes('example.com') ||
  envApiUrl.includes('script.google.com');

export const API_URL = isPlaceholder ? '' : envApiUrl;

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Express API routes starting with /api/ must always be called as relative paths
  if (cleanPath.startsWith('/api/') || !API_URL) return cleanPath;
  return `${API_URL}${cleanPath}`;
}

