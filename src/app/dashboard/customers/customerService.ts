import ApiClient from '@/lib/apiClient';

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
  static async addCustomer(customer: CustomerData) {
    return ApiClient.post('/customers', customer);
  }

  static async login(credentials: { storeId: string; emailOrPhone: string; password?: string }) {
    return ApiClient.post('/customers/login', credentials);
  }

  static async register(data: any) {
    return ApiClient.post('/customers/register', data);
  }

  static async getCustomers(storeId: string, page = 1, pageSize = 20) {
    return ApiClient.get(`/customers/store/${storeId}?page=${page}&pageSize=${pageSize}`);
  }

  static async broadcastMessage(storeId: string, message: string) {
    return ApiClient.post('/customers/broadcast', { storeId, message });
  }
}

