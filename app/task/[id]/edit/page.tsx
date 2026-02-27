"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Priority, Task, deleteTask, loadTasks, saveTasks } from "@/lib/tasks";

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [target, setTarget] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueAtLocal, setDueAtLocal] = useState<string>("");

  useEffect(() => {
    const t = loadTasks();
    setTasks(t);
    const found = t.find((x) => x.id === id) ?? null;
    setTarget(found);

    if (found) {
      setTitle(found.title ?? "");
      setMemo(found.memo ?? "");
      setPriority(found.priority);
      setDueAtLocal(found.dueAt ? toLocalInput(found.dueAt) : "");
    }
  }, [id]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  const onSave = () => {
    if (!target) return;
    const trimmed = title.trim();
    if (!trimmed) {
      alert("タスク名は必須です。");
      return;
    }

    const dueAtIso = dueAtLocal ? new Date(dueAtLocal).toISOString() : undefined;

    const updated: Task = {
      ...target,
      title: trimmed,
      memo: memo.trim() ? memo : undefined,
      priority,
      dueAt: dueAtIso,
    };

    const next = tasks.map((t) => (t.id === updated.id ? updated : t));
    saveTasks(next);
    router.push("/");
  };

  const onDelete = () => {
    if (!target) return;
    const ok = window.confirm(`「${target.title}」を削除しますか？`);
    if (!ok) return;
    const next = deleteTask(tasks, target.id);
    saveTasks(next);
    router.push("/");
  };

  if (!id) {
    return (
      <main style={{ padding: 16, fontFamily: "system-ui" }}>
        <div>URLが不正です。</div>
        <Link href="/">戻る</Link>
      </main>
    );
  }

  if (!target) {
    return (
      <main style={{ padding: 16, fontFamily: "system-ui" }}>
        <div>このタスクは見つかりませんでした（削除済みの可能性）。</div>
        <Link href="/">戻る</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>タスク編集</h1>
        <Link href="/" style={{ textDecoration: "none" }}>← 戻る</Link>
      </header>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div>タスク名（必須）</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>メモ（任意）</div>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={4} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>優先順位（必須）</div>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>締切（任意）</div>
          <input type="datetime-local" value={dueAtLocal} onChange={(e) => setDueAtLocal(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <div style={{ color: "#666", fontSize: 12 }}>空なら「締切なし」になります。</div>
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button
            onClick={onSave}
            disabled={!canSave}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: canSave ? "pointer" : "not-allowed", opacity: canSave ? 1 : 0.6 }}
          >
            保存
          </button>
          <button
            onClick={onDelete}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
          >
            削除
          </button>
          <Link
            href="/"
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          >
            キャンセル
          </Link>
        </div>
      </div>
    </main>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}