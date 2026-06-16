import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Target, Trash2, Pencil, Flag, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { ApiError } from "@/lib/api";
import {
  createTodo,
  deleteTodo as deleteTodoApi,
  fetchTodos,
  setTodoDone,
  Todo,
  TodoPriority,
  updateTodo,
} from "@/lib/todos";

function showTodoError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.code === "UNAUTHORIZED" || error.code === "TOKEN_EXPIRED") {
      toast.error("Sessiya tugagan. Qayta kiring");
      return;
    }

    if (error.code === "VALIDATION_ERROR") {
      toast.error("Ma'lumotlarni tekshirib qayta urinib ko'ring");
      return;
    }
  }

  toast.error(fallback);
}

const PRIORITY_LABEL: Record<TodoPriority, string> = {
  low: "Past",
  medium: "O'rta",
  high: "Yuqori",
};

const PRIORITY_CLASS: Record<TodoPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);

  useEffect(() => {
    let alive = true;

    const loadTodos = async () => {
      try {
        const remoteTodos = await fetchTodos();
        if (alive) setTodos(remoteTodos);
      } catch (error) {
        if (alive) showTodoError(error, "Rejalarni yuklab bo'lmadi");
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadTodos();

    return () => {
      alive = false;
    };
  }, []);

  const sortByDue = (arr: Todo[]) =>
    [...arr].sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

  const active = useMemo(() => sortByDue(todos.filter((t) => !t.isDone)), [todos]);
  const done = useMemo(() => todos.filter((t) => t.isDone), [todos]);

  const save = async (data: Omit<Todo, "id" | "createdAt" | "isDone" | "completedAt"> & { id?: string }) => {
    if (data.id) {
      try {
        const updated = await updateTodo(data.id, data);
        setTodos((arr) => arr.map((t) => (t.id === updated.id ? updated : t)));
        toast.success("Reja yangilandi");
      } catch (error) {
        showTodoError(error, "Rejani yangilab bo'lmadi");
        throw error;
      }
      return;
    }

    try {
      const created = await createTodo(data);
      setTodos((arr) => [created, ...arr]);
      toast.success("Reja qo'shildi");
    } catch (error) {
      showTodoError(error, "Rejani qo'shib bo'lmadi");
      throw error;
    }
  };

  const remove = async (id: string) => {
    const previousTodos = todos;
    setTodos((arr) => arr.filter((t) => t.id !== id));
    try {
      await deleteTodoApi(id);
      toast.success("Reja o'chirildi");
    } catch (error) {
      setTodos(previousTodos);
      showTodoError(error, "Rejani o'chirib bo'lmadi");
    }
  };

  const toggle = async (id: string) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;
    const nextDone = !current.isDone;
    const previousTodos = todos;
    setTodos((arr) =>
      arr.map((t) =>
        t.id === id
          ? { ...t, isDone: nextDone, completedAt: nextDone ? new Date().toISOString() : undefined }
          : t
      )
    );
    try {
      const updated = await setTodoDone(id, nextDone);
      setTodos((arr) => arr.map((t) => (t.id === id ? updated : t)));
    } catch (error) {
      setTodos(previousTodos);
      showTodoError(error, "Reja holatini saqlab bo'lmadi");
    }
  };

  return (
    <>
      <AppHeader title="Rejalar" subtitle="Maqsad va vazifalar" />

      <div className="space-y-4 px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Bajarilmagan" value={active.length} icon={Target} colorClass="text-primary" bgClass="bg-primary/10" />
          <StatCard label="Bajarildi" value={done.length} icon={CheckCircle2} colorClass="text-success" bgClass="bg-success/10" />
        </div>

        {!loading && todos.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Hali rejalar yo'q"
            description="Kelajakda bajarmoqchi bo'lgan ishlaringizni va maqsadlaringizni yozing."
            action={
              <Button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-xl">
                <Plus className="mr-1 h-4 w-4" /> Yangi reja
              </Button>
            }
          />
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="active" className="rounded-lg">
                📌 Bajarilmagan
                {active.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {active.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="done" className="rounded-lg">
                ✅ Bajarildi
                {done.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-success/20 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                    {done.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-3 space-y-2">
              {active.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground">
                  Bajarilmagan rejalar yo'q. 🎉
                </p>
              ) : (
                active.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    onToggle={() => toggle(t.id)}
                    onEdit={() => { setEditing(t); setOpen(true); }}
                    onDelete={() => remove(t.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="done" className="mt-3 space-y-2">
              {done.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground">
                  Hozircha bajarilgan rejalar yo'q.
                </p>
              ) : (
                done.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    onToggle={() => toggle(t.id)}
                    onEdit={() => { setEditing(t); setOpen(true); }}
                    onDelete={() => remove(t.id)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <button
        onClick={() => { setEditing(null); setOpen(true); }}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow transition-bounce tap-scale hover:scale-105"
        aria-label="Reja qo'shish"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <TodoDialog open={open} onOpenChange={setOpen} todo={editing} onSave={save} />
    </>
  );
}

function TodoItem({ todo, onToggle, onEdit, onDelete }: { todo: Todo; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = !todo.isDone && todo.dueDate && todo.dueDate < today;
  const isDueToday = !todo.isDone && todo.dueDate === today;
  const isDueSoon = !todo.isDone && todo.dueDate && todo.dueDate > today && todo.dueDate <= new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  const dueBadgeClass = isOverdue
    ? "bg-destructive/10 text-destructive"
    : isDueToday
    ? "bg-amber-500/10 text-amber-600"
    : isDueSoon
    ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";

  return (
    <>
      <div className={cn(
        "flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-base",
        todo.isDone && "opacity-70",
        isOverdue && "border-destructive/30"
      )}>
        <button onClick={onToggle} className="mt-1 tap-scale" aria-label="Belgilash">
          <Checkbox checked={todo.isDone} className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn("text-sm font-semibold leading-tight", todo.isDone && "line-through text-muted-foreground")}>
              {todo.title}
            </h3>
            <div className="flex shrink-0 gap-1">
              <button onClick={onEdit} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Tahrirlash">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setConfirm(true)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="O'chirish">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {todo.note && <p className="mt-1 text-xs text-muted-foreground">{todo.note}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", PRIORITY_CLASS[todo.priority])}>
              <Flag className="h-2.5 w-2.5" />
              {PRIORITY_LABEL[todo.priority]}
            </span>
            {todo.dueDate && (
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", dueBadgeClass)}>
                📅 {isOverdue ? "Kechikdi · " : isDueToday ? "Bugun · " : ""}{todo.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Bu rejani o'chirishni xohlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription>"{todo.title}" o'chiriladi va qayta tiklab bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TodoDialog({
  open,
  onOpenChange,
  todo,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  todo: Todo | null;
  onSave: (
    data: Omit<Todo, "id" | "createdAt" | "isDone" | "completedAt"> & { id?: string },
  ) => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  // sync when opening
  useMemo(() => {
    if (open) {
      setTitle(todo?.title ?? "");
      setNote(todo?.note ?? "");
      setPriority(todo?.priority ?? "medium");
      setDueDate(todo?.dueDate ?? "");
      setSaving(false);
    }
  }, [open, todo]);

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Sarlavhani kiriting");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: todo?.id,
        title: title.trim(),
        note: note.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      onOpenChange(false);
    } catch {
      // The page-level save handler shows the relevant toast and keeps the dialog open.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{todo ? "Rejani tahrirlash" : "Yangi reja"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sarlavha</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Kitob o'qish" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Izoh (ixtiyoriy)</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qo'shimcha tafsilotlar..." />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Muhimlik</label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as TodoPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition-base",
                    priority === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Muddat (ixtiyoriy)</label>
            <DatePicker
              value={dueDate ? dayjs(dueDate, "YYYY-MM-DD") : null}
              format="DD.MM.YYYY"
              size="large"
              onChange={(val) => setDueDate(val ? val.format("YYYY-MM-DD") : "")}
              placeholder="Sanani tanlang"
              style={{ width: "100%" }}
              getPopupContainer={(trigger) => trigger.parentElement!}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl" disabled={saving}>Bekor qilish</Button>
          <Button onClick={submit} className="rounded-xl" disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
