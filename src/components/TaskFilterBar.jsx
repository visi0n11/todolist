import React from 'react';
import { Search, X, ArrowUpDown, Check, Trash2, Folder, CheckSquare } from 'lucide-react';

export const TaskFilterBar = ({
  filter,
  onUpdateFilter,
  sortField,
  sortOrder,
  onUpdateSort,
  projects,
  searchInputRef,
  isBatchMode,
  onToggleBatchMode,
  selectedCount,
  totalFilteredCount,
  onSelectAll,
  onDeselectAll,
  onBatchComplete,
  onBatchDelete,
  onBatchMoveProject,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
            placeholder="Search tasks, notes, or tags... (Press / or F to focus)"
            className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onUpdateFilter({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side: Sort & Batch Mode toggle */}
        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xs text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                onUpdateSort(f, o);
              }}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="dueDate-asc" className="dark:bg-slate-800">Due Date (Earliest first)</option>
              <option value="dueDate-desc" className="dark:bg-slate-800">Due Date (Latest first)</option>
              <option value="priority-desc" className="dark:bg-slate-800">Priority (Highest first)</option>
              <option value="priority-asc" className="dark:bg-slate-800">Priority (Lowest first)</option>
              <option value="title-asc" className="dark:bg-slate-800">Title (A to Z)</option>
              <option value="createdAt-desc" className="dark:bg-slate-800">Recently Created</option>
            </select>
          </div>

          {/* Batch Mode Toggle */}
          <button
            onClick={onToggleBatchMode}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 ${
              isBatchMode
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Priority Segmented Button Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => onUpdateFilter({ priority: 'all' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              filter.priority === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Priorities
          </button>
          {['urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => onUpdateFilter({ priority: p })}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter.priority === p
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Date Range quick filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => onUpdateFilter({ dateRange: 'all' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              filter.dateRange === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Any Date
          </button>
          <button
            onClick={() => onUpdateFilter({ dateRange: 'overdue' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              filter.dateRange === 'overdue'
                ? 'bg-rose-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => onUpdateFilter({ dateRange: 'today' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              filter.dateRange === 'today'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onUpdateFilter({ dateRange: 'week' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              filter.dateRange === 'week'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
            }`}
          >
            This Week
          </button>
        </div>

        {/* Active Tag Clearer */}
        {filter.tag && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg">
            <span>Tag: #{filter.tag}</span>
            <button
              onClick={() => onUpdateFilter({ tag: null })}
              className="text-blue-500 hover:text-blue-800 dark:hover:text-blue-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Batch Actions Strip */}
      {isBatchMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-900 dark:text-blue-200">
            <span className="font-mono tabular-nums font-semibold">{selectedCount}</span>
            <span>of {totalFilteredCount} selected</span>
            <span aria-hidden="true" className="text-blue-300">·</span>
            {selectedCount < totalFilteredCount ? (
              <button
                onClick={onSelectAll}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Select all
              </button>
            ) : (
              <button
                onClick={onDeselectAll}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Deselect all
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Move to project dropdown */}
            <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
              <Folder className="w-3.5 h-3.5 text-slate-400" />
              <select
                onChange={(e) => {
                  if (e.target.value) onBatchMoveProject(e.target.value);
                }}
                defaultValue=""
                className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>Move to project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onBatchComplete}
              disabled={selectedCount === 0}
              className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>

            <button
              onClick={onBatchDelete}
              disabled={selectedCount === 0}
              className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
