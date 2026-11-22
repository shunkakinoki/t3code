import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProviderInstanceId } from "@t3tools/contracts";
import { useGT } from "gt-react";
import { GripVerticalIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

export function ProviderSortableList(props: {
  readonly instanceIds: ReadonlyArray<ProviderInstanceId>;
  readonly onReorder: (instanceIds: ReadonlyArray<ProviderInstanceId>) => void;
  readonly children: ReactNode;
}) {
  const { instanceIds, onReorder } = props;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over === null || event.active.id === event.over.id) return;
    const from = instanceIds.indexOf(event.active.id as ProviderInstanceId);
    const to = instanceIds.indexOf(event.over.id as ProviderInstanceId);
    if (from !== -1 && to !== -1) onReorder(arrayMove([...instanceIds], from, to));
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={[...instanceIds]} strategy={verticalListSortingStrategy}>
        {props.children}
      </SortableContext>
    </DndContext>
  );
}

export function ProviderSortableRow(props: {
  readonly instanceId: ProviderInstanceId;
  readonly children: (dragHandle: ReactNode) => ReactNode;
}) {
  const gt = useGT();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.instanceId });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && "relative z-10 bg-background shadow-md")}
    >
      {props.children(
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={gt("Drag to reorder")}
          className="pointer-events-auto relative -ms-2 flex h-6 w-4 shrink-0 cursor-grab touch-none items-center justify-center self-center rounded text-muted-foreground/50 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset active:cursor-grabbing"
        >
          <GripVerticalIcon className="size-3.5" />
        </button>,
      )}
    </div>
  );
}
