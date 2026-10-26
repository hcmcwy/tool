import React from 'react';
import { ToolId, ToolDefinition } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import { sound } from '../utils/audio';

interface ToolboxBarProps {
  selectedToolId: ToolId | null;
  onSelectTool: (toolId: ToolId) => void;
  requiredToolId?: ToolId;
}

export const ToolboxBar: React.FC<ToolboxBarProps> = ({
  selectedToolId,
  onSelectTool,
  requiredToolId,
}) => {
  return (
    <div className="relative z-20 w-full max-w-6xl mx-auto px-4 pb-3">
      {/* Wooden / Metal Tool Rack Container */}
      <div className="bg-[#181a1f]/95 border border-slate-700/80 rounded-xl p-2.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-1.5 px-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🧰</span>
              <span>維修工具箱 (TOOL RACK)</span>
            </span>
            <span className="text-[11px] text-slate-400">
              點擊或按鍵盤數字鍵 <span className="text-slate-300 font-mono">[1~9]</span> 快速取用工具
            </span>
          </div>

          {selectedToolId && (
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="text-slate-400">當前手持：</span>
              <span className="font-semibold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
                {TOOLS_DATA.find((t) => t.id === selectedToolId)?.name}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Tool Tray */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {TOOLS_DATA.map((tool: ToolDefinition, idx: number) => {
            const isSelected = selectedToolId === tool.id;
            const isRecommended = requiredToolId === tool.id;
            const hotkey = idx < 9 ? `${idx + 1}` : idx === 9 ? '0' : '';

            return (
              <button
                key={tool.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTool(tool.id);
                }}
                className={`relative flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-150 cursor-pointer min-w-[76px] group ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30 scale-105 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
                title={`${tool.name} (${tool.englishName})\n${tool.bestFor}`}
              >
                {/* Hotkey Tag */}
                {hotkey && (
                  <span className="absolute top-1 left-1.5 font-mono text-[9px] text-slate-400 group-hover:text-amber-300">
                    {hotkey}
                  </span>
                )}

                {/* Recommended Indicator if player gets stuck or for learning */}
                {isRecommended && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}

                <span className="text-2xl my-0.5 filter drop-shadow group-hover:scale-110 transition-transform">
                  {tool.icon}
                </span>

                <span
                  className={`text-[11px] font-medium leading-tight max-w-[72px] truncate ${
                    isSelected ? 'text-amber-300 font-bold' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {tool.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
