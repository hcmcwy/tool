/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { MissionStage } from './components/MissionStage';
import { ToolboxBar } from './components/ToolboxBar';
import { ToolEncyclopedia } from './components/ToolEncyclopedia';
import { TimeAttackMode } from './components/TimeAttackMode';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { HintModal } from './components/HintModal';
import { MISSIONS_DATA } from './data/missionsData';
import { TOOLS_DATA } from './data/toolsData';
import { ToolId } from './types';
import { sound } from './utils/audio';

type GameView = 'title' | 'playing' | 'workshop' | 'time_attack';

export default function App() {
  const [view, setView] = useState<GameView>('title');
  const [missionIndex, setMissionIndex] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [selectedToolId, setSelectedToolId] = useState<ToolId | null>(null);
  const [score, setScore] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [shakeKey, setShakeKey] = useState<number>(0);

  const currentMission = MISSIONS_DATA[missionIndex] || MISSIONS_DATA[0];
  const currentStep = currentMission.steps[stepIndex] || currentMission.steps[0];

  // Game timer
  useEffect(() => {
    if (view !== 'playing' || isPaused || isVictory) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [view, isPaused, isVictory]);

  // Global Keyboard Shortcuts (1-9 for tools, Esc for pause, M for mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sound
      if (e.key === 'm' || e.key === 'M') {
        setIsMuted(sound.toggleMute());
        return;
      }

      // Esc pause
      if (e.key === 'Escape' && view === 'playing' && !isVictory) {
        setIsPaused((prev) => !prev);
        sound.playClick();
        return;
      }

      // 1-9 for tools selection in playing mode
      if (view === 'playing' && !isPaused && !isVictory) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 9) {
          const tool = TOOLS_DATA[num - 1];
          if (tool) {
            setSelectedToolId(tool.id);
            sound.playClick();
          }
        } else if (e.key === '0') {
          const tool = TOOLS_DATA[9];
          if (tool) {
            setSelectedToolId(tool.id);
            sound.playClick();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, isPaused, isVictory]);

  const handleStartMissions = () => {
    setMissionIndex(0);
    setStepIndex(0);
    setScore(0);
    setElapsedSeconds(0);
    setSelectedToolId(null);
    setIsPaused(false);
    setIsVictory(false);
    setHintsUsed(0);
    setView('playing');
  };

  const handleStepComplete = (scoreGain: number) => {
    setScore((prev) => prev + scoreGain);

    if (stepIndex + 1 < currentMission.steps.length) {
      setStepIndex((prev) => prev + 1);
      setSelectedToolId(null);
    } else {
      setIsVictory(true);
    }
  };

  const handleNextMission = () => {
    if (missionIndex + 1 < MISSIONS_DATA.length) {
      setMissionIndex((prev) => prev + 1);
      setStepIndex(0);
      setSelectedToolId(null);
      setIsVictory(false);
      setIsPaused(false);
    } else {
      setView('title');
    }
  };

  const handleRestartMission = () => {
    setStepIndex(0);
    setSelectedToolId(null);
    setIsPaused(false);
    setIsVictory(false);
  };

  const handleToggleMute = () => {
    setIsMuted(sound.toggleMute());
  };

  const triggerErrorShake = () => {
    setShakeKey((prev) => prev + 1);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0d0f12] text-slate-100 font-sans select-none flex flex-col justify-between">
      {/* VIEW 1: TITLE SCREEN */}
      {view === 'title' && (
        <TitleScreen
          onStartMissions={handleStartMissions}
          onOpenWorkshop={() => setView('workshop')}
          onStartTimeAttack={() => setView('time_attack')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* VIEW 2: PLAYING ACTIVE MISSION */}
      {view === 'playing' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Top Low-Occlusion HUD */}
          <GameHUD
            mission={currentMission}
            currentStepIndex={stepIndex}
            score={score}
            elapsedSeconds={elapsedSeconds}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onTogglePause={() => setIsPaused(true)}
            onBackToTitle={() => setView('title')}
            onShowHint={() => {
              setShowHint(true);
              setHintsUsed((prev) => prev + 1);
            }}
            hintsUsed={hintsUsed}
          />

          {/* Interactive Playfield */}
          <div className="flex-1 w-full flex items-center justify-center p-4 pt-20 pb-2">
            <MissionStage
              key={`${currentMission.id}_${stepIndex}_${shakeKey}`}
              mission={currentMission}
              currentStepIndex={stepIndex}
              selectedToolId={selectedToolId}
              onStepComplete={handleStepComplete}
              onWrongToolUsed={() => triggerErrorShake()}
              onErrorShake={triggerErrorShake}
            />
          </div>

          {/* Bottom Tool Rack (Low-occlusion) */}
          <ToolboxBar
            selectedToolId={selectedToolId}
            onSelectTool={(toolId) => setSelectedToolId(toolId)}
            requiredToolId={currentStep.requiredToolId}
          />

          {/* Pause Modal */}
          {isPaused && (
            <PauseModal
              onResume={() => setIsPaused(false)}
              onRestart={handleRestartMission}
              onHome={() => setView('title')}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          )}

          {/* Victory Modal */}
          {isVictory && (
            <VictoryModal
              mission={currentMission}
              score={score}
              elapsedSeconds={elapsedSeconds}
              hintsUsed={hintsUsed}
              onNextMission={handleNextMission}
              onRestart={handleRestartMission}
              onHome={() => setView('title')}
              hasNextMission={missionIndex + 1 < MISSIONS_DATA.length}
            />
          )}

          {/* Educational Hint Modal */}
          {showHint && (
            <HintModal
              step={currentStep}
              onClose={() => setShowHint(false)}
            />
          )}
        </div>
      )}

      {/* VIEW 3: TOOL ENCYCLOPEDIA & SANDBOX WORKSHOP */}
      {view === 'workshop' && (
        <ToolEncyclopedia onBack={() => setView('title')} />
      )}

      {/* VIEW 4: EMERGENCY TIME ATTACK MODE */}
      {view === 'time_attack' && (
        <TimeAttackMode onBack={() => setView('title')} />
      )}
    </div>
  );
}
