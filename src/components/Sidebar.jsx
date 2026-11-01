import React, { useRef } from 'react';
import { 
  Inbox, 
  Calendar, 
  CalendarDays, 
  Grid2X2, 
  Columns3, 
  CheckCircle2, 
  Plus, 
  Tag as TagIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  HelpCircle,
  Briefcase,
  User,
  Heart,
  BookOpen,
  Folder,
  Trash2,
  Flame
} from 'lucide-react';

export const Sidebar = ({
  currentView,
  selectedProjectId,
  selectedTag,
  onSelectView,
  tasks,
  projects,
  onAddProject,
  onDeleteProject,
  onExportJSON,
  onExportCSV,
  onExportMarkdown,
  onImportJSON,
  onResetData,
  onOpenShortcuts,
  isOpenMobile,
  onCloseMobile,
}) => {
  const fileInputRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Counts
  const activeTasks = tasks.filter(t => !t.completed);
  const inboxCount = activeTasks.length;
  const todayCount = activeTasks.filter(t => t.dueDate === todayStr).length;
  const overdueCount = activeTasks.filter(t => t.dueDate && t.dueDate < todayStr).length;
  const upcomingCount = activeTasks.filter(t => t.dueDate && t.dueDate > todayStr).length;
  const completedCount = tasks.filter(t => t.completed).length;

  // Today progress
  const tasksDueToday = tasks.filter(t => t.dueDate === todayStr);
  const todayDone = tasksDueToday.filter(t => t.completed).length;
  const todayTotal = tasksDueToday.length;
  const todayPercent = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  // Extract all tags
  const tagsMap = new Map();
  tasks.forEach(task => {
    (task.tags || []).forEach(tag => {
      tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
    });
  });
  const allTags = Array.from(tagsMap.entries()).sort((a, b) => b[1] - a[1]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  const getProjectIcon = (iconName) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'User': return <User className="w-4 h-4" />;
      case 'Heart': return <Heart className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-50/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Daily Progress summary */}
          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Today's Target</span>
              </span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {todayDone}/{todayTotal} ({todayPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${todayPercent}%` }}
              />
            </div>
          </div>

          {/* Core Views */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-2">
              Views
            </div>

            <button
              onClick={() => onSelectView('inbox')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'inbox' && !selectedProjectId && !selectedTag
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Inbox</span>
              </div>
              <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                {inboxCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('today')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'today'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs">
                {overdueCount > 0 && (
                  <span className="text-rose-600 dark:text-rose-400 font-medium" title={`${overdueCount} overdue`}>
                    !{overdueCount}
                  </span>
                )}
                <span className="text-slate-500 dark:text-slate-400">{todayCount}</span>
              </div>
            </button>

            <button
              onClick={() => onSelectView('upcoming')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'upcoming'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                <span>Upcoming</span>
              </div>
              <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                {upcomingCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('matrix')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'matrix'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Grid2X2 className="w-4 h-4 text-emerald-500" />
                <span>Eisenhower Matrix</span>
              </div>
            </button>

            <button
              onClick={() => onSelectView('kanban')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'kanban'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Columns3 className="w-4 h-4 text-purple-500" />
                <span>Kanban Board</span>
              </div>
            </button>

            <button
              onClick={() => onSelectView('completed')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'completed'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Completed</span>
              </div>
              <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                {completedCount}
              </span>
            </button>
          </div>

          {/* Projects */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Projects
              </span>
              <button
                onClick={onAddProject}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
                title="Create New Project"
                aria-label="Create New Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {projects.map(proj => {
              const count = activeTasks.filter(t => t.projectId === proj.id).length;
              const isSelected = currentView === 'project' && selectedProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <button
                    onClick={() => onSelectView('project', proj.id)}
                    className="flex items-center gap-2.5 flex-1 text-left truncate mr-2"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono tabular-nums text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                      {count}
                    </span>
                    {proj.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                        title="Delete project"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-2">
                Tags
              </div>
              <div className="flex flex-wrap gap-1 px-1">
                {allTags.map(([tagName, count]) => {
                  const isSelected = currentView === 'tag' && selectedTag === tagName;
                  return (
                    <button
                      key={tagName}
                      onClick={() => onSelectView('tag', undefined, tagName)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <TagIcon className="w-3 h-3 opacity-60" />
                      <span>{tagName}</span>
                      <span className="font-mono tabular-nums text-[10px] opacity-75">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Utility Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-white/60 dark:bg-slate-900/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-medium">Backup &amp; Share</span>
            <button
              onClick={onOpenShortcuts}
              className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 text-[11px]"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Keys</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={onExportJSON}
              className="px-2 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
              title="Export JSON backup"
            >
              <Download className="w-3 h-3" />
              <span>JSON</span>
            </button>
            <button
              onClick={onExportCSV}
              className="px-2 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
              title="Export CSV spreadsheet"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
            <button
              onClick={onExportMarkdown}
              className="px-2 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
              title="Export Markdown checklist"
            >
              <Download className="w-3 h-3" />
              <span>MD</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3 h-3" />
              <span>Restore JSON</span>
            </button>
            <button
              onClick={onResetData}
              className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
              title="Reset to sample data"
              aria-label="Reset to sample data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
