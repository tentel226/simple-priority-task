export type Priority = "high" | "medium" | "low";
export type Status = "open" | "done";

export type Task = {
  id: string;
  title: string;
  memo?: string;
  priority: Priority;
  dueAt?: string; // ISO string
  status: Status;
  createdAt: string; // ISO string
};

const STORAGE_KEY = "simple_priority_tasks_v1";

function safeParse(json: string | null): Task[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v as Task[];
  } catch {
    return [];
  }
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function newId(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function priorityLabel(p: Priority): string {
  if (p === "high") return "高";
  if (p === "medium") return "中";
  return "低";
}

function priorityRank(p: Priority): number {
  if (p === "high") return 1;
  if (p === "medium") return 2;
  return 3;
}

function dueRank(iso?: string): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

export function sortTasksForList(tasks: Task[]): Task[] {
  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  const sortFn = (a: Task, b: Task) => {
    const pr = priorityRank(a.priority) - priorityRank(b.priority);
    if (pr !== 0) return pr;

    const dr = dueRank(a.dueAt) - dueRank(b.dueAt);
    if (dr !== 0) return dr;

    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  };

  open.sort(sortFn);
  done.sort(sortFn);

  return [...open, ...done];
}

export function upsertTask(tasks: Task[], task: Task): Task[] {
  const idx = tasks.findIndex((t) => t.id === task.id);
  if (idx === -1) return [task, ...tasks];
  const copy = [...tasks];
  copy[idx] = task;
  return copy;
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id);
}