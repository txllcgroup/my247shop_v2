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
    private static BASE_URL = 'https://my247v2.airshop247.com/api';

    private static getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    static async getOrders(storeId: string, filters: OrderFilters = {}): Promise<OrdersResponse> {
        const queryParams = new URLSearchParams();
        if (filters.status && filters.status !== 'All') queryParams.append('status', filters.status);
        if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
        if (filters.toDate) queryParams.append('toDate', filters.toDate);
        queryParams.append('page', (filters.page || 1).toString());
        queryParams.append('pageSize', (filters.pageSize || 20).toString());

        const res = await fetch(`${OrderService.BASE_URL}/orders/store/${storeId}?${queryParams.toString()}`, {
            method: 'GET',
            headers: OrderService.getHeaders()
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch orders');
        }

        return await res.json();
    }

    static async getOrderById(orderId: string): Promise<OrderDetailResponse> {
        const res = await fetch(`${OrderService.BASE_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: OrderService.getHeaders()
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch order details');
        }

        return await res.json();
    }

    static async updateOrderStatus(orderId: string, status: string): Promise<OrderDetailResponse> {
        const res = await fetch(`${OrderService.BASE_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: OrderService.getHeaders(),
            body: JSON.stringify({ status })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update order status');
        }

        return await res.json();
    }

    static async markOrderAsPaid(orderId: string, paymentData: { paymentMethod: string, reference: string }): Promise<OrderDetailResponse> {
        const res = await fetch(`${OrderService.BASE_URL}/orders/${orderId}/mark-paid`, {
            method: 'PATCH',
            headers: OrderService.getHeaders(),
            body: JSON.stringify(paymentData)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to mark order as paid');
        }

        return await res.json();
    }

    static async cancelOrder(orderId: string): Promise<OrderDetailResponse> {
        const res = await fetch(`${OrderService.BASE_URL}/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: OrderService.getHeaders()
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to cancel order');
        }

        return await res.json();
    }

    static async getOrderSummary(storeId: string): Promise<OrderSummaryResponse> {
        const res = await fetch(`${OrderService.BASE_URL}/orders/store/${storeId}/summary`, {
            method: 'GET',
            headers: OrderService.getHeaders()
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch order summary');
        }

        return await res.json();
    }

    static async getRecentOrders(storeId: string, count = 10): Promise<RecentOrdersResponse> {
        const res = await fetch(`${OrderService.BASE_URL}/orders/store/${storeId}/recent?count=${count}`, {
            method: 'GET',
            headers: OrderService.getHeaders()
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch recent orders');
        }

        return await res.json();
    }
}
