import React, { useEffect, useState } from 'react';
import { DDDRelationship, DDDConcept, ConceptRelationType } from '../types/Project';

interface ConceptDesignConnectionLineProps {
  relationship: DDDRelationship;
  sourceConcept: DDDConcept;
  targetConcept: DDDConcept;
  onDelete: () => void;
}

export const ConceptDesignConnectionLine: React.FC<ConceptDesignConnectionLineProps> = ({
  relationship,
  sourceConcept,
  targetConcept,
  onDelete
}) => {
  const [sourceSize, setSourceSize] = useState({ width: 120, height: 80 });
  const [targetSize, setTargetSize] = useState({ width: 120, height: 80 });

  // 动态获取概念元素的实际尺寸
  useEffect(() => {
    const updateConceptSizes = () => {
      const sourceElement = document.querySelector(`[data-concept-id="${sourceConcept.id}"]`) as HTMLElement;
      const targetElement = document.querySelector(`[data-concept-id="${targetConcept.id}"]`) as HTMLElement;

      if (sourceElement) {
        const rect = sourceElement.getBoundingClientRect();
        setSourceSize({ 
          width: Math.max(100, rect.width), 
          height: Math.max(60, rect.height) 
        });
      }

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetSize({ 
          width: Math.max(100, rect.width), 
          height: Math.max(60, rect.height) 
        });
      }
    };

    setTimeout(updateConceptSizes, 100);

    const observer = new MutationObserver(() => {
      setTimeout(updateConceptSizes, 50);
    });
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['style', 'class'] 
    });

    return () => observer.disconnect();
  }, [sourceConcept.id, targetConcept.id]);

  // 计算概念的中心点
  const sourceCenter = {
    x: sourceConcept.position.x + sourceSize.width / 2,
    y: sourceConcept.position.y + sourceSize.height / 2
  };
  
  const targetCenter = {
    x: targetConcept.position.x + targetSize.width / 2,
    y: targetConcept.position.y + targetSize.height / 2
  };

  // 计算从源到目标的方向向量
  const deltaX = targetCenter.x - sourceCenter.x;
  const deltaY = targetCenter.y - sourceCenter.y;

  // 计算边界交点的函数
  const getIntersectionPoint = (
    center: {x: number, y: number}, 
    direction: {x: number, y: number},
    size: {width: number, height: number}
  ) => {
    const absX = Math.abs(direction.x);
    const absY = Math.abs(direction.y);
    
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;
    
    if (absX * halfHeight > absY * halfWidth) {
      // 与左右边相交
      const side = direction.x > 0 ? halfWidth : -halfWidth;
      const ratio = side / direction.x;
      return {
        x: center.x + side,
        y: center.y + direction.y * ratio
      };
    } else {
      // 与上下边相交
      const side = direction.y > 0 ? halfHeight : -halfHeight;
      const ratio = side / direction.y;
      return {
        x: center.x + direction.x * ratio,
        y: center.y + side
      };
    }
  };

  // 计算源概念边界点（从源指向目标的方向）
  const sourcePoint = getIntersectionPoint(sourceCenter, {x: deltaX, y: deltaY}, sourceSize);
  
  // 计算目标概念边界点（从目标指向源的方向）
  const targetPoint = getIntersectionPoint(targetCenter, {x: -deltaX, y: -deltaY}, targetSize);

  // 根据关系类型确定样式
  const getRelationshipStyle = () => {
    switch (relationship.type) {
      case ConceptRelationType.DEPENDENCY:
        return {
          color: '#EF4444',        // 红色
          strokeWidth: 2,
          strokeDasharray: '5,5',  // 虚线
          label: '依赖'
        };
      case ConceptRelationType.COLLABORATION:
        return {
          color: '#10B981',        // 绿色
          strokeWidth: 2,
          strokeDasharray: undefined, // 实线
          label: '协作'
        };
      default:
        return {
          color: '#6B7280',        // 灰色（默认）
          strokeWidth: 1,
          strokeDasharray: undefined,
          label: '关联'
        };
    }
  };

  const style = getRelationshipStyle();

  // 计算中点位置（用于放置标签和删除按钮）
  const midpoint = {
    x: (sourcePoint.x + targetPoint.x) / 2,
    y: (sourcePoint.y + targetPoint.y) / 2
  };

  // 为每个关系生成唯一的marker id
  const markerId = `arrow-${relationship.id}`;

  return (
    <g className="group">
      {/* 箭头标记定义 */}
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill={style.color}
          />
        </marker>
      </defs>

      {/* 连接线 */}
      <line
        x1={sourcePoint.x}
        y1={sourcePoint.y}
        x2={targetPoint.x}
        y2={targetPoint.y}
        stroke={style.color}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
        markerEnd={`url(#${markerId})`}
        className="transition-all duration-300 hover:opacity-70 cursor-pointer"
        style={{ pointerEvents: 'auto' }}
      />

      {/* 关系标签 */}
      <text
        x={midpoint.x}
        y={midpoint.y - 10}
        textAnchor="middle"
        className="text-xs font-medium pointer-events-none"
        fill={style.color}
      >
        {relationship.label || style.label}
      </text>

      {/* 关系类型背景标签 */}
      <rect
        x={midpoint.x - 20}
        y={midpoint.y - 18}
        width="40"
        height="16"
        rx="8"
        fill={style.color}
        fillOpacity="0.1"
        stroke={style.color}
        strokeWidth="1"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* 删除按钮 */}
      <g className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ pointerEvents: 'auto' }}>
        <circle
          cx={midpoint.x}
          cy={midpoint.y + 15}
          r="8"
          fill="rgba(239, 68, 68, 0.9)"
          className="cursor-pointer"
          onClick={onDelete}
          style={{ pointerEvents: 'auto' }}
        />
        <text
          x={midpoint.x}
          y={midpoint.y + 19}
          textAnchor="middle"
          className="text-xs fill-white font-bold pointer-events-none"
        >
          ×
        </text>
      </g>
    </g>
  );
}; 