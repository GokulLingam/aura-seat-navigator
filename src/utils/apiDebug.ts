// API Debug Utility
export const apiDebug = {
  log: (message: string, data?: any) => {
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true') {
      console.log(`[API Debug] ${message}`, data);
    }
  },

  logRequest: (url: string, options: RequestInit) => {
    apiDebug.log('Request:', {
      url,
      method: options.method,
      headers: options.headers,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    });
  },

  logResponse: (response: Response, data: any) => {
    apiDebug.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    });
  },

  logError: (error: any, context?: string) => {
    console.error(`[API Error] ${context || 'Request failed'}:`, error);
  },
}; 