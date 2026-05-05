import ApiClient from '@/lib/apiClient';

export interface BillingWallet {
    id: string;
    storeId: string;
    walletType: string;
    balanceCredits: number;
    currency: string;
    totalFundedAmount: number;
    totalCreditsPurchased: number;
    totalCreditsConsumed: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BillingTransaction {
    id: string;
    storeId: string;
    billingWalletId: string;
    type: 'Debit' | 'Funding';
    amount: number;
    currency: string;
    credits: number;
    balanceBefore: number;
    balanceAfter: number;
    reference: string;
    description: string;
    status: string;
    metadata: any;
    createdAt: string;
}

export interface BillingAnalytics {
    currentBalance: number;
    totalCreditsFunded: number;
    totalCreditsConsumed: number;
    totalDebitTransactions: number;
    totalFundingTransactions: number;
    creditsConsumedToday: number;
    creditsConsumedThisWeek: number;
    creditsConsumedThisMonth: number;
    fundingVolumeByCurrency: Record<string, number>;
    recentTransactions: BillingTransaction[];
}

export interface BillingTransactionsResponse {
    items: BillingTransaction[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export class BillingService {
    static async getWallet(): Promise<BillingWallet> {
        return ApiClient.get('/Billing/wallet');
    }

    static async fund(data: { amount: number; currency: string; reference: string; description: string; credits?: number }): Promise<{ message: string; balance: number }> {
        return ApiClient.post('/Billing/fund', data);
    }

    static async getAnalytics(): Promise<BillingAnalytics> {
        return ApiClient.get('/Billing/analytics');
    }

    static async getTransactions(page = 1, pageSize = 20): Promise<BillingTransactionsResponse> {
        return ApiClient.get(`/Billing/transactions?page=${page}&pageSize=${pageSize}`);
    }
}
