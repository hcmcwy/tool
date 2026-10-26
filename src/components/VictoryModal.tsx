import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Star, ArrowRight, Home, RotateCcw, CheckCircle2 } from 'lucide-react';
import { RepairMission } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  mission: RepairMission;
  score: number;
  elapsedSeconds: number;
  hintsUsed: number;
  onNextMission: () => void;
  onRestart: () => void;
  onHome: () => void;
  hasNextMission: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  mission,
  score,
  elapsedSeconds,
  hintsUsed,
  onNextMission,
  onRestart,
  onHome,
  hasNextMission,
}) => {
  useEffect(() => {
    sound.playVictoryFanfare();

    // Confetti celebration burst
    const end = Date.now() + 1200;
    const interval: number = window.setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} 分 ${s} 秒`;
  };

  // Determine star rating: 3 stars if hints <= 1 and time <= 120s
  const stars = hintsUsed === 0 && elapsedSeconds < 150 ? 3 : hintsUsed <= 2 ? 2 : 1;

  // Extract tools used in this mission
  const usedTools = Array.from(new Set(mission.steps.map((s) => s.requiredToolId)))
    .map((id) => TOOLS_DATA.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-sans overflow-y-auto">
      <div className="w-full max-w-lg bg-[#181a20] border-2 border-amber-500/60 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center my-auto">
        {/* Victory Badge */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            🏆
          </div>
          <span className="absolute -bottom-2 -right-2 text-2xl">✨</span>
        </div>

        <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-1">
          MISSION ACCOMPLISHED
        </span>
        <h2 className="text-2xl font-black text-white mb-1">
          {mission.title} 修復完成！
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          恭喜你解決了這項家居故障，手法專業，工具選用完全正確！
        </p>

        {/* 3-Star Rating Display */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 ${
                starIdx <= stars
                  ? 'text-amber-400 fill-amber-400 animate-bounce'
                  : 'text-slate-700'
              }`}
              style={{ animationDelay: `${starIdx * 0.15}s` }}
            />
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 w-full mb-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono">最終得分</span>
            <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono">維修用時</span>
            <span className="text-xl font-black text-slate-200 font-mono tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Mastered Tools in this mission */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6 text-left">
          <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>本次熟練掌握的工具 ({usedTools.length} 款)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {usedTools.map((tool) => (
              <div
                key={tool?.id}
                className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs text-slate-200"
              >
                <span>{tool?.icon}</span>
                <span className="font-medium">{tool?.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          {hasNextMission ? (
            <button
              onClick={() => {
                sound.playClick();
                onNextMission();
              }}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <span>下一關任務</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onHome();
              }}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Award className="w-4 h-4" />
              <span>通關！榮登維修大師</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="再玩一次"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="sm:hidden">重玩</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="返回主選單"
          >
            <Home className="w-4 h-4" />
            <span className="sm:hidden">主選單</span>
          </button>
        </div>
      </div>
    </div>
  );
};
