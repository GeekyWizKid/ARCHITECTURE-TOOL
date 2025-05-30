// DDD 领域驱动设计中的关系类型
export enum DDDRelationType {
  // === 聚合内关系 ===
  AGGREGATION = 'aggregation',           // 聚合关系 (空心菱形)
  COMPOSITION = 'composition',           // 组合关系 (实心菱形)
  ASSOCIATION = 'association',           // 关联关系 (实线箭头)
  
  // === 依赖关系 ===
  DEPENDENCY = 'dependency',             // 依赖关系 (虚线箭头)
  USAGE = 'usage',                       // 使用关系 (虚线箭头，标注<<use>>)
  
  // === 领域服务关系 ===
  DOMAIN_SERVICE = 'domain_service',     // 领域服务调用 (虚线箭头，标注<<service>>)
  APPLICATION_SERVICE = 'application_service', // 应用服务调用 (虚线箭头，标注<<app>>)
  
  // === 事件关系 ===
  DOMAIN_EVENT = 'domain_event',         // 领域事件发布 (虚线箭头，标注<<event>>)
  EVENT_HANDLER = 'event_handler',       // 事件处理 (虚线箭头，标注<<handler>>)
  
  // === 仓储关系 ===
  REPOSITORY = 'repository',             // 仓储访问 (虚线箭头，标注<<repo>>)
  
  // === 工厂关系 ===
  FACTORY = 'factory',                   // 工厂创建 (虚线箭头，标注<<create>>)
  
  // === 值对象关系 ===
  VALUE_OBJECT = 'value_object',         // 值对象包含 (实线，无箭头)
  
  // === 跨边界上下文关系 ===
  ANTI_CORRUPTION_LAYER = 'acl',         // 防腐层 (双向虚线，标注<<ACL>>)
  SHARED_KERNEL = 'shared_kernel',       // 共享内核 (双向实线，标注<<Shared>>)
  CUSTOMER_SUPPLIER = 'customer_supplier', // 客户-供应商 (单向实线，标注<<C/S>>)
  CONFORMIST = 'conformist',             // 遵奉者 (单向虚线，标注<<Conform>>)
  OPEN_HOST_SERVICE = 'open_host',       // 开放主机服务 (单向实线，标注<<OHS>>)
  PUBLISHED_LANGUAGE = 'published_lang'  // 发布语言 (双向实线，标注<<PL>>)
}

// DDD 概念类型
export enum DDDConceptType {
  // === 聚合根 ===
  AGGREGATE_ROOT = 'aggregate_root',     // 聚合根
  
  // === 实体 ===
  ENTITY = 'entity',                     // 实体
  
  // === 值对象 ===
  VALUE_OBJECT = 'value_object',         // 值对象
  
  // === 领域服务 ===
  DOMAIN_SERVICE = 'domain_service',     // 领域服务
  
  // === 应用服务 ===
  APPLICATION_SERVICE = 'application_service', // 应用服务
  
  // === 仓储 ===
  REPOSITORY = 'repository',             // 仓储
  
  // === 工厂 ===
  FACTORY = 'factory',                   // 工厂
  
  // === 领域事件 ===
  DOMAIN_EVENT = 'domain_event',         // 领域事件
  
  // === 策略 ===
  POLICY = 'policy',                     // 策略/规则
  
  // === 规约 ===
  SPECIFICATION = 'specification'        // 规约
}

// 关系的视觉样式配置
export interface RelationshipStyle {
  lineType: 'solid' | 'dashed' | 'dotted';
  lineColor: string;
  lineWidth: number;
  arrowType: 'none' | 'open' | 'closed' | 'diamond' | 'filled_diamond';
  arrowPosition: 'target' | 'source' | 'both' | 'none';
  label?: string;
  stereotype?: string; // UML 构造型，如 <<use>>, <<create>> 等
}

