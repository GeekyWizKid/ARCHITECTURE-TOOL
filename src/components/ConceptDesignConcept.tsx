import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { DDDConcept } from '../types/Project';

interface ConceptDesignConceptProps {
  concept: DDDConcept;
  isSelected: boolean;
  isConnectionMode: boolean;
  isConnectionSource: boolean;
  isIsolated: boolean; // 游离态概念
  onClick: () => void;
  onEdit: (concept: DDDConcept) => void;
  onDelete: (conceptId: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

export const ConceptDesignConcept: React.FC<ConceptDesignConceptProps> = ({
  concept,
  isSelected,
  isConnectionMode,
  isConnectionSource,
  isIsolated,
  onClick,
  onEdit,
  onDelete,
  onPositionChange
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'concept',
    item: { type: 'concept', id: concept.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ position?: { x: number; y: number } }>();
      if (dropResult?.position) {
        onPositionChange(concept.id, dropResult.position);
      }
    }
  });

  drag(ref);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(concept);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(concept.id);
  };

  // 根据状态确定样式
  const getCardStyle = () => {
    let baseClasses = "relative w-full h-full transition-all duration-300 cursor-pointer group rounded-xl border-2 shadow-lg hover:shadow-xl";
    
    if (isDragging) {
      baseClasses += " opacity-50 rotate-2 scale-105";
    } else {
      baseClasses += " hover:scale-105";
    }

    // 游离态概念 - 橙色高亮
    if (isIsolated) {
      baseClasses += " bg-gradient-to-br from-orange-50 to-orange-100 border-orange-400 ring-2 ring-orange-300/50";
    }
    // 连接源 - 绿色
    else if (isConnectionSource) {
      baseClasses += " bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-500 ring-2 ring-emerald-400/50 animate-pulse";
    }
    // 选中状态 - 蓝色
    else if (isSelected) {
      baseClasses += " bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 ring-2 ring-blue-400/50";
    }
    // 连接模式 - 悬停变绿
    else if (isConnectionMode) {
      baseClasses += " bg-white border-slate-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 hover:border-green-400";
    }
    // 默认状态
    else {
      baseClasses += " bg-white border-slate-300 hover:border-slate-400";
    }

    return baseClasses;
  };

  return (
    <div
      ref={ref}
      className="absolute"
      data-concept-id={concept.id}
      style={{
        left: concept.position.x,
        top: concept.position.y,
        minWidth: 100,
        maxWidth: 180,
        minHeight: 60,
        zIndex: isConnectionSource ? 20 : 10
      }}
    >
      <div
        className={getCardStyle()}
        onClick={handleClick}
      >
        {/* 概念内容 */}
        <div className="flex flex-col items-center justify-center h-full p-3">
          <h3 className="font-bold text-sm text-slate-800 text-center leading-tight">
            {concept.name}
          </h3>
          {concept.description && (
            <p className="text-xs text-slate-600 text-center mt-1 line-clamp-2">
              {concept.description}
            </p>
          )}
        </div>

        {/* 状态指示器 */}
        {isIsolated && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}

        {isConnectionSource && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-xs text-white font-bold">S</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="absolute -top-2 -left-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg"
            title="编辑概念"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <button
            onClick={handleDelete}
            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
            title="删除概念"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* 连接模式指示器 */}
        {isConnectionMode && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full font-medium">
              {isConnectionSource ? '源概念' : '点击连接'}
            </div>
          </div>
        )}
      </div>

      {/* 游离态提示 */}
      {isIsolated && (
        <div className="absolute top-full left-0 mt-2">
          <div className="px-2 py-1 bg-yellow-500 text-white text-xs rounded font-medium">
            游离态概念
          </div>
        </div>
      )}
    </div>
  );
}; 