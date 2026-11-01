import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  loadStoredProjects, 
  loadStoredTasks, 
  saveStoredProjects, 
  saveStoredTasks,
  exportTasksAsJSON,
  exportTasksAsCSV,
  exportTasksAsMarkdown,
  INITIAL_TASKS,
  DEFAULT_PROJECTS
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { TaskItem } from './components/TaskItem';
import { TaskQuickAdd } from './components/TaskQuickAdd';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskFilterBar } from './components/TaskFilterBar';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { KanbanBoard } from './components/KanbanBoard';
import { FocusTimer } from './components/FocusTimer';
import { AnalyticsModal } from './components/AnalyticsModal';
import { ProjectModal } from './components/ProjectModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { CheckCircle2, Menu, Plus } from 'lucide-react';
import { playCompleteSound, playClickSound } from './utils/audio';
import confetti from 'canvas-confetti';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('taskflow_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sound state
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('taskflow_sound_muted') === 'true';
  });

  // Core Data
  const [tasks, setTasks] = useState(() => loadStoredTasks());
  const [projects, setProjects] = useState(() => loadStoredProjects());

  // Views & Navigation
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters & Sorting
  const [filter, setFilter] = useState({
    priority: 'all',
    searchQuery: '',
    tag: null,
    dateRange: 'all',
  });
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Batch Selection
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  // Modals & Panels
  const [editingTask, setEditingTask] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Pomodoro Focus Timer
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [pomodoro, setPomodoro] = useState({
    taskId: null,
    taskTitle: null,
    durationMinutes: 25,
    secondsRemaining: 25 * 60,
    isRunning: false,
    mode: 'work',
    completedSessions: 0,
  });

  // DOM Refs for Keyboard Shortcuts
  const quickAddInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('taskflow_theme', 'light');
    }
  }, [isDark]);

  // Persist tasks & projects
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        if (editingTask) setEditingTask(null);
        else if (isProjectModalOpen) setIsProjectModalOpen(false);
        else if (isAnalyticsOpen) setIsAnalyticsOpen(false);
        else if (isShortcutsOpen) setIsShortcutsOpen(false);
        else if (isBatchMode) {
          setIsBatchMode(false);
          setSelectedTaskIds(new Set());
        }
        return;
      }

      if (isInput) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        quickAddInputRef.current?.focus();
      } else if (e.key === 'f' || e.key === 'F' || e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '1') {
        setCurrentView('inbox');
        setSelectedProjectId(null);
        setSelectedTag(null);
      } else if (e.key === '2') {
        setCurrentView('today');
      } else if (e.key === '3') {
        setCurrentView('upcoming');
      } else if (e.key === '4') {
        setCurrentView('matrix');
      } else if (e.key === '5') {
        setCurrentView('kanban');
      } else if (e.key === 'p' || e.key === 'P') {
        setIsTimerVisible(prev => !prev);
      } else if (e.key === '?') {
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTask, isProjectModalOpen, isAnalyticsOpen, isShortcutsOpen, isBatchMode]);

  // Task Actions
  const handleAddTask = (taskData) => {
    const nowIso = new Date().toISOString();
    const newTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      completed: taskData.status === 'done',
      createdAt: nowIso,
      updatedAt: nowIso,
      status: taskData.status || 'todo',
    };

    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTask = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (editingTask?.id === updated.id) {
      setEditingTask(updated);
    }
  };

  const handleToggleComplete = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          const todayStr = new Date().toISOString().split('T')[0];
          const remainingToday = prev.filter(item => item.id !== taskId && !item.completed && item.dueDate === todayStr);
          if (t.dueDate === todayStr && remainingToday.length === 0) {
            try {
              confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            } catch {
              // ignore
            }
          }
        }
        return {
          ...t,
          completed: nextCompleted,
          status: nextCompleted ? 'done' : 'in_progress',
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    }));
  };

  const handleToggleStar = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isStarred: !t.isStarred } : t));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskIds.has(taskId)) {
      const next = new Set(selectedTaskIds);
      next.delete(taskId);
      setSelectedTaskIds(next);
    }
  };

  const handleStartFocus = (task) => {
    playClickSound();
    setPomodoro(prev => ({
      ...prev,
      taskId: task.id,
      taskTitle: task.title,
      mode: 'work',
      durationMinutes: 25,
      secondsRemaining: 25 * 60,
      isRunning: true,
    }));
    setIsTimerVisible(true);
  };

  // Batch actions
  const handleToggleSelectTask = (taskId) => {
    const next = new Set(selectedTaskIds);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setSelectedTaskIds(next);
  };

  const handleBatchComplete = () => {
    playCompleteSound();
    setTasks(prev => prev.map(t => {
      if (selectedTaskIds.has(t.id)) {
        return {
          ...t,
          completed: true,
          status: 'done',
          completedAt: new Date().toISOString(),
        };
      }
      return t;
    }));
    setSelectedTaskIds(new Set());
    setIsBatchMode(false);
  };

  const handleBatchDelete = () => {
    playClickSound();
    setTasks(prev => prev.filter(t => !selectedTaskIds.has(t.id)));
    setSelectedTaskIds(new Set());
    setIsBatchMode(false);
  };

  const handleBatchMoveProject = (newProjectId) => {
    playClickSound();
    setTasks(prev => prev.map(t => {
      if (selectedTaskIds.has(t.id)) {
        return { ...t, projectId: newProjectId };
      }
      return t;
    }));
    setSelectedTaskIds(new Set());
    setIsBatchMode(false);
  };

  // Project management
  const handleAddProject = (newProj) => {
    setProjects(prev => [...prev, newProj]);
    setCurrentView('project');
    setSelectedProjectId(newProj.id);
  };

  const handleDeleteProject = (projId) => {
    playClickSound();
    setTasks(prev => prev.map(t => t.projectId === projId ? { ...t, projectId: 'inbox' } : t));
    setProjects(prev => prev.filter(p => p.id !== projId));
    if (selectedProjectId === projId) {
      setCurrentView('inbox');
      setSelectedProjectId(null);
    }
  };

  // View switcher
  const handleSelectView = (view, projectId, tag) => {
    playClickSound();
    setCurrentView(view);
    setSelectedProjectId(projectId || null);
    setSelectedTag(tag || null);
    if (tag) {
      setFilter(prev => ({ ...prev, tag }));
    }
    setIsMobileSidebarOpen(false);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    localStorage.setItem('taskflow_sound_muted', String(nextVal));
  };

  // Data Reset
  const handleResetData = () => {
    if (window.confirm('Reset all tasks and projects to sample data?')) {
      playClickSound();
      setTasks(INITIAL_TASKS);
      setProjects(DEFAULT_PROJECTS);
      setSelectedProjectId(null);
      setSelectedTag(null);
      setCurrentView('inbox');
    }
  };

  // JSON Import
  const handleImportJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          if (Array.isArray(data.projects)) {
            setProjects(data.projects);
          }
          alert(`Successfully imported ${data.tasks.length} tasks!`);
        }
      } catch {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Filter & Sort Calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const endOfWeekStr = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (currentView === 'inbox') {
        if (task.completed) return false;
      } else if (currentView === 'today') {
        if (task.completed) return false;
        if (!task.dueDate || task.dueDate > todayStr) return false;
      } else if (currentView === 'upcoming') {
        if (task.completed) return false;
        if (!task.dueDate || task.dueDate <= todayStr) return false;
      } else if (currentView === 'completed') {
        if (!task.completed) return false;
      } else if (currentView === 'project' && selectedProjectId) {
        if (task.projectId !== selectedProjectId) return false;
      } else if (currentView === 'tag' && selectedTag) {
        if (!task.tags || !task.tags.includes(selectedTag)) return false;
      }

      if (filter.priority !== 'all' && task.priority !== filter.priority) {
        return false;
      }

      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        const matchesTag = (task.tags || []).some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      if (filter.dateRange === 'overdue') {
        if (!task.dueDate || task.dueDate >= todayStr) return false;
      } else if (filter.dateRange === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (filter.dateRange === 'week') {
        if (!task.dueDate || task.dueDate < todayStr || task.dueDate > endOfWeekStr) return false;
      } else if (filter.dateRange === 'no_date') {
        if (task.dueDate) return false;
      }

      return true;
    });
  }, [tasks, currentView, selectedProjectId, selectedTag, filter, todayStr, endOfWeekStr]);

  // Sorted tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.isStarred !== b.isStarred) {
        return a.isStarred ? -1 : 1;
      }

      if (sortField === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const cmp = a.dueDate.localeCompare(b.dueDate);
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (sortField === 'priority') {
        const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
        const diff = (weights[b.priority] || 0) - (weights[a.priority] || 0);
        return sortOrder === 'asc' ? -diff : diff;
      }

      if (sortField === 'title') {
        const cmp = a.title.localeCompare(b.title);
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (sortField === 'createdAt') {
        const cmp = a.createdAt.localeCompare(b.createdAt);
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      return 0;
    });
  }, [filteredTasks, sortField, sortOrder]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Groupings for Upcoming view
  const upcomingTomorrow = sortedTasks.filter(t => t.dueDate === tomorrowStr);
  const upcomingThisWeek = sortedTasks.filter(t => t.dueDate && t.dueDate > tomorrowStr && t.dueDate <= endOfWeekStr);
  const upcomingLater = sortedTasks.filter(t => t.dueDate && t.dueDate > endOfWeekStr);

  // Groupings for Today view
  const todayOverdue = sortedTasks.filter(t => t.dueDate && t.dueDate < todayStr);
  const todayDue = sortedTasks.filter(t => t.dueDate === todayStr);

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar adhering to Top Bar Contract */}
      <TopBar
        currentView={currentView}
        onViewChange={(v) => handleSelectView(v)}
        onOpenQuickAdd={() => quickAddInputRef.current?.focus()}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onToggleTimer={() => setIsTimerVisible(prev => !prev)}
        isTimerActive={isTimerVisible}
        timerMode={pomodoro.mode}
        isDark={isDark}
        onToggleDark={() => setIsDark(prev => !prev)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        activeCount={activeCount}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          selectedProjectId={selectedProjectId}
          selectedTag={selectedTag}
          onSelectView={handleSelectView}
          tasks={tasks}
          projects={projects}
          onAddProject={() => setIsProjectModalOpen(true)}
          onDeleteProject={handleDeleteProject}
          onExportJSON={() => exportTasksAsJSON(tasks, projects)}
          onExportCSV={() => exportTasksAsCSV(tasks, projects)}
          onExportMarkdown={() => exportTasksAsMarkdown(tasks, projects)}
          onImportJSON={handleImportJSON}
          onResetData={handleResetData}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full">
          {/* Mobile view toggle header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              <Menu className="w-4 h-4" />
              <span>Menu &amp; Views</span>
            </button>
            <div className="text-xs font-semibold text-slate-900 dark:text-white capitalize">
              {currentView === 'project' && activeProject ? activeProject.name : currentView}
            </div>
          </div>

          {/* Special Views: Matrix or Kanban */}
          {currentView === 'matrix' ? (
            <EisenhowerMatrix
              tasks={tasks}
              projects={projects}
              onToggleComplete={handleToggleComplete}
              onSelectTask={(task) => setEditingTask(task)}
              onUpdateTask={handleUpdateTask}
              onAddTask={handleAddTask}
            />
          ) : currentView === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              projects={projects}
              onSelectTask={(task) => setEditingTask(task)}
              onUpdateTask={handleUpdateTask}
              onAddTask={handleAddTask}
            />
          ) : (
            /* Standard List & Grouped Views */
            <div>
              {/* View Title & Kicker */}
              <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize flex items-center gap-2">
                    {currentView === 'project' && activeProject ? (
                      <>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeProject.color }} />
                        <span>{activeProject.name}</span>
                      </>
                    ) : currentView === 'tag' ? (
                      <span>Tag: #{selectedTag}</span>
                    ) : (
                      <span>{currentView}</span>
                    )}
                  </h1>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono tabular-nums">{sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {currentView === 'completed' && sortedTasks.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all completed tasks?')) {
                        setTasks(prev => prev.filter(t => !t.completed));
                      }
                    }}
                    className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline self-start sm:self-auto"
                  >
                    Clear Completed Archive
                  </button>
                )}
              </div>

              {/* Quick Add Bar */}
              {currentView !== 'completed' && (
                <TaskQuickAdd
                  projects={projects}
                  defaultProjectId={selectedProjectId || 'inbox'}
                  onAddTask={handleAddTask}
                  inputRef={quickAddInputRef}
                />
              )}

              {/* Filter & Sort Bar */}
              <TaskFilterBar
                filter={filter}
                onUpdateFilter={(f) => setFilter(prev => ({ ...prev, ...f }))}
                sortField={sortField}
                sortOrder={sortOrder}
                onUpdateSort={(field, order) => {
                  setSortField(field);
                  setSortOrder(order);
                }}
                projects={projects}
                searchInputRef={searchInputRef}
                isBatchMode={isBatchMode}
                onToggleBatchMode={() => {
                  setIsBatchMode(!isBatchMode);
                  setSelectedTaskIds(new Set());
                }}
                selectedCount={selectedTaskIds.size}
                totalFilteredCount={sortedTasks.length}
                onSelectAll={() => setSelectedTaskIds(new Set(sortedTasks.map(t => t.id)))}
                onDeselectAll={() => setSelectedTaskIds(new Set())}
                onBatchComplete={handleBatchComplete}
                onBatchDelete={handleBatchDelete}
                onBatchMoveProject={handleBatchMoveProject}
              />

              {/* Task Items List */}
              <div className="space-y-2">
                {/* For Today View: Overdue Grouping */}
                {currentView === 'today' && todayOverdue.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider px-1">
                      <span>Overdue</span>
                      <span className="font-mono tabular-nums">({todayOverdue.length})</span>
                    </div>
                    {todayOverdue.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        project={projects.find(p => p.id === task.projectId)}
                        onToggleComplete={handleToggleComplete}
                        onToggleStar={handleToggleStar}
                        onSelectTask={(t) => setEditingTask(t)}
                        onDeleteTask={handleDeleteTask}
                        onStartFocus={handleStartFocus}
                        isBatchMode={isBatchMode}
                        isSelected={selectedTaskIds.has(task.id)}
                        onToggleSelect={handleToggleSelectTask}
                      />
                    ))}
                  </div>
                )}

                {/* For Today View: Due Today Grouping */}
                {currentView === 'today' ? (
                  <div className="space-y-2">
                    {todayOverdue.length > 0 && (
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pt-2">
                        Due Today ({todayDue.length})
                      </div>
                    )}
                    {todayDue.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        project={projects.find(p => p.id === task.projectId)}
                        onToggleComplete={handleToggleComplete}
                        onToggleStar={handleToggleStar}
                        onSelectTask={(t) => setEditingTask(t)}
                        onDeleteTask={handleDeleteTask}
                        onStartFocus={handleStartFocus}
                        isBatchMode={isBatchMode}
                        isSelected={selectedTaskIds.has(task.id)}
                        onToggleSelect={handleToggleSelectTask}
                      />
                    ))}
                  </div>
                ) : currentView === 'upcoming' ? (
                  /* Upcoming Groupings */
                  <div className="space-y-6">
                    {/* Tomorrow */}
                    {upcomingTomorrow.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-1">
                          Tomorrow ({upcomingTomorrow.length})
                        </div>
                        {upcomingTomorrow.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            project={projects.find(p => p.id === task.projectId)}
                            onToggleComplete={handleToggleComplete}
                            onToggleStar={handleToggleStar}
                            onSelectTask={(t) => setEditingTask(t)}
                            onDeleteTask={handleDeleteTask}
                            onStartFocus={handleStartFocus}
                            isBatchMode={isBatchMode}
                            isSelected={selectedTaskIds.has(task.id)}
                            onToggleSelect={handleToggleSelectTask}
                          />
                        ))}
                      </div>
                    )}

                    {/* This Week */}
                    {upcomingThisWeek.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                          This Week ({upcomingThisWeek.length})
                        </div>
                        {upcomingThisWeek.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            project={projects.find(p => p.id === task.projectId)}
                            onToggleComplete={handleToggleComplete}
                            onToggleStar={handleToggleStar}
                            onSelectTask={(t) => setEditingTask(t)}
                            onDeleteTask={handleDeleteTask}
                            onStartFocus={handleStartFocus}
                            isBatchMode={isBatchMode}
                            isSelected={selectedTaskIds.has(task.id)}
                            onToggleSelect={handleToggleSelectTask}
                          />
                        ))}
                      </div>
                    )}

                    {/* Later */}
                    {upcomingLater.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                          Later ({upcomingLater.length})
                        </div>
                        {upcomingLater.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            project={projects.find(p => p.id === task.projectId)}
                            onToggleComplete={handleToggleComplete}
                            onToggleStar={handleToggleStar}
                            onSelectTask={(t) => setEditingTask(t)}
                            onDeleteTask={handleDeleteTask}
                            onStartFocus={handleStartFocus}
                            isBatchMode={isBatchMode}
                            isSelected={selectedTaskIds.has(task.id)}
                            onToggleSelect={handleToggleSelectTask}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard List */
                  sortedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      project={projects.find(p => p.id === task.projectId)}
                      onToggleComplete={handleToggleComplete}
                      onToggleStar={handleToggleStar}
                      onSelectTask={(t) => setEditingTask(t)}
                      onDeleteTask={handleDeleteTask}
                      onStartFocus={handleStartFocus}
                      isBatchMode={isBatchMode}
                      isSelected={selectedTaskIds.has(task.id)}
                      onToggleSelect={handleToggleSelectTask}
                    />
                  ))
                )}

                {/* Empty State */}
                {sortedTasks.length === 0 && (
                  <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {filter.searchQuery || filter.priority !== 'all' || filter.dateRange !== 'all'
                        ? 'No tasks matching your current filters'
                        : currentView === 'completed'
                        ? 'No completed tasks yet'
                        : currentView === 'today'
                        ? 'All caught up for today!'
                        : 'No tasks in this list'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      {filter.searchQuery || filter.priority !== 'all'
                        ? 'Try clearing the search query or resetting priority filters.'
                        : 'Add a new task using the box above or press N on your keyboard.'}
                    </p>
                    {currentView !== 'completed' && (
                      <button
                        onClick={() => quickAddInputRef.current?.focus()}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Task</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Pomodoro Focus Timer */}
      {isTimerVisible && (
        <FocusTimer
          pomodoro={pomodoro}
          onUpdatePomodoro={setPomodoro}
          onClose={() => setIsTimerVisible(false)}
          onCompleteTask={handleToggleComplete}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={editingTask}
        projects={projects}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onStartFocus={handleStartFocus}
      />

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        tasks={tasks}
        projects={projects}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
