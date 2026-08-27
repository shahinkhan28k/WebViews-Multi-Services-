import React, { useState, useEffect } from "react";
import { Link2, Play, Settings2, ShieldCheck, AlertCircle, BatteryLow } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ConfigPanelProps {
  onStart: (url: string, count: number, useProxy: boolean, lowPower: boolean, proxyPool: string, isShortsMode: boolean) => void;
  isLoading: boolean;
}

export function ConfigPanel({ onStart, isLoading }: ConfigPanelProps) {
  const [url, setUrl] = useState("");
  const [count, setCount] = useState(10);
  const [useProxy, setUseProxy] = useState(true);
  const [proxyRaw, setProxyRaw] = useState("");
  const [lowPower, setLowPower] = useState(false);
  const [isShortsMode, setIsShortsMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const MAX_LIMIT = isMobile ? 50 : 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onStart(url, Math.min(count, MAX_LIMIT), useProxy, lowPower, proxyRaw, isShortsMode);
  };

  const panelContent = (
    <div className="flex flex-col h-full gap-6 md:gap-8 overflow-y-auto pb-10">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-zinc-100">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          <h2 className="font-semibold text-sm">Anti-Detect Engine</h2>
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Cluster Configuration v2.4</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Target URL</label>
          <div className="relative group">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Paste stream link..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-700"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Instances</label>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{count} Units</span>
          </div>
          <input
            type="range"
            min="1"
            max={MAX_LIMIT}
            step="1"
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
          />
          {count > 25 && (
            <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-500 leading-tight font-medium">High Density Warning: Ensure stable internet bandwidth for {count} nodes.</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setUseProxy(!useProxy)}
            className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-zinc-300">Geo-IP Auto-Scraper</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative ${useProxy ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useProxy ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>
          {useProxy && (
            <p className="text-[9px] text-zinc-500 italic px-1">
              Auto-fetching global 4G/Residential IPs from US, UK, JP, etc.
            </p>
          )}

          <button
            type="button"
            onClick={() => setLowPower(!lowPower)}
            className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BatteryLow className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-zinc-300">Low-Power Mode</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative ${lowPower ? 'bg-amber-500' : 'bg-zinc-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${lowPower ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsShortsMode(!isShortsMode)}
            className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className={`w-full h-full ${isShortsMode ? 'text-red-500' : 'text-zinc-500'}`}>
                  <path fill="currentColor" d="M17.77,10.32l-1.2-.5L17.77,9.32a3.81,3.81,0,0,0,0-6.73L9.6,1.4a3.81,3.81,0,0,0-5.51,3.41v.5L2.89,5.81a3.81,3.81,0,0,0,0,6.73l1.2.5-1.2.5a3.81,3.81,0,0,0,0,6.73l8.17,1.19a3.81,3.81,0,0,0,5.51-3.41v-.5l1.2-.5A3.81,3.81,0,0,0,17.77,10.32ZM10,14.5v-5l4.5,2.5Z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-300">YouTube Shorts Mode</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative ${isShortsMode ? 'bg-red-600' : 'bg-zinc-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isShortsMode ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>

        {useProxy && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Custom Proxy Pool (Optional)</label>
            <textarea
              placeholder="IP:Port:User:Pass or IP:Port (one per line)"
              className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-[11px] font-mono text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-800 resize-none"
              value={proxyRaw}
              onChange={(e) => setProxyRaw(e.target.value)}
            />
            <p className="text-[8px] text-zinc-600 px-1 italic">Leave blank to use global auto-discovered carriers.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(79,70,229,0.3)] touch-manipulation"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Workspace</span>
        </button>
      </form>

      <div className="mt-auto space-y-4">
        <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 space-y-3">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Network Status</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Exit Nodes</span>
            <span className="text-zinc-200 font-mono">1,204</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Integrity</span>
            <span className="text-emerald-500 font-mono">99.8%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {panelContent}
    </div>
  );
}
