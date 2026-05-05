import ApiClient from '@/lib/apiClient';

export interface StaffData {
  id?: string;
  storeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export class StaffService {
  static async createStaff(staff: StaffData) {
    return ApiClient.post('/staffs', staff);
  }

  static async getStaffByStore(storeId: string, page = 1, pageSize = 20) {
    return ApiClient.get(`/staffs/store/${storeId}?page=${page}&pageSize=${pageSize}`);
  }

  static async getStaffById(id: string) {
    return ApiClient.get(`/staffs/${id}`);
  }

  static async updateStaff(id: string, staff: Partial<StaffData>) {
    return ApiClient.put(`/staffs/${id}`, staff);
  }

  static async deleteStaff(id: string) {
    return ApiClient.delete(`/staffs/${id}`);
  }

  static async toggleStatus(id: string) {
    return ApiClient.patch(`/staffs/${id}/toggle-status`, {});
  }
}
