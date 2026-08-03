const envApiUrl = ((import.meta as any).env?.VITE_API_URL as string || '').trim().replace(/\/$/, '');

// Filter out known generic placeholders or invalid urls
const isPlaceholder = !envApiUrl || 
  envApiUrl.includes('tu-backend') || 
  envApiUrl.includes('onrender.co') || 
  envApiUrl.includes('MY_APP_URL') || 
  envApiUrl.includes('example.com') ||
  envApiUrl.includes('script.google.com');

export const API_URL = isPlaceholder ? '' : envApiUrl;

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If API_URL is defined (e.g. https://mhc.com.ar or Cloud Run service URL) and doesn't match current origin, prepend it
  if (API_URL && typeof window !== 'undefined' && !API_URL.includes(window.location.host)) {
    return `${API_URL}${cleanPath}`;
  }

  // Standard relative call when running on same domain / Cloud Run container / Cloudflare proxy
  return cleanPath;
}

