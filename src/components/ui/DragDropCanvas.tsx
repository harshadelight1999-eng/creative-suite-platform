import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DragDropItem {
  id: string
  content: string
  type: 'text' | 'image' | 'shape'
}

interface SortableItemProps {
  item: DragDropItem
}

function SortableItem({ item }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-gray-300 rounded-full" />
        <div>
          <div className="text-sm font-medium text-gray-900">{item.type}</div>
          <div className="text-xs text-gray-500 truncate">{item.content}</div>
        </div>
      </div>
    </div>
  )
}

export function DragDropCanvas() {
  const [items, setItems] = useState<DragDropItem[]>([
    { id: '1', content: 'Title Text Element', type: 'text' },
    { id: '2', content: 'Logo Image', type: 'image' },
    { id: '3', content: 'Body Text Content', type: 'text' },
    { id: '4', content: 'Rectangle Shape', type: 'shape' },
  ])

  const [activeItem, setActiveItem] = useState<DragDropItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const item = items.find(item => item.id === active.id)
    setActiveItem(item || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setActiveItem(null)
  }

  const addNewItem = (type: 'text' | 'image' | 'shape') => {
    const newItem: DragDropItem = {
      id: Date.now().toString(),
      content: `New ${type} element`,
      type
    }
    setItems([...items, newItem])
  }

  return (
    <div className="drag-drop-canvas p-6">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => addNewItem('text')}
          className="btn-primary text-sm"
        >
          Add Text
        </button>
        <button
          onClick={() => addNewItem('image')}
          className="btn-secondary text-sm"
        >
          Add Image
        </button>
        <button
          onClick={() => addNewItem('shape')}
          className="btn-secondary text-sm"
        >
          Add Shape
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-gray-50 rounded-lg p-4 min-h-96">
          <h3 className="text-lg font-semibold mb-4">Canvas Elements</h3>
          <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <SortableItem key={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{activeItem.type}</div>
                  <div className="text-xs text-gray-500">{activeItem.content}</div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}