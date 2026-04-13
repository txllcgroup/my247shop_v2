'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { ProductService, ProductData } from '@/app/dashboard/products/productService';
import { POSService, POSCartItem } from '@/app/dashboard/pos/posService';
import { StorefrontService } from '@/app/store/[slug]/storefrontService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoreDetails {
  id?: string; name?: string; logoUrl?: string; footerMessage?: string;
  phone?: string; email?: string; address?: string; website?: string;
}
interface ReceiptData {
  orderNumber: string; orderId: string; items: POSCartItem[];
  subtotal: number; discountAmount: number; total: number;
  cashTendered: number; change: number; paymentMethod: string;
  customerName: string; customerPhone: string; timestamp: string;
  currency: string; storeName: string; storeDetails: StoreDetails | null;
  verificationUrl: string;
}
interface HeldOrder {
  id: string; savedAt: string; cart: POSCartItem[];
  customerName: string; customerPhone: string; note: string; subtotal: number;
}
type DiscountType = 'flat' | 'percent';
type PaymentMethod = 'cash' | 'card' | 'transfer';
type CalcMode = 'qty' | 'cash' | 'discount';
type InvoiceMode = 'receipt' | 'invoice';
type ProductTab = 'recent' | 'frequent' | 'all' | string;

// ─── localStorage Keys ───────────────────────────────────────────────────────
const LS = {
  HELD: 'pos_held_orders',
  RECENT: 'pos_recent_items',
  DAILY: 'pos_daily_counts',
  LAST_SALE: 'pos_last_sale',
  LAST_DISC: 'pos_last_discount',
  PENDING: 'pos_pending_orders',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (amount: number, currency = 'NGN') => {
  try { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN', minimumFractionDigits: 0 }).format(amount); }
  catch { return `₦${amount.toLocaleString()}`; }
};

const buildShareText = (r: ReceiptData) => {
  const items = r.items.map(i => `  ${i.productName} ×${i.quantity} — ${fmt(i.totalPrice, r.currency)}`).join('\n');
  return `*${r.storeName} — Receipt*\n\n📋 ${r.orderNumber}\n📅 ${new Date(r.timestamp).toLocaleString()}\n${r.customerName ? `👤 ${r.customerName}\n` : ''}\n${items}\n\n${r.discountAmount > 0 ? `🏷️ Discount: -${fmt(r.discountAmount, r.currency)}\n` : ''}*💰 TOTAL: ${fmt(r.total, r.currency)}*\nPaid via: ${r.paymentMethod}\n\n${r.storeDetails?.footerMessage || 'Thank you for shopping with us!'}\n\n🔗 ${r.verificationUrl}`;
};

const buildPrintHTML = (r: ReceiptData, mode: InvoiceMode): string => {
  const st = r.storeDetails;
  const isInv = mode === 'invoice';
  const docNo = isInv ? `INV-${r.orderNumber}` : r.orderNumber;
  const logo = st?.logoUrl ? `<img src="${st.logoUrl}" style="max-height:56px;max-width:200px;display:block;margin:0 auto 8px;" />` : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(r.verificationUrl)}&size=80x80&color=000000`;
  const rows = r.items.map(i => `<tr><td>${i.productName}</td><td align="center">×${i.quantity}</td><td align="right">${fmt(i.unitPrice, r.currency)}</td><td align="right">${fmt(i.totalPrice, r.currency)}</td></tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${isInv ? 'Invoice' : 'Receipt'} – ${docNo}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${isInv ? 'Arial,sans-serif' : "'Courier New',monospace"};font-size:${isInv ? 13 : 11}px;color:#000;padding:${isInv ? 24 : 12}px;max-width:${isInv ? 600 : 300}px;margin:0 auto}.c{text-align:center}.sm{font-size:10px;color:#555}.dashed{border:none;border-top:1px dashed #000;margin:8px 0}.solid{border:none;border-top:1px solid #000;margin:8px 0}table{width:100%;border-collapse:collapse;font-size:11px}th{font-size:10px;border-bottom:1px solid #000;padding:3px 0}.tot td{font-weight:bold;font-size:${isInv ? 14 : 12}px;border-top:2px solid #000;padding-top:5px}.fr{display:flex;justify-content:space-between;font-size:11px;margin:2px 0}.fr.big{font-weight:bold;font-size:13px;border-top:1px solid #000;padding-top:4px;margin-top:4px}.g{color:#16a34a}.foot{text-align:center;margin-top:10px;font-size:10px;color:#555}${isInv ? '.bill{border:1px solid #ddd;padding:10px;border-radius:4px;margin:10px 0}' : ''}</style></head><body>
${logo}<h1 class="c" style="font-size:${isInv ? 20 : 14}px">${r.storeName}</h1>
<p class="c sm">${isInv ? '<strong>INVOICE</strong>' : 'RECEIPT'} · ${docNo}</p>
${st?.address ? `<p class="c sm">${st.address}</p>` : ''}${st?.phone ? `<p class="c sm">Tel: ${st.phone}</p>` : ''}
<p class="c sm">${new Date(r.timestamp).toLocaleString()}</p>
${isInv && r.customerName ? `<div class="bill"><strong>Bill To:</strong><br>${r.customerName}${r.customerPhone ? '<br>Tel: ' + r.customerPhone : ''}</div>` : (r.customerName ? `<p class="c sm">Customer: ${r.customerName}${r.customerPhone ? ' · ' + r.customerPhone : ''}</p>` : '')}
<hr class="${isInv ? 'solid' : 'dashed'}">
<table><thead><tr><th>Item</th><th align="center">Qty</th><th align="right">Unit</th><th align="right">Total</th></tr></thead><tbody>${rows}</tbody></table>
<hr class="${isInv ? 'solid' : 'dashed'}">
<div class="fr"><span>Subtotal</span><span>${fmt(r.subtotal, r.currency)}</span></div>
${r.discountAmount > 0 ? `<div class="fr g"><span>Discount</span><span>-${fmt(r.discountAmount, r.currency)}</span></div>` : ''}
<div class="fr big"><span>TOTAL</span><span>${fmt(r.total, r.currency)}</span></div>
<div class="fr"><span>Paid via</span><span style="text-transform:capitalize">${r.paymentMethod}</span></div>
${r.paymentMethod === 'cash' && r.cashTendered > 0 ? `<div class="fr"><span>Cash Tendered</span><span>${fmt(r.cashTendered, r.currency)}</span></div><div class="fr" style="font-weight:bold"><span>Change Given</span><span>${fmt(r.change, r.currency)}</span></div>` : ''}
${isInv ? '<p style="font-size:11px;margin-top:10px;">Payment Status: <strong>PAID</strong></p>' : ''}
<div class="c" style="margin:10px 0"><img src="${qrUrl}" width="80" height="80" style="border:1px solid #eee;display:inline-block;" /><br><span class="sm" style="font-size:9px">Scan to verify order</span></div>
<hr class="${isInv ? 'solid' : 'dashed'}">
<p class="foot">${st?.footerMessage || 'Thank you for your business!'}</p>
${st?.website ? `<p class="foot">${st.website}</p>` : ''}
</body></html>`;
};

// ─── Calculator Pad ────────────────────────────────────────────────────────────
function CalcPad({ mode, setMode, targetLabel, input, onKey, onConfirm, onClose }: {
  mode: CalcMode; setMode: (m: CalcMode) => void; targetLabel: string;
  input: string; onKey: (k: string) => void; onConfirm: () => void; onClose: () => void;
}) {
  const keys = ['7','8','9','C','4','5','6','⌫','1','2','3','00','.','0','✓'];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
        <div className="bg-black px-5 py-4">
          <div className="flex gap-2 mb-3">
            {(['qty','cash','discount'] as CalcMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${mode === m ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>{m}</button>
            ))}
          </div>
          <p className="text-gray-400 text-xs truncate">{targetLabel || (mode === 'cash' ? 'Cash Tendered' : mode === 'discount' ? 'Discount Amount' : 'Quantity')}</p>
          <div className="bg-gray-900 rounded-xl px-4 py-3 mt-2 text-right text-3xl font-black text-white font-mono tracking-tight">{input || '0'}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 p-4">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => k === '✓' ? onConfirm() : onKey(k)}
              className={`flex items-center justify-center rounded-2xl font-bold text-base h-14 transition-all active:scale-95 ${
                k === '✓' ? 'col-span-2 bg-black text-white hover:bg-gray-800 text-sm' :
                k === 'C' ? 'bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100' :
                k === '⌫' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                'bg-gray-50 text-black border-2 border-gray-100 hover:bg-gray-100'
              }`}
            >{k === '✓' ? '✓  OK' : k}</button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <button onClick={onClose} className="w-full py-2.5 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:border-gray-400 transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Held Orders Panel ────────────────────────────────────────────────────────
function HeldOrdersPanel({ orders, onResume, onDelete, onClose, fmt: fmtFn }: {
  orders: HeldOrder[]; onResume: (o: HeldOrder) => void;
  onDelete: (id: string) => void; onClose: () => void; fmt: typeof fmt;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Held Orders</h3>
            <p className="text-gray-400 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''} on hold</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300 gap-2">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-medium">No held orders</p>
            </div>
          ) : orders.map(o => (
            <div key={o.id} className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-black transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-sm text-black">{o.customerName || 'Walk-in Customer'}</p>
                  <p className="text-xs text-gray-400">{o.cart.length} item{o.cart.length !== 1 ? 's' : ''} · {new Date(o.savedAt).toLocaleTimeString()}</p>
                </div>
                <span className="font-black text-black text-sm">{fmtFn(o.subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3 truncate">{o.cart.map(i => i.productName).join(', ')}</p>
              <div className="flex gap-2">
                <button onClick={() => onResume(o)} className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">Resume</button>
                <button onClick={() => onDelete(o.id)} className="w-10 h-9 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stock Adjustment Modal ──────────────────────────────────────────────────
function StockModal({ products, onAdjust, onClose }: {
  products: ProductData[];
  onAdjust: (product: ProductData, qty: number, type: 'add' | 'remove') => Promise<void>;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ProductData | null>(null);
  const [adjType, setAdjType] = useState<'add' | 'remove'>('add');
  const [adjQty, setAdjQty] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  const handleConfirm = async () => {
    if (!selected || !adjQty) return;
    setLoading(true);
    await onAdjust(selected, Number(adjQty), adjType);
    setLoading(false);
    setSelected(null); setAdjQty('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-black px-6 py-5 flex items-center justify-between">
          <div><h3 className="text-lg font-bold text-white">Stock Adjustment</h3><p className="text-gray-400 text-sm">Quick ±stock without leaving POS</p></div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          {!selected ? (
            <>
              <input type="text" placeholder="Search product…" value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors" autoFocus />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filtered.map(p => (
                  <button key={p.id} onClick={() => setSelected(p)} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors border-2 border-transparent hover:border-black">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-black truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">Stock: {p.stockQuantity ?? 0}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-black">
                <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                  {selected.images?.[0] ? <img src={selected.images[0]} alt={selected.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-black truncate">{selected.name}</p>
                  <p className="text-xs text-gray-500">Current stock: <strong>{selected.stockQuantity ?? 0}</strong></p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-black transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['add','remove'] as const).map(t => (
                  <button key={t} onClick={() => setAdjType(t)} className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all capitalize ${adjType === t ? (t === 'add' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500') : 'border-gray-200 text-gray-600'}`}>{t === 'add' ? '+ Add Stock' : '− Remove'}</button>
                ))}
              </div>
              <input type="number" placeholder="Quantity" value={adjQty} onChange={e => setAdjQty(e.target.value)} min="1" className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-black transition-colors text-center text-lg" autoFocus />
              <button onClick={handleConfirm} disabled={loading || !adjQty} className="w-full py-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 transition-all">
                {loading ? 'Adjusting…' : `Confirm — ${adjType === 'add' ? '+' : '-'}${adjQty || 0} units`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main POS Page ────────────────────────────────────────────────────────────
export default function POSPage() {

  // ── Core ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductData[]>([]);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [storeDetails, setStoreDetails] = useState<StoreDetails | null>(null);
  const [currency, setCurrency] = useState('NGN');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Search / Tabs ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ProductTab>('all');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({});

  // ── Customer ──────────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCustomer, setShowCustomer] = useState(false);
  const [note, setNote] = useState('');

  // ── Discount ──────────────────────────────────────────────────────────────
  const [discountType, setDiscountType] = useState<DiscountType>('flat');
  const [discountValue, setDiscountValue] = useState<number | ''>('');

  // ── Payment ───────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [paymentRef, setPaymentRef] = useState('');

  // ── Calculator ────────────────────────────────────────────────────────────
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcMode, setCalcMode] = useState<CalcMode>('cash');
  const [calcTarget, setCalcTarget] = useState('');
  const [calcInput, setCalcInput] = useState('0');

  // ── Hold / Resume ─────────────────────────────────────────────────────────
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [showHeld, setShowHeld] = useState(false);

  // ── Receipt ───────────────────────────────────────────────────────────────
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [invoiceMode, setInvoiceMode] = useState<InvoiceMode>('receipt');

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showStock, setShowStock] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  // ── Offline / Sync ────────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const lastAddedRef = useRef<string | null>(null);

  // -- Mobile View State --
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    // Load profile
    try { const p = JSON.parse(localStorage.getItem('profile') || ''); setProfile(p); } catch (_) {}
    // Load held orders
    try { setHeldOrders(JSON.parse(localStorage.getItem(LS.HELD) || '[]')); } catch (_) {}
    // Load recent items
    try { setRecentIds(JSON.parse(localStorage.getItem(LS.RECENT) || '[]')); } catch (_) {}
    // Load daily counts (reset if different day)
    try {
      const raw = JSON.parse(localStorage.getItem(LS.DAILY) || '{}');
      const today = new Date().toDateString();
      if (raw._date !== today) { localStorage.setItem(LS.DAILY, JSON.stringify({ _date: today })); }
      else { setDailyCounts(raw); }
    } catch (_) {}
    // Load pending count
    try { setPendingCount((JSON.parse(localStorage.getItem(LS.PENDING) || '[]')).length); } catch (_) {}
    // Online/offline
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    setIsOnline(navigator.onLine);
    return () => { window.removeEventListener('online', updateOnline); window.removeEventListener('offline', updateOnline); };
  }, []);

  // Load store branding
  useEffect(() => {
    if (!profile?.storeName) return;
    StorefrontService.getStoreDetails(profile.storeName)
      .then((res: any) => setStoreDetails(res?.data ?? res))
      .catch(() => {});
  }, [profile]);

  // Load products
  useEffect(() => {
    if (!profile?.storeId) return;
    ProductService.getProducts(profile.storeId, { isPublished: true, pageSize: 200 })
      .then(res => {
        const items: ProductData[] = res?.data?.items ?? res?.data ?? res?.items ?? [];
        setProducts(items);
        if (items[0]?.currency) setCurrency(items[0].currency);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [profile]);

  // Sync pending orders when back online
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return;
    const sync = async () => {
      setIsSyncing(true);
      const pending: any[] = JSON.parse(localStorage.getItem(LS.PENDING) || '[]');
      const remaining: any[] = [];
      for (const p of pending) {
        try { await POSService.createPOSOrder(p.payload); }
        catch (_) { remaining.push(p); break; }
      }
      localStorage.setItem(LS.PENDING, JSON.stringify(remaining));
      setPendingCount(remaining.length);
      setIsSyncing(false);
    };
    sync();
  }, [isOnline]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (tab === 'recent') {
      const recentSet = new Set(recentIds);
      list = recentIds.map(id => products.find(p => p.id === id)!).filter(Boolean);
    } else if (tab === 'frequent') {
      list = products
        .filter(p => (dailyCounts[p.id!] ?? 0) > 0)
        .sort((a, b) => (dailyCounts[b.id!] ?? 0) - (dailyCounts[a.id!] ?? 0));
    } else if (tab !== 'all') {
      list = products.filter(p => p.category === tab);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
    }
    return list;
  }, [products, tab, search, recentIds, dailyCounts]);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.totalPrice, 0), [cart]);
  const discountAmount = useMemo(() => {
    const val = Number(discountValue) || 0;
    return discountType === 'percent' ? Math.round(subtotal * val / 100) : Math.min(val, subtotal);
  }, [subtotal, discountType, discountValue]);
  const total = Math.max(0, subtotal - discountAmount);
  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const tenderedNum = Number(cashTendered) || 0;
  const changeAmount = Math.max(0, tenderedNum - total);

  // ── Cart Ops ──────────────────────────────────────────────────────────────
  const addToCart = useCallback((product: ProductData) => {
    if ((product.stockQuantity ?? 0) <= 0) return;
    lastAddedRef.current = product.id!;
    setCart(prev => {
      const ex = prev.find(i => i.productId === product.id);
      if (ex) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice } : i);
      return [...prev, { productId: product.id!, productName: product.name, sku: product.sku || '', imageUrl: product.images?.[0] || '', quantity: 1, unitPrice: product.price, totalPrice: product.price, variant: '' }];
    });
    // Track recent + daily
    setRecentIds(prev => {
      const next = [product.id!, ...prev.filter(id => id !== product.id)].slice(0, 20);
      localStorage.setItem(LS.RECENT, JSON.stringify(next));
      return next;
    });
    setDailyCounts(prev => {
      const next = { ...prev, [product.id!]: (prev[product.id!] || 0) + 1 };
      const stored = { ...next, _date: new Date().toDateString() };
      localStorage.setItem(LS.DAILY, JSON.stringify(stored));
      return next;
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity + delta), totalPrice: Math.max(0, i.quantity + delta) * i.unitPrice } : i).filter(i => i.quantity > 0));
  }, []);

  const setItemQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.productId !== productId)); return; }
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty, totalPrice: qty * i.unitPrice } : i));
  }, []);

  const removeItem = useCallback((productId: string) => setCart(prev => prev.filter(i => i.productId !== productId)), []);

  const clearCart = useCallback(() => {
    setCart([]); setDiscountValue(''); setDiscountType('flat');
    setPaymentMethod('cash'); setCashTendered(''); setPaymentRef('');
    setCustomerName(''); setCustomerPhone(''); setNote(''); setShowCustomer(false);
    lastAddedRef.current = null;
  }, []);

  // ── Quick Actions ─────────────────────────────────────────────────────────
  const voidLastItem = () => {
    if (lastAddedRef.current) removeItem(lastAddedRef.current);
    else if (cart.length > 0) removeItem(cart[cart.length - 1].productId);
  };

  const repeatLastSale = () => {
    try {
      const last = JSON.parse(localStorage.getItem(LS.LAST_SALE) || '');
      if (last?.cart) { setCart(last.cart); setCustomerName(last.customerName || ''); setCustomerPhone(last.customerPhone || ''); }
    } catch (_) {}
  };

  const holdOrder = () => {
    if (cart.length === 0) return;
    const held: HeldOrder = { id: `hold-${Date.now()}`, savedAt: new Date().toISOString(), cart: [...cart], customerName, customerPhone, note, subtotal };
    const next = [...heldOrders, held];
    setHeldOrders(next);
    localStorage.setItem(LS.HELD, JSON.stringify(next));
    clearCart();
  };

  const resumeOrder = (o: HeldOrder) => {
    if (cart.length > 0 && !confirm('Replace current cart with held order?')) return;
    setCart(o.cart); setCustomerName(o.customerName); setCustomerPhone(o.customerPhone); setNote(o.note);
    const next = heldOrders.filter(h => h.id !== o.id);
    setHeldOrders(next);
    localStorage.setItem(LS.HELD, JSON.stringify(next));
    setShowHeld(false);
  };

  const deleteHeld = (id: string) => {
    const next = heldOrders.filter(h => h.id !== id);
    setHeldOrders(next);
    localStorage.setItem(LS.HELD, JSON.stringify(next));
  };

  // ── Calculator ────────────────────────────────────────────────────────────
  const openCalc = (mode: CalcMode, target = '') => {
    setCalcMode(mode); setCalcTarget(target); setCalcInput('0'); setCalcOpen(true);
  };

  const calcKey = (k: string) => {
    setCalcInput(prev => {
      if (k === 'C') return '0';
      if (k === '⌫') return prev.length > 1 ? prev.slice(0, -1) : '0';
      if (k === '.' && prev.includes('.')) return prev;
      if (k === '00') return prev === '0' ? '0' : prev + '00';
      if (prev === '0' && k !== '.') return k;
      return prev + k;
    });
  };

  const calcConfirm = () => {
    const val = parseFloat(calcInput) || 0;
    if (calcMode === 'cash') setCashTendered(val);
    else if (calcMode === 'discount') { setDiscountValue(val); setDiscountType('flat'); }
    else if (calcMode === 'qty') { setItemQty(calcTarget, Math.max(1, Math.floor(val))); }
    setCalcOpen(false);
  };

  // ── Stock Adjustment ──────────────────────────────────────────────────────
  const handleStockAdjust = async (product: ProductData, qty: number, type: 'add' | 'remove') => {
    const delta = type === 'add' ? qty : -qty;
    await ProductService.adjustStock(product.id!, delta);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockQuantity: (p.stockQuantity ?? 0) + delta } : p));
    setShowStock(false);
  };

  // ── Complete Sale ─────────────────────────────────────────────────────────
  const completeSale = async () => {
    if (!cart.length) return;
    setIsProcessing(true);
    const payload = {
      storeId: profile?.storeId || '',
      customerName, customerEmail: '', customerPhone,
      items: cart, subtotal, discountAmount, taxAmount: 0,
      totalAmount: total, currency, paymentMethod,
      paymentReference: paymentMethod !== 'cash' ? paymentRef : undefined, note,
    };
    try {
      let orderData: any;
      if (!isOnline) {
        // Queue offline
        const pending: any[] = JSON.parse(localStorage.getItem(LS.PENDING) || '[]');
        pending.push({ id: `offline-${Date.now()}`, timestamp: new Date().toISOString(), payload });
        localStorage.setItem(LS.PENDING, JSON.stringify(pending));
        setPendingCount(pending.length);
        orderData = { orderNumber: `POS-${Date.now()}`, id: `offline-${Date.now()}` };
      } else {
        const res = await POSService.createPOSOrder(payload);
        orderData = res?.data ?? res;
      }
      const orderId = orderData?.id || `pos-${Date.now()}`;
      const orderNumber = orderData?.orderNumber || `POS-${Date.now()}`;
      // Save last sale + last discount
      localStorage.setItem(LS.LAST_SALE, JSON.stringify({ cart: [...cart], customerName, customerPhone }));
      if (discountValue) localStorage.setItem(LS.LAST_DISC, JSON.stringify({ type: discountType, value: discountValue }));
      setReceiptData({
        orderNumber, orderId, items: [...cart], subtotal, discountAmount, total,
        cashTendered: tenderedNum, change: changeAmount, paymentMethod, customerName, customerPhone,
        timestamp: new Date().toISOString(), currency,
        storeName: storeDetails?.name || profile?.storeName || 'My Store',
        storeDetails, verificationUrl: `https://my247.shop/orders/${orderId}`,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to complete sale. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!receiptData) return;
    const w = window.open('', '_blank', 'width=420,height=700');
    if (!w) return;
    w.document.write(buildPrintHTML(receiptData, invoiceMode));
    w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const shareWhatsApp = () => {
    if (!receiptData) return;
    const phone = receiptData.customerPhone?.replace(/[^0-9+]/g, '') || '';
    const text = buildShareText(receiptData);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };
  const shareSMS = () => {
    if (!receiptData) return;
    window.open(`sms:${receiptData.customerPhone}?body=${encodeURIComponent(buildShareText(receiptData))}`, '_blank');
  };
  const copyLink = async () => {
    if (!receiptData) return;
    await navigator.clipboard.writeText(receiptData.verificationUrl);
    alert('Order link copied!');
  };

  const handleNewSale = () => { setReceiptData(null); clearCart(); };

  // ── Apply Last Discount ───────────────────────────────────────────────────
  const applyLastDiscount = () => {
    try {
      const ld = JSON.parse(localStorage.getItem(LS.LAST_DISC) || '');
      if (ld?.value) { setDiscountType(ld.type); setDiscountValue(ld.value); }
    } catch (_) {}
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  const PayIcon = ({ method }: { method: PaymentMethod }) => {
    if (method === 'cash') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    if (method === 'card') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
  };

  const allTabs: { key: ProductTab; label: string }[] = [
    { key: 'recent', label: '⏱ Recent' },
    { key: 'frequent', label: '🔥 Frequent' },
    { key: 'all', label: 'All' },
    ...categories.map(c => ({ key: c, label: c })),
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ═══════════ HEADER ═══════════ */}
      <header className="bg-black text-white px-4 md:px-5 py-3 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs md:text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="w-px h-5 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            {storeDetails?.logoUrl
              ? <img src={storeDetails.logoUrl} alt="store" className="h-5 md:h-6 w-auto object-contain opacity-80" />
              : <span className="text-sm md:text-base font-black tracking-tight">{profile?.storeName || 'MY247 POS'}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className={`flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} ${isSyncing ? 'animate-pulse' : ''}`} />
            <span className="hidden xs:inline">{isSyncing ? 'Syncing…' : isOnline ? 'Online' : `Offline${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`}</span>
            {!isOnline && pendingCount > 0 && <span className="xs:hidden">{pendingCount}</span>}
          </div>

          <div className="hidden sm:flex bg-white/10 rounded-xl p-1 gap-1">
            {(['receipt', 'invoice'] as InvoiceMode[]).map(m => (
              <button key={m} onClick={() => setInvoiceMode(m)} className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${invoiceMode === m ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>{m}</button>
            ))}
          </div>

          <button onClick={() => setShowHeld(true)} className={`relative flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold border transition-colors ${heldOrders.length > 0 ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'border-white/20 text-gray-400 hover:text-white'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="hidden sm:inline">Hold</span>{heldOrders.length > 0 && <span className="w-4 h-4 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">{heldOrders.length}</span>}
          </button>
        </div>
      </header>

      {/* ═══════════ MAIN ═══════════ */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ════════════════════════════
            LEFT — Products
        ════════════════════════════ */}
        <div className={`flex-1 flex flex-col overflow-hidden bg-gray-50 border-r-2 border-gray-200 transition-all ${mobileView === 'cart' ? 'hidden lg:flex' : 'flex'}`}>

          {/* Quick Actions Bar - Big Square Buttons */}
          <div className="bg-white border-b-2 border-gray-200 shrink-0">
             <div className="flex items-center gap-4 px-4 py-5 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {[
                { label: 'Void Last', icon: '⚡', onClick: voidLastItem, color: 'text-gray-700' },
                { label: 'Repeat Sale', icon: '↺', onClick: repeatLastSale, color: 'text-gray-700' },
                { label: 'Hold Cart', icon: '⏸', onClick: holdOrder, color: 'text-gray-700' },
                { label: 'Discount', icon: '🔄', onClick: applyLastDiscount, color: 'text-gray-700' },
                { label: 'Stock Adj', icon: '📦', onClick: () => setShowStock(true), color: 'text-gray-700' },
                { label: 'Clear', icon: '✕', onClick: () => setClearConfirm(true), color: 'text-red-500 border-red-200 hover:bg-red-50' },
              ].map(a => (
                <button 
                  key={a.label} 
                  onClick={a.onClick} 
                  className={`flex flex-col items-center justify-center shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-gray-200 bg-white hover:border-black hover:shadow-lg transition-all active:scale-95 ${a.color}`}
                >
                  <span className="text-3xl md:text-4xl mb-1.5">{a.icon}</span>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-tight text-center leading-tight">{a.label}</span>
                </button>
              ))}
              
              <button 
                onClick={() => openCalc('cash')} 
                className="flex flex-col items-center justify-center shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-black bg-black text-white hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95"
              >
                <span className="text-3xl md:text-4xl mb-1.5">🧮</span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-tight">Calculator</span>
              </button>
            </div>
          </div>

          {/* Search + Tabs */}
          <div className="px-4 pt-3 pb-2 bg-white border-b-2 border-gray-100 shrink-0">
            <div className="relative mb-2.5">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {allTabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${tab === t.key ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden animate-pulse">
                    <div className="bg-gray-100 aspect-square" />
                    <div className="p-3 space-y-2"><div className="h-3 bg-gray-100 rounded-full" /><div className="h-3 bg-gray-100 rounded-full w-2/3" /></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 gap-3 text-gray-300">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <p className="font-semibold text-gray-400 text-sm">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {filteredProducts.map(product => {
                  const inCart = cart.find(i => i.productId === product.id);
                  const outOfStock = (product.stockQuantity ?? 0) <= 0;
                  const lowStock = !outOfStock && product.stockQuantity <= (product.lowStockThreshold ?? 5);
                  return (
                    <button key={product.id} onClick={() => addToCart(product)} disabled={outOfStock}
                      className={`group text-left bg-white rounded-2xl border-2 overflow-hidden transition-all duration-150 ${outOfStock ? 'border-gray-100 opacity-50 cursor-not-allowed' : inCart ? 'border-black shadow-md' : 'border-gray-200 hover:border-black hover:shadow-sm'}`}>
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                        {inCart && <div className="absolute top-2 right-2 bg-black text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">{inCart.quantity}</div>}
                        {outOfStock && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">Out of Stock</span></div>}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-black truncate">{product.name}</p>
                        <div className="flex items-center justify-between gap-1 mt-1">
                          <span className="text-xs font-black text-black">{fmt(product.price, product.currency)}</span>
                          {lowStock && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">Low</span>}
                          {tab === 'frequent' && dailyCounts[product.id!] > 0 && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">×{dailyCounts[product.id!]}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT — Cart & Checkout
        ════════════════════════════ */}
        <div className={`w-full lg:w-[370px] shrink-0 flex flex-col bg-white overflow-hidden transition-all ${mobileView === 'products' ? 'hidden lg:flex' : 'flex'}`}>

          {/* Customer section */}
          <div className="border-b-2 border-gray-100 shrink-0">
            <button onClick={() => setShowCustomer(!showCustomer)} className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className={customerName ? 'text-black font-bold' : ''}>{customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="flex items-center gap-2">
                {customerPhone && <span className="text-xs text-gray-400">{customerPhone}</span>}
                <svg className={`w-4 h-4 transition-transform duration-200 ${showCustomer ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>
            {showCustomer && (
              <div className="px-5 pb-3 space-y-2">
                <input type="text" placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors" />
                <input type="tel" placeholder="Phone number (tap to attach)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors" />
              </div>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300 gap-2">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <p className="text-sm font-medium">Tap products to add</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-black truncate">{item.productName}</p>
                      <p className="text-[11px] text-gray-400">{fmt(item.unitPrice, currency)} each</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(item.productId, -1)} className="w-6 h-6 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-colors text-sm font-bold leading-none">−</button>
                      <button onClick={() => openCalc('qty', item.productId)} className="text-sm font-black text-black w-7 text-center hover:text-gray-600 transition-colors">{item.quantity}</button>
                      <button onClick={() => updateQty(item.productId, 1)} className="w-6 h-6 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-colors text-sm font-bold leading-none">+</button>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-black">{fmt(item.totalPrice, currency)}</p>
                      <button onClick={() => removeItem(item.productId)} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100">
                <input type="text" placeholder="Sale note…" value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-colors text-gray-600 placeholder-gray-400" />
              </div>
            )}
          </div>

          {/* Checkout bottom */}
          {cart.length > 0 && (
            <div className="shrink-0 border-t-2 border-gray-200 bg-white">

              {/* Discount row */}
              <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
                  {(['flat','percent'] as DiscountType[]).map(t => (
                    <button key={t} onClick={() => setDiscountType(t)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${discountType === t ? 'bg-white shadow text-black' : 'text-gray-400'}`}>{t === 'flat' ? '₦' : '%'}</button>
                  ))}
                </div>
                <div className="relative flex-1">
                  <input type="number" placeholder="Discount…" value={discountValue} onChange={e => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))} min="0" max={discountType === 'percent' ? 100 : undefined} className="w-full pl-7 pr-9 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-black transition-colors" />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{discountType === 'flat' ? '₦' : '%'}</span>
                  <button onClick={() => openCalc('discount')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" /></svg>
                  </button>
                </div>
              </div>

              {/* Payment methods */}
              <div className="px-4 pb-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {(['cash','card','transfer'] as PaymentMethod[]).map(pm => (
                    <button key={pm} onClick={() => setPaymentMethod(pm)} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all capitalize ${paymentMethod === pm ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      <PayIcon method={pm} />{pm}
                    </button>
                  ))}
                </div>

                {/* Cash tendered */}
                {paymentMethod === 'cash' && (
                  <div className="mt-2 space-y-1.5">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₦</span>
                      <input type="number" placeholder="Cash tendered" value={cashTendered} onChange={e => setCashTendered(e.target.value === '' ? '' : Number(e.target.value))} min={total} className="w-full pl-8 pr-10 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-black transition-colors" />
                      <button onClick={() => openCalc('cash')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" /></svg>
                      </button>
                    </div>
                    {tenderedNum > 0 && (
                      <div className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold border-2 ${tenderedNum >= total ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                        <span>{tenderedNum >= total ? 'Change Due' : 'Still Owed'}</span>
                        <span>{fmt(tenderedNum >= total ? changeAmount : total - tenderedNum, currency)}</span>
                      </div>
                    )}
                  </div>
                )}
                {paymentMethod !== 'cash' && (
                  <input type="text" placeholder={paymentMethod === 'card' ? 'Card ref / last 4 digits' : 'Transfer reference'} value={paymentRef} onChange={e => setPaymentRef(e.target.value)} className="w-full mt-2 px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors" />
                )}
              </div>

              {/* Summary */}
              <div className="px-4 py-2.5 border-t-2 border-gray-100 space-y-1">
                <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span className="font-semibold text-black">{fmt(subtotal, currency)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-xs text-green-600 font-medium"><span>Discount {discountType === 'percent' && `(${discountValue}%)`}</span><span>−{fmt(discountAmount, currency)}</span></div>}
                <div className="flex justify-between font-black text-black border-t border-gray-100 pt-1.5">
                  <span>Total</span><span className="text-lg">{fmt(total, currency)}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 pb-4 pt-1">
                <button id="pos-charge-btn" onClick={completeSale} disabled={isProcessing || !cart.length} className="w-full py-4 bg-black text-white rounded-2xl text-base font-black hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                  {isProcessing
                    ? <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Processing…</>
                    : <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Charge {fmt(total, currency)}{!isOnline && ' (Offline)'}</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ MODALS ═══════════ */}

      {/* Calculator */}
      {calcOpen && (
        <CalcPad
          mode={calcMode} setMode={setCalcMode}
          targetLabel={calcMode === 'qty' ? `Set quantity for: ${cart.find(i => i.productId === calcTarget)?.productName || ''}` : ''}
          input={calcInput} onKey={calcKey} onConfirm={calcConfirm} onClose={() => setCalcOpen(false)}
        />
      )}

      {/* Held Orders */}
      {showHeld && <HeldOrdersPanel orders={heldOrders} onResume={resumeOrder} onDelete={deleteHeld} onClose={() => setShowHeld(false)} fmt={fmt} />}

      {/* Stock Adjustment */}
      {showStock && <StockModal products={products} onAdjust={handleStockAdjust} onClose={() => setShowStock(false)} />}

      {/* Clear Confirmation */}
      {clearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-7 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-black text-black mb-1">Clear Cart?</h3>
            <p className="text-sm text-gray-500 mb-5">This will remove all {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} from the current sale.</p>
            <div className="flex gap-3">
              <button onClick={() => setClearConfirm(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-gray-400 transition-colors">Cancel</button>
              <button onClick={() => { clearCart(); setClearConfirm(false); }} className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-sm font-black hover:bg-red-600 transition-colors">Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col max-h-[92dvh]">

            {/* Modal header */}
            <div className="bg-black px-7 py-6 text-white text-center shrink-0 rounded-t-3xl">
              {receiptData.storeDetails?.logoUrl
                ? <img src={receiptData.storeDetails.logoUrl} alt={receiptData.storeName} className="h-10 w-auto object-contain mx-auto mb-3 opacity-90" />
                : null}
              <h3 className="text-xl font-black">{receiptData.storeName}</h3>
              <p className="text-gray-400 text-xs font-mono mt-1">{receiptData.orderNumber}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-green-400/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {isOnline ? 'Sale Complete' : 'Saved Offline'}
              </div>
            </div>

            {/* Scrollable receipt */}
            <div className="flex-1 overflow-y-auto px-7 py-5">
              <div className="text-center mb-3">
                <p className="text-xs text-gray-500">{new Date(receiptData.timestamp).toLocaleString()}</p>
                {receiptData.customerName && <p className="text-xs font-bold text-gray-700 mt-0.5">{receiptData.customerName}{receiptData.customerPhone && ` · ${receiptData.customerPhone}`}</p>}
              </div>
              <hr className="border-dashed border-gray-300 mb-3" />
              <div className="space-y-1.5 mb-3">
                {receiptData.items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="flex-1 truncate pr-3 text-gray-700">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                    <span className="font-bold text-black shrink-0">{fmt(item.totalPrice, receiptData.currency)}</span>
                  </div>
                ))}
              </div>
              <hr className="border-dashed border-gray-300 mb-3" />
              <div className="space-y-1 text-sm mb-3">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(receiptData.subtotal, receiptData.currency)}</span></div>
                {receiptData.discountAmount > 0 && <div className="flex justify-between text-green-600 font-medium"><span>Discount</span><span>−{fmt(receiptData.discountAmount, receiptData.currency)}</span></div>}
                <div className="flex justify-between font-black text-black text-base border-t border-gray-100 pt-1.5"><span>TOTAL</span><span>{fmt(receiptData.total, receiptData.currency)}</span></div>
                <div className="flex justify-between text-xs text-gray-500 capitalize"><span>Paid via</span><span className="font-bold">{receiptData.paymentMethod}</span></div>
                {receiptData.paymentMethod === 'cash' && receiptData.cashTendered > 0 && (
                  <div className="flex justify-between text-xs font-bold text-green-700 bg-green-50 rounded-xl px-3 py-2 mt-1"><span>Change Given</span><span>{fmt(receiptData.change, receiptData.currency)}</span></div>
                )}
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 border-t border-dashed border-gray-300">
                <QRCodeSVG value={receiptData.verificationUrl} size={90} level="M" bgColor="#ffffff" fgColor="#000000" />
                <p className="text-[10px] text-gray-400">Scan to verify order</p>
              </div>
              <p className="text-center text-xs text-gray-400 italic mt-2">{receiptData.storeDetails?.footerMessage || 'Thank you for shopping with us!'}</p>
            </div>

            {/* Share row */}
            <div className="px-7 pt-3 pb-2 border-t border-gray-100 shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Share Receipt</p>
              <div className="flex gap-2">
                <button onClick={shareWhatsApp} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </button>
                <button onClick={shareSMS} className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  SMS
                </button>
                <button onClick={copyLink} className="flex-1 py-2 bg-gray-100 text-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Copy
                </button>
              </div>
            </div>

            {/* Print + New Sale */}
            <div className="px-7 pb-5 pt-2 shrink-0 flex gap-3">
              <button onClick={handlePrint} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print {invoiceMode === 'invoice' ? 'Invoice' : 'Receipt'}
              </button>
              <button onClick={handleNewSale} className="flex-1 py-3 bg-black text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden h-20 bg-white border-t-2 border-gray-200 flex items-center px-4 z-40 shrink-0 gap-4">
        <button 
          onClick={() => setMobileView('products')} 
          className={`flex-1 flex flex-col items-center justify-center gap-1.5 rounded-2xl h-14 transition-all ${mobileView === 'products' ? 'text-black font-black bg-gray-100 shadow-sm' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="text-[10px] uppercase font-black tracking-widest">Catalog</span>
        </button>
        <button 
          onClick={() => setMobileView('cart')} 
          className={`flex-1 flex flex-col items-center justify-center gap-1.5 rounded-2xl h-14 relative transition-all ${mobileView === 'cart' ? 'text-black font-black bg-gray-100 shadow-sm' : 'text-gray-400'}`}
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartItemCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[9px] flex items-center justify-center rounded-full ring-2 ring-white font-black">{cartItemCount}</span>}
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest">Cart</span>
        </button>
      </div>
    </div>
  );
}
