/**
 * API client for making requests to the backend
 */

// Always use the production API URL
const API_URL = 'https://api.emagjby.com';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  token?: string;
}

/**
 * Make an API request
 */
async function request<T = Record<string, unknown>>(
  endpoint: string,
  { method = 'GET', headers = {}, body, token }: RequestOptions = {}
): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  
  // Set up timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`Request to ${url} timed out after 10 seconds`);
    controller.abort();
  }, 10000); // 10 second timeout
  
  const config: RequestInit = {
    method,
    headers: requestHeaders,
    signal: controller.signal
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  console.log(`API Request: ${method} ${url}`);
  
  try {
    console.log(`API Request: ${method} ${url}`, { 
      headers: requestHeaders,
      hasBody: !!body
    });
    
    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      console.log(`API Response: ${response.status} for ${url}`);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.log(`Non-JSON response (${contentType}):`, text.substring(0, 100));
          data = text;
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        data = 'Failed to parse response';
      }
      
      if (!response.ok) {
        const errorMessage = typeof data === 'object' && data.error 
          ? data.error 
          : typeof data === 'string' 
            ? data 
            : 'Something went wrong';
        
        console.error('Request failed:', {
          status: response.status,
          errorMessage
        });
        throw new Error(errorMessage);
      }
      
      return data as T;
    } catch (fetchError) {
      // Network errors will be caught here
      console.error('Fetch operation failed:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    // Clear timeout if request failed
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Request aborted due to timeout:', url);
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('Network error detected:', error.message);
        throw new Error('Network connection issue. Please check your internet connection and try again.');
      }
    }
    
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * API client methods
 */
export const api = {
  auth: {
    login: (identifier: string, password: string) => 
      request<{ user: Record<string, any>; session: { access_token: string } }>('/auth/login', { 
        method: 'POST', 
        body: { identifier, password } 
      }),
    register: (username: string, email: string, password: string) => 
      request<{ user: Record<string, any>; session: { access_token: string } }>('/auth/register', { 
        method: 'POST', 
        body: { username, email, password } 
      }),
    profile: (token: string) =>
      request('/auth/profile', { token }),
    updateProfile: (data: Record<string, unknown>, token: string) =>
      request('/auth/profile', { method: 'PUT', body: data, token }),
  },
  
  events: {
    getAll: (token: string) => 
      request('/events', { token }),
    getById: (id: string, token: string) => 
      request(`/events/${id}`, { token }),
  },
  
  bets: {
    place: (eventId: string, team: 'a' | 'b', amount: number, token: string) => 
      request('/bets', { method: 'POST', body: { event_id: eventId, team, amount }, token }),
    getByUser: (token: string) => 
      request('/bets/user', { token }),
  },
  
  user: {
    getProfile: (token: string) => 
      request('/users/profile', { token }),
    updateProfile: (data: Record<string, unknown>, token: string) => 
      request('/users/profile', { method: 'PUT', body: data, token }),
  },
}; 