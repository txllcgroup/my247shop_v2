import ApiClient from '@/lib/apiClient';

export interface POSCartItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: string;
}

export interface POSOrderPayload {
  storeId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: POSCartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentReference?: string;
  note?: string;
}

export class POSService {
  static async createPOSOrder(payload: POSOrderPayload) {
    const noteText = [
      'POS Sale',
      payload.customerName ? `Customer: ${payload.customerName}` : null,
      payload.paymentReference ? `Ref: ${payload.paymentReference}` : null,
      payload.note || null,
    ]
      .filter(Boolean)
      .join(' | ');

    const orderData = {
      storeId: payload.storeId,
      customerId: '',
      items: payload.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku || '',
        imageUrl: item.imageUrl || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        variant: item.variant || '',
      })),
      subtotal: payload.subtotal,
      discountAmount: payload.discountAmount,
      taxAmount: payload.taxAmount || 0,
      shippingAmount: 0,
      totalAmount: payload.totalAmount,
      currency: payload.currency || 'NGN',
      status: 'fulfilled',
      paymentStatus: 'paid',
      paymentMethod: payload.paymentMethod,
      shippingAddress: {
        addressLine1: 'Walk-in (POS)',
        addressLine2: null,
        city: 'In-Store',
        state: 'In-Store',
        country: 'In-Store',
        postalCode: '000000',
      },
      customerEmail:
        payload.customerEmail || `walkin-${Date.now()}@pos.local`,
      customerPhone: payload.customerPhone || '',
      note: noteText,
    };

    return ApiClient.post('/orders', orderData);
  }
}

