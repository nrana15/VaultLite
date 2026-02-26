import { useMemo, useState } from 'react';

interface TaskItem {
  id: string;
  title: string;
  dueAt?: string;
  reminderAt?: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const storeKey = 'vaultlite.tasks';

function loadTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(storeKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TaskItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: TaskItem[]) {
  localStorage.setItem(storeKey, JSON.stringify(tasks));
}

function uid() {
  return `task-${Math.random().toString(36).slice(2, 10)}`;
}

export function TaskTodoPanel() {
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadTasks());
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const overdue = tasks.filter((t) => t.status === 'pending' && t.dueAt && new Date(t.dueAt).getTime() < Date.now()).length;
    return { pending, completed, overdue };
  }, [tasks]);

  const visible = useMemo(() => {
    const list =
      filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    });
  }, [tasks, filter]);

  const update = (next: TaskItem[]) => {
    setTasks(next);
    saveTasks(next);
  };

  const addTask = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const next: TaskItem = {
      id: uid(),
      title: title.trim(),
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : undefined,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    update([next, ...tasks]);
    setTitle('');
    setDueAt('');
    setReminderAt('');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Tasks / Todo</h3>
      <p className="mt-1 text-xs text-slate-500">Track what to do, when to do it, and what is completed.</p>

      <div className="mt-3 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Task title"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-600">
            Due date/time
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-slate-600">
            Reminder time
            <input
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
            />
          </label>
        </div>
        <button onClick={addTask} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Add Task
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg border border-slate-200 p-2">Pending: <b>{stats.pending}</b></div>
        <div className="rounded-lg border border-slate-200 p-2">Completed: <b>{stats.completed}</b></div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700">Overdue: <b>{stats.overdue}</b></div>
      </div>

      <div className="mt-3 flex gap-2 text-xs">
        {(['pending', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md border px-2 py-1 ${filter === f ? 'bg-slate-900 text-white' : 'border-slate-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {visible.map((task) => {
          const isOverdue = task.status === 'pending' && task.dueAt && new Date(task.dueAt).getTime() < Date.now();
          return (
            <article key={task.id} className={`rounded-lg border p-2 text-sm ${isOverdue ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Due: {task.dueAt ? new Date(task.dueAt).toLocaleString() : '—'} · Reminder: {task.reminderAt ? new Date(task.reminderAt).toLocaleString() : '—'}
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {task.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() =>
                    update(
                      tasks.map((t) =>
                        t.id === task.id
                          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed', updatedAt: new Date().toISOString() }
                          : t,
                      ),
                    )
                  }
                  className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
                >
                  {task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                </button>
                <button
                  onClick={() => {
                    const base = task.dueAt ? new Date(task.dueAt) : new Date();
                    base.setDate(base.getDate() + 1);
                    update(tasks.map((t) => (t.id === task.id ? { ...t, dueAt: base.toISOString(), status: 'pending', updatedAt: new Date().toISOString() } : t)));
                  }}
                  className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
                >
                  Move to next day
                </button>
                <button
                  onClick={() => update(tasks.filter((t) => t.id !== task.id))}
                  className="rounded border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
        {visible.length === 0 ? <p className="text-xs text-slate-500">No tasks in this view.</p> : null}
      </div>
    </section>
  );
}
