import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none font-sans">
      <div className="w-full max-w-sm bg-[#181a20] border-2 border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl mb-3">
          ⏸️
        </div>

        <h2 className="text-xl font-black text-white mb-1">維修暫停中</h2>
        <p className="text-xs text-slate-400 mb-6">工具已安全置於工具箱中，隨時可繼續操作</p>

        <div className="w-full flex flex-col gap-2.5 mb-5">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>繼續維修 (Esc)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新開始本關</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>返回主選單</span>
          </button>
        </div>

        <button
          onClick={onToggleMute}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? '開啟遊戲音效 (M)' : '靜音遊戲音效 (M)'}</span>
        </button>
      </div>
    </div>
  );
};
