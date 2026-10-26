import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RepairMission, ToolId } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import { sound } from '../utils/audio';

interface MissionStageProps {
  mission: RepairMission;
  currentStepIndex: number;
  selectedToolId: ToolId | null;
  onStepComplete: (scoreGain: number) => void;
  onWrongToolUsed: (wrongMsg: string) => void;
  onErrorShake: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export const MissionStage: React.FC<MissionStageProps> = ({
  mission,
  currentStepIndex,
  selectedToolId,
  onStepComplete,
  onWrongToolUsed,
  onErrorShake,
}) => {
  const currentStep = mission.steps[currentStepIndex];
  const [progress, setProgress] = useState<number>(0);
  const [isActionActive, setIsActionActive] = useState<boolean>(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [shake, setShake] = useState<number>(0);
  const [frameAngle, setFrameAngle] = useState<number>(-12); // for balance step
  const [tapeDist, setTapeDist] = useState<number>(25); // for measure step
  const [turns, setTurns] = useState<number>(0); // for wrap step

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Reset progress when step changes
  useEffect(() => {
    setProgress(0);
    setWarningMsg(null);
    setShake(0);
    setFrameAngle(-12);
    setTapeDist(25);
    setTurns(0);
  }, [currentStepIndex]);

  // Particle Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.alpha -= 0.025;
        p.life -= 1;

        if (p.alpha <= 0 || p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (running) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string = '#f59e0b', count: number = 18) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        life: 30 + Math.random() * 20,
      });
    }
  }, []);

  // Validation before action
  const validateTool = (): boolean => {
    if (!selectedToolId) {
      setWarningMsg('請先在下方工具箱挑選合適的維修手動工具！');
      sound.playError();
      onErrorShake();
      return false;
    }
    if (selectedToolId !== currentStep.requiredToolId) {
      setWarningMsg(currentStep.toolExplanationOnWrong);
      sound.playError();
      onErrorShake();
      onWrongToolUsed(currentStep.toolExplanationOnWrong);
      return false;
    }
    setWarningMsg(null);
    return true;
  };

  // Trigger strike action (Mallet or Hammer)
  const handleStrike = (e: React.MouseEvent) => {
    if (!validateTool()) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    if (currentStep.requiredToolId === 'rubber_mallet') {
      sound.playMallet();
      spawnParticles(cx, cy, '#d97706', 12);
    } else {
      sound.playHammer(1.0);
      spawnParticles(cx, cy, '#fbbf24', 24);
      setShake(6);
      setTimeout(() => setShake(0), 100);
    }

    const nextProgress = Math.min(100, progress + 25);
    setProgress(nextProgress);

    if (nextProgress >= 100) {
      setTimeout(() => onStepComplete(300), 400);
    }
  };

  // Trigger rotation action (Screwdriver, Wrench, Allen Key, Combination Pliers)
  const handleRotate = () => {
    if (!validateTool()) return;

    if (currentStep.requiredToolId === 'phillips_screwdriver' || currentStep.requiredToolId === 'flathead_screwdriver') {
      sound.playScrewdriver(1 + progress / 100);
    } else if (currentStep.requiredToolId === 'adjustable_wrench') {
      sound.playWrench();
    } else if (currentStep.requiredToolId === 'combination_pliers') {
      sound.playPliersSnip();
    } else {
      sound.playScrewdriver(0.8);
    }

    const nextProgress = Math.min(100, progress + 16.7);
    setProgress(nextProgress);

    if (nextProgress >= 100) {
      setTimeout(() => onStepComplete(350), 400);
    }
  };

  // Trigger extract action (Pliers, Claw Hammer pulling nail)
  const handleExtract = () => {
    if (!validateTool()) return;

    if (currentStep.requiredToolId === 'claw_hammer') {
      sound.playHammer(0.7);
      sound.playTapeSnap();
    } else {
      sound.playPliersSnip();
    }

    const nextProgress = Math.min(100, progress + 25);
    setProgress(nextProgress);

    if (nextProgress >= 100) {
      setTimeout(() => onStepComplete(350), 400);
    }
  };

  // Trigger tape wrap action (Teflon Tape, Insulation Tape)
  const handleWrap = () => {
    if (!validateTool()) return;
    sound.playWrapTape();

    const nextTurns = turns + 1;
    setTurns(nextTurns);
    const nextProgress = Math.min(100, Math.round((nextTurns / 5) * 100));
    setProgress(nextProgress);

    if (nextProgress >= 100) {
      setTimeout(() => onStepComplete(300), 400);
    }
  };

  // Handle Spirit Level Tilt adjustment
  const handleLevelTilt = (delta: number) => {
    if (!validateTool()) return;
    const nextAngle = Math.max(-20, Math.min(20, frameAngle + delta));
    setFrameAngle(nextAngle);

    // If near zero (within +- 0.8 degrees), success!
    if (Math.abs(nextAngle) <= 0.8) {
      sound.playLevelSuccess();
      setProgress(100);
      setTimeout(() => onStepComplete(400), 700);
    } else {
      sound.playClick();
      const accuracy = Math.max(0, 100 - Math.abs(nextAngle) * 7);
      setProgress(Math.round(accuracy));
    }
  };

  // Handle Tape Measure pull
  const handleMeasureDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validateTool()) return;
    const val = parseFloat(e.target.value);
    setTapeDist(val);
    sound.playTapePull();

    if (Math.abs(val - 50.0) < 0.5) {
      sound.playTapeSnap();
      setProgress(100);
      setTimeout(() => onStepComplete(300), 500);
    } else {
      const diff = Math.abs(val - 50.0);
      const acc = Math.max(0, Math.round(100 - diff * 3));
      setProgress(acc);
    }
  };

  // Spacebar triggers current action
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (currentStep.actionType === 'tap_strike') {
          handleStrike({ currentTarget: { getBoundingClientRect: () => ({ left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 }) } } as unknown as React.MouseEvent);
        } else if (currentStep.actionType === 'rotate') {
          handleRotate();
        } else if (currentStep.actionType === 'extract') {
          handleExtract();
        } else if (currentStep.actionType === 'wrap') {
          handleWrap();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, progress, selectedToolId, turns]);

  const activeToolDef = TOOLS_DATA.find((t) => t.id === selectedToolId);
  const requiredToolDef = TOOLS_DATA.find((t) => t.id === currentStep.requiredToolId);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        transform: shake > 0 ? `translate(${Math.sin(Date.now()) * shake}px, ${Math.cos(Date.now()) * shake}px)` : 'none',
        transition: 'transform 0.05s ease',
      }}
    >
      {/* Particle Overlay Canvas (Full screen, no pointer events) */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="pointer-events-none absolute inset-0 z-20 w-full h-full"
      />

      {/* Main Worktable Simulation Stage */}
      <div className="relative w-full max-w-4xl h-[480px] md:h-[520px] rounded-2xl bg-gradient-to-b from-[#232730] to-[#181a20] border-2 border-slate-700/80 shadow-2xl flex flex-col justify-between p-6 overflow-hidden">
        {/* Workbench texture line */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[#1e2229] border-t border-slate-800 opacity-60" />

        {/* Step Briefing Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/85 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
                當前步驟任務
              </span>
              <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
                {currentStep.title}
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {currentStep.prompt}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-col items-end min-w-[140px]">
            <div className="flex items-center gap-2 text-xs mb-1.5">
              <span className="text-slate-400">修復完成度</span>
              <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Playfield Centerpiece */}
        <div className="relative z-10 flex-1 flex items-center justify-center my-2">
          {/* SCENARIO 1: Tap Strike (Wood dowel / Nail) */}
          {currentStep.actionType === 'tap_strike' && (
            <div className="flex flex-col items-center">
              <div
                onClick={handleStrike}
                className="group relative cursor-pointer flex flex-col items-center justify-center p-8 transition-transform active:scale-95"
                title="點擊或按空白鍵進行敲擊"
              >
                {/* Visual of wood joint & protruding dowel */}
                {currentStep.requiredToolId === 'rubber_mallet' ? (
                  <div className="relative flex flex-col items-center">
                    {/* The Wood Frame Block */}
                    <div className="w-48 h-28 rounded-lg bg-amber-900/80 border-4 border-amber-800 shadow-xl flex items-center justify-center relative overflow-hidden">
                      <div className="text-xs font-mono text-amber-200/50 uppercase tracking-widest">
                        實木卡榫接口
                      </div>
                      {/* The protruding dowel pin */}
                      <div
                        className="absolute -top-7 w-12 h-14 bg-amber-600 border-2 border-amber-500 rounded-t-md shadow-md transition-all duration-200 flex items-center justify-center"
                        style={{
                          transform: `translateY(${(progress / 100) * 26}px)`,
                        }}
                      >
                        <div className="w-8 h-1 bg-amber-700 rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Wall Nail hammering */
                  <div className="relative flex flex-col items-center">
                    <div className="w-48 h-32 rounded-lg bg-stone-700 border-4 border-stone-600 shadow-xl flex items-center justify-center relative">
                      <div className="text-xs font-mono text-stone-400 uppercase">水泥實心牆</div>
                      {/* The steel nail */}
                      <div
                        className="absolute -top-10 w-4 bg-slate-300 border border-slate-400 rounded-t shadow-lg transition-all duration-200 flex flex-col items-center"
                        style={{
                          height: '50px',
                          transform: `translateY(${(progress / 100) * 36}px)`,
                        }}
                      >
                        <div className="w-7 h-2 bg-slate-400 rounded-full -mt-1 shadow" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Handheld Tool Animation Hover Overlay */}
                <div className="mt-6 flex items-center gap-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 px-5 py-2.5 rounded-xl text-amber-300 font-bold text-sm shadow-lg group-hover:scale-105 transition-all">
                  <span className="text-xl">
                    {activeToolDef ? activeToolDef.icon : '🔨'}
                  </span>
                  <span>點擊揮擊 / 敲入到位 (或按 Space)</span>
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO 2: Rotate (Screwdriver / Wrench / Allen Key) */}
          {currentStep.actionType === 'rotate' && (
            <div className="flex flex-col items-center">
              <div
                onClick={handleRotate}
                className="group relative cursor-pointer flex flex-col items-center justify-center p-8 transition-transform active:scale-95"
                title="點擊或按空白鍵旋緊"
              >
                {/* SVG Fastener / Hex Nut / Pipe Nut */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div
                    className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-600 shadow-2xl flex items-center justify-center transition-transform duration-150"
                    style={{
                      transform: `rotate(${progress * 7.2}deg)`,
                    }}
                  >
                    {currentStep.requiredToolId === 'adjustable_wrench' ? (
                      /* Big Hex Pipe Nut */
                      <div className="w-24 h-24 bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 rounded-lg flex items-center justify-center shadow-inner border border-amber-400">
                        <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                          <span className="text-[10px] font-mono text-amber-400 font-bold">六角螺母</span>
                        </div>
                      </div>
                    ) : currentStep.requiredToolId === 'allen_key' ? (
                      /* Hex Socket Screw */
                      <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center">
                        <div className="w-10 h-10 bg-slate-950 border border-slate-600 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] flex items-center justify-center">
                          <span className="text-[9px] font-mono text-amber-400">HEX</span>
                        </div>
                      </div>
                    ) : (
                      /* Cross Screw Head */
                      <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center relative">
                        <div className="w-12 h-3 bg-slate-950 rounded-sm" />
                        <div className="w-3 h-12 bg-slate-950 rounded-sm absolute" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 px-5 py-2.5 rounded-xl text-amber-300 font-bold text-sm shadow-lg group-hover:scale-105 transition-all">
                  <span className="text-xl">
                    {activeToolDef ? activeToolDef.icon : '🪛'}
                  </span>
                  <span>順時針擰緊鎖死 (點擊或 Space)</span>
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO 3: Balance (Spirit Level) */}
          {currentStep.actionType === 'balance' && (
            <div className="flex flex-col items-center w-full max-w-lg">
              {/* Picture Frame with Mounted Level */}
              <div
                className="relative w-80 h-44 rounded-xl bg-amber-950/70 border-4 border-amber-700 shadow-2xl flex flex-col items-center justify-between p-3 transition-transform duration-100"
                style={{
                  transform: `rotate(${frameAngle}deg)`,
                }}
              >
                {/* Embedded Spirit Level Tool on Top */}
                <div className="w-64 h-9 rounded-lg bg-amber-500 border-2 border-amber-300 shadow-inner flex items-center justify-center px-4 relative overflow-hidden">
                  <span className="text-[9px] font-mono font-bold text-amber-950 mr-2">SPIRIT LEVEL</span>
                  {/* Bubble Vial Tube */}
                  <div className="relative w-36 h-5 rounded-full bg-emerald-400/90 border border-emerald-700 flex items-center justify-center shadow-inner overflow-hidden">
                    {/* Centering Indicator Double Lines */}
                    <div className="absolute left-[45%] top-0 bottom-0 w-[2px] bg-slate-900/80 z-10" />
                    <div className="absolute right-[45%] top-0 bottom-0 w-[2px] bg-slate-900/80 z-10" />

                    {/* Fluid Bubble */}
                    <div
                      className="w-5 h-4 rounded-full bg-white/90 shadow-md transition-all duration-75 flex items-center justify-center"
                      style={{
                        transform: `translateX(${frameAngle * 2.8}px)`,
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-200/50" />
                    </div>
                  </div>
                </div>

                <div className="text-center my-auto">
                  <span className="text-3xl">🖼️</span>
                  <div className="text-xs text-amber-200/80 mt-1 font-serif">《客廳名畫 · 水平校準》</div>
                </div>

                <div className="text-[11px] font-mono text-amber-300/80">
                  當前傾角: <span className="tabular-nums font-bold text-white">{frameAngle > 0 ? `+${frameAngle.toFixed(1)}°` : `${frameAngle.toFixed(1)}°`}</span>
                </div>
              </div>

              {/* Angle Adjustment Controls */}
              <div className="mt-5 flex items-center gap-4">
                <button
                  onClick={() => handleLevelTilt(2)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 font-bold text-sm cursor-pointer shadow active:scale-95"
                >
                  向右扶正 (+2°)
                </button>

                <button
                  onClick={() => handleLevelTilt(-2)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 font-bold text-sm cursor-pointer shadow active:scale-95"
                >
                  向左微調 (-2°)
                </button>
              </div>

              <span className="text-xs text-amber-400 mt-2">
                提示：調整畫框傾斜，讓綠色氣泡完全停在中央雙黑線內！
              </span>
            </div>
          )}

          {/* SCENARIO 4: Measure Align (Tape Measure) */}
          {currentStep.actionType === 'measure_align' && (
            <div className="flex flex-col items-center w-full max-w-lg">
              <div className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-5 shadow-xl flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-2">
                  目標定位距離：<span className="text-amber-400 font-bold font-mono text-sm">50.0 cm</span>
                </div>

                {/* Tape Measure Graphic */}
                <div className="relative w-full h-16 flex items-center bg-stone-900 border-2 border-dashed border-slate-700 rounded-lg px-4 mb-4">
                  {/* Tape Housing */}
                  <div className="w-14 h-12 bg-amber-500 rounded-md border-2 border-amber-600 flex items-center justify-center text-xs font-mono font-bold text-slate-950 shadow">
                    拉尺
                  </div>

                  {/* Yellow Steel Tape */}
                  <div
                    className="h-7 bg-amber-300 border-y border-amber-500 shadow flex items-center justify-end px-2 transition-all duration-75 relative"
                    style={{ width: `${Math.min(80, (tapeDist / 60) * 80)}%` }}
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-900 tabular-nums">
                      {tapeDist.toFixed(1)} cm
                    </span>
                    {/* Metal Hook */}
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-slate-950 rounded-r" />
                  </div>

                  {/* Wall Reference Mark */}
                  <div className="absolute right-12 top-2 bottom-2 w-0.5 bg-rose-500 flex flex-col justify-between items-center">
                    <span className="text-[9px] font-mono text-rose-400 -mt-3">50cm標記點</span>
                  </div>
                </div>

                {/* Slider Control */}
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="0.5"
                  value={tapeDist}
                  onChange={handleMeasureDrag}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                />

                <span className="text-xs text-slate-400 mt-3">
                  拖動滑塊拉伸金屬尺身至 50.0 cm 處打上鉛筆記號
                </span>
              </div>
            </div>
          )}

          {/* SCENARIO 5: Extract (Needle-nose Pliers, Claw Hammer) */}
          {currentStep.actionType === 'extract' && (
            <div className="flex flex-col items-center">
              <div
                onClick={handleExtract}
                className="group relative cursor-pointer flex flex-col items-center justify-center p-8 transition-transform active:scale-95"
                title="點擊或按空白鍵向外拔出"
              >
                <div className="relative w-44 h-36 rounded-xl bg-slate-800/90 border-2 border-slate-600 shadow-xl flex items-center justify-center">
                  {currentStep.requiredToolId === 'claw_hammer' ? (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl transform -rotate-45 mb-2">📌</span>
                      <span className="text-xs font-mono text-amber-400">已鬆動 50%</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">🌀</span>
                      <span className="text-xs font-mono text-amber-400">電機內部金屬線</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 px-5 py-2.5 rounded-xl text-amber-300 font-bold text-sm shadow-lg group-hover:scale-105 transition-all">
                  <span className="text-xl">
                    {activeToolDef ? activeToolDef.icon : '🗜️'}
                  </span>
                  <span>咬住向外拔出 (點擊或 Space)</span>
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO 6: Wrap (Teflon Tape, Insulation Tape) */}
          {currentStep.actionType === 'wrap' && (
            <div className="flex flex-col items-center">
              <div
                onClick={handleWrap}
                className="group relative cursor-pointer flex flex-col items-center justify-center p-8 transition-transform active:scale-95"
                title="點擊或按空白鍵順時針纏繞"
              >
                {/* Pipe Thread / Wire Cylinder */}
                <div className="relative w-48 h-28 rounded-lg bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 border-2 border-amber-500 shadow-2xl flex items-center justify-center overflow-hidden">
                  {/* Wrapped Rings */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((ring) => (
                      <div
                        key={ring}
                        className={`w-6 h-20 rounded-sm border transition-all duration-200 ${
                          turns >= ring
                            ? currentStep.requiredToolId === 'teflon_tape'
                              ? 'bg-white border-slate-300 shadow-md'
                              : 'bg-slate-950 border-slate-700 shadow-md'
                            : 'bg-transparent border-dashed border-amber-400/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 px-5 py-2.5 rounded-xl text-amber-300 font-bold text-sm shadow-lg group-hover:scale-105 transition-all">
                  <span className="text-xl">
                    {activeToolDef ? activeToolDef.icon : '💧'}
                  </span>
                  <span>
                    順時針纏繞密封 (已纏 {turns} / 5 圈)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO 7: Click Hold (Utility Knife trim) */}
          {currentStep.actionType === 'click_hold' && (
            <div className="flex flex-col items-center">
              <div
                onClick={() => {
                  if (!validateTool()) return;
                  sound.playPliersSnip();
                  setProgress(100);
                  setTimeout(() => onStepComplete(300), 400);
                }}
                className="group relative cursor-pointer flex flex-col items-center justify-center p-8 transition-transform active:scale-95"
              >
                <div className="w-56 h-32 rounded-xl bg-slate-800 border-2 border-slate-600 flex items-center justify-center relative overflow-hidden">
                  <div className="w-40 h-8 bg-neutral-900 border-t-2 border-neutral-700 flex items-center justify-between px-3">
                    <span className="text-xs text-neutral-400">門框防撞膠條</span>
                    <span className="text-xs text-rose-400 font-bold">待裁切過長邊</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 px-5 py-2.5 rounded-xl text-amber-300 font-bold text-sm shadow-lg group-hover:scale-105 transition-all">
                  <span className="text-xl">
                    {activeToolDef ? activeToolDef.icon : '🔪'}
                  </span>
                  <span>平直裁切多餘膠條 (點擊操作)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Warning / Educational Feedback Modal Overlay on Wrong Tool */}
        {warningMsg && (
          <div className="relative z-20 bg-rose-950/90 border-2 border-rose-500/80 rounded-xl p-3.5 shadow-xl flex items-center justify-between gap-3 text-xs md:text-sm text-rose-200 animate-bounce">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{warningMsg}</span>
            </div>
            <button
              onClick={() => setWarningMsg(null)}
              className="text-xs bg-rose-800 hover:bg-rose-700 text-white px-2.5 py-1 rounded font-bold cursor-pointer"
            >
              明白
            </button>
          </div>
        )}

        {/* Bottom Hint Banner */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">維修訣竅：</span>
            <span>{currentStep.detailHint}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span>推薦工具：</span>
            <span className="text-amber-300 font-semibold">{requiredToolDef?.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
