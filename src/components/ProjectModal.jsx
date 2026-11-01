import React, { useState } from 'react';
import { X, Briefcase, User, Heart, BookOpen, Folder, Star, Zap, ShoppingBag } from 'lucide-react';
import { playClickSound } from '../utils/audio';

const PALETTE = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#64748b',
];

const ICONS = [
  { name: 'Folder', icon: Folder },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'User', icon: User },
  { name: 'Heart', icon: Heart },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Star', icon: Star },
  { name: 'Zap', icon: Zap },
  { name: 'ShoppingBag', icon: ShoppingBag },
];

export const ProjectModal = ({
  isOpen,
  onClose,
  onAddProject,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [iconName, setIconName] = useState('Folder');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    playClickSound();
    const newProj = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      color,
      iconName,
      isCustom: true,
    };
    onAddProject(newProj);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mobile App Launch, Home Renovation"
              autoFocus
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-2.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-115 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICONS.map(({ name: iName, icon: IconComp }) => (
                <button
                  key={iName}
                  type="button"
                  onClick={() => setIconName(iName)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-xs transition-colors ${
                    iconName === iName
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="text-[10px]">{iName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
