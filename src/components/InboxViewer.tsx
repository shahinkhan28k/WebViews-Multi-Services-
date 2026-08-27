import React, { useEffect, useState } from "react";
import { Mail, RefreshCw, ChevronRight, ExternalLink, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
}

interface InboxViewerProps {
  email: string;
  onClose: () => void;
}

export function InboxViewer({ email, onClose }: InboxViewerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gmail/inbox?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [email]);

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            {email}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Recent unread messages</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInbox}
            disabled={loading}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={onClose}
            className="text-sm font-medium text-zinc-400 hover:text-white px-3 py-1.5 hover:bg-zinc-800 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 animate-pulse font-medium">Synchronizing with Google...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-4">
              <Mail className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sync Failed</h3>
            <p className="text-zinc-500 mb-6">{error}</p>
            <button 
              onClick={fetchInbox}
              className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all"
            >
              Retry Sync
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-zinc-800/50 rounded-full mb-4">
              <Mail className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No New Messages</h3>
            <p className="text-zinc-500">Your inbox is clean for now.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-zinc-900/50 cursor-pointer group transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-indigo-400 mb-1 block truncate">
                        {msg.from?.split('<')[0].trim()}
                      </span>
                      <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {msg.subject || "(No Subject)"}
                      </h4>
                    </div>
                    <span className="text-xs text-zinc-500 whitespace-nowrap mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed mb-4">
                    {msg.snippet}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                    View full message <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
