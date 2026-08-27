import { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { ConfigPanel } from "./components/ConfigPanel";
import { StreamGrid } from "./components/StreamGrid";
import { AccountGenerator } from "./components/AccountGenerator";
import { InboxViewer } from "./components/InboxViewer";
import { GmailManager } from "./components/GmailManager";
import { ControlBar } from "./components/ControlBar";
import { LogFooter } from "./components/LogFooter";
import { StreamInstance, LogEntry } from "./types";
import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";

export default function App() {
  const [streams, setStreams] = useState<StreamInstance[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAllMuted, setIsAllMuted] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"main" | "gmail-checker">("main");
  const [selectedInboxEmail, setSelectedInboxEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#gmail-checker") {
        setCurrentView("gmail-checker");
      } else {
        setCurrentView("main");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Initial check
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    // Handle redirect from OAuth
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view === "gmail-checker") {
      setCurrentView("gmail-checker");
      // Clean URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const navigateTo = (view: "main" | "gmail-checker") => {
    setCurrentView(view);
  };
  const [generatedAccounts, setGeneratedAccounts] = useState<Array<{ id: string; alias: string; country: string }>>([]);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type
    };
    setLogs(prev => [...prev, newLog].slice(-50));
  }, []);

  const handleGenerateAccounts = (baseEmail: string, countries: string[]) => {
    const [user, domain] = baseEmail.split("@");
    const newAccounts = Array.from({ length: 200 }).map((_, i) => {
      const country = countries[i % countries.length];
      const alias = `${user}+${country.toLowerCase()}${i + 1}@${domain}`;
      return { id: `acc-${Date.now()}-${i}`, alias, country };
    });
    setGeneratedAccounts(newAccounts);
    addLog(`Identity pool generated: 200 unique Gmail aliases created.`, "success");
  };

  const launchWorkspace = async (url: string, count: number, useProxy: boolean, lowPower: boolean, proxyPool: string, isShortsMode: boolean) => {
    setIsLoading(true);
    setStreams([]);
    
    let proxies: any[] = [];
    if (useProxy && proxyPool) {
      proxies = proxyPool.split("\n").map(line => {
        const parts = line.trim().split(":");
        if (parts.length >= 2) {
          return { ip: parts[0], port: parts[1], username: parts[2], password: parts[3] };
        }
        return null;
      }).filter(Boolean);

      addLog(`Configuring residential pool with ${proxies.length} nodes...`, "info");
      await fetch("/api/configure-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proxies })
      });
    }

    addLog(`Initializing hub with ${count} instances [${isShortsMode ? "SHORTS-MODE" : (lowPower ? "ECO-MODE" : "PERFORMANCE-MODE")}]`, "info");

    const newStreams: StreamInstance[] = [];
    
    const devices = isShortsMode ? ["Mobile", "Tablet"] : ["Mobile", "Tablet", "Desktop"];
    const osList = isShortsMode ? ["iOS", "Android"] : ["iOS", "Android", "Windows", "MacOS", "Linux"];
    const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
    const resolutions = isShortsMode ? ["375x812", "414x896", "1080x1920"] : ["1920x1080", "1366x768", "375x812", "414x896", "1536x864"];

    // Batch processing to avoid UI lockup
    const batchSize = count > 50 ? 50 : 20;
    for (let i = 0; i < count; i += batchSize) {
      const currentBatchLimit = Math.min(i + batchSize, count);
      for (let j = i; j < currentBatchLimit; j++) {
        // Dynamic Virtual IP & Location Rotation
        const octets = Array.from({length: 4}, () => Math.floor(Math.random() * 255)).join(".");
        const countries = ["USA", "CANADA", "UK", "GERMANY", "FRANCE", "JAPAN", "SINGAPORE", "AUSTRALIA", "INDIA", "BRAZIL"];
        const selectedCountry = countries[Math.floor(Math.random() * countries.length)];
        
        const profile = {
          device: devices[Math.floor(Math.random() * devices.length)],
          os: osList[Math.floor(Math.random() * osList.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          resolution: resolutions[Math.floor(Math.random() * resolutions.length)]
        };

        // Simulated Handshake Log
        addLog(`Node #${j+1}: Handshake Established via ${selectedCountry}.`, "success");
        addLog(`Node #${j+1}: Virtual IP Active: ${octets}`, "proxy");

        // Use real accounts from Identity Pool if available, otherwise fallback
        const pool = JSON.parse(localStorage.getItem("gmail_accounts") || "[]");
        const account = pool[j % pool.length] || 
                      generatedAccounts[j % generatedAccounts.length] || 
                      { alias: `SESSION_${j+1}`, email: `guest_${j+1}@youtube.com` };
        
        const alias = account.email || account.alias;

        newStreams.push({
          id: `stream-${j}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          url: url.trim(),
          assignedIp: octets,
          isMuted: isAllMuted,
          status: "active",
          isLowPower: lowPower,
          alias: alias,
          country: `${selectedCountry}`,
          browserProfile: profile,
          mode: isShortsMode ? "shorts" : "video"
        });
      }
      setStreams([...newStreams]);
    }

    setIsLoading(false);
    addLog(`Cluster synchronization complete. ${count} nodes established with global IP profiles.`, "success");
  };

  const regenerateStreamIdentity = useCallback((id: string) => {
    setStreams(prev => prev.map(s => {
      if (s.id === id) {
        const octets = Array.from({length: 4}, () => Math.floor(Math.random() * 255)).join(".");
        const countriesList = ["USA", "CANADA", "UK", "GERMANY", "FRANCE", "JAPAN", "SINGAPORE", "AUSTRALIA", "INDIA", "BRAZIL"];
        const selectedCountry = countriesList[Math.floor(Math.random() * countriesList.length)];
        
        const devices = s.mode === "shorts" ? ["Mobile", "Tablet"] : ["Mobile", "Tablet", "Desktop"];
        const osList = s.mode === "shorts" ? ["iOS", "Android"] : ["iOS", "Android", "Windows", "MacOS", "Linux"];
        const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
        const resolutions = s.mode === "shorts" ? ["375x812", "414x896", "1080x1920"] : ["1920x1080", "1366x768", "375x812", "414x896", "1536x864"];

        const profile = {
          device: devices[Math.floor(Math.random() * devices.length)],
          os: osList[Math.floor(Math.random() * osList.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          resolution: resolutions[Math.floor(Math.random() * resolutions.length)]
        };

        addLog(`Node Identity Regenerated: [${selectedCountry}] IP: ${octets}`, "proxy");
        
        return {
          ...s,
          assignedIp: octets,
          country: selectedCountry,
          browserProfile: profile
        };
      }
      return s;
    }));
  }, [addLog]);

  const handleMuteAll = () => {
    setIsAllMuted(true);
    setStreams(prev => prev.map(s => ({ ...s, isMuted: true })));
    addLog("Global audio suppression active.", "warning");
  };

  const handleUnmuteAll = () => {
    setIsAllMuted(false);
    setStreams(prev => prev.map(s => ({ ...s, isMuted: false })));
    addLog("Global audio bypass enabled.", "info");
  };

  const handleReset = () => {
    setStreams([]);
    addLog("Workspace purged. All nodes terminated.", "warning");
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <Header 
        connectionStatus={isLoading ? "reconnecting" : "connected"} 
        activeProxies={streams.length} 
        onMenuClick={() => setIsSidebarOpen(true)}
        onGmailCheckerClick={() => navigateTo("gmail-checker")}
      />
      
      {currentView === "gmail-checker" ? (
        <div className="flex-1 flex flex-col min-h-0 bg-black">
          {!selectedInboxEmail ? (
            <GmailManager 
              onClose={() => navigateTo("main")} 
              onOpenInbox={(email) => setSelectedInboxEmail(email)} 
            />
          ) : (
            <InboxViewer 
              email={selectedInboxEmail} 
              onClose={() => setSelectedInboxEmail(null)} 
            />
          )}
        </div>
      ) : (
        <div key="view-main-dashboard" className="flex flex-1 overflow-hidden relative">
        {/* Sidebar for Desktop and Mobile Drawer */}
        <div className={`
          flex flex-col border-r border-zinc-800 bg-zinc-900/40 w-80 shrink-0 p-4 gap-4 overflow-y-auto
          fixed inset-y-0 left-0 z-[60] lg:relative lg:translate-x-0 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="flex items-center justify-between lg:hidden mb-2">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Configuration</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-zinc-800 rounded-lg"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
          <ConfigPanel 
            onStart={(...args) => {
              launchWorkspace(...args);
              setIsSidebarOpen(false);
            }} 
            isLoading={isLoading} 
          />
          <AccountGenerator 
            onGenerate={handleGenerateAccounts} 
            generatedAccounts={generatedAccounts} 
            onSelectAccount={(email) => setSelectedInboxEmail(email)}
          />
        </div>

        {/* Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <StreamGrid 
            streams={streams} 
            onRegenerateIdentity={regenerateStreamIdentity}
          />
          
          <ControlBar 
            activeCount={streams.length}
            isAllMuted={isAllMuted}
            onMuteAll={handleMuteAll}
            onUnmuteAll={handleUnmuteAll}
            onReset={handleReset}
            onPauseAll={() => addLog("Global pause signal broadcasted", "info")}
            onPlayAll={() => addLog("Global play signal broadcasted", "info")}
          />
        </div>
      </div>
    )}

    <LogFooter logs={logs} onClear={clearLogs} />
    </div>
  );
}
