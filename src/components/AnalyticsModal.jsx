import React from 'react';
import { X, TrendingUp } from 'lucide-react';

export const AnalyticsModal = ({
  tasks,
  projects,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const dueTodayTasks = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;

  // Day-of-week completions (last 7 days)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const dayStats = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[d.getDay()];

    const completedOnDay = tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false;
      return t.completedAt.startsWith(dateStr);
    }).length;

    return {
      dateStr,
      dayLabel,
      count: completedOnDay,
      isToday: dateStr === todayStr,
    };
  });

  const maxDayCount = Math.max(...dayStats.map(d => d.count), 1);

  // Priority breakdown
  const priorities = ['urgent', 'high', 'medium', 'low'];
  const priorityStats = priorities.map(p => {
    const total = tasks.filter(t => t.priority === p).length;
    const done = tasks.filter(t => t.priority === p && t.completed).length;
    return { priority: p, total, done };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Productivity &amp; Velocity Analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Completion Rate
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {completionRate}%
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Completed
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {completedTasks}
                </span>
                <span className="text-xs text-slate-400">/ {totalTasks}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Due Today
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {dueTodayTasks}
                </span>
                <span className="text-xs text-slate-400">active</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Overdue
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-2xl font-bold font-mono tabular-nums ${
                  overdueTasks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {overdueTasks}
                </span>
                <span className="text-xs text-slate-400">tasks</span>
              </div>
            </div>
          </div>

          {/* 7-Day Completion Velocity Chart */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tasks Completed (Past 7 Days)
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Total: {dayStats.reduce((sum, d) => sum + d.count, 0)} completed
              </span>
            </div>

            <div className="h-32 flex items-end justify-between gap-3 pt-4 px-2">
              {dayStats.map(d => {
                const heightPercent = maxDayCount > 0 ? Math.max(10, (d.count / maxDayCount) * 100) : 10;
                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono tabular-nums text-slate-500">
                      {d.count}
                    </span>
                    <div className="w-full max-w-[28px] bg-slate-200 dark:bg-slate-700 rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          d.isToday 
                            ? 'bg-blue-600 dark:bg-blue-500' 
                            : 'bg-slate-400 dark:bg-slate-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-medium ${
                      d.isToday ? 'text-blue-600 font-semibold' : 'text-slate-500'
                    }`}>
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority & Projects Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Status */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                By Priority
              </span>
              <div className="space-y-2 text-xs">
                {priorityStats.map(item => {
                  const pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
                  return (
                    <div key={item.priority} className="space-y-1">
                      <div className="flex items-center justify-between capitalize text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{item.priority}</span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {item.done}/{item.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Distribution */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                By Project
              </span>
              <div className="space-y-2 text-xs">
                {projects.map(proj => {
                  const projTasks = tasks.filter(t => t.projectId === proj.id);
                  const projDone = projTasks.filter(t => t.completed).length;
                  const pct = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;
                  return (
                    <div key={proj.id} className="space-y-1">
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.color }} />
                          <span className="truncate max-w-[140px]">{proj.name}</span>
                        </span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {projDone}/{projTasks.length}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: proj.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
