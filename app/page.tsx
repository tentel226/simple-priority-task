"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Task,
  deleteTask,
  loadTasks,
  priorityLabel,
  saveTasks,
  sortTasksForList,
  upsertTask,
} from "@/lib/tasks";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const t = loadTasks();
    setTasks(t);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveTasks(tasks);
  }, [tasks, loaded]);

  const sorted = useMemo(() => sortTasksForList(tasks), [tasks]);
  const visibleTasks = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();
    return sorted.filter((t) => {
      if (showOpenOnly && t.status !== "open") return false;
      if (!normalizedQuery) return true;
      const title = t.title.toLowerCase();
      const memo = (t.memo ?? "").toLowerCase();
      return title.includes(normalizedQuery) || memo.includes(normalizedQuery);
    });
  }, [sorted, showOpenOnly, searchText]);

  const onToggleDone = (task: Task) => {
    const next: Task = { ...task, status: task.status === "done" ? "open" : "done" };
    setTasks((prev) => upsertTask(prev, next));
  };

  const onDelete = (task: Task) => {
    const ok = window.confirm(`「${task.title}」を削除しますか？`);
    if (!ok) return;
    setTasks((prev) => deleteTask(prev, task.id));
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>タスク管理（優先順位）</h1>
        <Link
          href="/task/new"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
          }}
        >
          ＋ タスク追加
        </Link>
      </header>

      <p style={{ color: "#666", marginTop: 8 }}>
        並び順：優先（高→中→低）→締切が近い順／締切なしは最後。完了は下に表示。
      </p>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="検索（タスク名・メモ）"
          aria-label="検索（タスク名・メモ）"
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 14,
          }}
        />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={showOpenOnly}
            onChange={(e) => setShowOpenOnly(e.target.checked)}
            aria-label="未完了のみ表示"
          />
          未完了のみ表示
        </label>
      </div>

      <section style={{ marginTop: 16 }}>
        {visibleTasks.length === 0 ? (
          <div style={{ border: "1px dashed #ccc", borderRadius: 12, padding: 16 }}>
            {tasks.length === 0
              ? "タスクがまだありません。「タスク追加」から作ってみましょう。"
              : "条件に一致するタスクはありません。"}
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {visibleTasks.map((t) => (
              <li
                key={t.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: 12,
                  opacity: t.status === "done" ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <input
                      type="checkbox"
                      checked={t.status === "done"}
                      onChange={() => onToggleDone(t)}
                      style={{ width: 18, height: 18, marginTop: 3 }}
                      aria-label="完了切り替え"
                    />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, textDecoration: t.status === "done" ? "line-through" : "none" }}>
                        {t.title}
                      </div>
                      <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                        優先：{priorityLabel(t.priority)}
                        {"  "}｜{"  "}
                        締切：{t.dueAt ? formatLocal(t.dueAt) : "なし"}
                      </div>
                      {t.memo ? <div style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 13 }}>{t.memo}</div> : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/task/${t.id}/edit`}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => onDelete(t)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        background: "white",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function formatLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}
