import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, ShieldX, Calendar as CalendarIcon } from "lucide-react";
import { Habit, HabitLogs } from "@/lib/types";
import { dateKey, todayKey, weekRange } from "@/lib/date";
import {
  createHabit,
  dailyCompletion,
  deleteHabit as deleteHabitApi,
  deleteHabitLog,
  fetchHabitLogs,
  fetchHabits,
  isCompleted,
  rangeCompletion,
  setHabitLog,
  setHabitPinned,
  streak as calcStreak,
  updateHabit,
} from "@/lib/habits";
import { DateStrip } from "@/components/habits/DateStrip";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { HabitMatrix } from "@/components/habits/HabitMatrix";
import { StatsRow } from "@/components/habits/StatsRow";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitDialog } from "@/components/habits/HabitDialog";
import { EmptyState } from "@/components/EmptyState";
import { ChartLoading, ListLoading } from "@/components/DataLoading";
import { format } from "date-fns";
import { toast } from "sonner";
import { HabitType } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api";

function showHabitError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.code === "PINNED_HABIT_LOCKED") {
      toast.error("Mahkamlangan odatni o'zgartirib bo'lmaydi");
      return;
    }

    if (error.code === "FUTURE_DATE_NOT_ALLOWED") {
      toast.error("Kelajak sanasini belgilab bo'lmaydi");
      return;
    }

    if (error.code === "UNAUTHORIZED" || error.code === "TOKEN_EXPIRED") {
      toast.error("Sessiya tugagan. Qayta kiring");
      return;
    }
  }

  toast.error(fallback);
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLogs>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [initialType, setInitialType] = useState<HabitType>("good");

  useEffect(() => {
    let alive = true;

    const loadHabits = async () => {
      try {
        const [remoteHabits, remoteLogs] = await Promise.all([fetchHabits(), fetchHabitLogs()]);
        if (!alive) return;
        setHabits(remoteHabits);
        setLogs(remoteLogs);
      } catch (error) {
        if (alive) showHabitError(error, "Odatlarni yuklab bo'lmadi");
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadHabits();

    return () => {
      alive = false;
    };
  }, []);

  const todayPct = useMemo(() => dailyCompletion(habits, logs, todayKey()), [habits, logs]);
  const weekPct = useMemo(() => {
    const { from, to } = weekRange();
    return rangeCompletion(habits, logs, from, to);
  }, [habits, logs]);
  const streak = useMemo(() => calcStreak(habits, logs), [habits, logs]);

  const sortPinned = (a: Habit, b: Habit) => Number(!!b.pinned) - Number(!!a.pinned);
  const goods = habits.filter((h) => h.type === "good").sort(sortPinned);
  const bads = habits.filter((h) => h.type === "bad").sort(sortPinned);

  const openNew = (type: HabitType) => {
    setEditing(null);
    setInitialType(type);
    setDialogOpen(true);
  };

  const openEdit = (h: Habit) => {
    if (h.pinned) {
      toast.error("Mahkamlangan odatni tahrirlab bo'lmaydi");
      return;
    }
    setEditing(h);
    setInitialType(h.type);
    setDialogOpen(true);
  };

  const saveHabit = async (data: Omit<Habit, "id" | "createdAt"> & { id?: string }) => {
    if (data.id) {
      try {
        const updated = await updateHabit(data.id, data);
        setHabits((arr) => arr.map((h) => (h.id === updated.id ? updated : h)));
        toast.success("Odat yangilandi");
      } catch (error) {
        showHabitError(error, "Odatni yangilab bo'lmadi");
        throw error;
      }
      return;
    }

    try {
      const created = await createHabit(data);
      setHabits((arr) => [created, ...arr]);
      toast.success("Odat yaratildi");
    } catch (error) {
      showHabitError(error, "Odatni yaratib bo'lmadi");
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    const h = habits.find((x) => x.id === id);
    if (h?.pinned) {
      toast.error("Mahkamlangan odatni o'chirib bo'lmaydi");
      return;
    }
    const previousHabits = habits;
    const previousLogs = logs;
    setHabits((arr) => arr.filter((h) => h.id !== id));
    setLogs((l) => {
      const next = { ...l };
      delete next[id];
      return next;
    });
    try {
      await deleteHabitApi(id);
      toast.success("Odat o'chirildi");
    } catch (error) {
      setHabits(previousHabits);
      setLogs(previousLogs);
      showHabitError(error, "Odatni o'chirib bo'lmadi");
    }
  };

  const togglePin = async (id: string) => {
    const current = habits.find((x) => x.id === id);
    if (!current) return;
    const nextPinned = !current.pinned;
    const previousHabits = habits;
    setHabits((arr) => arr.map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h)));
    try {
      const updated = await setHabitPinned(id, nextPinned);
      setHabits((arr) => arr.map((h) => (h.id === id ? updated : h)));
      toast.success(current.pinned ? "Mahkamlash bekor qilindi" : "Odat mahkamlandi");
    } catch (error) {
      setHabits(previousHabits);
      showHabitError(error, "Odat mahkamlash holatini o'zgartirib bo'lmadi");
    }
  };

  const toggleAt = async (id: string, key: string) => {
    if (key > todayKey()) return;
    const previousLogs = logs;
    const checked = isCompleted(logs, id, key);
    setLogs((l) => {
      const day = { ...(l[id] || {}) };
      if (day[key]) delete day[key];
      else day[key] = true;
      return { ...l, [id]: day };
    });
    try {
      if (checked) {
        await deleteHabitLog(id, key);
      } else {
        await setHabitLog(id, key);
      }
    } catch (error) {
      setLogs(previousLogs);
      showHabitError(error, "Odat holatini saqlab bo'lmadi");
    }
  };

  const toggle = (id: string) => toggleAt(id, dateKey(selected));

  const subtitle = format(selected, "EEEE, MMM d");

  return (
    <>
      <AppHeader title="Odatlar" subtitle={subtitle} />

      <div className="space-y-5 px-4 pt-4">
        <Tabs defaultValue="strip" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="strip" className="rounded-lg">So'nggi</TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg">Taqvim</TabsTrigger>
            <TabsTrigger value="matrix" className="rounded-lg">Batafsil</TabsTrigger>
          </TabsList>
          <TabsContent value="strip" className="mt-3">
            <DateStrip selected={selected} onSelect={setSelected} />
          </TabsContent>
          <TabsContent value="calendar" className="mt-3">
            {loading ? <ChartLoading className="h-[360px]" /> : <HabitCalendar habits={habits} logs={logs} selected={selected} onSelect={setSelected} />}
          </TabsContent>
          <TabsContent value="matrix" className="mt-3">
            {loading ? <ChartLoading /> : <HabitMatrix habits={habits} logs={logs} onToggle={toggleAt} />}
          </TabsContent>
        </Tabs>

        <StatsRow streak={streak} todayPct={todayPct} weekPct={weekPct} />

        {loading ? (
          <>
            <Section title="Yaxshi odatlar" icon={<Sparkles className="h-4 w-4 text-success" />} onAdd={() => openNew("good")}>
              <ListLoading items={3} />
            </Section>

            <Section title="Yomon odatlar" icon={<ShieldX className="h-4 w-4 text-destructive" />} onAdd={() => openNew("bad")}>
              <ListLoading items={2} />
            </Section>
          </>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="Kunningizni kuzatishni boshlang"
            description="Qo'shmoqchi yoki tark etmoqchi bo'lgan odatlaringizni qo'shing. Har kuni kichik qadamlar."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => openNew("good")} className="rounded-xl">
                  <Plus className="mr-1 h-4 w-4" /> Yaxshi odat
                </Button>
                <Button onClick={() => openNew("bad")} variant="outline" className="rounded-xl">
                  <Plus className="mr-1 h-4 w-4" /> Yomon odat
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <Section title="Yaxshi odatlar" icon={<Sparkles className="h-4 w-4 text-success" />} onAdd={() => openNew("good")}>
              {goods.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground">
                  Hozircha yaxshi odatlar yo'q.
                </p>
              ) : (
                <div className="space-y-2">
                  {goods.map((h) => (
                    <HabitCard key={h.id} habit={h} logs={logs} selectedDate={selected}
                      onToggle={() => toggle(h.id)} onEdit={() => openEdit(h)} onDelete={() => deleteHabit(h.id)} onTogglePin={() => togglePin(h.id)} />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Yomon odatlar" icon={<ShieldX className="h-4 w-4 text-destructive" />} onAdd={() => openNew("bad")}>
              {bads.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center text-sm text-muted-foreground">
                  Hozircha yomon odatlar kuzatilmagan.
                </p>
              ) : (
                <div className="space-y-2">
                  {bads.map((h) => (
                    <HabitCard key={h.id} habit={h} logs={logs} selectedDate={selected}
                      onToggle={() => toggle(h.id)} onEdit={() => openEdit(h)} onDelete={() => deleteHabit(h.id)} onTogglePin={() => togglePin(h.id)} />
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </div>

      {/* Floating action button */}
      <button
        onClick={() => openNew("good")}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow transition-bounce tap-scale hover:scale-105"
        aria-label="Odat qo'shish"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <HabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialType={initialType}
        habit={editing}
        onSave={saveHabit}
      />
    </>
  );
}

function Section({ title, icon, onAdd, children }: { title: string; icon: React.ReactNode; onAdd: () => void; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          {icon}{title}
        </h2>
        <Button size="sm" variant="ghost" className="h-7 rounded-lg px-2 text-xs" onClick={onAdd}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Qo'shish
        </Button>
      </div>
      {children}
    </section>
  );
}
