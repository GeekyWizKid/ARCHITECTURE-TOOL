import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCurrentView, addConcept, addRelationship, selectConcept } from '../store/architectureSlice';
import { RelationType, Concept, Relationship } from '../types';

const ContextView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    boundedContexts, 
    concepts, 
    relationships, 
    selectedContextId, 
    selectedConceptId 
  } = useAppSelector((state) => state.architecture);

  const [newConceptName, setNewConceptName] = useState('');
  const [isAddingConcept, setIsAddingConcept] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<RelationType>(RelationType.DEPENDENCY);

  const selectedContext = boundedContexts.find(bc => bc.id === selectedContextId);
  const contextConcepts = concepts.filter(c => c.boundedContextId === selectedContextId);
  const contextRelationships = relationships.filter(r => 
    contextConcepts.some(c => c.id === r.sourceId) && 
    contextConcepts.some(c => c.id === r.targetId)
  );

  // 识别游离态概念
  const connectedConceptIds = new Set([
    ...contextRelationships.map(r => r.sourceId),
    ...contextRelationships.map(r => r.targetId)
  ]);
  const isolatedConcepts = contextConcepts.filter(c => !connectedConceptIds.has(c.id));

  const handleBackToGlobal = () => {
    dispatch(setCurrentView('global'));
  };

  const handleAddConcept = () => {
    if (newConceptName.trim() && selectedContextId) {
      setIsAddingConcept(true);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGElement>) => {
    if (isAddingConcept && newConceptName.trim() && selectedContextId) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      dispatch(addConcept({
        name: newConceptName,
        position: { x, y },
        boundedContextId: selectedContextId
      }));

      setNewConceptName('');
      setIsAddingConcept(false);
    }
  };

  const handleConceptClick = (conceptId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (isConnecting) {
      if (connectionSource === null) {
        setConnectionSource(conceptId);
      } else if (connectionSource !== conceptId) {
        dispatch(addRelationship({
          sourceId: connectionSource,
          targetId: conceptId,
          type: connectionType,
          label: connectionType === RelationType.DEPENDENCY ? '依赖' : '协作'
        }));
        setConnectionSource(null);
        setIsConnecting(false);
      }
    } else {
      dispatch(selectConcept(conceptId));
    }
  };

  const getArrowPath = (sourceId: string, targetId: string) => {
    const source = contextConcepts.find(c => c.id === sourceId);
    const target = contextConcepts.find(c => c.id === targetId);
    if (!source || !target) return '';

    const dx = target.position.x - source.position.x;
    const dy = target.position.y - source.position.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / length;
    const unitY = dy / length;

    const startX = source.position.x + unitX * 30;
    const startY = source.position.y + unitY * 30;
    const endX = target.position.x - unitX * 30;
    const endY = target.position.y - unitY * 30;

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const getLabelPosition = (sourceId: string, targetId: string) => {
    const source = contextConcepts.find(c => c.id === sourceId);
    const target = contextConcepts.find(c => c.id === targetId);
    if (!source || !target) return { x: 0, y: 0 };

    return {
      x: (source.position.x + target.position.x) / 2,
      y: (source.position.y + target.position.y) / 2
    };
  };

  const getConceptStyle = (concept: Concept) => {
    let className = "cursor-pointer transition-all duration-200 ";
    
    if (isolatedConcepts.includes(concept)) {
      className += "fill-yellow-200 stroke-yellow-500"; // 游离态概念
    } else if (concept.id === selectedConceptId) {
      className += "fill-blue-200 stroke-blue-500"; // 选中概念
    } else if (concept.id === connectionSource) {
      className += "fill-red-200 stroke-red-500"; // 连接源概念
    } else {
      className += "fill-gray-100 stroke-gray-400 hover:fill-gray-200"; // 默认状态
    }
    
    return className;
  };

  if (!selectedContext) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">未选择边界上下文</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white p-4">
      {/* 工具栏 */}
      <div className="mb-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={handleBackToGlobal}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              ← 返回全局视图
            </button>
            <h2 className="text-xl font-bold text-gray-800 ml-4 inline">
              {selectedContext.name}
            </h2>
          </div>
          
          <div className="text-sm text-gray-600">
            游离态概念: <span className="text-yellow-600 font-semibold">{isolatedConcepts.length}</span>
          </div>
        </div>

        {/* 操作面板 */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newConceptName}
              onChange={(e) => setNewConceptName(e.target.value)}
              placeholder="输入概念名称"
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleAddConcept}
              disabled={!newConceptName.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              添加概念
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value as RelationType)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={RelationType.DEPENDENCY}>依赖关系</option>
              <option value={RelationType.COLLABORATION}>协作关系</option>
            </select>
            <button
              onClick={() => setIsConnecting(!isConnecting)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                isConnecting 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isConnecting ? '取消连接' : '连接概念'}
            </button>
          </div>
        </div>

        {isAddingConcept && (
          <div className="mt-2 text-sm text-blue-600">
            💡 点击画布任意位置添加概念 "{newConceptName}"
          </div>
        )}

        {isConnecting && (
          <div className="mt-2 text-sm text-green-600">
            💡 {connectionSource ? '选择目标概念完成连接' : '选择源概念开始连接'}
          </div>
        )}
      </div>

      {/* 概念关系图 */}
      <div className="relative w-full h-96 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <svg 
          width="100%" 
          height="100%" 
          className="absolute inset-0"
          onClick={handleCanvasClick}
        >
          {/* 绘制关系箭头 */}
          <defs>
            <marker
              id="arrowhead-dependency"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#EF4444"
              />
            </marker>
            <marker
              id="arrowhead-collaboration"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#10B981"
              />
            </marker>
          </defs>

          {contextRelationships.map((relationship: Relationship) => {
            const labelPos = getLabelPosition(relationship.sourceId, relationship.targetId);
            return (
              <g key={relationship.id}>
                <path
                  d={getArrowPath(relationship.sourceId, relationship.targetId)}
                  stroke={relationship.type === RelationType.DEPENDENCY ? '#EF4444' : '#10B981'}
                  strokeWidth={2}
                  fill="none"
                  markerEnd={`url(#arrowhead-${relationship.type})`}
                />
                {relationship.label && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    className="fill-gray-600 text-xs pointer-events-none"
                  >
                    {relationship.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* 绘制概念节点 */}
          {contextConcepts.map((concept: Concept) => (
            <g key={concept.id}>
              <circle
                cx={concept.position.x}
                cy={concept.position.y}
                r={25}
                className={getConceptStyle(concept)}
                strokeWidth={2}
                onClick={(e) => handleConceptClick(concept.id, e)}
              />
              <text
                x={concept.position.x}
                y={concept.position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-800 text-xs font-medium pointer-events-none"
              >
                {concept.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 状态信息 */}
      <div className="mt-4 text-sm text-gray-500">
        <div className="flex gap-6">
          <span>概念总数: {contextConcepts.length}</span>
          <span>关系总数: {contextRelationships.length}</span>
          <span className="text-yellow-600">游离态概念: {isolatedConcepts.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ContextView; 