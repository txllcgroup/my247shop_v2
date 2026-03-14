export class StorefrontService {
  private static BASE_URL = 'https://my247v2.airshop247.com/api';

  static async getStoreDetails(storeName: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/storefront/store/${storeName}`);
      if (!res.ok) {
        console.error(`Storefront API Error: ${res.status} ${res.statusText} for slug: ${storeName}`);
        throw new Error(`Failed to fetch store details: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
       console.error("StorefrontService.getStoreDetails caught error:", error);
       throw error;
    }
  }

  static async getStoreProducts(storeId: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/storefront/store/${storeId}/products`);
      if (!res.ok) {
        console.error(`Storefront Products API Error: ${res.status} for storeId: ${storeId}`);
        throw new Error(`Failed to fetch store products: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
       console.error("StorefrontService.getStoreProducts caught error:", error);
       throw error;
    }
  }

  static async getProductDetails(productId: string) {
    const res = await fetch(`${this.BASE_URL}/products/${productId}`);
    if (!res.ok) throw new Error('Product not found');
    const data = await res.json();
    return data.success ? data.data : data;
  }

  static async placeOrder(orderData: any) {
    const res = await fetch(`${this.BASE_URL}/storefront/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      console.error(`Order Placement Error: ${res.status}`, data);
      throw new Error(data.message || `Failed to place order (${res.status})`);
    }
    
    // Ensure success is true if res.ok is true
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Order placed successfully'
    };
  }

  static async getCustomerOrders(customerId: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/storefront/customer/${customerId}/orders`);
      if (!res.ok) {
        console.error(`Customer Orders API Error: ${res.status} for customerId: ${customerId}`);
        throw new Error(`Failed to fetch customer orders: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
       console.error("StorefrontService.getCustomerOrders caught error:", error);
       throw error;
    }
  }
}
