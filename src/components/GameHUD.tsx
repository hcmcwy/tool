import React from 'react';
import { Volume2, VolumeX, Pause, HelpCircle, ArrowLeft } from 'lucide-react';
import { RepairMission } from '../types';

interface GameHUDProps {
  mission: RepairMission;
  currentStepIndex: number;
  score: number;
  elapsedSeconds: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onBackToTitle: () => void;
  onShowHint: () => void;
  hintsUsed: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mission,
  currentStepIndex,
  score,
  elapsedSeconds,
  isMuted,
  onToggleMute,
  onTogglePause,
  onBackToTitle,
  onShowHint,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSteps = mission.steps.length;
  const currentStep = mission.steps[currentStepIndex];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between p-4 md:p-6 select-none font-sans">
      {/* Top Left: Mission & Step Status Cluster */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          onClick={onBackToTitle}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shadow-lg cursor-pointer transition-colors"
          title="返回主選單"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="bg-[#14171d]/90 border border-slate-700/70 rounded-xl px-4 py-2.5 shadow-xl">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{mission.icon}</span>
            <span className="text-sm font-bold text-white tracking-wide">{mission.title}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
              {mission.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span>進度：</span>
              <span className="font-mono tabular-nums font-bold">
                {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 truncate max-w-[240px] md:max-w-md">
              {currentStep ? currentStep.title : '已完成'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Right: Status readout (Score, Timer, Controls) */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        {/* Score & Timer Badge */}
        <div className="bg-[#14171d]/90 border border-slate-700/70 rounded-xl px-4 py-2 shadow-xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">維修得分</span>
            <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-slate-700" />

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">耗時</span>
            <span className="font-mono text-base font-bold text-slate-200 tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Hint button */}
        <button
          onClick={onShowHint}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/70 shadow-lg cursor-pointer transition-colors"
          title="查看工具教學提示"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Audio Mute */}
        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 shadow-lg cursor-pointer transition-colors"
          title="切換音效 (M)"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* Pause Button */}
        <button
          onClick={onTogglePause}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 shadow-lg cursor-pointer transition-colors"
          title="暫停遊戲 (Esc)"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
