import { DDDConceptType, DDDRelationType } from './DDDRelationships';

// 项目编辑模式
export enum ProjectEditMode {
  UML = 'uml',                    // UML类图模式
  CONCEPT = 'concept'             // 概念设计模式
}

// 概念设计关系类型
export enum ConceptRelationType {
  DEPENDENCY = 'dependency',      // 依赖关系（红色）
  COLLABORATION = 'collaboration' // 协作关系（绿色）
}

// 项目基本信息
export interface Project {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  tags?: string[];
  editMode: ProjectEditMode;      // 新增：编辑模式
}

// 边界上下文
export interface BoundedContext {
  id: string;
  name: string;
  description: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// DDD概念
export interface DDDConcept {
  id: string;
  name: string;
  type: DDDConceptType;
  position: { x: number; y: number };
  boundedContextId: string;
  description?: string;
  properties?: string[];
  methods?: string[];
}

// DDD关系
export interface DDDRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: DDDRelationType | ConceptRelationType; // 支持两种关系类型
  label?: string;
  stereotype?: string;
  multiplicity?: {
    source?: string;
    target?: string;
  };
}

// 项目数据结构
export interface ProjectData {
  project: Project;
  boundedContexts: BoundedContext[];
  // 概念设计模式的数据
  conceptDesign: {
    concepts: DDDConcept[];
    relationships: DDDRelationship[];
  };
  // UML设计模式的数据
  umlDesign: {
    concepts: DDDConcept[];
    relationships: DDDRelationship[];
  };
  // 保持向后兼容的旧字段（将被废弃）
  concepts?: DDDConcept[];
  relationships?: DDDRelationship[];
}

// 项目文件格式
export interface ProjectFile {
  version: string;
  data: ProjectData;
  metadata: {
    exportedAt: string;
    exportedBy?: string;
    toolVersion: string;
  };
}

// 项目列表项
export interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  size: number; // 文件大小（字节）
  conceptCount: number;
  contextCount: number;
}

// 项目操作结果
export interface ProjectOperationResult {
  success: boolean;
  message: string;
  data?: any;
}

// 导出格式选项
export enum ExportFormat {
  JSON = 'json',
  XML = 'xml',
  YAML = 'yaml'
}

// 导出选项
export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  includePositions: boolean;
  minify: boolean;
} 