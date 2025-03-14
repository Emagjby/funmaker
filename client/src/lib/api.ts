/**
 * API client for making requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, config);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

/**
 * API client methods
 */
export const api = {
  auth: {
    login: (email: string, password: string) => 
      request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (username: string, email: string, password: string) => 
      request('/auth/register', { method: 'POST', body: { username, email, password } }),
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