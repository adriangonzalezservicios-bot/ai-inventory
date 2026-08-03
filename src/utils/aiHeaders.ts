// Helper function to return headers including user's custom Claude API key if present in localStorage
export function getAIHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const savedKey = localStorage.getItem('akari_claude_api_key');
  if (savedKey && savedKey.trim()) {
    headers['x-claude-api-key'] = savedKey.trim();
  }
  
  return headers;
}
