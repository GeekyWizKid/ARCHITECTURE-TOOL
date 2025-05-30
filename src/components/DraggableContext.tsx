import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { BoundedContext } from '../types/Project';

interface DraggableContextProps {
  context: BoundedContext;
  isSelected: boolean;
  onEdit: (context: BoundedContext) => void;
  onDelete: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSelect: (contextId: string) => void;
  onEnterContext: (contextId: string) => void;
}

export const DraggableContext: React.FC<DraggableContextProps> = ({
  context,
  isSelected,
  onEdit,
  onDelete,
  onPositionChange,
  onSelect,
  onEnterContext
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'context',
    item: { type: 'context', id: context.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ position?: { x: number; y: number } }>();
      if (dropResult?.position) {
        onPositionChange(context.id, dropResult.position);
      }
    }
  });

  drag(ref);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(context.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnterContext(context.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(context);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(context.id);
  };

  return (
    <div
      ref={ref}
      className={`absolute bg-white rounded-xl border-2 shadow-lg transition-all duration-300 cursor-move group ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:shadow-xl hover:-translate-y-1'
      } ${
        isSelected ? 'border-blue-500 shadow-blue-500/25 ring-2 ring-blue-400/30' : 'border-slate-200 hover:border-slate-300'
      }`}
      style={{
        left: context.position.x,
        top: context.position.y,
        width: context.size.width,
        height: context.size.height,
        borderLeftColor: context.color,
        borderLeftWidth: '4px'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 头部 */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
            {context.name}
          </h3>
          
          {/* 操作按钮 */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEnterContext(context.id)}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
              title="进入上下文"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={handleEdit}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
              title="编辑"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
              title="删除"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4">
        <p className="text-slate-600 text-sm leading-relaxed">
          {context.description}
        </p>
        
        {/* 选择提示 */}
        {isSelected && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs text-center font-medium">
              已选择 - 双击进入上下文编辑
            </p>
          </div>
        )}
        
        {/* 进入提示 */}
        <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-emerald-700 text-xs text-center">
            双击进入上下文内部编辑概念和关系
          </p>
        </div>
      </div>

      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
      )}
    </div>
  );
}; 