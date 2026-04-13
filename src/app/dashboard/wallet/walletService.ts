import ApiClient from '@/lib/apiClient';

export interface Wallet {
    id: string;
    storeId: string;
    pendingBalance: number;
    settledBalance: number;
    totalEarnings: number;
    totalWithdrawn: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    walletId: string;
    storeId: string;
    orderId: string | null;
    payoutId: string | null;
    type: 'Credit' | 'Debit';
    category: string;
    reference: string;
    description: string;
    amount: number;
    currency: string;
    status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    balanceBefore: number;
    balanceAfter: number;
    metadata: any;
    createdAt: string;
}

export interface BankAccount {
    id: string;
    storeId: string;
    storeName: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionsResponse {
    success: boolean;
    data: {
        items: Transaction[];
        totalCount: number;
        page: number;
        pageSize: number;
    };
}

export interface WalletResponse {
    success: boolean;
    data: Wallet;
}

export interface BankAccountsResponse {
    success: boolean;
    data: BankAccount[];
}

export class WalletService {
    static async getWallet(storeId: string): Promise<WalletResponse> {
        return ApiClient.get(`/wallet/store/${storeId}`);
    }

    static async getTransactions(storeId: string, page = 1, pageSize = 20): Promise<TransactionsResponse> {
        return ApiClient.get(`/transactions/store/${storeId}?type=&category=&status=&search=&page=${page}&pageSize=${pageSize}`);
    }

    static async getBankAccounts(storeId: string): Promise<BankAccount[]> {
        return ApiClient.get(`/bankaccount/store/${storeId}`);
    }

    static async createBankAccount(data: { storeId: string; bankName: string; accountName: string; accountNumber: string }) {
        try {
            return await ApiClient.post('/bankaccount', data);
        } catch (error: any) {
            return { success: false, status: error.message };
        }
    }

    static async updateBankAccount(data: { accountId: string; bankName: string; accountName: string; accountNumber: string }) {
        try {
            return await ApiClient.put('/bankaccount', data);
        } catch (error: any) {
            return { success: false, status: error.message };
        }
    }
}

