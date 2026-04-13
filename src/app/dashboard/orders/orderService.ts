import ApiClient from '@/lib/apiClient';

export interface OrderItem {
    productId: string;
    productName: string;
    sku: string | null;
    imageUrl: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variant: string;
}

export interface ShippingAddress {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface Order {
    id: string;
    storeId: string;
    customerId: string;
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string | null;
    shippingAddress: ShippingAddress;
    customerEmail: string;
    customerPhone: string;
    note: string | null;
    placedAt: string;
    updatedAt: string;
}

export interface OrdersResponse {
    success: boolean;
    data: {
        items: Order[];
        totalCount: number;
        page: number;
        pageSize: number;
    };
}

export interface OrderDetailResponse {
    success: boolean;
    data: Order;
}

export interface OrderSummary {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    fulfilledOrders: number;
    cancelledOrders: number;
}

export interface OrderSummaryResponse {
    success: boolean;
    data: OrderSummary;
}

export interface RecentOrdersResponse {
    success: boolean;
    data: Order[];
}

export interface OrderFilters {
    status?: string;
    paymentStatus?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}

export class OrderService {
    static async getOrders(storeId: string, filters: OrderFilters = {}): Promise<OrdersResponse> {
        const queryParams = new URLSearchParams();
        if (filters.status && filters.status !== 'All') queryParams.append('status', filters.status);
        if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
        if (filters.toDate) queryParams.append('toDate', filters.toDate);
        queryParams.append('page', (filters.page || 1).toString());
        queryParams.append('pageSize', (filters.pageSize || 20).toString());

        return ApiClient.get(`/orders/store/${storeId}?${queryParams.toString()}`);
    }

    static async getOrderById(orderId: string): Promise<OrderDetailResponse> {
        return ApiClient.get(`/orders/${orderId}`);
    }

    static async updateOrderStatus(orderId: string, status: string): Promise<OrderDetailResponse> {
        return ApiClient.patch(`/orders/${orderId}/status`, { status });
    }

    static async markOrderAsPaid(orderId: string, paymentData: { paymentMethod: string, reference: string }): Promise<OrderDetailResponse> {
        return ApiClient.patch(`/orders/${orderId}/mark-paid`, paymentData);
    }

    static async cancelOrder(orderId: string): Promise<OrderDetailResponse> {
        return ApiClient.patch(`/orders/${orderId}/cancel`);
    }

    static async getOrderSummary(storeId: string): Promise<OrderSummaryResponse> {
        return ApiClient.get(`/orders/store/${storeId}/summary`);
    }

    static async getRecentOrders(storeId: string, count = 10): Promise<RecentOrdersResponse> {
        return ApiClient.get(`/orders/store/${storeId}/recent?count=${count}`);
    }
}

