import { Volume2, VolumeX, RotateCcw, Play, Pause } from "lucide-react";

interface ControlBarProps {
  onMuteAll: () => void;
  onUnmuteAll: () => void;
  onReset: () => void;
  onPauseAll: () => void;
  onPlayAll: () => void;
  isAllMuted: boolean;
  activeCount: number;
}

export function ControlBar({ 
  onMuteAll, 
  onUnmuteAll, 
  onReset, 
  onPauseAll, 
  onPlayAll,
  isAllMuted, 
  activeCount 
}: ControlBarProps) {
  return (
    <div className="hidden lg:flex bg-zinc-900 border-t border-zinc-800 px-6 py-4 items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
      <div className="flex items-center gap-6">
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button 
            onClick={onPlayAll}
            className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-emerald-500"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={onPauseAll}
            className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-amber-500"
          >
            <Pause className="w-5 h-5 fill-current" />
          </button>
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-2" />

        <div className="flex gap-2">
          <button
            onClick={isAllMuted ? onUnmuteAll : onMuteAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
              isAllMuted 
              ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' 
              : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
            }`}
          >
            {isAllMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {isAllMuted ? "Unmute All" : "Mute All"}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 font-semibold text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Workspace
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Threads</span>
          <span className="text-xl font-mono font-bold text-indigo-400 leading-none">{activeCount}</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  );
}
