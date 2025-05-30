import React from 'react';

interface Concept {
  id: string;
  name: string;
  position: { x: number; y: number };
  boundedContextId: string;
}

interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'dependency' | 'collaboration';
  label: string;
}

interface ConnectionLineProps {
  relationship: Relationship;
  sourceConcept: Concept;
  targetConcept: Concept;
  onDelete: (relationshipId: string) => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  relationship,
  sourceConcept,
  targetConcept,
  onDelete
}) => {
  // 计算连接线的起点和终点
  const sourceX = sourceConcept.position.x + 40; // 概念宽度的一半
  const sourceY = sourceConcept.position.y + 16; // 概念高度的一半
  const targetX = targetConcept.position.x + 40;
  const targetY = targetConcept.position.y + 16;

  // 计算中点用于放置标签
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // 计算箭头方向
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
  const arrowLength = 10;
  const arrowAngle = Math.PI / 6;

  // 箭头端点
  const arrowX1 = targetX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowY1 = targetY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowX2 = targetX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowY2 = targetY - arrowLength * Math.sin(angle + arrowAngle);

  const lineColor = relationship.type === 'dependency' ? '#3B82F6' : '#10B981';

  return (
    <g className="group">
      {/* 主连接线 */}
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke={lineColor}
        strokeWidth="2"
        className="connection-line"
      />
      
      {/* 箭头 */}
      <polygon
        points={`${targetX},${targetY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill={lineColor}
      />
      
      {/* 标签背景 */}
      <rect
        x={midX - 30}
        y={midY - 10}
        width="60"
        height="20"
        rx="10"
        fill="rgba(255, 255, 255, 0.9)"
        stroke={lineColor}
        strokeWidth="1"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
      
      {/* 标签文字 */}
      <text
        x={midX}
        y={midY + 4}
        textAnchor="middle"
        fontSize="10"
        fill={lineColor}
        className="opacity-0 group-hover:opacity-100 transition-opacity font-medium"
      >
        {relationship.label}
      </text>
      
      {/* 删除按钮 */}
      <circle
        cx={midX + 35}
        cy={midY - 15}
        r="8"
        fill="#EF4444"
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => onDelete(relationship.id)}
      />
      <text
        x={midX + 35}
        y={midY - 11}
        textAnchor="middle"
        fontSize="10"
        fill="white"
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none"
      >
        ×
      </text>
    </g>
  );
}; 