import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  X, 
  Minimize2, 
  Maximize2, 
  CheckCircle2
} from 'lucide-react';
import { playTimerFinishSound, playClickSound } from '../utils/audio';
import confetti from 'canvas-confetti';

export const FocusTimer = ({
  pomodoro,
  onUpdatePomodoro,
  onClose,
  onCompleteTask,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    let interval = null;

    if (pomodoro.isRunning) {
      interval = setInterval(() => {
        if (pomodoro.secondsRemaining > 0) {
          onUpdatePomodoro({
            ...pomodoro,
            secondsRemaining: pomodoro.secondsRemaining - 1,
          });
        } else {
          // Timer finished!
          playTimerFinishSound();

          if (pomodoro.mode === 'work') {
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
              });
            } catch {
              // ignore
            }

            const nextSessions = pomodoro.completedSessions + 1;
            const nextMode = nextSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
            const nextDuration = nextMode === 'longBreak' ? 15 : 5;

            onUpdatePomodoro({
              ...pomodoro,
              mode: nextMode,
              durationMinutes: nextDuration,
              secondsRemaining: nextDuration * 60,
              isRunning: false,
              completedSessions: nextSessions,
            });
          } else {
            // Break finished -> back to work
            onUpdatePomodoro({
              ...pomodoro,
              mode: 'work',
              durationMinutes: 25,
              secondsRemaining: 25 * 60,
              isRunning: false,
            });
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro, onUpdatePomodoro]);

  const toggleRunning = () => {
    playClickSound();
    onUpdatePomodoro({
      ...pomodoro,
      isRunning: !pomodoro.isRunning,
    });
  };

  const handleReset = () => {
    playClickSound();
    onUpdatePomodoro({
      ...pomodoro,
      isRunning: false,
      secondsRemaining: pomodoro.durationMinutes * 60,
    });
  };

  const handleSwitchMode = (mode) => {
    playClickSound();
    let mins = 25;
    if (mode === 'shortBreak') mins = 5;
    if (mode === 'longBreak') mins = 15;

    onUpdatePomodoro({
      ...pomodoro,
      mode,
      durationMinutes: mins,
      secondsRemaining: mins * 60,
      isRunning: false,
    });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSeconds = pomodoro.durationMinutes * 60;
  const progressPercent = totalSeconds > 0 
    ? Math.min(100, Math.max(0, ((totalSeconds - pomodoro.secondsRemaining) / totalSeconds) * 100))
    : 0;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-4 py-2 flex items-center gap-3 animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-mono tabular-nums text-xs font-semibold text-slate-800 dark:text-slate-200">
            {formatTime(pomodoro.secondsRemaining)}
          </span>
        </div>
        <button
          onClick={toggleRunning}
          className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900"
        >
          {pomodoro.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 text-slate-400 hover:text-slate-600"
          title="Expand"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Focus Timer
          </span>
          <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            #{pomodoro.completedSessions}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            title="Close timer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg text-[11px] font-medium text-center">
        <button
          onClick={() => handleSwitchMode('work')}
          className={`py-1 rounded-md transition-colors ${
            pomodoro.mode === 'work'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          25m Work
        </button>
        <button
          onClick={() => handleSwitchMode('shortBreak')}
          className={`py-1 rounded-md transition-colors ${
            pomodoro.mode === 'shortBreak'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          5m Break
        </button>
        <button
          onClick={() => handleSwitchMode('longBreak')}
          className={`py-1 rounded-md transition-colors ${
            pomodoro.mode === 'longBreak'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          15m Break
        </button>
      </div>

      {/* Linked Task Context */}
      {pomodoro.taskTitle ? (
        <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 tracking-wide block">
              Current Task
            </span>
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
              {pomodoro.taskTitle}
            </div>
          </div>
          {pomodoro.taskId && onCompleteTask && (
            <button
              onClick={() => {
                onCompleteTask(pomodoro.taskId);
                onUpdatePomodoro({ ...pomodoro, taskId: null, taskTitle: null });
              }}
              className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
              title="Mark task done"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="text-[11px] text-center text-slate-400">
          Independent focus session
        </div>
      )}

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="font-mono tabular-nums text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {formatTime(pomodoro.secondsRemaining)}
        </div>

        {/* Linear progress */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-300 ${
              pomodoro.mode === 'work' ? 'bg-blue-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          onClick={handleReset}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Reset session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleRunning}
          className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          {pomodoro.isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            const nextMode = pomodoro.mode === 'work' ? 'shortBreak' : 'work';
            handleSwitchMode(nextMode);
          }}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Skip session"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