// 关系样式映射
export const RELATIONSHIP_STYLES: Record<DDDRelationType, RelationshipStyle> = {
  // 聚合内关系
  [DDDRelationType.AGGREGATION]: {
    lineType: 'solid',
    lineColor: '#2563EB', // 蓝色
    lineWidth: 2,
    arrowType: 'diamond',
    arrowPosition: 'source',
    label: '聚合'
  },
  [DDDRelationType.COMPOSITION]: {
    lineType: 'solid',
    lineColor: '#DC2626', // 红色
    lineWidth: 2,
    arrowType: 'filled_diamond',
    arrowPosition: 'source',
    label: '组合'
  },
  [DDDRelationType.ASSOCIATION]: {
    lineType: 'solid',
    lineColor: '#059669', // 绿色
    lineWidth: 2,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '关联'
  },
  
  // 依赖关系
  [DDDRelationType.DEPENDENCY]: {
    lineType: 'dashed',
    lineColor: '#7C3AED', // 紫色
    lineWidth: 1,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '依赖'
  },
  [DDDRelationType.USAGE]: {
    lineType: 'dashed',
    lineColor: '#7C3AED',
    lineWidth: 1,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '使用',
    stereotype: '<<use>>'
  },
  
  // 领域服务关系
  [DDDRelationType.DOMAIN_SERVICE]: {
    lineType: 'dashed',
    lineColor: '#EA580C', // 橙色
    lineWidth: 1,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '领域服务',
    stereotype: '<<service>>'
  },
  [DDDRelationType.APPLICATION_SERVICE]: {
    lineType: 'dashed',
    lineColor: '#EA580C',
    lineWidth: 1,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '应用服务',
    stereotype: '<<app>>'
  },
  
  // 事件关系
  [DDDRelationType.DOMAIN_EVENT]: {
    lineType: 'dashed',
    lineColor: '#DB2777', // 粉色
    lineWidth: 1,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '发布事件',
    stereotype: '<<event>>'
  },
  [DDDRelationType.EVENT_HANDLER]: {
    lineType: 'dashed',
    lineColor: '#DB2777',
    lineWidth: 1,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '处理事件',
    stereotype: '<<handler>>'
  },
  
  // 仓储关系
  [DDDRelationType.REPOSITORY]: {
    lineType: 'dashed',
    lineColor: '#0891B2', // 青色
    lineWidth: 1,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '仓储访问',
    stereotype: '<<repo>>'
  },
  
  // 工厂关系
  [DDDRelationType.FACTORY]: {
    lineType: 'dashed',
    lineColor: '#65A30D', // 绿色
    lineWidth: 1,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '工厂创建',
    stereotype: '<<create>>'
  },
  
  // 值对象关系
  [DDDRelationType.VALUE_OBJECT]: {
    lineType: 'solid',
    lineColor: '#6B7280', // 灰色
    lineWidth: 1,
    arrowType: 'none',
    arrowPosition: 'none',
    label: '包含值对象'
  },
  
  // 跨边界上下文关系
  [DDDRelationType.ANTI_CORRUPTION_LAYER]: {
    lineType: 'dashed',
    lineColor: '#DC2626',
    lineWidth: 2,
    arrowType: 'open',
    arrowPosition: 'both',
    label: '防腐层',
    stereotype: '<<ACL>>'
  },
  [DDDRelationType.SHARED_KERNEL]: {
    lineType: 'solid',
    lineColor: '#059669',
    lineWidth: 2,
    arrowType: 'none',
    arrowPosition: 'both',
    label: '共享内核',
    stereotype: '<<Shared>>'
  },
  [DDDRelationType.CUSTOMER_SUPPLIER]: {
    lineType: 'solid',
    lineColor: '#2563EB',
    lineWidth: 2,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '客户-供应商',
    stereotype: '<<C/S>>'
  },
  [DDDRelationType.CONFORMIST]: {
    lineType: 'dashed',
    lineColor: '#7C3AED',
    lineWidth: 2,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '遵奉者',
    stereotype: '<<Conform>>'
  },
  [DDDRelationType.OPEN_HOST_SERVICE]: {
    lineType: 'solid',
    lineColor: '#EA580C',
    lineWidth: 2,
    arrowType: 'open',
    arrowPosition: 'target',
    label: '开放主机服务',
    stereotype: '<<OHS>>'
  },
  [DDDRelationType.PUBLISHED_LANGUAGE]: {
    lineType: 'solid',
    lineColor: '#DB2777',
    lineWidth: 2,
    arrowType: 'none',
    arrowPosition: 'both',
    label: '发布语言',
    stereotype: '<<PL>>'
  }
};

// 概念类型的视觉样式
export interface ConceptStyle {
  shape: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  icon?: string; // 可选的图标
}

// 概念样式映射
export const CONCEPT_STYLES: Record<DDDConceptType, ConceptStyle> = {
  [DDDConceptType.AGGREGATE_ROOT]: {
    shape: 'rectangle',
    fillColor: '#FEF3C7', // 黄色背景
    borderColor: '#F59E0B',
    borderWidth: 3,
    textColor: '#92400E',
    icon: '👑' // 王冠图标表示聚合根
  },
  [DDDConceptType.ENTITY]: {
    shape: 'rectangle',
    fillColor: '#DBEAFE',
    borderColor: '#3B82F6',
    borderWidth: 2,
    textColor: '#1E40AF'
  },
  [DDDConceptType.VALUE_OBJECT]: {
    shape: 'circle',
    fillColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    borderWidth: 2,
    textColor: '#5B21B6'
  },
  [DDDConceptType.DOMAIN_SERVICE]: {
    shape: 'hexagon',
    fillColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 2,
    textColor: '#991B1B'
  },
  [DDDConceptType.APPLICATION_SERVICE]: {
    shape: 'hexagon',
    fillColor: '#FFEDD5',
    borderColor: '#F97316',
    borderWidth: 2,
    textColor: '#9A3412'
  },
  [DDDConceptType.REPOSITORY]: {
    shape: 'rectangle',
    fillColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 2,
    textColor: '#047857'
  },
  [DDDConceptType.FACTORY]: {
    shape: 'diamond',
    fillColor: '#F0FDF4',
    borderColor: '#22C55E',
    borderWidth: 2,
    textColor: '#15803D'
  },
  [DDDConceptType.DOMAIN_EVENT]: {
    shape: 'circle',
    fillColor: '#FCE7F3',
    borderColor: '#EC4899',
    borderWidth: 2,
    textColor: '#BE185D'
  },
  [DDDConceptType.POLICY]: {
    shape: 'diamond',
    fillColor: '#F0F9FF',
    borderColor: '#0EA5E9',
    borderWidth: 2,
    textColor: '#0369A1'
  },
  [DDDConceptType.SPECIFICATION]: {
    shape: 'hexagon',
    fillColor: '#F8FAFC',
    borderColor: '#64748B',
    borderWidth: 2,
    textColor: '#334155'
  }
}; 