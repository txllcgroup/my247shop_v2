import ApiClient from '@/lib/apiClient';

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
    return ApiClient.post('/products', data);
  }

  static async uploadImage(file: File) {
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    const data = await ApiClient.post('/filemanager/upload', uploadData);
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

    return ApiClient.get(`/products/store/${storeId}?${query.toString()}`);
  }

  static async getProduct(id: string) {
    return ApiClient.get(`/products/${id}`);
  }

  static async updateProduct(id: string, data: Partial<ProductData>) {
    return ApiClient.put(`/products/${id}`, data);
  }

  static async deleteProduct(id: string) {
    return ApiClient.delete(`/products/${id}`);
  }

  static async publishProduct(id: string) {
    return ApiClient.patch(`/products/${id}/publish`);
  }

  static async unpublishProduct(id: string) {
    return ApiClient.patch(`/products/${id}/unpublish`);
  }

  static async archiveProduct(id: string) {
    return ApiClient.patch(`/products/${id}/archive`);
  }

  static async updateStock(id: string, stockQuantity: number) {
    return ApiClient.patch(`/products/${id}/stock`, { stockQuantity });
  }

  static async adjustStock(id: string, quantity: number) {
    return ApiClient.patch(`/products/${id}/adjust-stock`, { quantity });
  }

  static async updateImages(id: string, imageUrls: string[]) {
    return ApiClient.patch(`/products/${id}/images`, { imageUrls });
  }

  static async deleteImage(id: string, imageUrl: string) {
    return ApiClient.request(`/products/${id}/images`, {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl })
    });
  }

  static async addVariant(id: string, variant: ProductVariant) {
    return ApiClient.post(`/products/${id}/variants`, variant);
  }

  static async updateVariant(productId: string, variantId: string, variant: ProductVariant) {
    return ApiClient.put(`/products/${productId}/variants/${variantId}`, variant);
  }

  static async deleteVariant(productId: string, variantId: string) {
    return ApiClient.delete(`/products/${productId}/variants/${variantId}`);
  }

  static async generateProductContent(params: { productName: string, currency: string, storeCategoryHint?: string }) {
    return ApiClient.post('/product-content-ai/generate', params);
  }

  static async optimizeImage(image: File | Blob, description: string) {
    const formData = new FormData();
    formData.append('Image', image);
    formData.append('Description', description);
    
    return ApiClient.post('/image-generation-ai/optimize', formData);
  }
}

