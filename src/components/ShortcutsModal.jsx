import React from 'react';
import { X, Command } from 'lucide-react';

export const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Create a new task' },
    { key: 'F or /', desc: 'Jump to search & filter' },
    { key: '1', desc: 'Switch to Inbox' },
    { key: '2', desc: 'Switch to Today view' },
    { key: '3', desc: 'Switch to Upcoming view' },
    { key: '4', desc: 'Switch to Eisenhower Matrix' },
    { key: '5', desc: 'Switch to Kanban Board' },
    { key: 'P', desc: 'Toggle Pomodoro focus timer' },
    { key: '?', desc: 'Open keyboard shortcuts sheet' },
    { key: 'Esc', desc: 'Close modals & drawers' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
          {shortcuts.map(({ key, desc }) => (
            <div key={key} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">{desc}</span>
              <kbd className="px-2 py-1 font-mono text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
