"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Priority, Task, loadTasks, newId, saveTasks } from "@/lib/tasks";

export default function NewTaskPage() {
  const router = useRouter();
  const nowIso = useMemo(() => new Date().toISOString(), []);

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueAtLocal, setDueAtLocal] = useState<string>("");

  const onSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      alert("タスク名は必須です。");
      return;
    }

    const dueAtIso = dueAtLocal ? new Date(dueAtLocal).toISOString() : undefined;

    const task: Task = {
      id: newId(),
      title: trimmed,
      memo: memo.trim() ? memo : undefined,
      priority,
      dueAt: dueAtIso,
      status: "open",
      createdAt: nowIso,
    };

    const tasks = loadTasks();
    saveTasks([task, ...tasks]);
    router.push("/");
  };

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>タスク追加</h1>
        <Link href="/" style={{ textDecoration: "none" }}>← 戻る</Link>
      </header>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div>タスク名（必須）</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：請求書を送る"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>メモ（任意）</div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>優先順位（必須）</div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>締切（任意）</div>
          <input
            type="datetime-local"
            value={dueAtLocal}
            onChange={(e) => setDueAtLocal(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <div style={{ color: "#666", fontSize: 12 }}>空なら「締切なし」になります。</div>
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button
            onClick={onSave}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
          >
            保存
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
