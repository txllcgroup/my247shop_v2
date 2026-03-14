const BASE_URL = 'https://my247v2.airshop247.com/api';

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
    private static getHeaders(contentType = true) {
        const token = localStorage.getItem('token');
        const headers: any = {
            'Authorization': `Bearer ${token}`
        };
        if (contentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    static async getWallet(storeId: string): Promise<WalletResponse> {
        const response = await fetch(`${BASE_URL}/wallet/store/${storeId}`, {
            headers: this.getHeaders(false)
        });
        return response.json();
    }

    static async getTransactions(storeId: string, page = 1, pageSize = 20): Promise<TransactionsResponse> {
        const response = await fetch(`${BASE_URL}/transactions/store/${storeId}?type=&category=&status=&search=&page=${page}&pageSize=${pageSize}`, {
            headers: this.getHeaders(false)
        });
        return response.json();
    }

    static async getBankAccounts(storeId: string): Promise<BankAccount[]> {
        const response = await fetch(`${BASE_URL}/bankaccount/store/${storeId}`, {
            headers: this.getHeaders(false)
        });
        return response.json();
    }

    static async createBankAccount(data: { storeId: string; bankName: string; accountName: string; accountNumber: string }) {
        const response = await fetch(`${BASE_URL}/bankaccount`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        if (!response.ok) return { success: false, status: response.status };
        try {
            return await response.json();
        } catch {
            return { success: true };
        }
    }

    static async updateBankAccount(data: { accountId: string; bankName: string; accountName: string; accountNumber: string }) {
        const response = await fetch(`${BASE_URL}/bankaccount`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        if (!response.ok) return { success: false, status: response.status };
        try {
            return await response.json();
        } catch {
            return { success: true };
        }
    }
}
