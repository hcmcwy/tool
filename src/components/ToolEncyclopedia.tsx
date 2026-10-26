import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Video, Play } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolDefinition } from '../types';
import { sound } from '../utils/audio';

interface ToolEncyclopediaProps {
  onBack: () => void;
}

export const ToolEncyclopedia: React.FC<ToolEncyclopediaProps> = ({ onBack }) => {
  const [selectedTool, setSelectedTool] = useState<ToolDefinition>(TOOLS_DATA[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sandboxProgress, setSandboxProgress] = useState<number>(50);
  const [sandboxActive, setSandboxActive] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: '全部工具 (13)' },
    { id: 'fastening', label: '緊固拆裝 (螺絲批)' },
    { id: 'turning', label: '扳手旋轉' },
    { id: 'striking', label: '敲擊起釘 (鐵鎚/橡皮鎚)' },
    { id: 'pliers', label: '夾持剪切 (鉗類)' },
    { id: 'measuring', label: '測量水平' },
    { id: 'materials', label: '耗材防漏絕緣' },
  ];

  const filteredTools = TOOLS_DATA.filter(
    (t) => filterCategory === 'all' || t.category === filterCategory
  );

  const handleTestbenchAction = () => {
    setSandboxActive(true);
    setTimeout(() => setSandboxActive(false), 200);

    if (selectedTool.id === 'claw_hammer') {
      sound.playHammer(1.0);
    } else if (selectedTool.id === 'rubber_mallet') {
      sound.playMallet();
    } else if (selectedTool.id.includes('screwdriver')) {
      sound.playScrewdriver();
    } else if (selectedTool.id === 'adjustable_wrench') {
      sound.playWrench();
    } else if (selectedTool.id.includes('pliers')) {
      sound.playPliersSnip();
    } else if (selectedTool.id === 'tape_measure') {
      sound.playTapePull();
    } else if (selectedTool.id === 'spirit_level') {
      sound.playLevelSuccess();
    } else {
      sound.playWrapTape();
    }

    setSandboxProgress((prev) => (prev >= 100 ? 10 : prev + 20));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#121418] text-slate-100 flex flex-col p-4 md:p-6 select-none font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="返回主選單"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>🧰 家居維修工具圖鑑與試用台</span>
            </h1>
            <p className="text-xs text-slate-400">
              收錄 YouTube《自己動手系列：常用家居維修手動工具介紹》完整 13 款工具實務教學
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                sound.playClick();
                setFilterCategory(c.id);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filterCategory === c.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Split Pane */}
      <div className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 overflow-hidden">
        {/* Left Column: Tool Selector Grid */}
        <div className="md:col-span-5 flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 max-h-[calc(100vh-140px)]">
          {filteredTools.map((tool) => {
            const isSelected = selectedTool.id === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTool(tool);
                  setSandboxProgress(50);
                }}
                className={`flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300'
                }`}
              >
                <span className="text-3xl filter drop-shadow">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate">{tool.name}</span>
                    <span className="text-[10px] font-mono text-amber-400/90 bg-amber-950/40 border border-amber-600/30 px-1.5 py-0.5 rounded">
                      {tool.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {tool.englishName}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: In-depth Tool Dossier & Live Interactive Testbench */}
        <div className="md:col-span-7 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 max-h-[calc(100vh-140px)]">
          {/* Main Dossier Card */}
          <div className="bg-[#181a20] border border-slate-700/80 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-3xl shadow-inner">
                  {selectedTool.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedTool.name}</h2>
                  <div className="text-xs font-mono text-amber-400">{selectedTool.englishName}</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-5 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              {selectedTool.description}
            </p>

            {/* Structured Insights */}
            <div className="space-y-3">
              {/* Best For */}
              <div className="flex items-start gap-2.5 bg-emerald-950/30 border border-emerald-700/30 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-300 mb-0.5">最佳適用場景</div>
                  <div className="text-emerald-100/90 leading-relaxed">{selectedTool.bestFor}</div>
                </div>
              </div>

              {/* Don't Use For */}
              <div className="flex items-start gap-2.5 bg-rose-950/30 border border-rose-700/30 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-rose-300 mb-0.5">常見錯誤與禁忌</div>
                  <div className="text-rose-100/90 leading-relaxed">{selectedTool.dontUseFor}</div>
                </div>
              </div>

              {/* Safety Tip */}
              <div className="flex items-start gap-2.5 bg-blue-950/30 border border-blue-700/30 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-blue-300 mb-0.5">安全操作守則</div>
                  <div className="text-blue-100/90 leading-relaxed">{selectedTool.safetyTip}</div>
                </div>
              </div>

              {/* Video Highlight Takeaway */}
              <div className="flex items-start gap-2.5 bg-amber-950/40 border border-amber-600/40 rounded-xl p-3">
                <Video className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-amber-300 mb-0.5">影片教學精華要點</div>
                  <div className="text-amber-100/90 leading-relaxed">{selectedTool.videoHighlight}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Interactive Testbench (試用實驗台) */}
          <div className="bg-[#181a20] border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span>
                <span>工具即時互動試用台 (TESTBENCH)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                點擊下方按鈕或工作台試試手感
              </span>
            </div>

            <div
              onClick={handleTestbenchAction}
              className={`h-36 rounded-xl bg-gradient-to-b from-slate-900 to-[#121418] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden ${
                sandboxActive ? 'border-amber-400 bg-amber-500/10' : 'hover:border-slate-500'
              }`}
            >
              <div className="text-4xl mb-2 filter drop-shadow animate-pulse">
                {selectedTool.icon}
              </div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-amber-300" />
                <span>點擊觸發工具動作與音效</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                狀態模擬進度：{sandboxProgress}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
