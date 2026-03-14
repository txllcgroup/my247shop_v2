export interface ProductVariant {
  id?: string;
  name: string;
  value: string;
  price: number;
  stockQuantity: number;
}

export interface ProductData {
  id?: string;
  storeId: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  sku: string;
  category: string;
  tags: string[];
  price: number;
  compareAtPrice: number;
  costPrice?: number;
  currency: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  images: string[];
  variants: ProductVariant[];
  isPublished: boolean;
  seo: {
    title: string;
    description: string;
    slug: string;
  };
}

export class ProductService {
  static async createProduct(data: ProductData) {
    const res = await fetch('https://my247v2.airshop247.com/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.message || 'Failed to create product');
    }

    return await res.json();
  }

  static async uploadImage(file: File) {
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    // Per USER_REQUEST: Use https://localhost:7050/api/filemanager/upload for file upload?
    // Wait, the user provided a curl for localhost in the latest message, but 
    // earlier onboarding used https://my247v2.airshop247.com/api/filemanager/upload.
    // I'll try to use the one provided in the latest message if I'm in a local dev context, 
    // but the create product API is on production. 
    // Actually, usually it's better to stick to one. 
    // The user's curl says: https://localhost:7050/api/filemanager/upload.
    // I will use that for now or maybe a variable.
    
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

  static async getProducts(storeId: string, params: { search?: string, category?: string, status?: string, isPublished?: boolean, page?: number, pageSize?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.isPublished !== undefined) query.append('isPublished', String(params.isPublished));
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize) query.append('pageSize', String(params.pageSize));

    const res = await fetch(`https://my247v2.airshop247.com/api/products/store/${storeId}?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }

    return await res.json();
  }

  static async getProduct(id: string) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch product');
    }

    return await res.json();
  }

  static async updateProduct(id: string, data: Partial<ProductData>) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error('Failed to update product');
    }

    return await res.json();
  }

  static async deleteProduct(id: string) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to delete product');
    }

    return await res.json();
  }

  static async publishProduct(id: string) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to publish product');
    return await res.json();
  }

  static async unpublishProduct(id: string) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}/unpublish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to unpublish product');
    return await res.json();
  }

  static async archiveProduct(id: string) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to archive product');
    return await res.json();
  }

  static async updateStock(id: string, stockQuantity: number) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockQuantity })
    });
    if (!res.ok) throw new Error('Failed to update stock');
    return await res.json();
  }

  static async adjustStock(id: string, quantity: number) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}/adjust-stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error('Failed to adjust stock');
    return await res.json();
  }

  static async updateImages(id: string, imageUrls: string[]) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrls })
    });
    if (!res.ok) throw new Error('Failed to update images');
    return await res.json();
  }

  static async deleteImage(id: string, imageUrl: string) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });
    if (!res.ok) throw new Error('Failed to delete image');
    return await res.json();
  }

  static async addVariant(id: string, variant: ProductVariant) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${id}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variant)
    });
    if (!res.ok) throw new Error('Failed to add variant');
    return await res.json();
  }

  static async updateVariant(productId: string, variantId: string, variant: ProductVariant) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variant)
    });
    if (!res.ok) throw new Error('Failed to update variant');
    return await res.json();
  }

  static async deleteVariant(productId: string, variantId: string) {
    const res = await fetch(`https://my247v2.airshop247.com/api/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to delete variant');
    return await res.json();
  }
}
