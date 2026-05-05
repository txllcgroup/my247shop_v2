"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LiveShoppingService, LiveSession } from './liveShoppingService';

export default function LiveShoppingPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', description: '' });

  const fetchSessions = async () => {
    try {
      const data = await LiveShoppingService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await LiveShoppingService.createSession(newSession);
      setShowCreateModal(false);
      setNewSession({ title: '', description: '' });
      fetchSessions();
    } catch (err) {
      alert("Failed to create session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-black">Live Shopping</h1>
          <p className="text-xl text-gray-500 font-medium">Host live sessions and sell products in real-time.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-xl transition-all hover:-translate-y-1"
        >
          Schedule Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white border-2 border-gray-100 rounded-[32px] overflow-hidden group hover:border-black transition-all duration-300 shadow-sm">
            <div className="aspect-video bg-gray-100 relative">
              {session.coverImageUrl ? (
                <img src={session.coverImageUrl} alt={session.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${session.status === 'Live' ? 'bg-rose-500 text-white' : 'bg-black/50 text-white backdrop-blur-md'}`}>
                  {session.status}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-black line-clamp-1">{session.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{session.description || 'No description'}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  {session.viewerCount}
                </div>
                <Link 
                  href={`/dashboard/live-shopping/studio/${session.id}`}
                  className="text-black font-bold text-sm hover:underline"
                >
                  Enter Studio →
                </Link>
              </div>
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-gray-400 font-medium italic">No live sessions found</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-bold text-black tracking-tight mb-8">Schedule Session</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Session Title</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-lg font-semibold focus:border-black outline-none transition-all"
                  placeholder="e.g. Summer Collection Launch"
                  value={newSession.title}
                  onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-lg font-semibold focus:border-black outline-none transition-all h-32 resize-none"
                  placeholder="Tell your customers what to expect..."
                  value={newSession.description}
                  onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-black transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-xl hover:-translate-y-1 transition-all">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
