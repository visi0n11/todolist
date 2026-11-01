import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Flag, 
  Folder, 
  Tag as TagIcon, 
  Trash2, 
  Plus, 
  Timer, 
  Star, 
  Check, 
  Repeat,
  CheckSquare
} from 'lucide-react';
import { playCompleteSound, playClickSound } from '../utils/audio';

export const TaskDetailModal = ({
  task,
  projects,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onStartFocus,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [projectId, setProjectId] = useState('inbox');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [estimatedMinutes, setEstimatedMinutes] = useState(undefined);
  const [isStarred, setIsStarred] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCompleted(task.completed);
      setPriority(task.priority);
      setStatus(task.status || (task.completed ? 'done' : 'todo'));
      setProjectId(task.projectId);
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setRecurrence(task.recurrence || 'none');
      setEstimatedMinutes(task.estimatedMinutes);
      setIsStarred(task.isStarred || false);
      setSubtasks(task.subtasks || []);
      setTags(task.tags || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onUpdateTask({
      ...task,
      title: title.trim(),
      description: description.trim(),
      completed,
      completedAt: completed && !task.completed ? new Date().toISOString() : task.completedAt,
      priority,
      status: completed ? 'done' : status,
      projectId,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      recurrence,
      estimatedMinutes,
      isStarred,
      subtasks,
      tags,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleToggleCompleted = () => {
    const nextVal = !completed;
    setCompleted(nextVal);
    setStatus(nextVal ? 'done' : 'in_progress');
    if (nextVal) {
      playCompleteSound();
    } else {
      playClickSound();
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    playClickSound();
    const newSub = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId) => {
    setSubtasks(subtasks.map(s => {
      if (s.id === subId) {
        if (!s.completed) playCompleteSound();
        else playClickSound();
        return { ...s, completed: !s.completed };
      }
      return s;
    }));
  };

  const handleDeleteSubtask = (subId) => {
    playClickSound();
    setSubtasks(subtasks.filter(s => s.id !== subId));
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const completedSubtasksCount = subtasks.filter(s => s.completed).length;
  const subtasksPercent = subtasks.length > 0 
    ? Math.round((completedSubtasksCount / subtasks.length) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleCompleted}
              className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                completed
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
              }`}
              title={completed ? 'Mark incomplete' : 'Mark completed'}
            >
              {completed && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {completed ? 'Task Completed' : 'Task Details'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsStarred(!isStarred);
                playClickSound();
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isStarred 
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={isStarred ? 'Unstar' : 'Star'}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>

            {!completed && (
              <button
                onClick={() => {
                  onStartFocus(task);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg hover:bg-amber-100 transition-colors"
                title="Focus with Pomodoro timer"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Focus</span>
              </button>
            )}

            <button
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1.5 focus:border-blue-500 focus:outline-none"
              placeholder="Task title..."
            />
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Description &amp; Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, links, or instructions..."
              className="w-full p-3 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <Flag className="w-3.5 h-3.5" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <Folder className="w-3.5 h-3.5" />
                <span>Project</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Due Time</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Status (Kanban sync) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Status Column</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Under Review</option>
                <option value="done">Completed</option>
              </select>
            </div>

            {/* Recurrence */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <Repeat className="w-3.5 h-3.5" />
                <span>Repeat</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Subtasks ({completedSubtasksCount}/{subtasks.length})
              </label>
              {subtasks.length > 0 && (
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {subtasksPercent}% done
                </span>
              )}
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${subtasksPercent}%` }}
                />
              </div>
            )}

            {/* Subtask list */}
            <div className="space-y-1.5">
              {subtasks.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id)}
                    className="flex items-center gap-2.5 flex-1 text-left min-w-0"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      sub.completed 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`text-xs break-words ${
                      sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {sub.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Delete subtask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a step or subtask..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <TagIcon className="w-3 h-3 text-slate-400" />
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-rose-500 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
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
                  placeholder="+ Tag"
                  className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800/80 rounded-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none w-24"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-400 font-mono">
            Created {new Date(task.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
