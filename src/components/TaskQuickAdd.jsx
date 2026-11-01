import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Flag, 
  Clock, 
  Folder, 
  Tag as TagIcon, 
  X
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

export const TaskQuickAdd = ({
  projects,
  defaultProjectId = 'inbox',
  onAddTask,
  inputRef: externalInputRef,
}) => {
  const localInputRef = useRef(null);
  const inputRef = externalInputRef || localInputRef;

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [estimatedMinutes, setEstimatedMinutes] = useState(undefined);
  const [recurrence, setRecurrence] = useState('none');

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    playClickSound();
    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      projectId,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      tags,
      subtasks: [],
      isStarred: false,
      estimatedMinutes,
      recurrence,
    });

    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setDueDate('');
    setDueTime('');
    setEstimatedMinutes(undefined);
    setRecurrence('none');
    setPriority('medium');
    setIsOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs transition-all overflow-hidden mb-5">
      <form onSubmit={handleSubmit} className="p-3.5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-slate-400 dark:text-slate-500 pl-1">
            <Plus className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Add a new task... (Type title and press Enter)"
            className="w-full text-sm font-medium bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Detailed inputs when active */}
        {isOpen && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 space-y-3 text-xs animate-in fade-in duration-150">
            {/* Description input */}
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes or description (optional)..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {/* Quick selectors bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Priority */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                <Flag className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                {['low', 'medium', 'high', 'urgent'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2 py-1 rounded text-[11px] capitalize font-medium transition-colors ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : p === 'high'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : p === 'medium'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Project selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                <Folder className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id} className="dark:bg-slate-800">
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Quick buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                <button
                  type="button"
                  onClick={() => setDueDate(todayStr)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    dueDate === todayStr
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDueDate(tomorrowStr)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    dueDate === tomorrowStr
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Tomorrow
                </button>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none pl-1"
                />
              </div>

              {/* Time */}
              {dueDate && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="bg-transparent text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Tags line */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                <TagIcon className="w-3 h-3 text-slate-500" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag and press Enter"
                  className="bg-transparent text-[11px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none w-36"
                />
              </div>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setTitle('');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
