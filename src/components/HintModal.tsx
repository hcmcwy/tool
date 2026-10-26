import React from 'react';
import { X, Lightbulb, Video, AlertCircle } from 'lucide-react';
import { MissionStep, ToolDefinition } from '../types';
import { TOOLS_DATA } from '../data/toolsData';

interface HintModalProps {
  step: MissionStep;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({ step, onClose }) => {
  const tool: ToolDefinition | undefined = TOOLS_DATA.find((t) => t.id === step.requiredToolId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none font-sans">
      <div className="w-full max-w-md bg-[#181a20] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl flex flex-col text-left">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>維修技巧與工具指南</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-1">當前任務要求</div>
          <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            {step.prompt}
          </p>
        </div>

        {tool && (
          <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{tool.icon}</span>
              <div>
                <div className="text-xs font-mono text-amber-400">推薦使用工具</div>
                <div className="text-base font-black text-white">{tool.name}</div>
              </div>
            </div>

            <div className="space-y-2 mt-3 text-xs">
              <div className="flex items-start gap-2 text-amber-100/90">
                <Video className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{tool.videoHighlight}</span>
              </div>

              <div className="flex items-start gap-2 text-slate-300">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{tool.safetyTip}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
        >
          我明白了，繼續維修
        </button>
      </div>
    </div>
  );
};
