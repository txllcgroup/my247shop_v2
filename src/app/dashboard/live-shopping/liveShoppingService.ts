import ApiClient from '@/lib/apiClient';

export interface LiveSession {
    id: string;
    storeId: string;
    title: string;
    description?: string;
    coverImageUrl?: string;
    status: 'Scheduled' | 'Live' | 'Ended';
    featuredProductId?: string;
    viewerCount: number;
    startedAt?: string;
    endedAt?: string;
    createdAt: string;
}

export class LiveShoppingService {
    static async getSessions(): Promise<LiveSession[]> {
        return ApiClient.get('/Live/sessions');
    }

    static async createSession(data: Partial<LiveSession>): Promise<LiveSession> {
        return ApiClient.post('/Live/sessions', data);
    }

    static async updateStatus(id: string, status: string): Promise<LiveSession> {
        return ApiClient.patch(`/Live/sessions/${id}/status`, status);
    }

    static async featureProduct(id: string, productId: string): Promise<LiveSession> {
        return ApiClient.patch(`/Live/sessions/${id}/feature-product`, productId);
    }
}
