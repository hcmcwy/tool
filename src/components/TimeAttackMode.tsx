import React, { useState, useEffect } from 'react';
import { ArrowLeft, Timer, Zap, Trophy, RotateCcw } from 'lucide-react';
import { QUICK_FIX_CHALLENGES } from '../data/quizData';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolId } from '../types';
import { sound } from '../utils/audio';

interface TimeAttackModeProps {
  onBack: () => void;
}

export const TimeAttackMode: React.FC<TimeAttackModeProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const currentChallenge = QUICK_FIX_CHALLENGES[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (gameOver || feedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, gameOver, feedback]);

  const handleTimeOut = () => {
    sound.playError();
    setFeedback({
      isCorrect: false,
      text: `時間到！正確答案是：${TOOLS_DATA.find((t) => t.id === currentChallenge.correctToolId)?.name}。\n${currentChallenge.explanation}`,
    });
  };

  const handleSelectTool = (toolId: ToolId) => {
    if (feedback || gameOver) return;

    if (toolId === currentChallenge.correctToolId) {
      sound.playLevelSuccess();
      const points = 100 + timeLeft * 10;
      setScore((prev) => prev + points);
      setFeedback({
        isCorrect: true,
        text: `完全正確！(+${points}分)\n${currentChallenge.explanation}`,
      });
    } else {
      sound.playError();
      const correctName = TOOLS_DATA.find((t) => t.id === currentChallenge.correctToolId)?.name;
      setFeedback({
        isCorrect: false,
        text: `選錯了！正確應使用：【${correctName}】。\n${currentChallenge.explanation}`,
      });
    }
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex + 1 < QUICK_FIX_CHALLENGES.length) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(15);
    } else {
      setGameOver(true);
      sound.playVictoryFanfare();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(15);
    setGameOver(false);
    setFeedback(null);
  };

  // Combine correct tool with wrong tools and shuffle
  const options = React.useMemo(() => {
    if (!currentChallenge) return [];
    const list = [currentChallenge.correctToolId, ...currentChallenge.wrongTools];
    // deterministic shuffle based on challenge id
    return list.sort(() => (currentChallenge.id.charCodeAt(0) % 2 === 0 ? 0.5 - Math.random() : Math.random() - 0.5));
  }, [currentChallenge]);

  const getRank = (finalScore: number) => {
    if (finalScore >= 1800) return { title: 'S 級 · 傳奇維修大師', color: 'text-amber-400', desc: '神乎其技！所有家居手動工具如臂使指！' };
    if (finalScore >= 1200) return { title: 'A 級 · 資深維修師傅', color: 'text-emerald-400', desc: '經驗老道！熟稔各類維修常規與安全守則！' };
    if (finalScore >= 700) return { title: 'B 級 · 熟練家庭巧手', color: 'text-blue-400', desc: '能夠勝任大多數日常維修，避免滑牙與損壞！' };
    return { title: 'C 級 · 剛入行學徒', color: 'text-slate-400', desc: '建議多去「工具圖鑑」複習影片精華要點！' };
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#121418] text-slate-100 flex flex-col p-4 md:p-6 select-none font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto pb-4 border-b border-slate-800">
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

        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-black text-white">緊急急速搶修 · 限時挑戰</h1>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-bold tabular-nums text-sm ${timeLeft <= 5 ? 'text-rose-400' : 'text-slate-200'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="bg-amber-950/60 border border-amber-600/40 text-amber-300 px-3 py-1.5 rounded-lg font-bold">
            得分: <span className="tabular-nums text-sm">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Challenge Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto flex flex-col items-center justify-center py-6">
        {!gameOver ? (
          <div className="w-full bg-[#181a20] border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col">
            {/* Question Counter */}
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className="font-mono text-amber-400 font-bold bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
                緊急警報 #{currentIndex + 1} / {QUICK_FIX_CHALLENGES.length}
              </span>
              <span className="text-slate-400">剩餘挑戰：{QUICK_FIX_CHALLENGES.length - currentIndex}</span>
            </div>

            {/* Scenario Card */}
            <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-6">
              <span className="text-4xl">{currentChallenge.itemImage}</span>
              <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed">
                {currentChallenge.scenario}
              </p>
            </div>

            {/* Tool Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {options.map((toolId) => {
                const tool = TOOLS_DATA.find((t) => t.id === toolId);
                if (!tool) return null;

                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSelectTool(tool.id)}
                    disabled={feedback !== null}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      feedback !== null
                        ? tool.id === currentChallenge.correctToolId
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                          : 'bg-slate-900/50 border-slate-800 opacity-40'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 hover:border-amber-500 text-slate-200 hover:text-white border-slate-700 active:scale-95'
                    }`}
                  >
                    <span className="text-2xl">{tool.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{tool.name}</span>
                      <span className="text-[11px] text-slate-400">{tool.englishName}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Explanation Box */}
            {feedback && (
              <div
                className={`p-4 rounded-xl border mb-4 text-xs md:text-sm leading-relaxed whitespace-pre-line animate-fade-in ${
                  feedback.isCorrect
                    ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600/50 text-rose-200'
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Next Button */}
            {feedback && (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {currentIndex + 1 < QUICK_FIX_CHALLENGES.length ? '下一道故障搶修 ➔' : '查看最終維修成績 🏆'}
              </button>
            )}
          </div>
        ) : (
          /* Game Over Scorecard */
          <div className="w-full bg-[#181a20] border border-slate-700/80 rounded-2xl p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">搶修挑戰完成！</h2>
            <div className="text-xs text-slate-400 mb-6">家庭緊急突發維修評測結果</div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 w-full max-w-md mb-6">
              <div className="text-xs text-slate-400 mb-1">最終總得分</div>
              <div className="text-4xl font-black text-amber-400 font-mono tabular-nums mb-3">
                {score} <span className="text-base text-slate-400 font-normal">PTS</span>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className={`text-lg font-bold ${getRank(score).color}`}>
                  {getRank(score).title}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {getRank(score).desc}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRestart}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>再次挑戰</span>
              </button>

              <button
                onClick={onBack}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-amber-500/20"
              >
                返回主選單
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
