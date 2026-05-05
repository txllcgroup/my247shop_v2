"use client";
import React, { useState, useEffect } from 'react';
import { StaffService, StaffData } from './staffService';
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

const FloatingSelect = ({ label, id, value, onChange, options, required = false }: any) => (
  <div className="relative group w-full text-black">
    <select
      id={id}
      required={required}
      value={value}
      onChange={onChange}
      className={`peer w-full bg-white border-2 border-gray-200 rounded-2xl px-5 pt-7 pb-3 text-base font-bold text-black outline-none transition-all focus:border-black appearance-none`}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <label
      htmlFor={id}
      className="absolute left-5 top-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </div>
  </div>
);

export default function StaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState("");

  const [formData, setFormData] = useState<StaffData>({
    storeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "Staff",
    isActive: true
  });

  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const storedStoreId = localStorage.getItem('storeId');
      if (storedStoreId) {
        setStoreId(storedStoreId);
        setFormData(prev => ({ ...prev, storeId: storedStoreId }));
        
        try {
          const res = await StaffService.getStaffByStore(storedStoreId);
          if (res.success) {
            setStaffList(res.data?.items || []);
          }
        } catch (err) {
          console.error("Failed to fetch staff", err);
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
      const res = await StaffService.createStaff(formData);
      if (res.success) {
        setSuccess(true);
        // Refresh staff list
        const updated = await StaffService.getStaffByStore(storeId);
        setStaffList(updated.data?.items || []);
        
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess(false);
          setFormData({
            storeId,
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            password: "",
            role: "Staff",
            isActive: true
          });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff: StaffData) => {
    if (!staff.id) return;
    try {
      const res = await StaffService.toggleStatus(staff.id);
      if (res.success) {
        setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, isActive: !s.isActive } : s));
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
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
          {[1, 2, 3].map(i => (
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
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-2">Staff Management</h1>
          <p className="text-gray-500 font-medium text-base md:text-xl">Manage your team members and their access levels.</p>
        </div>
        <div className="flex gap-4 flex-col sm:flex-row">
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl border-2 border-black text-lg font-bold hover:bg-gray-800 transition-all shadow-sm">
             Add Staff Member
          </button>
        </div>
      </div>
      
      {staffList.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-sm p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-10 border-2 border-gray-100">
             <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
          <h3 className="text-3xl font-bold text-black mb-4">No staff members found</h3>
          <p className="text-gray-400 font-medium max-w-sm mb-10 text-xl">Start by adding your first team member to help manage your store.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-bold text-xl hover:underline underline-offset-[12px] decoration-4 transition-all whitespace-nowrap">
             Add your first staff
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-50">
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Team Member</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {staffList.map((staff) => (
                <tr 
                  key={staff.id} 
                  className="group hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-6" onClick={() => setSelectedStaff(staff)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${staff.isActive ? 'bg-black' : 'bg-gray-300'}`}>
                        {staff.firstName?.[0] || '?'}{staff.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-bold text-black text-lg">{staff.firstName} {staff.lastName}</p>
                        <p className="text-gray-400 text-sm font-medium">Added {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'Recently'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6" onClick={() => setSelectedStaff(staff)}>
                    <p className="font-bold text-black">{staff.email}</p>
                    <p className="text-gray-400 font-bold text-sm tracking-tight">{staff.phoneNumber || 'No phone'}</p>
                  </td>
                  <td className="px-8 py-6" onClick={() => setSelectedStaff(staff)}>
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                        {staff.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(staff); }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${staff.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                    >
                        {staff.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedStaff(staff); }}
                        className="w-10 h-10 bg-gray-50 border-2 border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
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
        {selectedStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStaff(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#f8f9fa] rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-black text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-bold">
                       {selectedStaff.firstName?.[0]}{selectedStaff.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-black">{selectedStaff.firstName} {selectedStaff.lastName}</h3>
                      <p className="text-gray-400 font-medium">Role: {selectedStaff.role}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStaff(null)} className="p-4 hover:bg-white rounded-2xl transition-all text-black shadow-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                            <p className="font-bold text-black text-lg">{selectedStaff.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                            <p className="font-bold text-black text-lg">{selectedStaff.phoneNumber || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account Status</p>
                            <span className={`px-4 py-1 bg-gray-50 rounded-lg text-sm font-bold ${selectedStaff.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {selectedStaff.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Login</p>
                            <p className="font-bold text-black text-lg">
                                {selectedStaff.lastLoginAt ? new Date(selectedStaff.lastLoginAt).toLocaleString() : 'Never'}
                            </p>
                        </div>
                    </div>
                    <div className="pt-6 border-t-2 border-gray-50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Security Notice</p>
                        <p className="text-gray-400 text-sm italic">
                            Passwords are encrypted and cannot be viewed. To reset a password, please update the staff member profile.
                        </p>
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
                  <h3 className="text-3xl font-bold text-black">Add Team Member</h3>
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
                      <h4 className="text-3xl font-bold text-black mb-2">Staff Added!</h4>
                      <p className="text-gray-500 font-medium text-xl">The team member can now log in to the dashboard.</p>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FloatingInput label="Access Password" id="password" type="password" required value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} />
                        <FloatingSelect 
                            label="Role" 
                            id="role" 
                            required 
                            value={formData.role} 
                            onChange={(e: any) => setFormData({...formData, role: e.target.value})}
                            options={[
                                { value: "Staff", label: "General Staff" },
                                { value: "Manager", label: "Manager" },
                                { value: "Admin", label: "Admin" }
                            ]} 
                        />
                    </div>

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
                        {isSubmitting ? <><div className="w-7 h-7 border-[5px] border-white/20 border-t-white rounded-full animate-spin"/> Saving...</> : 'Save Staff Member'}
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
