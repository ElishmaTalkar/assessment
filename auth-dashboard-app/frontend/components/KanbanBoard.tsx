'use client';

import React, { useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, IStatus } from '@/lib/types';
import { User } from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '@/lib/constants/field-definitions';

interface KanbanBoardProps {
    tasks: Task[];
    statuses: IStatus[]; // Expected to be ordered
    onUpdateTaskStatus: (taskId: string, newStatus: string) => void;
    onTaskClick?: (task: Task) => void;
}

export default function KanbanBoard({ tasks, statuses, onUpdateTaskStatus, onTaskClick }: KanbanBoardProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = React.useState<string | null>(null);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const grouped: Record<string, Task[]> = {};
        statuses.forEach(s => grouped[s.id] = []);
        tasks.forEach(t => {
            if (grouped[t.status]) {
                grouped[t.status].push(t);
            } else {
                // Handle tasks with undefined/deleted status by putting them in first col
                if (statuses.length > 0) {
                    grouped[statuses[0].id].push(t);
                }
            }
        });
        return grouped;
    }, [tasks, statuses]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTask = tasks.find(t => t._id === active.id);
        const overId = over.id as string;

        // If dropped over a container (status column)
        if (statuses.some(s => s.id === overId)) {
            if (activeTask && activeTask.status !== overId) {
                onUpdateTaskStatus(activeTask._id, overId);
            }
        }
        // If dropped over another task
        else {
            const overTask = tasks.find(t => t._id === overId);
            if (activeTask && overTask && activeTask.status !== overTask.status) {
                onUpdateTaskStatus(activeTask._id, overTask.status);
            }
        }

        setActiveId(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
                {statuses.map(status => (
                    <SortableContext
                        key={status.id}
                        id={status.id}
                        items={tasksByStatus[status.id]?.map(t => t._id) || []}
                        strategy={verticalListSortingStrategy}
                    >
                        <KanbanColumn
                            status={status}
                            tasks={tasksByStatus[status.id] || []}
                            onTaskClick={onTaskClick}
                        />
                    </SortableContext>
                ))}
            </div>

            <DragOverlay>
                {activeId ? (
                    <TaskCard task={tasks.find(t => t._id === activeId)!} isOverlay />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function KanbanColumn({ status, tasks, onTaskClick }: { status: IStatus, tasks: Task[], onTaskClick?: (task: Task) => void }) {
    const { setNodeRef } = useSortable({ id: status.id, data: { type: 'Column', status } });

    return (
        <div ref={setNodeRef} className="flex-shrink-0 w-72 bg-[#1a2642]/50 border border-slate-700/50 rounded-xl flex flex-col max-h-full">
            <div className="p-3 border-b border-slate-700/50 flex items-center justify-between sticky top-0 bg-[#1a2642] rounded-t-xl z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                    <h3 className="font-semibold text-sm text-slate-200">{status.label}</h3>
                </div>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                    {tasks.length}
                </span>
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-2 min-h-[100px]">
                {tasks.map(task => (
                    <SortableTaskItem key={task._id} task={task} onTaskClick={onTaskClick} />
                ))}
            </div>
        </div>
    );
}

function SortableTaskItem({ task, onTaskClick }: { task: Task, onTaskClick?: (task: Task) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task._id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} onClick={() => onTaskClick?.(task)} />
        </div>
    );
}

function TaskCard({ task, isOverlay, onClick }: { task: Task, isOverlay?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`
            p-3 bg-[#1e293b] rounded-lg border border-slate-700 shadow-sm group hover:border-blue-500/50 hover:bg-[#1e293b]/80 transition-all cursor-grab active:cursor-grabbing
            ${isOverlay ? 'shadow-2xl scale-105 border-blue-500 z-50' : ''}
        `}>
            {task.category && CATEGORY_DEFINITIONS[task.category] && (
                <div className="mb-2 flex items-center gap-1.5">
                    {(() => {
                        const CatIcon = CATEGORY_DEFINITIONS[task.category].icon;
                        return <CatIcon className={`w-3 h-3 ${CATEGORY_DEFINITIONS[task.category].color.replace('bg-', 'text-')}`} />;
                    })()}
                    <span className="text-[10px] text-slate-400 font-medium">
                        {task.category}
                    </span>
                </div>
            )}
            <h4 className="text-sm font-medium text-slate-200 mb-1 line-clamp-2">{task.title}</h4>

            {/* Custom Field Highlights */}
            {task.customFields && Object.keys(task.customFields).length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                    {task.customFields.budgetCeiling && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            💰 {task.customFields.currency || '$'}{task.customFields.budgetCeiling}
                        </span>
                    )}
                    {task.customFields.roiImpact && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            📈 {task.customFields.roiImpact}
                        </span>
                    )}
                    {task.customFields.complexity && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Fib: {task.customFields.complexity}
                        </span>
                    )}
                    {task.customFields.severity && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            🐞 {task.customFields.severity}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3 mt-3 text-slate-400">
                {task.priority && (
                    <div className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                        }`}>
                        {task.priority}
                    </div>
                )}
                <div className="flex items-center gap-1 text-[11px]">
                    <User className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
}
