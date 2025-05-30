import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';

interface Concept {
  id: string;
  name: string;
  position: { x: number; y: number };
  boundedContextId: string;
}

interface DraggableConceptProps {
  concept: Concept;
  isConnecting: boolean;
  isConnectionSource: boolean;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onConceptClick: (conceptId: string) => void;
  onDelete: (conceptId: string) => void;
}

export const DraggableConcept: React.FC<DraggableConceptProps> = ({
  concept,
  isConnecting,
  isConnectionSource,
  onPositionChange,
  onConceptClick,
  onDelete
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'concept',
    item: { id: concept.id, type: 'concept' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ name: string; position?: { x: number; y: number } }>();
      
      if (dropResult && dropResult.position) {
        // 使用Canvas返回的绝对位置，并确保在画布边界内
        const newPosition = {
          x: Math.max(20, Math.min(dropResult.position.x - 40, window.innerWidth - 120)), // 40是概念宽度的一半，120是概念的大致宽度
          y: Math.max(20, Math.min(dropResult.position.y - 16, window.innerHeight - 200)) // 16是概念高度的一半，200是底部预留空间
        };
        onPositionChange(concept.id, newPosition);
      } else {
        // 如果没有dropResult.position，使用差值计算（兼容性处理）
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta) {
          const newPosition = {
            x: Math.max(20, concept.position.x + delta.x),
            y: Math.max(20, concept.position.y + delta.y)
          };
          onPositionChange(concept.id, newPosition);
        }
      }
    },
  });

  drag(ref);

  return (
    <div
      ref={ref}
      className={`absolute group ${isDragging ? 'dragging' : 'cursor-move'}`}
      style={{
        left: concept.position.x,
        top: concept.position.y,
      }}
    >
      <div
        className={`
          relative px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover-lift
          ${isConnectionSource ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
          ${isConnecting ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''}
          glass-effect border border-white/30 text-white text-sm font-medium
          min-w-[80px] text-center
        `}
        onClick={() => isConnecting && onConceptClick(concept.id)}
      >
        {concept.name}
        
        {/* 连接点 */}
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full pulse-ring"></div>
          </div>
        )}
        
        {/* 删除按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(concept.id);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* 拖拽指示器 */}
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg bg-white/10"></div>
        )}
      </div>
    </div>
  );
}; 