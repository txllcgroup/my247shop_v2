const BASE_URL = 'https://my247v2.airshop247.com/api';

export interface TopProduct {
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
}

export interface AnalyticsOrder {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    placedAt: string;
}

export interface AnalyticsTransaction {
    transactionId: string;
    reference: string;
    category: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
}

export interface AnalyticsData {
    storeId: string;
    currency: string;
    totalRevenue: number;
    pendingRevenue: number;
    settledBalance: number;
    pendingBalance: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    fulfilledOrders: number;
    cancelledOrders: number;
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    publishedProducts: number;
    lowStockProducts: number;
    averageOrderValue: number;
    topProducts: TopProduct[];
    recentOrders: AnalyticsOrder[];
    recentTransactions: AnalyticsTransaction[];
}

export interface AnalyticsResponse {
    success: boolean;
    data: AnalyticsData;
}

export class AnalyticsService {
    private static getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    static async getAnalytics(storeId: string): Promise<AnalyticsResponse> {
        const response = await fetch(`${BASE_URL}/analytics/store/${storeId}`, {
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }
        return response.json();
    }
}
