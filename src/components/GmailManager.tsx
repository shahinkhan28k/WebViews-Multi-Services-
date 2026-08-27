import React, { useState, useEffect } from "react";
import { Mail, Plus, Trash2, Key, ShieldCheck, ExternalLink, Inbox, ArrowLeft, User, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";

interface Account {
  id: string;
  email: string;
  name: string;
  picture: string;
  linked_at: any;
}

interface GmailManagerProps {
  onClose: () => void;
  onOpenInbox: (email: string) => void;
}

export function GmailManager({ onClose, onOpenInbox }: GmailManagerProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "linked_accounts"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Account[];
      setAccounts(accs);
    });
    return () => unsubscribe();
  }, []);

  const handleConnectGoogle = () => {
    setIsProcessing(true);
    // Open the official OAuth flow
    window.location.href = "/api/auth/google";
  };

  const removeAccount = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      await deleteDoc(doc(db, "linked_accounts", id));
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-zinc-950 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-4 md:p-8 border-b border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter italic">Google <span className="text-indigo-500 text-xs md:text-sm tracking-widest not-italic">AUTH CENTER</span></h2>
              <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Authorized Identity Management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* Left: Google Login Simulator */}
          <div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-zinc-800 p-6 md:p-8 flex flex-col items-center justify-center bg-zinc-900/10 shrink-0">
            <div className="w-full max-w-[320px] space-y-8 bg-zinc-950 border border-zinc-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden text-center">
              {isProcessing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-3 shadow-lg">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Connect Account</h3>
                  <p className="text-zinc-500 mt-2 text-sm">Link your Gmail account securely using Google OAuth 2.0</p>
                </div>
              </div>

              <button
                onClick={handleConnectGoogle}
                className="w-full bg-white hover:bg-zinc-200 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
              >
                <LogIn className="w-5 h-5" /> Connect with Google
              </button>

              <div className="pt-4 border-t border-zinc-900">
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> Secure Google API Connection
                </div>
              </div>
            </div>
            <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest text-center max-w-[280px]">Multiple accounts allowed. Each session will use a unique proxy fingerprint.</p>
          </div>

          {/* Right: Identity Pool List */}
          <div className="flex-1 p-6 md:p-10 bg-zinc-950">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.3em]">Identity Pool</h3>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Linked accounts for multi-stream traffic</p>
                </div>
                <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                  <span className="text-xs font-black text-indigo-400">{accounts.length} ACTIVE SESSIONS</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {accounts.map((acc, index) => (
                    <motion.div
                      key={`${acc.email}-${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[24px] hover:border-indigo-500/40 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          {acc.picture ? (
                            <img src={acc.picture} alt={acc.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-zinc-800" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                              <Mail className="w-6 h-6 text-indigo-500" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-zinc-100 truncate max-w-[120px]">{acc.name || 'Connected User'}</h4>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest truncate max-w-[120px]">{acc.email}</p>
                          </div>
                        </div>
                        <button onClick={() => removeAccount(acc.id)} className="text-zinc-700 hover:text-red-400 p-2 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onOpenInbox(acc.email)}
                          className="flex-1 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Inbox className="w-3.5 h-3.5" /> Check Inbox
                        </button>
                        <div className="px-3 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
