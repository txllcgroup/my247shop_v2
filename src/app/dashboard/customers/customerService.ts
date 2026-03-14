export interface CustomerAddress {
  label: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CustomerData {
  id?: string;
  storeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  passwordHash?: string;
  addresses: CustomerAddress[];
  status?: string;
  createdAt?: string;
}

export class CustomerService {
  private static BASE_URL = 'https://my247v2.airshop247.com/api';

  private static getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  static async addCustomer(customer: CustomerData) {
    const res = await fetch(`${this.BASE_URL}/customers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(customer)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add customer');
    }

    return await res.json();
  }

  static async login(credentials: { storeId: string; emailOrPhone: string; password?: string }) {
    const res = await fetch(`${this.BASE_URL}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    return await res.json();
  }

  static async register(data: any) {
    const res = await fetch(`${this.BASE_URL}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    return await res.json();
  }

  static async getCustomers(storeId: string, page = 1, pageSize = 20) {
    const res = await fetch(`${this.BASE_URL}/customers/store/${storeId}?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!res.ok) {
      throw new Error('Failed to fetch customers');
    }

    return await res.json();
  }
}
