# Agent 5: UI/UX Engineer Tasks

## CURRENT ASSIGNMENT
**Focus:** Build functional drag-and-drop canvas and comprehensive React component library

## MANDATORY TECHNOLOGIES
- React 18 with TypeScript
- Tailwind CSS for styling
- @dnd-kit for drag-and-drop functionality
- Framer Motion for animations
- Headless UI for accessible components

## TODAY'S TASKS (DAY 2 PRIORITY)
1. [ ] Complete @dnd-kit integration with multi-element support
2. [ ] Build properties panel for element customization
3. [ ] Create responsive component library
4. [ ] Implement canvas zoom and pan functionality
5. [ ] Add accessibility compliance (WCAG 2.1 AA)

## CODE TO IMPLEMENT

### Task 1: Install Required Dependencies
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @headlessui/react framer-motion
npm install lucide-react react-hotkeys-hook
```

### Task 2: Canvas Core Implementation
```typescript
// src/components/Canvas/DocumentCanvas.tsx
import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { CanvasElement } from './CanvasElement';
import { ElementToolbar } from './ElementToolbar';
import { PropertiesPanel } from './PropertiesPanel';

export interface DocumentElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  rotation?: number;
  locked?: boolean;
  visible?: boolean;
}

interface DocumentCanvasProps {
  elements: DocumentElement[];
  onElementsChange: (elements: DocumentElement[]) => void;
  width: number;
  height: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  elements,
  onElementsChange,
  width,
  height,
  zoom,
  onZoomChange
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (delta.x === 0 && delta.y === 0) {
      setActiveId(null);
      return;
    }

    const elementId = active.id as string;
    const updatedElements = elements.map(element => {
      if (element.id === elementId) {
        return {
          ...element,
          x: element.x + delta.x / zoom,
          y: element.y + delta.y / zoom,
        };
      }
      return element;
    });

