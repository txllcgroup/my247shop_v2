export interface OnboardingData {
  account: { email: string; fullName: string; password: string; phone: string; };
  store: { name: string; businessType: string; country: string; currency: string; theme: string; };
  contact: { supportEmail: string; supportPhone: string; address: { street: string; city: string; state: string; zipCode: string; } };
  payments: { selectedProviders: string[] };
  initialProduct: { name: string; price: number | string; description: string; imageUrls: string[] };
}

export class OnboardingService {
  static async submitOnboarding(data: OnboardingData) {
    const res = await fetch('https://my247v2.airshop247.com/api/account/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Onboarding failed');
    }

    return true;
  }

  static async uploadImage(file: File) {
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    const res = await fetch('https://my247v2.airshop247.com/api/filemanager/upload', {
      method: 'POST',
      body: uploadData,
    });
    
    const data = await res.json();
    if (data.success) {
      return data.fileUrl;
    } else {
      throw new Error('Upload failed');
    }
  }
}
