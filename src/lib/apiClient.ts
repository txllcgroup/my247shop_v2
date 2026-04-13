const BASE_URL = 'https://my247v2.airshop247.com/api';

class ApiClient {
  private static storeId: string | null = null;

  static setStoreId(id: string) {
    this.storeId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeStoreId', id);
    }
  }

  private static getHeaders(options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Priority for X-Store-ID:
      // 1. Explicitly set storeId (useful for storefront)
      // 2. localStorage 'storeId' (used in dashboard)
      // 3. localStorage 'activeStoreId' (set via setStoreId)
      const id = this.storeId || localStorage.getItem('storeId') || localStorage.getItem('activeStoreId');
      if (id) {
        headers['X-Store-ID'] = id;
      }
    }

    return {
      ...headers,
      ...(options.headers as Record<string, string>),
    };
  }

  static async request(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    // Determine headers
    const customHeaders = (options.headers as Record<string, string>) || {};
    const defaultHeaders = this.getHeaders(options);
    
    // If body is FormData, we MUST NOT set Content-Type: application/json
    // and we MUST NOT stringify the body. The browser will set the correct
    // multipart/form-data with the boundary.
    const isFormData = options.body instanceof FormData;
    
    if (isFormData) {
      delete defaultHeaders['Content-Type'];
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  static put(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static patch(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export default ApiClient;
