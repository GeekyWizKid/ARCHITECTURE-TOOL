import React, { useEffect, useState } from 'react';
import { DDDRelationship, DDDConcept } from '../types/Project';
import { DDDRelationType, RELATIONSHIP_STYLES } from '../types/DDDRelationships';

interface DDDConnectionLineProps {
  relationship: DDDRelationship;
  sourceConcept: DDDConcept;
  targetConcept: DDDConcept;
  onDelete: () => void;
}

export const DDDConnectionLine: React.FC<DDDConnectionLineProps> = ({
  relationship,
  sourceConcept,
  targetConcept,
  onDelete
}) => {
  const [sourceSize, setSourceSize] = useState({ width: 160, height: 120 });
  const [targetSize, setTargetSize] = useState({ width: 160, height: 120 });

  // 动态获取概念元素的实际尺寸
  useEffect(() => {
    const updateConceptSizes = () => {
      // 通过概念ID查找DOM元素
      const sourceElement = document.querySelector(`[data-concept-id="${sourceConcept.id}"]`) as HTMLElement;
      const targetElement = document.querySelector(`[data-concept-id="${targetConcept.id}"]`) as HTMLElement;

      if (sourceElement) {
        const rect = sourceElement.getBoundingClientRect();
        const canvas = sourceElement.closest('.origin-top-left');
        const canvasRect = canvas?.getBoundingClientRect();
        
        if (canvasRect) {
          // 计算相对于画布的尺寸
          setSourceSize({ 
            width: Math.max(140, rect.width), 
            height: Math.max(80, rect.height) 
          });
        } else {
          // 回退到元素自身的尺寸
          setSourceSize({ 
            width: Math.max(140, rect.width), 
            height: Math.max(80, rect.height) 
          });
        }
      }

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const canvas = targetElement.closest('.origin-top-left');
        const canvasRect = canvas?.getBoundingClientRect();
        
        if (canvasRect) {
          setTargetSize({ 
            width: Math.max(140, rect.width), 
            height: Math.max(80, rect.height) 
          });
        } else {
          setTargetSize({ 
            width: Math.max(140, rect.width), 
            height: Math.max(80, rect.height) 
          });
        }
      }
    };

    // 初始更新
    setTimeout(updateConceptSizes, 100); // 延迟确保DOM已渲染

    // 监听窗口大小变化，重新计算
    window.addEventListener('resize', updateConceptSizes);
    
    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(() => {
      setTimeout(updateConceptSizes, 50);
    });
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['style', 'class'] 
    });

    return () => {
      window.removeEventListener('resize', updateConceptSizes);
      observer.disconnect();
    };
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
    
    // 判断连线与矩形哪个边相交
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

  // 获取关系样式，只处理DDDRelationType
  const getRelationshipStyle = () => {
    // 类型检查：确保这是DDDRelationType
    if (Object.values(DDDRelationType).includes(relationship.type as DDDRelationType)) {
      return RELATIONSHIP_STYLES[relationship.type as DDDRelationType];
    }
    
    // 如果不是DDDRelationType，提供默认样式
    return {
      lineType: 'solid' as const,
      lineColor: '#6B7280',
      lineWidth: 1,
      arrowType: 'open' as const,
      arrowPosition: 'target' as const,
      label: '关联'
    };
  };

  const style = getRelationshipStyle();

  // 计算中点位置（用于放置标签和删除按钮）
  const midpoint = {
    x: (sourcePoint.x + targetPoint.x) / 2,
    y: (sourcePoint.y + targetPoint.y) / 2
  };

  // 为每个关系生成唯一的marker id
  const markerId = `arrowhead-${relationship.id}`;

  return (
    <g className="group">
      {/* 箭头标记定义 */}
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={style.lineColor}
          />
        </marker>
      </defs>

      {/* 连接线 */}
      <line
        x1={sourcePoint.x}
        y1={sourcePoint.y}
        x2={targetPoint.x}
        y2={targetPoint.y}
        stroke={style.lineColor}
        strokeWidth={style.lineWidth}
        strokeDasharray={style.lineType === 'dashed' ? '5,5' : style.lineType === 'dotted' ? '2,2' : undefined}
        markerEnd={`url(#${markerId})`}
        className="transition-all duration-300 hover:stroke-white cursor-pointer"
        style={{ pointerEvents: 'auto' }}
      />

      {/* 关系标签 */}
      {relationship.label && (
        <text
          x={midpoint.x}
          y={midpoint.y - 10}
          textAnchor="middle"
          className="text-xs fill-white font-medium pointer-events-none"
        >
          {relationship.label}
        </text>
      )}

      {/* 多重性标签 */}
      {relationship.multiplicity && (
        <>
          {relationship.multiplicity.source && (
            <text
              x={sourcePoint.x + (targetPoint.x - sourcePoint.x) * 0.2}
              y={sourcePoint.y + (targetPoint.y - sourcePoint.y) * 0.2 - 5}
              textAnchor="middle"
              className="text-xs fill-gray-300 pointer-events-none"
            >
              {relationship.multiplicity.source}
            </text>
          )}
          {relationship.multiplicity.target && (
            <text
              x={targetPoint.x - (targetPoint.x - sourcePoint.x) * 0.2}
              y={targetPoint.y - (targetPoint.y - sourcePoint.y) * 0.2 - 5}
              textAnchor="middle"
              className="text-xs fill-gray-300 pointer-events-none"
            >
              {relationship.multiplicity.target}
            </text>
          )}
        </>
      )}

      {/* 删除按钮 */}
      <g className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ pointerEvents: 'auto' }}>
        <circle
          cx={midpoint.x}
          cy={midpoint.y + 10}
          r="8"
          fill="rgba(239, 68, 68, 0.9)"
          className="cursor-pointer"
          onClick={onDelete}
          style={{ pointerEvents: 'auto' }}
        />
        <text
          x={midpoint.x}
          y={midpoint.y + 14}
          textAnchor="middle"
          className="text-xs fill-white font-bold pointer-events-none"
        >
          ×
        </text>
      </g>
    </g>
  );
}; 