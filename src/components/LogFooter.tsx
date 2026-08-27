import { Terminal, Shield, Info, AlertCircle, CheckCircle2, Trash2, Filter } from "lucide-react";
import { LogEntry } from "../types";
import { useEffect, useRef, useState } from "react";

interface LogFooterProps {
  logs: LogEntry[];
  onClear: () => void;
}

type LogFilter = "all" | "success" | "error" | "proxy" | "info";

export function LogFooter({ logs, onClear }: LogFooterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<LogFilter>("all");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter(log => filter === "all" || log.type === filter);

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "error": return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      case "warning": return <Info className="w-3.5 h-3.5 text-amber-500" />;
      case "proxy": return <Shield className="w-3.5 h-3.5 text-indigo-500" />;
      default: return <Info className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 h-44 md:h-40 flex flex-col relative z-20">
      <div className="px-4 py-2 bg-zinc-900 flex flex-wrap items-center justify-between border-b border-zinc-800 gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Logs</span>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto no-scrollbar">
          {(["all", "success", "proxy", "error"] as LogFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all border
                ${filter === f 
                  ? "bg-indigo-600 border-indigo-500 text-white" 
                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"}
              `}
            >
              {f}
            </button>
          ))}
          <div className="w-px h-3 bg-zinc-800 mx-1" />
          <button 
            onClick={onClear}
            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[10px] md:text-[11px] space-y-1.5 scrollbar-hide"
      >
        {filteredLogs.length === 0 && (
          <div className="flex items-center gap-2 text-zinc-600 italic">
            <Info className="w-3.5 h-3.5" />
            <span>No logs matching filter criteria...</span>
          </div>
        )}
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-zinc-700 shrink-0 select-none">[{log.timestamp}]</span>
            <div className="flex items-center gap-2">
              {getIcon(log.type)}
              <span className={`
                ${log.type === "success" ? "text-emerald-400/90" : ""}
                ${log.type === "error" ? "text-red-400/90" : ""}
                ${log.type === "warning" ? "text-amber-400/90" : ""}
                ${log.type === "proxy" ? "text-indigo-400/90" : ""}
                ${log.type === "info" ? "text-zinc-400" : ""}
              `}>
                {log.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
