import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Wrench, Shield, Award, Play, BookOpen, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStartMissions: () => void;
  onOpenWorkshop: () => void;
  onStartTimeAttack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartMissions,
  onOpenWorkshop,
  onStartTimeAttack,
  isMuted,
  onToggleMute,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        sound.playClick();
        if (selectedIdx === 0) onStartMissions();
        else if (selectedIdx === 1) onOpenWorkshop();
        else if (selectedIdx === 2) onStartTimeAttack();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev > 0 ? prev - 1 : 2));
        sound.playClick();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev < 2 ? prev + 1 : 0));
        sound.playClick();
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, onStartMissions, onOpenWorkshop, onStartTimeAttack, onToggleMute]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#1b1e23] via-[#14171c] to-[#0e1014] text-slate-100 flex flex-col justify-between p-6 select-none font-sans">
      {/* Background Blueprint / Workbench Grid Layer */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15), transparent 70%),
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* Decorative ambient tool silhouettes in background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-16 opacity-15">
        <span className="text-8xl select-none filter blur-[1px] rotate-[-25deg] transform -translate-y-8">🪛</span>
        <span className="text-9xl select-none filter blur-[1px] rotate-[15deg] transform translate-y-12">🔧</span>
        <span className="text-8xl select-none filter blur-[1px] rotate-[-10deg] transform -translate-y-16">🔨</span>
      </div>

      {/* Top Bar: Minimal low-occlusion badge & sound toggle */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto pt-2">
        <div className="flex items-center gap-2.5 text-xs tracking-wider uppercase text-amber-400/90 font-medium bg-amber-950/40 border border-amber-600/30 px-3.5 py-1.5 rounded">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>自己動手系列 · 常用家居維修手動工具指南</span>
        </div>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-xs font-medium cursor-pointer"
          title="切換音效 (快捷鍵 M)"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? '已靜音 (M)' : '音效已開啟 (M)'}</span>
        </button>
      </div>

      {/* Centerpiece: Bespoke Title Lockup with 35% negative space */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-4xl mx-auto">
        {/* Inline SVG Title Lockup */}
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Wrench className="w-8 h-8 text-amber-400 transform -rotate-12" />
          </div>
          <div className="text-left">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold block">
              HOME REPAIR WORKSHOP SIMULATOR
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              <span>家居維修大師</span>
              <span className="text-amber-400 font-serif font-medium text-2xl md:text-3xl">自己動手做</span>
            </h1>
          </div>
        </div>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mb-8 leading-relaxed">
          掌握十字/一字螺絲批、活動扳手、羊角錘、橡皮鎚、水平尺、捲尺、止洩帶等必備工具。
          解決搖晃家具、水龍頭滲水、歪斜掛畫與破損線路，成為自給自足的家庭維修巧手！
        </p>

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
          {/* Card 1: 實戰任務 */}
          <button
            onClick={() => {
              sound.playClick();
              onStartMissions();
            }}
            onMouseEnter={() => setSelectedIdx(0)}
            className={`group text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
              selectedIdx === 0
                ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 transform scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🛠️</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${selectedIdx === 0 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                推薦模式
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>實戰維修任務</span>
              <Play className="w-4 h-4 opacity-70" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              5 大實境家居故障！椅腳木榫、水龍頭漏水、歪斜掛畫、風扇雜物與滑牙螺絲修復。
            </p>
          </button>

          {/* Card 2: 工具百科 */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenWorkshop();
            }}
            onMouseEnter={() => setSelectedIdx(1)}
            className={`group text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
              selectedIdx === 1
                ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 transform scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🧰</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
                13 款必備工具
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>工具圖鑑與試用台</span>
              <BookOpen className="w-4 h-4 opacity-70" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              收錄影片所有工具的規格選型、技巧與安全禁忌，並可在互動台上親手把玩操作。
            </p>
          </button>

          {/* Card 3: 緊急急速搶修 */}
          <button
            onClick={() => {
              sound.playClick();
              onStartTimeAttack();
            }}
            onMouseEnter={() => setSelectedIdx(2)}
            className={`group text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
              selectedIdx === 2
                ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 transform scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">⏱️</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-rose-950/60 border border-rose-800/40 text-rose-300">
                限時挑戰
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
              <span>緊急急速搶修</span>
              <Zap className="w-4 h-4 opacity-70 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              隨機 10 道突發家居故障！考驗工具直覺與臨場手速，爭取維修達人 S 級評分！
            </p>
          </button>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              if (selectedIdx === 0) onStartMissions();
              else if (selectedIdx === 1) onOpenWorkshop();
              else onStartTimeAttack();
            }}
            className="px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base tracking-wide flex items-center gap-2.5 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>開始體驗 (Enter / Space)</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line & Video Attribution */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4 gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>快捷操作：[1-9] 數字鍵選擇工具 · 滑鼠拖曳旋轉/敲擊 · Space 動作 · Esc 暫停</span>
        </div>
        <div className="text-slate-400 flex items-center gap-2">
          <span>參考影片：【自己動手系列】常用家居維修手動工具介紹</span>
        </div>
      </div>
    </div>
  );
};
