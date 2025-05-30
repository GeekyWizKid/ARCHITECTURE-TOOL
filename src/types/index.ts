// 关系类型
export enum RelationType {
  DEPENDENCY = 'dependency',      // 依赖关系
  COLLABORATION = 'collaboration' // 协作关系
}

// 概念节点
export interface Concept {
  id: string;
  name: string;
  description?: string;
  position: { x: number; y: number };
  boundedContextId: string;
}

// 关系边
export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  label?: string;
  description?: string;
}

// 边界上下文
export interface BoundedContext {
  id: string;
  name: string;
  description?: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// 应用状态
export interface AppState {
  boundedContexts: BoundedContext[];
  concepts: Concept[];
  relationships: Relationship[];
  currentView: 'global' | 'context';
  selectedContextId: string | null;
  selectedConceptId: string | null;
} 