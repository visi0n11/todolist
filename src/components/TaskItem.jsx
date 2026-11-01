import React from 'react';
import { 
  Check, 
  Star, 
  Timer, 
  Trash2, 
  Calendar,
  CheckSquare,
  Clock,
  Repeat
} from 'lucide-react';
import { playCompleteSound, playClickSound } from '../utils/audio';

export const TaskItem = ({
  task,
  project,
  onToggleComplete,
  onToggleStar,
  onSelectTask,
  onDeleteTask,
  onStartFocus,
  isSelected,
  onToggleSelect,
  isBatchMode,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    if (!task.completed) {
      playCompleteSound();
    } else {
      playClickSound();
    }
    onToggleComplete(task.id);
  };

  const getDueDateLabel = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr < todayStr) return { label: 'Overdue', isOverdue: true, isToday: false };
    if (dateStr === todayStr) return { label: 'Today', isOverdue: false, isToday: true };
    if (dateStr === tomorrowStr) return { label: 'Tomorrow', isOverdue: false, isToday: false };

    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return { 
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
        isOverdue: false, 
        isToday: false 
      };
    }
    return { label: dateStr, isOverdue: false, isToday: false };
  };

  const dueInfo = getDueDateLabel(task.dueDate);
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'high': return 'text-amber-600 dark:text-amber-400 font-medium';
      case 'medium': return 'text-blue-600 dark:text-blue-400';
      case 'low': return 'text-slate-500 dark:text-slate-400';
      default: return 'text-slate-500';
    }
  };

  return (
    <div
      onClick={() => onSelectTask(task)}
      className={`group relative flex items-start gap-3.5 px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${
        task.completed
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-65'
          : isSelected
          ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-xs'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Batch Select Checkbox */}
      {isBatchMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(task.id);
          }}
          className="mt-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          aria-label={isSelected ? 'Deselect task' : 'Select task'}
        >
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 dark:border-slate-600 bg-transparent'
          }`}>
            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </button>
      )}

      {/* Complete Task Checkbox */}
      <button
        onClick={handleCheckboxClick}
        aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
          task.completed
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800'
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.8]" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-baseline gap-2">
          <h3 className={`text-sm font-medium leading-snug break-words transition-colors ${
            task.completed
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-slate-100'
          }`}>
            {task.title}
          </h3>
          {task.isStarred && (
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0 inline-block self-center" />
          )}
        </div>

        {task.description && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Unboxed Metadata Line with typographic separators */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          {/* Priority */}
          <span className={`capitalize ${getPriorityColor()}`}>
            {task.priority} Priority
          </span>

          {/* Project */}
          {project && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span 
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: project.color }}
                />
                <span>{project.name}</span>
              </span>
            </>
          )}

          {/* Due Date */}
          {dueInfo && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className={`flex items-center gap-1 ${
                dueInfo.isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-medium'
                  : dueInfo.isToday
                  ? 'text-amber-600 dark:text-amber-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{dueInfo.label}</span>
                {task.dueTime && <span>at {task.dueTime}</span>}
              </span>
            </>
          )}

          {/* Subtasks Count */}
          {totalSubtasks > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                <CheckSquare className="w-3 h-3" />
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </span>
            </>
          )}

          {/* Estimated time */}
          {task.estimatedMinutes && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                <Clock className="w-3 h-3" />
                <span>{task.estimatedMinutes}m</span>
              </span>
            </>
          )}

          {/* Recurrence */}
          {task.recurrence && task.recurrence !== 'none' && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1 capitalize text-slate-500 dark:text-slate-400">
                <Repeat className="w-3 h-3" />
                <span>{task.recurrence}</span>
              </span>
            </>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 dark:text-slate-400">
                {task.tags.map(t => `#${t}`).join(' ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Row Actions on Hover/Focus */}
      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(task.id);
            playClickSound();
          }}
          className={`p-1.5 rounded-md transition-colors ${
            task.isStarred
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
          title={task.isStarred ? 'Remove Star' : 'Star Task'}
          aria-label={task.isStarred ? 'Remove Star' : 'Star Task'}
        >
          <Star className={`w-4 h-4 ${task.isStarred ? 'fill-current' : ''}`} />
        </button>

        {!task.completed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartFocus(task);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
            title="Start Pomodoro Focus on this task"
            aria-label="Start Pomodoro Focus on this task"
          >
            <Timer className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
            playClickSound();
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
