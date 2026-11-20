import type { CSSProperties, ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  /** Habits in display order (pinned first). */
  habits: Habit[];
  /** Called with the new display order after a drop that changed it. */
  onReorder: (next: Habit[]) => void;
  renderItem: (habit: Habit, handle: ReactNode, isDragging: boolean) => ReactNode;
}

/** Pinned habits always stay above the rest, so a drop never moves an item across that line. */
const keepPinnedFirst = (list: Habit[]) =>
  [...list].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

export function SortableHabitList({ habits, onReorder, renderItem }: Props) {
  const sensors = useSensors(
    // Drag starts only from the handle; a small distance keeps taps on it from becoming drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = habits.findIndex((h) => h.id === active.id);
    const to = habits.findIndex((h) => h.id === over.id);
    if (from < 0 || to < 0) return;

    const next = keepPinnedFirst(arrayMove(habits, from, to));
    if (next.some((h, i) => h.id !== habits[i].id)) onReorder(next);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {habits.map((habit) => (
            <SortableHabit key={habit.id} habit={habit} renderItem={renderItem} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableHabit({ habit, renderItem }: { habit: Habit; renderItem: Props["renderItem"] }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: habit.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  };

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`"${habit.title}" odatini sudrab joyini o'zgartirish`}
      className={cn(
        "-ml-1 flex h-8 w-5 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging ? "cursor-grabbing text-foreground" : "cursor-grab",
      )}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(habit, handle, isDragging)}
    </div>
  );
}
