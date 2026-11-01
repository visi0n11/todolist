// Data persistence and export utilities in pure JavaScript

export const DEFAULT_PROJECTS = [
  { id: 'inbox', name: 'Inbox', color: '#64748b', iconName: 'Inbox' },
  { id: 'work', name: 'Work & Projects', color: '#3b82f6', iconName: 'Briefcase' },
  { id: 'personal', name: 'Personal & Life', color: '#10b981', iconName: 'User' },
  { id: 'health', name: 'Health & Fitness', color: '#f59e0b', iconName: 'Heart' },
  { id: 'learning', name: 'Learning & Dev', color: '#8b5cf6', iconName: 'BookOpen' },
];

function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Prepare quarterly strategic review & team deliverables',
    description: 'Compile OKR milestones, engineering velocity charts, and infrastructure roadmap for Q4 board review.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: getFormattedDate(0), // Today
    dueTime: '14:30',
    priority: 'urgent',
    projectId: 'work',
    tags: ['Strategy', 'Roadmap', 'Q4'],
    subtasks: [
      { id: 'sub-1', title: 'Audit pending pull requests and backlog items', completed: true },
      { id: 'sub-2', title: 'Draft slide deck executive summary', completed: true },
      { id: 'sub-3', title: 'Align resource budget with finance lead', completed: false },
    ],
    isStarred: true,
    estimatedMinutes: 60,
    status: 'in_progress',
    recurrence: 'none',
  },
  {
    id: 'task-2',
    title: 'Refactor database indexing & slow query optimizations',
    description: 'Analyze telemetry logs on PostgreSQL query planner to eliminate full table scans on user event logs.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: getFormattedDate(0), // Today
    dueTime: '17:00',
    priority: 'high',
    projectId: 'work',
    tags: ['Backend', 'Performance'],
    subtasks: [
      { id: 'sub-4', title: 'Review EXPLAIN ANALYZE on audit tables', completed: false },
      { id: 'sub-5', title: 'Add partial index for active subscription records', completed: false },
    ],
    isStarred: false,
    estimatedMinutes: 90,
    status: 'todo',
    recurrence: 'none',
  },
  {
    id: 'task-3',
    title: 'Morning 5km endurance run & mobility stretches',
    description: 'Keep zone 2 heart rate baseline; follow with 15-minute hip and hamstring active mobility routine.',
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    dueDate: getFormattedDate(0),
    dueTime: '07:30',
    priority: 'medium',
    projectId: 'health',
    tags: ['Cardio', 'Routine'],
    subtasks: [
      { id: 'sub-6', title: '5km jog at steady pace', completed: true },
      { id: 'sub-7', title: 'Hydration & post-workout stretching', completed: true },
    ],
    isStarred: false,
    estimatedMinutes: 45,
    status: 'done',
    recurrence: 'daily',
  },
  {
    id: 'task-4',
    title: 'Read research paper on LLM agent reasoning architectures',
    description: 'Study recent benchmarks on Tree-of-Thought search and autonomous tool-augmented problem solvers.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    dueDate: getFormattedDate(1), // Tomorrow
    dueTime: '20:00',
    priority: 'medium',
    projectId: 'learning',
    tags: ['AI', 'Research'],
    subtasks: [
      { id: 'sub-8', title: 'Summarize 3 core architecture trade-offs', completed: false },
      { id: 'sub-9', title: 'Share notes in internal engineering channel', completed: false },
    ],
    isStarred: true,
    estimatedMinutes: 40,
    status: 'todo',
    recurrence: 'weekly',
  },
  {
    id: 'task-5',
    title: 'Annual dentist checkup and preventive cleaning',
    description: 'Dr. Miller clinic appointment downtown. Bring updated health coverage card.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    dueDate: getFormattedDate(3),
    dueTime: '10:00',
    priority: 'low',
    projectId: 'personal',
    tags: ['Health', 'Appointments'],
    subtasks: [],
    isStarred: false,
    estimatedMinutes: 60,
    status: 'todo',
    recurrence: 'none',
  },
  {
    id: 'task-6',
    title: 'Order replacement water filtration cartridges',
    description: 'Check model dimensions for reverse osmosis system under the sink.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    priority: 'low',
    projectId: 'personal',
    tags: ['Home', 'Errands'],
    subtasks: [],
    isStarred: false,
    estimatedMinutes: 15,
    status: 'todo',
    recurrence: 'none',
  },
  {
    id: 'task-7',
    title: 'Inspect API contract tests for authentication service',
    description: 'Ensure backward compatibility before rolling out v2 session tokens.',
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: getFormattedDate(-1),
    priority: 'high',
    projectId: 'work',
    tags: ['Security', 'QA'],
    subtasks: [
      { id: 'sub-10', title: 'Run automated regression test suite', completed: true },
      { id: 'sub-11', title: 'Sign off on security compliance checklist', completed: true },
    ],
    isStarred: false,
    estimatedMinutes: 50,
    status: 'done',
    recurrence: 'none',
  }
];

const TASKS_KEY = 'taskflow_tasks_v1';
const PROJECTS_KEY = 'taskflow_projects_v1';

export function loadStoredTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      saveStoredTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveStoredTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // LocalStorage write error handle
  }
}

export function loadStoredProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) {
      saveStoredProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveStoredProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // LocalStorage write error handle
  }
}

// Data Export/Import Helpers
export function exportTasksAsJSON(tasks, projects) {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    projects,
    tasks,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTasksAsCSV(tasks, projects) {
  const projectMap = new Map(projects.map(p => [p.id, p.name]));
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Project', 'Due Date', 'Due Time', 'Tags', 'Subtasks Count', 'Completed Subtasks', 'Created At'];
  
  const rows = tasks.map(t => {
    const subtaskTotal = t.subtasks?.length || 0;
    const subtaskDone = t.subtasks?.filter(s => s.completed).length || 0;
    const projName = projectMap.get(t.projectId) || t.projectId;
    return [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      t.completed ? 'Completed' : t.status,
      t.priority,
      `"${projName}"`,
      t.dueDate || '',
      t.dueTime || '',
      `"${(t.tags || []).join('; ')}"`,
      subtaskTotal,
      subtaskDone,
      t.createdAt
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-tasks-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTasksAsMarkdown(tasks, projects) {
  const projectMap = new Map(projects.map(p => [p.id, p.name]));
  let md = `# TaskFlow Export - ${new Date().toLocaleDateString()}\n\n`;

  projects.forEach(project => {
    const projTasks = tasks.filter(t => t.projectId === project.id);
    if (projTasks.length === 0) return;

    md += `## ${project.name}\n\n`;
    projTasks.forEach(task => {
      const check = task.completed ? '[x]' : '[ ]';
      const due = task.dueDate ? ` *(Due: ${task.dueDate})*` : '';
      const priority = ` [${task.priority.toUpperCase()}]`;
      md += `- ${check} **${task.title}**${priority}${due}\n`;
      if (task.description) {
        md += `  > ${task.description.replace(/\n/g, '\n  > ')}\n`;
      }
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(sub => {
          md += `    - ${sub.completed ? '[x]' : '[ ]'} ${sub.title}\n`;
        });
      }
    });
    md += '\n';
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-checklist-${new Date().toISOString().split('T')[0]}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
