import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { CONCEPT_STYLES } from '../types/DDDRelationships';
import { DDDConcept } from '../types/Project';

interface DDDConceptProps {
  concept: DDDConcept;
  isSelected: boolean;
  isConnectionMode: boolean;
  isConnectionSource: boolean;
  onClick: () => void;
  onEdit: (concept: DDDConcept) => void;
  onDelete: (conceptId: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

export const DDDConceptComponent: React.FC<DDDConceptProps> = ({
  concept,
  isSelected,
  isConnectionMode,
  isConnectionSource,
  onClick,
  onEdit,
  onDelete,
  onPositionChange
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const style = CONCEPT_STYLES[concept.type];

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

  // 根据概念类型渲染不同的形状
  const renderShape = () => {
    const baseClasses = `
      relative w-full h-full transition-all duration-300 cursor-pointer group
      ${isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover-lift'}
      ${isSelected ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-transparent' : ''}
      ${isConnectionMode ? 'hover:ring-2 hover:ring-yellow-400' : ''}
      ${isConnectionSource ? 'ring-2 ring-green-400 animate-pulse' : ''}
    `;

    // UML标准类图显示
    return (
      <div 
        className={`${baseClasses} rounded-xl border-2 border-slate-300 bg-white shadow-lg hover:shadow-xl transition-all duration-200`}
        onClick={handleClick}
      >
        {/* 类名区域 */}
        <div className="border-b border-slate-200 p-3 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">{style.icon}</span>
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">
                {`<<${concept.type}>>`}
              </div>
              <div className="font-bold text-sm text-slate-800">
                {concept.name}
              </div>
            </div>
          </div>
        </div>

        {/* 属性区域 */}
        <div className="border-b border-slate-200 p-3 bg-white">
          {concept.properties && concept.properties.length > 0 ? (
            <div className="text-xs text-slate-700 space-y-1">
              {concept.properties.map((prop, index) => (
                <div key={index} className="truncate font-mono">
                  {prop}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 italic text-xs py-2">No properties</div>
          )}
        </div>

        {/* 方法区域 */}
        <div className="p-3 bg-white rounded-b-xl">
          {concept.methods && concept.methods.length > 0 ? (
            <div className="text-xs text-slate-700 space-y-1">
              {concept.methods.map((method, index) => (
                <div key={index} className="truncate font-mono">
                  {method}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 italic text-xs py-2">No methods</div>
          )}
        </div>

        {/* 类型指示器 - 左侧色条 */}
        <div 
          className="absolute left-0 top-0 w-1 h-full rounded-l-lg"
          style={{ backgroundColor: style.fillColor }}
        ></div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className="absolute"
      data-concept-id={concept.id}
      style={{
        left: concept.position.x,
        top: concept.position.y,
        minWidth: 140, // 最小宽度
        maxWidth: 240, // 最大宽度  
        zIndex: isConnectionSource ? 20 : 10
      }}
    >
      {renderShape()}

      {/* 操作按钮 */}
      <div className="absolute -top-2 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-medium">
            {isConnectionSource ? '源' : '点击连接'}
          </div>
        </div>
      )}

      {/* 详细信息提示 */}
      <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
        <div className="bg-black/90 text-white p-3 rounded-lg shadow-xl max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{style.icon}</span>
            <div>
              <h4 className="font-bold text-sm">{concept.name}</h4>
              <p className="text-xs text-gray-300">{concept.type}</p>
            </div>
          </div>
          
          {concept.description && (
            <p className="text-xs text-gray-300 mb-2">{concept.description}</p>
          )}
          
          {concept.properties && concept.properties.length > 0 && (
            <div className="mb-2">
              <h5 className="text-xs font-semibold text-blue-300 mb-1">属性:</h5>
              <ul className="text-xs text-gray-300 space-y-1">
                {concept.properties.slice(0, 3).map((prop, index) => (
                  <li key={index} className="truncate">• {prop}</li>
                ))}
                {concept.properties.length > 3 && (
                  <li className="text-gray-400">... 还有 {concept.properties.length - 3} 个</li>
                )}
              </ul>
            </div>
          )}
          
          {concept.methods && concept.methods.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-green-300 mb-1">方法:</h5>
              <ul className="text-xs text-gray-300 space-y-1">
                {concept.methods.slice(0, 3).map((method, index) => (
                  <li key={index} className="truncate">• {method}</li>
                ))}
                {concept.methods.length > 3 && (
                  <li className="text-gray-400">... 还有 {concept.methods.length - 3} 个</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 