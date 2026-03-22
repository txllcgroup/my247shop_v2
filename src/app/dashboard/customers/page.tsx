"use client";
import React, { useState, useEffect } from 'react';
import { CustomerService, CustomerData, CustomerAddress } from './customerService';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingInput = ({ label, id, value, onChange, type = "text", required = false }: any) => (
  <div className="relative group w-full text-black">
    <input
      type={type}
      id={id}
      required={required}
      value={value}
      onChange={onChange}
      className={`peer w-full bg-white border-2 border-gray-200 rounded-2xl px-5 pt-7 pb-3 text-base font-bold text-black outline-none transition-all focus:border-black placeholder-transparent`}
      placeholder={label}
    />
    <label
      htmlFor={id}
      className="absolute left-5 top-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-black pointer-events-none"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  </div>
);

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState("");
  const [currency, setCurrency] = useState('NGN');

  const [formData, setFormData] = useState<CustomerData>({
    storeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    addresses: []
  });

  const [address, setAddress] = useState<CustomerAddress>({
    label: "Home",
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
    isDefault: true
  });

  const [showAddress, setShowAddress] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const storedStoreId = localStorage.getItem('storeId');
      if (storedStoreId) {
        setStoreId(storedStoreId);
        setFormData(prev => ({ ...prev, storeId: storedStoreId }));
        
        const storedCountry = localStorage.getItem('country');
        if (storedCountry) {
          setCurrency(storedCountry === 'Nigeria' ? 'NGN' : 'USD');
        }
        
        try {
          const res = await CustomerService.getCustomers(storedStoreId);
          if (res.success) {
            setCustomers(res.data?.items || []);
          } else if (Array.isArray(res)) {
            setCustomers(res);
          }
        } catch (err) {
          console.error("Failed to fetch customers", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        addresses: showAddress ? [address] : []
      };
      
      const res = await CustomerService.addCustomer(payload);
      if (res.success || res.id) {
        setSuccess(true);
        // Refresh customer list
        const updated = await CustomerService.getCustomers(storeId);
        setCustomers(updated.data?.items || updated.data || updated || []);
        
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess(false);
          setFormData({
            storeId,
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            addresses: []
          });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-gray-200 pb-10">
          <div className="w-1/3 h-12 bg-gray-100 rounded-2xl animate-pulse"/>
          <div className="w-40 h-12 bg-gray-100 rounded-2xl animate-pulse"/>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-50 rounded-[2rem] border-2 border-gray-100 animate-pulse"/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 pt-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-gray-200 pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-2">Customers</h1>
          <p className="text-gray-500 font-medium text-base md:text-xl">Manage your customer database and address books.</p>
        </div>
        <div className="flex gap-4 flex-col sm:flex-row">
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl border-2 border-black text-lg font-bold hover:bg-gray-800 transition-all shadow-sm">
             Add Customer
          </button>
        </div>
      </div>
      
      {customers.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-sm p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-10 border-2 border-gray-100">
             <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
          <h3 className="text-3xl font-bold text-black mb-4">No customers found</h3>
          <p className="text-gray-400 font-medium max-w-sm mb-10 text-xl">Start by adding your first customer manually or through an order.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-bold text-xl hover:underline underline-offset-[12px] decoration-4 transition-all whitespace-nowrap">
             Add your first customer
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-50">
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Joined</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spent</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {customers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="group hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-6" onClick={() => setSelectedCustomer(customer)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-black font-bold text-lg">
                        {customer.firstName?.[0] || '?'}{customer.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-bold text-black text-lg">{customer.firstName} {customer.lastName}</p>
                        <p className="text-gray-400 text-sm font-medium">Customer ID: {customer.id?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6" onClick={() => setSelectedCustomer(customer)}>
                    <p className="font-bold text-black">{customer.email}</p>
                    <p className="text-gray-400 font-bold text-sm tracking-tight">{customer.phoneNumber}</p>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell" onClick={() => setSelectedCustomer(customer)}>
                    <p className="text-gray-500 font-bold">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Mar 14, 2026'}</p>
                  </td>
                  <td className="px-8 py-6" onClick={() => setSelectedCustomer(customer)}>
                    <div className="flex items-center gap-2">
                       <span className="text-black font-bold text-lg">{currency} {(customer as any).totalSpent?.toLocaleString() || '0'}</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                       <span className="text-gray-400 font-bold text-sm">{(customer as any).totalOrders || 0} orders</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <a 
                        href={`mailto:${customer.email}`}
                        className="w-10 h-10 bg-gray-50 border-2 border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
                        title="Send Email"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      </a>
                      <a 
                        href={`https://wa.me/${customer.phoneNumber?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-emerald-50 border-2 border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                        title="Chat via WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#f8f9fa] rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-black text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-bold">
                       {selectedCustomer.firstName?.[0]}{selectedCustomer.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-black">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                      <p className="text-gray-400 font-medium">Customer since {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'Mar 14, 2026'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-4 hover:bg-white rounded-2xl transition-all text-black shadow-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Info Card */}
                   <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 space-y-6">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Contact Information</h4>
                      <div className="space-y-4">
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                            <p className="font-bold text-black text-lg">{selectedCustomer.email}</p>
                         </div>
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                        <p className="font-bold text-black text-lg">{selectedCustomer.phoneNumber}</p>
                     </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <a 
                      href={`mailto:${selectedCustomer.email}`}
                      className="flex-1 bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      Email
                    </a>
                    <a 
                      href={`https://wa.me/${selectedCustomer.phoneNumber?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                  </div>
               </div>

                   {/* Stats Card */}
                   <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 space-y-6">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Business Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
                            <p className="font-bold text-black text-2xl">{currency} {((selectedCustomer as any).totalSpent || 0).toLocaleString()}</p>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                            <p className="font-bold text-black text-2xl">{(selectedCustomer as any).totalOrders || 0}</p>
                         </div>
                      </div>
                   </div>

                   {/* Address Card */}
                   <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-[2rem] border-2 border-gray-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Address Book</h4>
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">{selectedCustomer.addresses?.length || 0} Saved</span>
                      </div>
                      
                      {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                        <div className="space-y-4">
                          {selectedCustomer.addresses.map((addr, idx) => (
                            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100">
                               <div className="flex items-center justify-between mb-2">
                                  <p className="font-bold text-black uppercase tracking-tight">{addr.label}</p>
                                  {addr.isDefault && <span className="text-[10px] font-bold text-emerald-600 uppercase border border-emerald-200 px-2 py-0.5 rounded-md">Default</span>}
                               </div>
                               <p className="text-gray-500 font-medium">
                                  {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}<br/>
                                  {addr.city}, {addr.state} {addr.postalCode}<br/>
                                  {addr.country}
                               </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 font-medium italic">No address on file</p>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-10 md:p-14 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-3xl font-bold text-black">New Customer</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-gray-50 rounded-2xl transition-all text-black">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                {success ? (
                  <div className="py-24 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100">
                      <svg className="w-14 h-14 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold text-black mb-2">Success!</h4>
                      <p className="text-gray-500 font-medium text-xl">The customer profile has been created.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FloatingInput label="First Name" id="firstName" required value={formData.firstName} onChange={(e: any) => setFormData({...formData, firstName: e.target.value})} />
                      <FloatingInput label="Last Name" id="lastName" required value={formData.lastName} onChange={(e: any) => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                    <FloatingInput label="Email Address" id="email" type="email" required value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
                    <FloatingInput label="Phone Number" id="phone" value={formData.phoneNumber} onChange={(e: any) => setFormData({...formData, phoneNumber: e.target.value})} />

                    <div className="pt-6 border-t-2 border-gray-50 text-black">
                      <button 
                        type="button" 
                        onClick={() => setShowAddress(!showAddress)}
                        className="flex items-center gap-4 text-indigo-600 font-extrabold text-lg"
                      >
                        <span className={`w-7 h-7 rounded-[10px] border-2 flex items-center justify-center transition-all ${showAddress ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white group-hover:border-black'}`}>
                          {showAddress && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>}
                        </span>
                        Add residential address
                      </button>
                    </div>

                    {showAddress && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-8 overflow-hidden pt-4">
                        <FloatingInput label="Address Line 1" value={address.addressLine1} onChange={(e: any) => setAddress({...address, addressLine1: e.target.value})} />
                        <div className="grid grid-cols-2 gap-8">
                          <FloatingInput label="City" value={address.city} onChange={(e: any) => setAddress({...address, city: e.target.value})} />
                          <FloatingInput label="State" value={address.state} onChange={(e: any) => setAddress({...address, state: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <FloatingInput label="Postal Code" value={address.postalCode} onChange={(e: any) => setAddress({...address, postalCode: e.target.value})} />
                          <FloatingInput label="Country" value={address.country} onChange={(e: any) => setAddress({...address, country: e.target.value})} />
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <div className="p-6 bg-red-50 rounded-[2rem] border-2 border-red-100 flex items-center gap-4 text-red-600">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        <p className="font-bold">{error}</p>
                      </div>
                    )}

                    <div className="pt-8">
                      <button 
                        disabled={isSubmitting}
                        className={`w-full bg-black text-white py-7 rounded-[2rem] text-2xl font-bold hover:bg-gray-800 transition-all shadow-2xl shadow-black/10 flex items-center justify-center gap-5 ${isSubmitting ? 'opacity-50' : ''}`}
                      >
                        {isSubmitting ? <><div className="w-7 h-7 border-[5px] border-white/20 border-t-white rounded-full animate-spin"/> Saving...</> : 'Save Customer Profile'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
