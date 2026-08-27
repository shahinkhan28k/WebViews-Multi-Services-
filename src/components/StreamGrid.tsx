import { StreamInstance } from "../types";
import { Monitor, Shield, Wifi, Maximize2, Minimize2, ChevronLeft, ChevronRight, Mail, Heart, MessageSquare, Share2, Play, RefreshCcw, Home, Settings, Activity, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useEffect, useRef } from "react";

interface StreamGridProps {
  streams: StreamInstance[];
  onRegenerateIdentity: (id: string) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function StreamGrid({ streams, onRegenerateIdentity }: StreamGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSequenceIndex, setActiveSequenceIndex] = useState(-1);
  
  const isShortsMode = streams.length > 0 && streams.some(s => s.mode === "shorts");
  const itemsPerPage = 100;

  // Sequential loading logic: 3 seconds delay between each node starting for faster response
  useEffect(() => {
    if (streams.length > 0) {
      setActiveSequenceIndex(0);
      const interval = setInterval(() => {
        setActiveSequenceIndex(prev => {
          if (prev < streams.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 3000); 
      return () => clearInterval(interval);
    } else {
      setActiveSequenceIndex(-1);
    }
  }, [streams.length]);

  const totalPages = Math.ceil(streams.length / itemsPerPage);
  const currentStreams = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return streams.slice(start, start + itemsPerPage);
  }, [streams, currentPage, itemsPerPage]);

  return (
    <main className="flex-1 overflow-auto bg-zinc-950 pb-24 lg:pb-6 scrollbar-hide flex flex-col gap-4">
      {/* Mobile-App Header */}
      <div className="lg:hidden sticky top-0 z-[40] bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Multi-Hub <span className="text-indigo-500 italic">PRO</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-zinc-900 rounded-full border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400">{streams.length} ACTIVE</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expandedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-2 md:p-10"
            onClick={() => setExpandedId(null)}
          >
            {streams.find(s => s.id === expandedId) && (
              <IndividualStream 
                stream={streams.find(s => s.id === expandedId)!} 
                idx={streams.findIndex(s => s.id === expandedId)} 
                isExpanded={true}
                onToggleExpand={() => setExpandedId(null)}
                isAllowedToLoad={true}
                onRegenerateIdentity={() => onRegenerateIdentity(expandedId)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 md:px-6 flex flex-col gap-4 mt-2">
        {streams.length > itemsPerPage && (
          <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-white">Network Cluster</span>
              <span className="text-xs text-zinc-400">Node Range {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, streams.length)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl text-zinc-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-mono font-bold text-indigo-400">{currentPage}/{totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl text-zinc-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {streams.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-6 py-20">
            <motion.div 
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
              className="p-12 bg-zinc-900 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-50" />
              <Monitor className="w-24 h-24 text-zinc-700 relative z-10" />
            </motion.div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-zinc-400">Cluster Offline</h3>
              <p className="text-sm max-w-xs mx-auto text-zinc-500 leading-relaxed font-medium">Add a YouTube link in the Config panel and launch up to 100 nodes for unlimited views.</p>
            </div>
          </div>
        ) : (
          <div className={`
            grid gap-2 md:gap-3
            ${isShortsMode 
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            }
          `}>
            <AnimatePresence mode="popLayout">
              {currentStreams.map((stream, idx) => {
                const globalIdx = (currentPage - 1) * itemsPerPage + idx;
                return (
                  <div key={stream.id} className={expandedId === stream.id ? "invisible" : ""}>
                    <IndividualStream 
                      stream={stream} 
                      idx={globalIdx} 
                      isAllowedToLoad={globalIdx <= activeSequenceIndex}
                      onToggleExpand={() => setExpandedId(stream.id)}
                      onRegenerateIdentity={() => onRegenerateIdentity(stream.id)}
                    />
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/50 px-8 py-3 flex items-center justify-between z-[50]">
        <button className="flex flex-col items-center gap-1 text-indigo-500">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-500">
          <Mail className="w-6 h-6" />
          <span className="text-[10px] font-bold">Inbox</span>
        </button>
        <div className="relative -top-6">
          <button className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/40 border-4 border-zinc-950">
            <Play className="w-6 h-6 text-white fill-current" />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-zinc-500">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold">Config</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-500">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </main>
  );
}

interface IndividualStreamProps {
  stream: StreamInstance;
  idx: number;
  isExpanded?: boolean;
  isAllowedToLoad: boolean;
  onToggleExpand: () => void;
  onRegenerateIdentity: () => void;
}

function IndividualStream({ stream, idx, isExpanded, isAllowedToLoad, onToggleExpand, onRegenerateIdentity }: IndividualStreamProps) {
  const isShorts = stream.mode === "shorts";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isWaitingForLoop, setIsWaitingForLoop] = useState(false);
  const playerRef = useRef<any>(null);
  const [playerKey, setPlayerKey] = useState(0);

  const getEmbedUrl = (rawUrl: string, isMuted: boolean) => {
    try {
      const urlString = rawUrl.trim();
      let videoId = "";
      
      // Better Regex for all YouTube formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
      const match = urlString.match(regExp);

      if (match && match[2].length === 11) {
        videoId = match[2];
      }

      if (!videoId) {
        // Fallback for tricky URLs
        if (urlString.includes("shorts/")) {
          videoId = urlString.split("shorts/")[1].split(/[?&]/)[0];
        } else if (urlString.includes("v=")) {
          videoId = urlString.split("v=")[1].split(/[?&]/)[0];
        }
      }

      if (!videoId) return "";
      
      const volumeParams = isMuted ? "&mute=1" : "&mute=0";
      return `https://www.youtube.com/embed/${videoId}?autoplay=1${volumeParams}&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}&widget_referrer=${window.location.origin}&playsinline=1&v=${Date.now()}`;
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    let checkInterval: any;
    
    if (isAllowedToLoad && iframeRef.current) {
      const initPlayer = () => {
        if (!window.YT || !window.YT.Player) return;

        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onReady: (event: any) => {
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setIsWaitingForLoop(true);
                setTimeout(() => {
                  onRegenerateIdentity();
                  setPlayerKey(prev => prev + 1);
                  setIsWaitingForLoop(false);
                }, 5000);
              }
            },
            onError: () => {
              // Auto-recover on error
              setTimeout(() => setPlayerKey(prev => prev + 1), 2000);
            }
          }
        });
        clearInterval(checkInterval);
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        // Poll for YT availability if script is still loading
        checkInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            initPlayer();
          }
        }, 500);
      }
    }

    return () => clearInterval(checkInterval);
  }, [isAllowedToLoad, playerKey]);

  return (
    <motion.div
      layoutId={stream.id}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`
        bg-zinc-900 border border-zinc-800/50 rounded-2xl md:rounded-[2rem] overflow-hidden group flex flex-col relative shadow-2xl transition-all duration-500
        ${isExpanded ? "w-full max-w-lg aspect-[9/16]" : (isShorts ? "aspect-[9/16]" : "aspect-video")}
        ${isAllowedToLoad ? "ring-2 ring-indigo-500/20" : "opacity-40 grayscale blur-[2px]"}
      `}
    >
      {/* Visual Identity Overlay */}
      {isShorts && (
        <>
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 z-20 pointer-events-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white ring-1 ring-white/20">
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </div>
              <span className="text-[10px] font-black text-white drop-shadow-lg">1.2M</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white ring-1 ring-white/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-white drop-shadow-lg">45K</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white ring-1 ring-white/20">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-white drop-shadow-lg">SHARE</span>
            </div>
          </div>

          <div className="absolute bottom-6 left-4 right-12 z-20 pointer-events-none text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-indigo-500/40">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${stream.alias}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white drop-shadow-md leading-none">@{stream.alias?.split('@')[0]}</span>
                <span className="text-[10px] text-zinc-300 font-bold">Node Identity</span>
              </div>
              <div className="ml-auto bg-indigo-600 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                SUBSCRIBE
              </div>
            </div>
            <p className="text-[11px] text-zinc-100 font-medium line-clamp-2 drop-shadow-md">
              Multi-node cluster sync active via residential proxy. {stream.country} Tunnel.
            </p>
          </div>
        </>
      )}

      {/* Control Overlay */}
      <div className={`absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/80 to-transparent z-10 ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all duration-300 px-4 py-3 flex items-center justify-between`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">{stream.country}</span>
          </div>
          <span className="text-[9px] font-mono text-indigo-400 font-bold">{stream.assignedIp}</span>
        </div>
        <button 
          onClick={onToggleExpand}
          className="w-10 h-10 bg-white/10 hover:bg-indigo-600 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all border border-white/10"
        >
          {isExpanded ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
        </button>
      </div>

      <div className="flex-1 bg-black relative">
        {!isAllowedToLoad ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Monitor className="w-10 h-10 text-zinc-800 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-tighter">In Queue...</span>
          </div>
        ) : (
          <>
            <iframe
              key={playerKey}
              ref={iframeRef}
              src={getEmbedUrl(stream.url, stream.isMuted)}
              className={`w-full h-full border-none transition-opacity duration-1000 ${isWaitingForLoop ? "opacity-0" : "opacity-100"}`}
              allow="autoplay; encrypted-media; fullscreen"
              title={`Node ${idx + 1}`}
            />
            {isWaitingForLoop && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-3 z-30">
                <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="text-[10px] font-black text-indigo-500 tracking-tighter uppercase">Regenerating Identity...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Minimal Footer */}
      {!isExpanded && (
        <div className="bg-zinc-900 border-t border-zinc-800/50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-zinc-100 uppercase tracking-tighter">NODE #{idx + 1}</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter truncate max-w-[80px]">{stream.alias}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-[9px] font-black text-emerald-500">LIVE</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
