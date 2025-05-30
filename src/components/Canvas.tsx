import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { ProjectEditMode } from '../types/Project';

interface CanvasProps {
  children: React.ReactNode;
  className?: string;
  editMode?: ProjectEditMode;
  onContextDrop?: (id: string, position: { x: number; y: number }) => void;
  onConceptDrop?: (id: string, position: { x: number; y: number }) => void;
  onContextSelect?: (contextId: string | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  children, 
  className = '', 
  editMode = ProjectEditMode.UML,
  onContextDrop,
  onConceptDrop,
  onContextSelect
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: ['context', 'concept'],
    drop: (item: any, monitor) => {
      if (!canvasRef.current) return { name: 'Canvas' };
      
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return { name: 'Canvas' };
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: clientOffset.x - canvasRect.left,
        y: clientOffset.y - canvasRect.top
      };
      
      // 根据拖拽项类型调用不同的回调
      if (item.type === 'context' && onContextDrop) {
        onContextDrop(item.id, position);
      } else if (item.type === 'concept' && onConceptDrop) {
        onConceptDrop(item.id, position);
      }
      
      return { name: 'Canvas', position };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    // 如果点击的是画布本身（不是子元素），取消选择
    if (e.target === e.currentTarget && onContextSelect) {
      onContextSelect(null);
    }
  };

  // 根据编辑模式设置不同的背景样式
  const getCanvasStyle = () => {
    let baseClasses = `relative w-full h-screen overflow-hidden ${className}`;
    
    if (editMode === ProjectEditMode.CONCEPT) {
      // 概念设计模式：温和的背景色
      baseClasses += ' bg-gradient-to-br from-green-50 to-blue-50';
    } else {
      // UML模式：专业的背景
      baseClasses += ' bg-gradient-to-br from-slate-50 to-indigo-100';
    }
    
    if (isOver) {
      baseClasses += ' ring-2 ring-blue-300 ring-opacity-50';
    }
    
    return baseClasses;
  };

  drop(canvasRef);

  return (
    <div
      ref={canvasRef}
      className={getCanvasStyle()}
      onClick={handleCanvasClick}
    >
      {children}
      
      {/* 编辑模式指示器 */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 text-xs font-medium text-gray-600 z-10">
        {editMode === ProjectEditMode.CONCEPT ? '概念设计模式' : 'UML模式'}
      </div>
      
      {/* 拖拽提示 */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400/50 bg-blue-400/5 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-blue-400 font-medium">释放以放置元素</div>
        </div>
      )}
      
      {/* 网格背景（可选） */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ddd 1px, transparent 1px),
              linear-gradient(to bottom, #ddd 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </div>
  );
}; 