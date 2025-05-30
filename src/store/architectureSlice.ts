import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, BoundedContext, Concept, Relationship, RelationType } from '../types';

const initialState: AppState = {
  boundedContexts: [
    {
      id: 'bc1',
      name: '用户管理',
      description: '处理用户注册、登录、权限管理',
      color: '#3B82F6',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 150 }
    },
    {
      id: 'bc2',
      name: '订单管理',
      description: '处理订单创建、支付、配送',
      color: '#10B981',
      position: { x: 350, y: 100 },
      size: { width: 200, height: 150 }
    }
  ],
  concepts: [
    // 用户管理上下文的概念
    { id: 'c1', name: '用户', position: { x: 50, y: 50 }, boundedContextId: 'bc1' },
    { id: 'c2', name: '权限', position: { x: 150, y: 50 }, boundedContextId: 'bc1' },
    { id: 'c3', name: '认证服务', position: { x: 100, y: 120 }, boundedContextId: 'bc1' },
    // 订单管理上下文的概念
    { id: 'c4', name: '订单', position: { x: 50, y: 50 }, boundedContextId: 'bc2' },
    { id: 'c5', name: '支付', position: { x: 150, y: 50 }, boundedContextId: 'bc2' },
    { id: 'c6', name: '库存服务', position: { x: 100, y: 120 }, boundedContextId: 'bc2' },
  ],
  relationships: [
    // 用户管理内部关系
    { id: 'r1', sourceId: 'c3', targetId: 'c1', type: RelationType.DEPENDENCY, label: '验证' },
    { id: 'r2', sourceId: 'c3', targetId: 'c2', type: RelationType.DEPENDENCY, label: '检查权限' },
  ],
  currentView: 'global',
  selectedContextId: null,
  selectedConceptId: null,
};

const architectureSlice = createSlice({
  name: 'architecture',
  initialState,
  reducers: {
    // 视图切换
    setCurrentView: (state, action: PayloadAction<'global' | 'context'>) => {
      state.currentView = action.payload;
    },
    
    // 选择边界上下文
    selectBoundedContext: (state, action: PayloadAction<string | null>) => {
      state.selectedContextId = action.payload;
      if (action.payload) {
        state.currentView = 'context';
      }
    },
    
    // 选择概念
    selectConcept: (state, action: PayloadAction<string | null>) => {
      state.selectedConceptId = action.payload;
    },
    
    // 添加概念
    addConcept: (state, action: PayloadAction<Omit<Concept, 'id'>>) => {
      const newConcept: Concept = {
        ...action.payload,
        id: `c${Date.now()}`,
      };
      state.concepts.push(newConcept);
    },
    
    // 添加关系
    addRelationship: (state, action: PayloadAction<Omit<Relationship, 'id'>>) => {
      const newRelationship: Relationship = {
        ...action.payload,
        id: `r${Date.now()}`,
      };
      state.relationships.push(newRelationship);
    },
    
    // 添加边界上下文
    addBoundedContext: (state, action: PayloadAction<Omit<BoundedContext, 'id'>>) => {
      const newContext: BoundedContext = {
        ...action.payload,
        id: `bc${Date.now()}`,
      };
      state.boundedContexts.push(newContext);
    },
  },
});

export const {
  setCurrentView,
  selectBoundedContext,
  selectConcept,
  addConcept,
  addRelationship,
  addBoundedContext,
} = architectureSlice.actions;

export default architectureSlice.reducer; 