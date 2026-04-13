import ApiClient from '@/lib/apiClient';

export class StorefrontService {
  static async getStoreDetails(storeName: string) {
    try {
      const data = await ApiClient.get(`/storefront/store/${storeName}`);
      if (data.success && data.data?.id) {
        ApiClient.setStoreId(data.data.id);
      }
      return data;
    } catch (error) {
       console.error("StorefrontService.getStoreDetails caught error:", error);
       throw error;
    }
  }

  static async getStoreProducts(storeId: string) {
    try {
      // Ensure we have the storeId in the client even if passed manually to the method
      if (storeId) ApiClient.setStoreId(storeId);
      return await ApiClient.get(`/storefront/store/${storeId}/products`);
    } catch (error) {
       console.error("StorefrontService.getStoreProducts caught error:", error);
       throw error;
    }
  }

  static async getProductDetails(productId: string) {
    return ApiClient.get(`/products/${productId}`);
  }

  static async placeOrder(orderData: any) {
    try {
      const data = await ApiClient.post('/storefront/order', orderData);
      
      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Order placed successfully'
      };
    } catch (error: any) {
      console.error(`Order Placement Error:`, error);
      throw error;
    }
  }

  static async getCustomerOrders(customerId: string) {
    try {
      return await ApiClient.get(`/storefront/customer/${customerId}/orders`);
    } catch (error) {
       console.error("StorefrontService.getCustomerOrders caught error:", error);
       throw error;
    }
  }
}

