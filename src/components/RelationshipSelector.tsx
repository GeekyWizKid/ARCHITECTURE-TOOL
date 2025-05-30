import React, { useState } from 'react';
import { DDDRelationType, RELATIONSHIP_STYLES } from '../types/DDDRelationships';

interface RelationshipSelectorProps {
  selectedType: DDDRelationType;
  onTypeChange: (type: DDDRelationType) => void;
  isVisible: boolean;
  className?: string;
}

// 关系类型分组
const RELATIONSHIP_GROUPS = {
  '聚合内关系': [
    DDDRelationType.AGGREGATION,
    DDDRelationType.COMPOSITION,
    DDDRelationType.ASSOCIATION,
  ],
  '依赖关系': [
    DDDRelationType.DEPENDENCY,
    DDDRelationType.USAGE,
  ],
  '服务关系': [
    DDDRelationType.DOMAIN_SERVICE,
    DDDRelationType.APPLICATION_SERVICE,
  ],
  '事件关系': [
    DDDRelationType.DOMAIN_EVENT,
    DDDRelationType.EVENT_HANDLER,
  ],
  '基础设施': [
    DDDRelationType.REPOSITORY,
    DDDRelationType.FACTORY,
  ],
  '值对象': [
    DDDRelationType.VALUE_OBJECT,
  ],
  '跨上下文关系': [
    DDDRelationType.ANTI_CORRUPTION_LAYER,
    DDDRelationType.SHARED_KERNEL,
    DDDRelationType.CUSTOMER_SUPPLIER,
    DDDRelationType.CONFORMIST,
    DDDRelationType.OPEN_HOST_SERVICE,
    DDDRelationType.PUBLISHED_LANGUAGE,
  ]
};

