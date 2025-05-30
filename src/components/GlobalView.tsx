import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectBoundedContext } from '../store/architectureSlice';
import { BoundedContext } from '../types';

const GlobalView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { boundedContexts } = useAppSelector((state) => state.architecture);

  const handleContextClick = (contextId: string) => {
    dispatch(selectBoundedContext(contextId));
  };

  return (
    <div className="w-full h-full bg-gray-50 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">架构概念梳理工具</h1>
        <p className="text-gray-600">点击边界上下文查看详细概念关系</p>
      </div>
      
      <div className="relative w-full h-96 bg-white border border-gray-200 rounded-lg overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0">
          {boundedContexts.map((context: BoundedContext) => (
            <g key={context.id}>
              {/* 边界上下文矩形 */}
              <rect
                x={context.position.x}
                y={context.position.y}
                width={context.size.width}
                height={context.size.height}
                fill={context.color}
                fillOpacity={0.1}
                stroke={context.color}
                strokeWidth={2}
                className="cursor-pointer hover:fill-opacity-20 transition-all duration-200"
                onClick={() => handleContextClick(context.id)}
              />
              
              {/* 上下文标题 */}
              <text
                x={context.position.x + context.size.width / 2}
                y={context.position.y + 30}
                textAnchor="middle"
                className="fill-gray-800 text-sm font-semibold pointer-events-none"
              >
                {context.name}
              </text>
              
              {/* 上下文描述 */}
              <foreignObject
                x={context.position.x + 10}
                y={context.position.y + 50}
                width={context.size.width - 20}
                height={context.size.height - 60}
                className="pointer-events-none"
              >
                <div className="text-xs text-gray-600 p-2">
                  {context.description}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>💡 提示：点击任意边界上下文进入详细视图，查看内部概念和关系</p>
      </div>
    </div>
  );
};

export default GlobalView; 