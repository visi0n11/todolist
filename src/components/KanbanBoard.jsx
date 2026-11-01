import React, { useState } from 'react';
import { Plus, ArrowRight, ArrowLeft, Check, Calendar, Star } from 'lucide-react';
import { playCompleteSound, playClickSound } from '../utils/audio';

export const KanbanBoard = ({
  tasks,
  projects,
  onSelectTask,
  onUpdateTask,
  onAddTask,
}) => {
  const [quickAddColumn, setQuickAddColumn] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');

  const projectMap = new Map(projects.map(p => [p.id, p]));

  const columns = [
    { id: 'todo', label: 'To Do', color: 'border-slate-300 dark:border-slate-700', desc: 'Backlog & queued tasks' },
    { id: 'in_progress', label: 'In Progress', color: 'border-blue-400 dark:border-blue-600', desc: 'Actively being executed' },
    { id: 'review', label: 'Under Review', color: 'border-amber-400 dark:border-amber-600', desc: 'Awaiting feedback / QA' },
    { id: 'done', label: 'Completed', color: 'border-emerald-400 dark:border-emerald-600', desc: 'Finished deliverables' },
  ];

  const handleStatusChange = (task, newStatus, e) => {
    e.stopPropagation();
    const isNowDone = newStatus === 'done';
    if (isNowDone) playCompleteSound();
    else playClickSound();

    onUpdateTask({
      ...task,
      status: newStatus,
      completed: isNowDone,
      completedAt: isNowDone && !task.completed ? new Date().toISOString() : task.completedAt,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddCard = (status) => {
    if (!quickTitle.trim()) return;
    playClickSound();

    onAddTask({
      title: quickTitle.trim(),
      description: '',
      priority: 'medium',
      projectId: 'inbox',
      tags: [],
      subtasks: [],
      isStarred: false,
      status,
    });

    setQuickTitle('');
    setQuickAddColumn(null);
  };

  return (
    <div className="space-y-4">
      {/* Board Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Kanban Board
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track stage-by-stage execution. Move cards between columns to visualize task flow.
        </p>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map(col => {
          const colTasks = tasks.filter(t => (t.status || (t.completed ? 'done' : 'todo')) === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {col.label}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {col.desc}
                  </p>
                </div>
                <span className="font-mono tabular-nums text-xs font-medium px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Tasks */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                {colTasks.map(task => {
                  const proj = projectMap.get(task.projectId);
                  const subDone = task.subtasks?.filter(s => s.completed).length || 0;
                  const subTotal = task.subtasks?.length || 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs cursor-pointer group transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-xs font-medium leading-snug line-clamp-2 ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {task.title}
                        </h4>
                        {task.isStarred && (
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                      </div>

                      {/* Unboxed Metadata Line */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {proj && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: proj.color }} />
                            <span>{proj.name}</span>
                          </span>
                        )}

                        {task.dueDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                            </span>
                          </>
                        )}

                        {subTotal > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {subDone}/{subTotal} subs
                            </span>
                          </>
                        )}
                      </div>

                      {/* Column Move Actions */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        {/* Move Back */}
                        {col.id !== 'todo' ? (
                          <button
                            onClick={(e) => {
                              const prev = col.id === 'done' ? 'review' : col.id === 'review' ? 'in_progress' : 'todo';
                              handleStatusChange(task, prev, e);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Move to previous column"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : <div />}

                        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                          {task.priority}
                        </span>

                        {/* Move Next */}
                        {col.id !== 'done' ? (
                          <button
                            onClick={(e) => {
                              const next = col.id === 'todo' ? 'in_progress' : col.id === 'in_progress' ? 'review' : 'done';
                              handleStatusChange(task, next, e);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Move to next column"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No tasks in {col.label}
                  </div>
                )}
              </div>

              {/* Quick Add Card */}
              {quickAddColumn === col.id ? (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCard(col.id)}
                    placeholder="Task title..."
                    autoFocus
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddCard(col.id)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg shadow-xs"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setQuickAddColumn(null)}
                    className="px-2 py-1.5 text-xs text-slate-500"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setQuickAddColumn(col.id)}
                  className="mt-3 w-full py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
