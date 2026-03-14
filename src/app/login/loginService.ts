export interface LoginData {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  profile: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    isEmailVerified: boolean;
    storeId: string;
    storeName: string;
  };
}

export class LoginService {
  static async login(data: LoginData): Promise<LoginResponse> {
    const res = await fetch('https://my247v2.airshop247.com/api/account/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Login failed');
    }

    return await res.json();
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    window.location.href = '/login';
  }
}
