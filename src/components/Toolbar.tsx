import React, { useState } from 'react';
import { DDDConceptType, DDDRelationType } from '../types/DDDRelationships';
import { ProjectEditMode, ConceptRelationType } from '../types/Project';

interface ToolbarProps {
  // 通用属性
  onAddConcept: () => void;
  onAddContext: () => void;
  
  // UML模式属性
  selectedConceptType?: DDDConceptType;
  onConceptTypeChange?: (type: DDDConceptType) => void;
  selectedRelationType?: DDDRelationType | ConceptRelationType;
  onRelationTypeChange?: (type: DDDRelationType | ConceptRelationType) => void;
  
  // 概念设计模式属性
  isConnectionMode?: boolean;
  onToggleConnectionMode?: () => void;
  connectionType?: ConceptRelationType;
  onConnectionTypeChange?: (type: ConceptRelationType) => void;
  
  // 编辑模式
  editMode: ProjectEditMode;
  onEditModeChange: (mode: ProjectEditMode) => void;
  
  // 视图状态
  onBackToProject?: () => void;
  isContextEditor?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddConcept,
  onAddContext,
  selectedConceptType,
  onConceptTypeChange,
  selectedRelationType,
  onRelationTypeChange,
  isConnectionMode = false,
  onToggleConnectionMode,
  connectionType = ConceptRelationType.DEPENDENCY,
  onConnectionTypeChange,
  editMode,
  onEditModeChange,
  onBackToProject,
  isContextEditor = false
}) => {
  const [showModeMenu, setShowModeMenu] = useState(false);

  return (
    <div className="bg-gray-100 border-b border-gray-300 p-4 flex flex-wrap items-center gap-4">
      {/* 返回按钮 */}
      {onBackToProject && (
        <button
          onClick={onBackToProject}
          className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          返回
        </button>
      )}

      {/* 编辑模式切换 */}
      <div className="relative">
        <button
          onClick={() => setShowModeMenu(!showModeMenu)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          {editMode === ProjectEditMode.UML ? 'UML模式' : '概念设计'}
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {showModeMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[160px] z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  onEditModeChange(ProjectEditMode.UML);
                  setShowModeMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  editMode === ProjectEditMode.UML ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <div>
                    <div className="font-medium">UML模式</div>
                    <div className="text-xs text-gray-500">类图、属性、方法</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  onEditModeChange(ProjectEditMode.CONCEPT);
                  setShowModeMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  editMode === ProjectEditMode.CONCEPT ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">概念设计</div>
                    <div className="text-xs text-gray-500">依赖、协作关系</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {isContextEditor && (
        <>
          {/* 添加概念按钮 */}
          <button
            onClick={onAddConcept}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            添加概念
          </button>

          {/* UML模式工具 */}
          {editMode === ProjectEditMode.UML && (
            <>
              {/* 概念类型选择 */}
              {onConceptTypeChange && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">概念类型:</label>
                  <select
                    value={selectedConceptType}
                    onChange={(e) => onConceptTypeChange(e.target.value as DDDConceptType)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={DDDConceptType.ENTITY}>实体 (Entity)</option>
                    <option value={DDDConceptType.VALUE_OBJECT}>值对象 (Value Object)</option>
                    <option value={DDDConceptType.AGGREGATE_ROOT}>聚合根 (Aggregate Root)</option>
                    <option value={DDDConceptType.DOMAIN_SERVICE}>领域服务 (Domain Service)</option>
                    <option value={DDDConceptType.REPOSITORY}>仓储 (Repository)</option>
                    <option value={DDDConceptType.FACTORY}>工厂 (Factory)</option>
                  </select>
                </div>
              )}

              {/* 关系类型选择 */}
              {onRelationTypeChange && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">关系类型:</label>
                  <select
                    value={selectedRelationType}
                    onChange={(e) => onRelationTypeChange(e.target.value as DDDRelationType)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={DDDRelationType.ASSOCIATION}>关联</option>
                    <option value={DDDRelationType.AGGREGATION}>聚合</option>
                    <option value={DDDRelationType.COMPOSITION}>组合</option>
                    <option value={DDDRelationType.DEPENDENCY}>依赖</option>
                    <option value={DDDRelationType.USAGE}>使用</option>
                    <option value={DDDRelationType.DOMAIN_SERVICE}>领域服务</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* 概念设计模式工具 */}
          {editMode === ProjectEditMode.CONCEPT && (
            <>
              {/* 连接模式切换 */}
              {onToggleConnectionMode && (
                <button
                  onClick={onToggleConnectionMode}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isConnectionMode
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  {isConnectionMode ? '取消连接' : '连接概念'}
                </button>
              )}

              {/* 关系类型选择（概念设计模式） */}
              {onConnectionTypeChange && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">关系类型:</label>
                  <select
                    value={connectionType}
                    onChange={(e) => onConnectionTypeChange(e.target.value as ConceptRelationType)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={ConceptRelationType.DEPENDENCY}>依赖 (红色虚线)</option>
                    <option value={ConceptRelationType.COLLABORATION}>协作 (绿色实线)</option>
                  </select>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 添加边界上下文按钮 */}
      {!isContextEditor && (
        <button
          onClick={onAddContext}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          添加边界上下文
        </button>
      )}
    </div>
  );
}; 