export const RelationshipSelector: React.FC<RelationshipSelectorProps> = ({
  selectedType,
  onTypeChange,
  isVisible,
  className = ''
}) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('聚合内关系');

  if (!isVisible) return null;

  const renderRelationshipOption = (type: DDDRelationType) => {
    const style = RELATIONSHIP_STYLES[type];
    const isSelected = selectedType === type;

    return (
      <div
        key={type}
        onClick={() => onTypeChange(type)}
        className={`
          flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'bg-blue-100 border-2 border-blue-500 shadow-md' 
            : 'bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300'
          }
        `}
      >
        {/* 关系线预览 */}
        <div className="flex-shrink-0">
          <svg width="40" height="20" className="overflow-visible">
            <defs>
              {/* 箭头标记 */}
              {style.arrowType === 'open' && (
                <marker
                  id={`preview-${type}-arrow`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <path
                    d="M0,0 L0,6 L8,3 z"
                    fill="none"
                    stroke={style.lineColor}
                    strokeWidth="1"
                  />
                </marker>
              )}
              {style.arrowType === 'closed' && (
                <marker
                  id={`preview-${type}-arrow`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <path
                    d="M0,0 L0,6 L8,3 z"
                    fill={style.lineColor}
                    stroke={style.lineColor}
                    strokeWidth="1"
                  />
                </marker>
              )}
              {style.arrowType === 'diamond' && (
                <marker
                  id={`preview-${type}-diamond`}
                  markerWidth="10"
                  markerHeight="8"
                  refX="1"
                  refY="4"
                  orient="auto"
                >
                  <path
                    d="M0,4 L5,0 L10,4 L5,8 z"
                    fill="white"
                    stroke={style.lineColor}
                    strokeWidth="1"
                  />
                </marker>
              )}
              {style.arrowType === 'filled_diamond' && (
                <marker
                  id={`preview-${type}-diamond`}
                  markerWidth="10"
                  markerHeight="8"
                  refX="1"
                  refY="4"
                  orient="auto"
                >
                  <path
                    d="M0,4 L5,0 L10,4 L5,8 z"
                    fill={style.lineColor}
                    stroke={style.lineColor}
                    strokeWidth="1"
                  />
                </marker>
              )}
            </defs>
            
            <line
              x1="5"
              y1="10"
              x2="35"
              y2="10"
              stroke={style.lineColor}
              strokeWidth={style.lineWidth}
              strokeDasharray={style.lineType === 'dashed' ? '3,3' : undefined}
              markerEnd={
                style.arrowPosition === 'target' || style.arrowPosition === 'both'
                  ? `url(#preview-${type}-${style.arrowType === 'diamond' || style.arrowType === 'filled_diamond' ? 'diamond' : 'arrow'})`
                  : undefined
              }
              markerStart={
                style.arrowPosition === 'source' || style.arrowPosition === 'both'
                  ? `url(#preview-${type}-${style.arrowType === 'diamond' || style.arrowType === 'filled_diamond' ? 'diamond' : 'arrow'})`
                  : undefined
              }
            />
          </svg>
        </div>

        {/* 关系信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 text-sm">
              {style.label}
            </span>
            {style.stereotype && (
              <span 
                className="text-xs font-mono px-2 py-1 rounded"
                style={{ 
                  backgroundColor: style.lineColor + '20',
                  color: style.lineColor 
                }}
              >
                {style.stereotype}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getRelationshipDescription(type)}
          </div>
        </div>

        {/* 选中指示器 */}
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`glass-effect rounded-xl shadow-xl border border-white/20 p-4 max-h-96 overflow-y-auto ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">选择关系类型</h3>
        <p className="text-sm text-white/70">
          选择符合DDD和UML规范的关系类型来连接概念
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(RELATIONSHIP_GROUPS).map(([groupName, types]) => (
          <div key={groupName} className="border border-white/10 rounded-lg overflow-hidden">
            {/* 分组标题 */}
            <button
              onClick={() => setExpandedGroup(expandedGroup === groupName ? null : groupName)}
              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-white font-medium text-sm"
            >
              <span>{groupName}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedGroup === groupName ? 'rotate-180' : ''}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 分组内容 */}
            {expandedGroup === groupName && (
              <div className="p-2 space-y-2 bg-white/5">
                {types.map(renderRelationshipOption)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 快速选择常用关系 */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <h4 className="text-sm font-medium text-white/80 mb-2">快速选择</h4>
        <div className="flex flex-wrap gap-2">
          {[
            DDDRelationType.ASSOCIATION,
            DDDRelationType.DEPENDENCY,
            DDDRelationType.AGGREGATION,
            DDDRelationType.COMPOSITION
          ].map(type => {
            const style = RELATIONSHIP_STYLES[type];
            return (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${selectedType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }
                `}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 获取关系类型的详细描述
function getRelationshipDescription(type: DDDRelationType): string {
  const descriptions: Record<DDDRelationType, string> = {
    [DDDRelationType.AGGREGATION]: '整体与部分的关系，部分可以独立存在',
    [DDDRelationType.COMPOSITION]: '强组合关系，部分不能脱离整体存在',
    [DDDRelationType.ASSOCIATION]: '一般的关联关系，表示两个概念之间的连接',
    [DDDRelationType.DEPENDENCY]: '依赖关系，一个概念的变化会影响另一个',
    [DDDRelationType.USAGE]: '使用关系，表示一个概念使用另一个概念的服务',
    [DDDRelationType.DOMAIN_SERVICE]: '领域服务调用，处理跨聚合的业务逻辑',
    [DDDRelationType.APPLICATION_SERVICE]: '应用服务调用，协调领域对象完成用例',
    [DDDRelationType.DOMAIN_EVENT]: '领域事件发布，表示领域中发生的重要事件',
    [DDDRelationType.EVENT_HANDLER]: '事件处理，响应和处理领域事件',
    [DDDRelationType.REPOSITORY]: '仓储访问，提供聚合的持久化操作',
    [DDDRelationType.FACTORY]: '工厂创建，负责复杂对象的创建逻辑',
    [DDDRelationType.VALUE_OBJECT]: '值对象包含，表示概念包含某个值对象',
    [DDDRelationType.ANTI_CORRUPTION_LAYER]: '防腐层，保护本地模型不受外部影响',
    [DDDRelationType.SHARED_KERNEL]: '共享内核，多个上下文共享的核心模型',
    [DDDRelationType.CUSTOMER_SUPPLIER]: '客户-供应商关系，下游依赖上游',
    [DDDRelationType.CONFORMIST]: '遵奉者模式，完全遵循上游模型',
    [DDDRelationType.OPEN_HOST_SERVICE]: '开放主机服务，提供标准化的服务接口',
    [DDDRelationType.PUBLISHED_LANGUAGE]: '发布语言，定义通用的交流语言'
  };
  
  return descriptions[type] || '未知关系类型';
} 