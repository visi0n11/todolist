import React from 'react';
import { CheckSquare, Plus, Timer, Sun, Moon, Volume2, VolumeX, BarChart2 } from 'lucide-react';

export const TopBar = ({
  currentView,
  onViewChange,
  onOpenQuickAdd,
  onOpenAnalytics,
  onToggleTimer,
  isTimerActive,
  isDark,
  onToggleDark,
  isMuted,
  onToggleSound,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-30 transition-colors">
      {/* Zone 1: Brand Zone - Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onViewChange('inbox')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            TaskFlow
          </span>
        </button>
      </div>

      {/* Zone 2: Navigation Links - Clean single-line text navigation */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onViewChange('inbox')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'inbox' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => onViewChange('today')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'today' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
          }`}
        >
          Today
        </button>
        <button
          onClick={() => onViewChange('upcoming')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'upcoming' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => onViewChange('matrix')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'matrix' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
          }`}
        >
          Matrix
        </button>
        <button
          onClick={() => onViewChange('kanban')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'kanban' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
          }`}
        >
          Board
        </button>
        <button
          onClick={onOpenAnalytics}
          className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </nav>

      {/* Zone 3: Utility Controls & Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Focus Timer Button */}
        <button
          onClick={onToggleTimer}
          aria-label="Toggle Focus Timer"
          className={`p-2 rounded-lg text-sm font-medium transition-colors border ${
            isTimerActive
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Pomodoro Focus Timer"
        >
          <Timer className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          title={isMuted ? 'Sound muted (Click to enable)' : 'Sound enabled (Click to mute)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary CTA */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-blue-700 text-blue-100 rounded">
            N
          </kbd>
        </button>
      </div>
    </header>
  );
};