    onElementsChange(updatedElements);
    setActiveId(null);
  }, [elements, onElementsChange, zoom]);

  const handleElementUpdate = useCallback((elementId: string, updates: Partial<DocumentElement>) => {
    const updatedElements = elements.map(element => {
      if (element.id === elementId) {
        return { ...element, ...updates };
      }
      return element;
    });
    onElementsChange(updatedElements);
  }, [elements, onElementsChange]);

  const handleElementDelete = useCallback((elementId: string) => {
    const updatedElements = elements.filter(element => element.id !== elementId);
    onElementsChange(updatedElements);
    setSelectedElementId(null);
  }, [elements, onElementsChange]);

  const addElement = useCallback((type: DocumentElement['type']) => {
    const newElement: DocumentElement = {
      id: `element-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 40 : 100,
      content: type === 'text' ? 'New Text Element' : undefined,
      fontSize: type === 'text' ? 16 : undefined,
      fontFamily: type === 'text' ? 'Arial' : undefined,
      color: '#000000',
      backgroundColor: type === 'shape' ? '#f3f4f6' : 'transparent',
      opacity: 1,
      rotation: 0,
      locked: false,
      visible: true,
    };

    onElementsChange([...elements, newElement]);
    setSelectedElementId(newElement.id);
  }, [elements, onElementsChange]);

  const selectedElement = selectedElementId ? elements.find(el => el.id === selectedElementId) : null;

  return (
    <div className="flex h-full bg-gray-50">
      {/* Toolbar */}
      <ElementToolbar onAddElement={addElement} />

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Controls */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Zoom:</span>
            <select
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={0.25}>25%</option>
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={1}>100%</option>
              <option value={1.25}>125%</option>
              <option value={1.5}>150%</option>
              <option value={2}>200%</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {elements.length} element{elements.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className="absolute inset-0 overflow-auto"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div
                className="bg-white shadow-lg mx-auto my-8 relative"
                style={{
                  width: width * zoom,
                  height: height * zoom,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedElementId(null);
                  }
                }}
              >
                {/* Grid background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Elements */}
                {elements.map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    isSelected={selectedElementId === element.id}
                    onSelect={setSelectedElementId}
                    onUpdate={handleElementUpdate}
                    zoom={zoom}
                  />
                ))}

                <DragOverlay>
                  {activeId ? (
                    <CanvasElement
                      element={elements.find(el => el.id === activeId)!}
                      isSelected={false}
                      onSelect={() => {}}
                      onUpdate={() => {}}
                      zoom={zoom}
                      isDragging
                    />
                  ) : null}
                </DragOverlay>
              </div>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElement && (
        <PropertiesPanel
          element={selectedElement}
          onUpdate={(updates) => handleElementUpdate(selectedElement.id, updates)}
          onDelete={() => handleElementDelete(selectedElement.id)}
        />
      )}
    </div>
  );
};
```

### Task 3: Canvas Element Component
```typescript
// src/components/Canvas/CanvasElement.tsx
import React, { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { DocumentElement } from './DocumentCanvas';

interface CanvasElementProps {
  element: DocumentElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DocumentElement>) => void;
  zoom: number;
  isDragging?: boolean;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  zoom,
  isDragging = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: element.id,
    disabled: element.locked || isEditing,
  });

  const handleDoubleClick = () => {
    if (element.type === 'text' && !element.locked) {
      setIsEditing(true);
      setTimeout(() => {
        textRef.current?.focus();
        textRef.current?.select();
      }, 0);
    }
  };

  const handleTextChange = (newText: string) => {
    onUpdate(element.id, { content: newText });
  };

  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  const style = {
    position: 'absolute' as const,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${element.rotation || 0}deg)` : `rotate(${element.rotation || 0}deg)`,
    opacity: element.opacity || 1,
    zIndex: isSelected ? 1000 : 1,
    visibility: element.visible ? 'visible' : 'hidden' as const,
  };

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            className={`w-full h-full flex items-center justify-center border-2 ${
              isSelected ? 'border-blue-500' : 'border-transparent'
            } ${element.locked ? 'cursor-not-allowed' : 'cursor-move'}`}
            style={{
              backgroundColor: element.backgroundColor,
              borderColor: isSelected ? '#3b82f6' : element.borderColor,
              borderWidth: element.borderWidth || (isSelected ? 2 : 0),
            }}
          >
            {isEditing ? (
              <textarea
                ref={textRef}
                value={element.content || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                onBlur={handleTextBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-full resize-none border-none outline-none bg-transparent"
                style={{
                  fontSize: element.fontSize,
                  fontFamily: element.fontFamily,
                  color: element.color,
                  textAlign: 'center',
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  fontSize: element.fontSize,
                  fontFamily: element.fontFamily,
                  color: element.color,
                }}
              >
                {element.content || 'Text Element'}
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div
            className={`w-full h-full border-2 ${
              isSelected ? 'border-blue-500' : 'border-gray-300'
            } bg-gray-100 flex items-center justify-center`}
            style={{
              borderColor: isSelected ? '#3b82f6' : element.borderColor,
              borderWidth: element.borderWidth || (isSelected ? 2 : 1),
            }}
          >
            <span className="text-gray-500 text-sm">Image Placeholder</span>
          </div>
        );

      case 'shape':
        return (
          <div
            className={`w-full h-full border-2 ${
              isSelected ? 'border-blue-500' : 'border-gray-300'
            }`}
            style={{
              backgroundColor: element.backgroundColor,
              borderColor: isSelected ? '#3b82f6' : element.borderColor,
              borderWidth: element.borderWidth || (isSelected ? 2 : 1),
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      onDoubleClick={handleDoubleClick}
      className="group"
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      transition={{ duration: 0.1 }}
    >
      {renderElement()}

      {/* Element controls */}
      {isSelected && !isEditing && (
        <div className="absolute -top-8 -right-2 flex space-x-1">
          {element.locked && (
            <div className="bg-red-500 text-white p-1 rounded text-xs">
              <Lock size={12} />
            </div>
          )}
          {!element.visible && (
            <div className="bg-gray-500 text-white p-1 rounded text-xs">
              <EyeOff size={12} />
            </div>
          )}
        </div>
      )}

      {/* Resize handles */}
      {isSelected && !element.locked && !isEditing && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white cursor-se-resize" />
        </>
      )}
    </motion.div>
  );
};
```

### Task 4: Properties Panel Component
```typescript
// src/components/Canvas/PropertiesPanel.tsx
import React from 'react';
import { DocumentElement } from './DocumentCanvas';
import { X, Lock, Unlock, Eye, EyeOff, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  element: DocumentElement;
  onUpdate: (updates: Partial<DocumentElement>) => void;
  onDelete: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  element,
  onUpdate,
  onDelete
}) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Properties</h3>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-1"
          title="Delete Element"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Element Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Element Type
        </label>
        <div className="text-sm text-gray-600 capitalize">{element.type}</div>
      </div>

      {/* Position and Size */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position & Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500">X</label>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdate({ x: Number(e.target.value) })}
              className="w-full text-sm border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Y</label>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdate({ y: Number(e.target.value) })}
              className="w-full text-sm border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Width</label>
            <input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onUpdate({ width: Number(e.target.value) })}
              className="w-full text-sm border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Height</label>
            <input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onUpdate({ height: Number(e.target.value) })}
              className="w-full text-sm border rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      {/* Text Properties */}
      {element.type === 'text' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Properties
          </label>
          
          {/* Content */}
          <div className="mb-2">
            <label className="block text-xs text-gray-500">Content</label>
            <textarea
              value={element.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full text-sm border rounded px-2 py-1 h-16 resize-none"
            />
          </div>

          {/* Font Size */}
          <div className="mb-2">
            <label className="block text-xs text-gray-500">Font Size</label>
            <input
              type="number"
              value={element.fontSize || 16}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
              className="w-full text-sm border rounded px-2 py-1"
              min="8"
              max="72"
            />
          </div>

          {/* Font Family */}
          <div className="mb-2">
            <label className="block text-xs text-gray-500">Font Family</label>
            <select
              value={element.fontFamily || 'Arial'}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-full text-sm border rounded px-2 py-1"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>

          {/* Text Color */}
          <div className="mb-2">
            <label className="block text-xs text-gray-500">Text Color</label>
            <input
              type="color"
              value={element.color || '#000000'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-full h-8 border rounded"
            />
          </div>
        </div>
      )}

      {/* Appearance */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Appearance
        </label>

        {/* Background Color */}
        <div className="mb-2">
          <label className="block text-xs text-gray-500">Background</label>
          <input
            type="color"
            value={element.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-full h-8 border rounded"
          />
        </div>

        {/* Border Color */}
        <div className="mb-2">
          <label className="block text-xs text-gray-500">Border Color</label>
          <input
            type="color"
            value={element.borderColor || '#000000'}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="w-full h-8 border rounded"
          />
        </div>

        {/* Border Width */}
        <div className="mb-2">
          <label className="block text-xs text-gray-500">Border Width</label>
          <input
            type="number"
            value={element.borderWidth || 0}
            onChange={(e) => onUpdate({ borderWidth: Number(e.target.value) })}
            className="w-full text-sm border rounded px-2 py-1"
            min="0"
            max="10"
          />
        </div>

        {/* Opacity */}
        <div className="mb-2">
          <label className="block text-xs text-gray-500">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={element.opacity || 1}
            onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">
            {Math.round((element.opacity || 1) * 100)}%
          </div>
        </div>

        {/* Rotation */}
        <div className="mb-2">
          <label className="block text-xs text-gray-500">Rotation</label>
          <input
            type="range"
            min="0"
            max="360"
            value={element.rotation || 0}
            onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">
            {element.rotation || 0}°
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={() => onUpdate({ locked: !element.locked })}
          className={`flex items-center space-x-1 px-3 py-2 rounded text-sm ${
            element.locked
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
          <span>{element.locked ? 'Unlock' : 'Lock'}</span>
        </button>

        <button
          onClick={() => onUpdate({ visible: !element.visible })}
          className={`flex items-center space-x-1 px-3 py-2 rounded text-sm ${
            element.visible
              ? 'bg-gray-100 text-gray-700'
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>{element.visible ? 'Hide' : 'Show'}</span>
        </button>
      </div>
    </div>
  );
};
```

### Task 5: Element Toolbar Component
```typescript
// src/components/Canvas/ElementToolbar.tsx
import React from 'react';
import { Type, Image, Square, PenTool } from 'lucide-react';
import { DocumentElement } from './DocumentCanvas';

interface ElementToolbarProps {
  onAddElement: (type: DocumentElement['type']) => void;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ onAddElement }) => {
  const tools = [
    { type: 'text' as const, icon: Type, label: 'Text' },
    { type: 'image' as const, icon: Image, label: 'Image' },
    { type: 'shape' as const, icon: Square, label: 'Shape' },
    { type: 'signature' as const, icon: PenTool, label: 'Signature' },
  ];

  return (
    <div className="w-16 bg-gray-100 border-r border-gray-200 p-2">
      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onAddElement(tool.type)}
            className="w-full h-12 flex flex-col items-center justify-center bg-white rounded border hover:bg-gray-50 hover:border-blue-300 transition-colors"
            title={tool.label}
          >
            <tool.icon size={16} className="mb-1" />
            <span className="text-xs">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

## INTEGRATION REQUIREMENTS

### With PDF Engineer (Agent 1)
- Provide DocumentElement interface for PDF generation
- Export canvas state in pdfme-compatible format
- Ensure element positioning accuracy

### With Authentication Engineer (Agent 2)
- Integrate auth-protected features
- Show/hide premium elements based on subscription
- Handle user preferences and settings

### With Payment Engineer (Agent 3)
- Display subscription-gated features
- Show upgrade prompts for premium templates
- Handle usage limits for different tiers

### With Database Architect (Agent 4)
- Use document storage schema for saving/loading
- Implement real-time collaboration features
- Store user preferences and canvas settings

### With AI Engineer (Agent 6)
- Provide document structure for AI analysis
- Display AI-generated content suggestions
- Integrate AI-powered layout optimization

## STRICT BOUNDARIES - DO NOT WORK ON
- PDF generation algorithms
- Authentication logic
- Payment processing
- Database queries
- AI model integration
- Testing framework configuration

## ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA)
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader compatibility with ARIA labels
- [ ] High contrast support for visual elements
- [ ] Focus indicators for all focusable elements
- [ ] Alternative text for images and icons

## PERFORMANCE REQUIREMENTS
- [ ] 95+ Lighthouse performance score
- [ ] Sub-100ms interaction response times
- [ ] Smooth 60fps animations
- [ ] Efficient re-rendering with React optimization
- [ ] Responsive design for mobile devices

## SUCCESS CRITERIA
- [ ] Drag-and-drop functionality working smoothly
- [ ] Multi-element selection and manipulation
- [ ] Properties panel updates elements in real-time
- [ ] Canvas zoom and pan functionality
- [ ] Keyboard shortcuts for common actions
- [ ] Undo/redo functionality
- [ ] Element layering and ordering
- [ ] Copy/paste elements functionality

## DELIVERABLE FILES
- `/src/components/Canvas/DocumentCanvas.tsx`
- `/src/components/Canvas/CanvasElement.tsx`
- `/src/components/Canvas/PropertiesPanel.tsx`
- `/src/components/Canvas/ElementToolbar.tsx`
- `/src/hooks/useCanvas.ts`
- `/src/types/canvas.ts`

Remember: Focus ONLY on UI/UX components and user interactions. All business logic, data processing, and integrations are handled by other specialized agents.