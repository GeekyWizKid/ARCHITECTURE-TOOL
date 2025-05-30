import { 
  Project, 
  ProjectData, 
  ProjectFile, 
  ProjectListItem, 
  ProjectOperationResult,
  ExportOptions,
  ProjectEditMode
} from '../types/Project';

const STORAGE_KEY = 'ddd-architecture-projects';
const CURRENT_PROJECT_KEY = 'ddd-current-project';

export class ProjectService {
  // 获取所有项目列表
  static getProjectList(): ProjectListItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const projects = JSON.parse(stored);
      return Object.values(projects).map((projectData: any) => ({
        id: projectData.project.id,
        name: projectData.project.name,
        description: projectData.project.description,
        updatedAt: projectData.project.updatedAt,
        size: JSON.stringify(projectData).length,
        conceptCount: (projectData.umlDesign?.concepts?.length || 0) + (projectData.conceptDesign?.concepts?.length || 0) + (projectData.concepts?.length || 0),
        contextCount: projectData.boundedContexts?.length || 0
      }));
    } catch (error) {
      console.error('获取项目列表失败:', error);
      return [];
    }
  }

  // 创建新项目
  static createProject(name: string, description?: string, author?: string): ProjectOperationResult {
    try {
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const project: Project = {
        id: projectId,
        name: name.trim(),
        description: description?.trim(),
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
        author: author?.trim(),
        tags: [],
        editMode: ProjectEditMode.UML // 默认为UML模式
      };

      const projectData: ProjectData = {
        project,
        boundedContexts: [],
        conceptDesign: {
          concepts: [],
          relationships: []
        },
        umlDesign: {
          concepts: [],
          relationships: []
        }
      };

      this.saveProject(projectData);
      this.setCurrentProject(projectId);

      return {
        success: true,
        message: '项目创建成功',
        data: projectData
      };
    } catch (error) {
      return {
        success: false,
        message: `创建项目失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 保存项目
  static saveProject(projectData: ProjectData): ProjectOperationResult {
    try {
      // 更新项目的修改时间
      projectData.project.updatedAt = new Date().toISOString();
      
      const stored = localStorage.getItem(STORAGE_KEY);
      const projects = stored ? JSON.parse(stored) : {};
      
      projects[projectData.project.id] = projectData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

      return {
        success: true,
        message: '项目保存成功'
      };
    } catch (error) {
      return {
        success: false,
        message: `保存项目失败: ${error instanceof Error ? error.message : '存储空间不足'}`
      };
    }
  }

  // 加载项目
  static loadProject(projectId: string): ProjectOperationResult {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          success: false,
          message: '没有找到项目数据'
        };
      }

      const projects = JSON.parse(stored);
      const originalData = projects[projectId];
      
      if (!originalData) {
        return {
          success: false,
          message: '项目不存在'
        };
      }

      // 数据迁移：处理旧格式的项目数据
      let projectData: ProjectData;
      
      if (originalData.conceptDesign && originalData.umlDesign) {
        // 新格式，直接使用
        projectData = originalData;
      } else {
        // 旧格式，需要迁移
        projectData = {
          project: originalData.project,
          boundedContexts: originalData.boundedContexts || [],
          conceptDesign: {
            concepts: [],
            relationships: []
          },
          umlDesign: {
            concepts: originalData.concepts || [],
            relationships: originalData.relationships || []
          }
        };
        
        // 自动保存迁移后的数据
        this.saveProject(projectData);
      }

      this.setCurrentProject(projectId);

      return {
        success: true,
        message: '项目加载成功',
        data: projectData
      };
    } catch (error) {
      return {
        success: false,
        message: `加载项目失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 删除项目
  static deleteProject(projectId: string): ProjectOperationResult {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          success: false,
          message: '没有找到项目数据'
        };
      }

      const projects = JSON.parse(stored);
      if (!projects[projectId]) {
        return {
          success: false,
          message: '项目不存在'
        };
      }

      delete projects[projectId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

      // 如果删除的是当前项目，清除当前项目标记
      const currentProjectId = this.getCurrentProjectId();
      if (currentProjectId === projectId) {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
      }

      return {
        success: true,
        message: '项目删除成功'
      };
    } catch (error) {
      return {
        success: false,
        message: `删除项目失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 复制项目
  static duplicateProject(projectId: string, newName: string): ProjectOperationResult {
    try {
      const loadResult = this.loadProject(projectId);
      if (!loadResult.success) {
        return loadResult;
      }

      const originalData = loadResult.data as ProjectData;
      const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // 复制边界上下文，生成新ID
      const newBoundedContexts = originalData.boundedContexts.map(bc => ({
        ...bc,
        id: `bc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      // 复制概念设计数据
      const newConceptDesign = {
        concepts: originalData.conceptDesign.concepts.map(concept => ({
          ...concept,
          id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })),
        relationships: originalData.conceptDesign.relationships.map(rel => ({
          ...rel,
          id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };

      // 复制UML设计数据
      const newUmlDesign = {
        concepts: originalData.umlDesign.concepts.map(concept => ({
          ...concept,
          id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })),
        relationships: originalData.umlDesign.relationships.map(rel => ({
          ...rel,
          id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };

      // 创建新的项目数据
      const newProjectData: ProjectData = {
        project: {
          ...originalData.project,
          id: newProjectId,
          name: newName,
          createdAt: now,
          updatedAt: now,
          version: '1.0.0'
        },
        boundedContexts: newBoundedContexts,
        conceptDesign: newConceptDesign,
        umlDesign: newUmlDesign
      };

      return this.saveProject(newProjectData);
    } catch (error) {
      return {
        success: false,
        message: `复制项目失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 导出项目（暂时禁用）
  static exportProject(projectId: string, options: ExportOptions): ProjectOperationResult {
    // TODO: 重新实现导出功能以支持新的数据结构
    return {
      success: false,
      message: '导出功能正在重构中'
    };
  }

  // 导入项目
  static importProject(file: File): Promise<ProjectOperationResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let projectFile: ProjectFile;

          // 根据文件扩展名解析内容
          const extension = file.name.split('.').pop()?.toLowerCase();
          
          switch (extension) {
            case 'json':
              projectFile = JSON.parse(content);
              break;
            case 'xml':
              projectFile = this.parseXML(content);
              break;
            case 'yaml':
            case 'yml':
              projectFile = this.parseYAML(content);
              break;
            default:
              resolve({
                success: false,
                message: '不支持的文件格式'
              });
              return;
          }

          // 验证文件格式
          if (!this.validateProjectFile(projectFile)) {
            resolve({
              success: false,
              message: '无效的项目文件格式'
            });
            return;
          }

          // 生成新的项目ID
          const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          
          const projectData: ProjectData = {
            ...projectFile.data,
            project: {
              ...projectFile.data.project,
              id: newProjectId,
              createdAt: now,
              updatedAt: now
            }
          };

          const saveResult = this.saveProject(projectData);
          if (saveResult.success) {
            this.setCurrentProject(newProjectId);
            resolve({
              success: true,
              message: '项目导入成功',
              data: projectData
            });
          } else {
            resolve(saveResult);
          }
        } catch (error) {
          resolve({
            success: false,
            message: `导入项目失败: ${error instanceof Error ? error.message : '文件格式错误'}`
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          message: '文件读取失败'
        });
      };

      reader.readAsText(file);
    });
  }

  // 设置当前项目
  static setCurrentProject(projectId: string): void {
    localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
  }

  // 获取当前项目ID
  static getCurrentProjectId(): string | null {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  }

  // 获取当前项目数据
  static getCurrentProject(): ProjectOperationResult {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      return {
        success: false,
        message: '没有当前项目'
      };
    }
    return this.loadProject(projectId);
  }

  // 清除所有项目数据
  static clearAllProjects(): ProjectOperationResult {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_PROJECT_KEY);
      return {
        success: true,
        message: '所有项目数据已清除'
      };
    } catch (error) {
      return {
        success: false,
        message: '清除数据失败'
      };
    }
  }

  // 验证项目文件格式
  private static validateProjectFile(file: any): file is ProjectFile {
    return (
      file &&
      typeof file.version === 'string' &&
      file.data &&
      file.data.project &&
      typeof file.data.project.id === 'string' &&
      typeof file.data.project.name === 'string' &&
      Array.isArray(file.data.boundedContexts) &&
      Array.isArray(file.data.concepts) &&
      Array.isArray(file.data.relationships)
    );
  }

  // 转换为XML格式（简化实现）
  private static convertToXML(data: ProjectFile): string {
    // 这里是一个简化的XML转换实现
    // 在实际项目中，建议使用专门的XML库
    return `<?xml version="1.0" encoding="UTF-8"?>
<project>
  <version>${data.version}</version>
  <data>${JSON.stringify(data.data)}</data>
  <metadata>${JSON.stringify(data.metadata)}</metadata>
</project>`;
  }

  // 转换为YAML格式（简化实现）
  private static convertToYAML(data: ProjectFile): string {
    // 这里是一个简化的YAML转换实现
    // 在实际项目中，建议使用专门的YAML库
    return `version: "${data.version}"
data: ${JSON.stringify(data.data, null, 2)}
metadata: ${JSON.stringify(data.metadata, null, 2)}`;
  }

  // 解析XML格式（简化实现）
  private static parseXML(content: string): ProjectFile {
    // 简化的XML解析实现
    throw new Error('XML导入功能暂未实现，请使用JSON格式');
  }

  // 解析YAML格式（简化实现）
  private static parseYAML(content: string): ProjectFile {
    // 简化的YAML解析实现
    throw new Error('YAML导入功能暂未实现，请使用JSON格式');
  }

  // 获取单个项目
  static getProject(projectId: string): Project | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const projects = JSON.parse(stored);
      const projectData = projects[projectId];
      
      return projectData ? projectData.project : null;
    } catch (error) {
      console.error('获取项目失败:', error);
      return null;
    }
  }

  // 获取所有项目
  static getAllProjects(): Project[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const projects = JSON.parse(stored);
      return Object.values(projects).map((projectData: any) => projectData.project);
    } catch (error) {
      console.error('获取所有项目失败:', error);
      return [];
    }
  }

  // 更新项目编辑模式
  static updateProjectEditMode(projectId: string, editMode: ProjectEditMode): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const projects = JSON.parse(stored);
      const projectData = projects[projectId];
      
      if (!projectData) return false;

      projectData.project.editMode = editMode;
      projectData.project.updatedAt = new Date().toISOString();

      projects[projectId] = projectData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      
      return true;
    } catch (error) {
      console.error('更新项目编辑模式失败:', error);
      return false;
    }
  }
} 