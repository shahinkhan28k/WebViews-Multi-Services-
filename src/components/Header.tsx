import { Globe, Shield, Zap, Activity, Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  activeProxies: number;
  onMenuClick: () => void;
  onGmailCheckerClick: () => void;
}

export function Header({ connectionStatus, activeProxies, onMenuClick, onGmailCheckerClick }: HeaderProps) {
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(12, Math.min(120, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-zinc-950 border-b border-zinc-800 shadow-lg sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
          <Zap className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-zinc-100">Multi-Stream Hub</h1>
          <p className="hidden md:block text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Enterprise Stream Manager</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-mono text-zinc-400">{latency}ms</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800">
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[11px] font-medium text-zinc-300">{activeProxies}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === "connected" ? "bg-emerald-500 animate-pulse" : 
            connectionStatus === "reconnecting" ? "bg-amber-500 animate-bounce" : "bg-red-500"
          }`} />
          <span className="hidden xs:block text-xs font-medium text-zinc-400 capitalize">{connectionStatus}</span>
        </div>

        <button 
          onClick={onGmailCheckerClick}
          className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center gap-2"
        >
          Gmail Checker Unlimited
        </button>
      </div>
    </header>
  );
}
