import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { playCompleteSound, playClickSound } from '../utils/audio';

export const EisenhowerMatrix = ({
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onUpdateTask,
  onAddTask,
}) => {
  const [quickAddQuadrant, setQuickAddQuadrant] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Active tasks only
  const activeTasks = tasks.filter(t => !t.completed);

  // Quadrant 1: Urgent & Important (Urgent priority, or High with due date <= today)
  const q1Tasks = activeTasks.filter(t => 
    t.priority === 'urgent' || (t.priority === 'high' && t.dueDate && t.dueDate <= todayStr)
  );

  // Quadrant 2: Not Urgent & Important (High priority not due today, or starred tasks)
  const q2Tasks = activeTasks.filter(t => 
    !q1Tasks.includes(t) && (t.priority === 'high' || t.isStarred)
  );

  // Quadrant 3: Urgent & Not Important (Medium priority with due date <= today)
  const q3Tasks = activeTasks.filter(t => 
    !q1Tasks.includes(t) && !q2Tasks.includes(t) && (t.dueDate && t.dueDate <= todayStr)
  );

  // Quadrant 4: Not Urgent & Not Important (Low or Medium without pressing deadline)
  const q4Tasks = activeTasks.filter(t => 
    !q1Tasks.includes(t) && !q2Tasks.includes(t) && !q3Tasks.includes(t)
  );

  const handleQuickAdd = (quadrantIndex) => {
    if (!quickTitle.trim()) return;
    playClickSound();

    let priority = 'medium';
    let dueDate = undefined;

    if (quadrantIndex === 1) {
      priority = 'urgent';
      dueDate = todayStr;
    } else if (quadrantIndex === 2) {
      priority = 'high';
    } else if (quadrantIndex === 3) {
      priority = 'medium';
      dueDate = todayStr;
    } else {
      priority = 'low';
    }

    onAddTask({
      title: quickTitle.trim(),
      description: '',
      priority,
      projectId: 'inbox',
      dueDate,
      tags: [],
      subtasks: [],
      isStarred: false,
    });

    setQuickTitle('');
    setQuickAddQuadrant(null);
  };

  const moveTask = (task, targetQuadrant, e) => {
    e.stopPropagation();
    playClickSound();

    let newPriority = task.priority;
    let newDueDate = task.dueDate;

    if (targetQuadrant === 1) {
      newPriority = 'urgent';
      newDueDate = todayStr;
    } else if (targetQuadrant === 2) {
      newPriority = 'high';
      if (newDueDate === todayStr) newDueDate = undefined;
    } else if (targetQuadrant === 3) {
      newPriority = 'medium';
      newDueDate = todayStr;
    } else {
      newPriority = 'low';
      newDueDate = undefined;
    }

    onUpdateTask({
      ...task,
      priority: newPriority,
      dueDate: newDueDate,
      updatedAt: new Date().toISOString(),
    });
  };

  const projectMap = new Map(projects.map(p => [p.id, p]));

  const renderTaskCard = (task, currentQ) => {
    const proj = projectMap.get(task.projectId);
    return (
      <div
        key={task.id}
        onClick={() => onSelectTask(task)}
        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs cursor-pointer group transition-all"
      >
        <div className="flex items-start gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playCompleteSound();
              onToggleComplete(task.id);
            }}
            className="mt-0.5 w-4 h-4 rounded border border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center shrink-0"
            title="Complete task"
          >
            <Check className="w-3 h-3 opacity-0 group-hover:opacity-40" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
              {task.title}
            </div>
            {/* Unboxed metadata */}
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {proj && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: proj.color }} />
                  <span>{proj.name}</span>
                </span>
              )}
              {task.dueDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className={task.dueDate <= todayStr ? 'text-amber-600 dark:text-amber-400' : ''}>
                    {task.dueDate === todayStr ? 'Today' : task.dueDate}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quadrant Quick Shift */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
          <span>Move:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].filter(q => q !== currentQ).map(targetQ => (
              <button
                key={targetQ}
                onClick={(e) => moveTask(task, targetQ, e)}
                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/60 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 rounded font-mono transition-colors"
                title={`Move to Q${targetQ}`}
              >
                Q{targetQ}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Overview header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Eisenhower Matrix
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Prioritize tasks by urgency and importance to focus your mental energy on high-leverage activities.
        </p>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Urgent & Important */}
        <div className="bg-rose-50/30 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 p-4 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200/60 dark:border-rose-900/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-400">Q1</span>
                <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-300">Do First</h3>
              </div>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-0.5">
                Urgent &amp; Important (Crises, tight deadlines)
              </p>
            </div>
            <span className="font-mono tabular-nums text-xs font-semibold px-2 py-0.5 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-md">
              {q1Tasks.length}
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {q1Tasks.map(t => renderTaskCard(t, 1))}
            {q1Tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-rose-600/60 dark:text-rose-400/60">
                No immediate critical tasks
              </div>
            )}
          </div>

          {quickAddQuadrant === 1 ? (
            <div className="mt-3 pt-2 border-t border-rose-200/60 flex items-center gap-1.5">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(1)}
                placeholder="New Q1 task..."
                autoFocus
                className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 rounded-lg border border-rose-300 dark:border-rose-700 focus:outline-none"
              />
              <button
                onClick={() => handleQuickAdd(1)}
                className="px-2.5 py-1 text-xs font-semibold bg-rose-600 text-white rounded-lg"
              >
                Add
              </button>
              <button
                onClick={() => setQuickAddQuadrant(null)}
                className="px-2 py-1 text-xs text-slate-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setQuickAddQuadrant(1)}
              className="mt-3 w-full py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-900/30 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Do First</span>
            </button>
          )}
        </div>

        {/* Quadrant 2: Important, Not Urgent */}
        <div className="bg-blue-50/30 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/40 p-4 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200/60 dark:border-blue-900/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">Q2</span>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Schedule</h3>
              </div>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                Important, Not Urgent (Planning, growth, deep work)
              </p>
            </div>
            <span className="font-mono tabular-nums text-xs font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md">
              {q2Tasks.length}
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {q2Tasks.map(t => renderTaskCard(t, 2))}
            {q2Tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-blue-600/60 dark:text-blue-400/60">
                Schedule important future goals here
              </div>
            )}
          </div>

          {quickAddQuadrant === 2 ? (
            <div className="mt-3 pt-2 border-t border-blue-200/60 flex items-center gap-1.5">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(2)}
                placeholder="New Q2 task..."
                autoFocus
                className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 rounded-lg border border-blue-300 dark:border-blue-700 focus:outline-none"
              />
              <button
                onClick={() => handleQuickAdd(2)}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg"
              >
                Add
              </button>
              <button
                onClick={() => setQuickAddQuadrant(null)}
                className="px-2 py-1 text-xs text-slate-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setQuickAddQuadrant(2)}
              className="mt-3 w-full py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Schedule</span>
            </button>
          )}
        </div>

        {/* Quadrant 3: Urgent, Not Important */}
        <div className="bg-amber-50/30 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 p-4 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200/60 dark:border-amber-900/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">Q3</span>
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Delegate</h3>
              </div>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                Urgent, Not Important (Interruptions, routine requests)
              </p>
            </div>
            <span className="font-mono tabular-nums text-xs font-semibold px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-md">
              {q3Tasks.length}
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {q3Tasks.map(t => renderTaskCard(t, 3))}
            {q3Tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-amber-600/60 dark:text-amber-400/60">
                No tasks to delegate
              </div>
            )}
          </div>

          {quickAddQuadrant === 3 ? (
            <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center gap-1.5">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(3)}
                placeholder="New Q3 task..."
                autoFocus
                className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 rounded-lg border border-amber-300 dark:border-amber-700 focus:outline-none"
              />
              <button
                onClick={() => handleQuickAdd(3)}
                className="px-2.5 py-1 text-xs font-semibold bg-amber-600 text-white rounded-lg"
              >
                Add
              </button>
              <button
                onClick={() => setQuickAddQuadrant(null)}
                className="px-2 py-1 text-xs text-slate-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setQuickAddQuadrant(3)}
              className="mt-3 w-full py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Delegate</span>
            </button>
          )}
        </div>

        {/* Quadrant 4: Not Urgent & Not Important */}
        <div className="bg-slate-100/40 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">Q4</span>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Eliminate</h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Not Urgent &amp; Not Important (Distractions, low value)
              </p>
            </div>
            <span className="font-mono tabular-nums text-xs font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md">
              {q4Tasks.length}
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {q4Tasks.map(t => renderTaskCard(t, 4))}
            {q4Tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Clear of clutter
              </div>
            )}
          </div>

          {quickAddQuadrant === 4 ? (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(4)}
                placeholder="New Q4 task..."
                autoFocus
                className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none"
              />
              <button
                onClick={() => handleQuickAdd(4)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-700 text-white rounded-lg"
              >
                Add
              </button>
              <button
                onClick={() => setQuickAddQuadrant(null)}
                className="px-2 py-1 text-xs text-slate-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setQuickAddQuadrant(4)}
              className="mt-3 w-full py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/40 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Eliminate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
