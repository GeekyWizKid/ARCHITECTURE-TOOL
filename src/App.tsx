import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableContext } from './components/DraggableContext';
import { ZoomableCanvas } from './components/ZoomableCanvas';
import { Toolbar } from './components/Toolbar';
import { Modal } from './components/Modal';
import { ProjectManager } from './components/ProjectManager';
// 新的DDD组件
import { DDDConceptComponent } from './components/DDDConcept';
import { DDDConnectionLine } from './components/DDDConnectionLine';
import { DDDRelationType, DDDConceptType } from './types/DDDRelationships';
import { ProjectService } from './services/ProjectService';
import { ProjectData, BoundedContext, DDDConcept, DDDRelationship, ProjectEditMode, ConceptRelationType } from './types/Project';
// 概念设计组件
import { ConceptDesignConcept } from './components/ConceptDesignConcept';
import { ConceptDesignConnectionLine } from './components/ConceptDesignConnectionLine';

function App() {
  // 项目管理状态 - 三层视图：project-manager -> project-editor -> context-editor
  const [currentView, setCurrentView] = useState<'project-manager' | 'project-editor' | 'context-editor'>('project-manager');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentContextId, setCurrentContextId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 编辑模式状态
  const [editMode, setEditMode] = useState<ProjectEditMode>(ProjectEditMode.UML);

  // UML模式状态
  const [selectedConceptType, setSelectedConceptType] = useState<DDDConceptType>(DDDConceptType.ENTITY);
  const [selectedRelationType, setSelectedRelationType] = useState<DDDRelationType | ConceptRelationType>(DDDRelationType.ASSOCIATION);

  // 概念设计模式状态
  const [isConnectionMode, setIsConnectionMode] = useState(false);
  const [connectionType, setConnectionType] = useState<ConceptRelationType>(ConceptRelationType.DEPENDENCY);
  const [sourceConceptId, setSourceConceptId] = useState<string | null>(null);

  // 编辑器状态
  const [boundedContexts, setBoundedContexts] = useState<BoundedContext[]>([]);
  const [concepts, setConcepts] = useState<DDDConcept[]>([]);
  const [relationships, setRelationships] = useState<DDDRelationship[]>([]);
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'context' | 'concept'>('context');
  const [editingItem, setEditingItem] = useState<any>(null);

  // 获取当前模式的概念和关系数据
  const getCurrentModeData = () => {
    if (!projectData) return { concepts: [], relationships: [] };
    
    if (editMode === ProjectEditMode.CONCEPT) {
      return projectData.conceptDesign;
    } else {
      return projectData.umlDesign;
    }
  };

  // 注意：目前直接使用本地状态，getCurrentModeData仅用于保存时的数据同步
  
  // 获取当前上下文内的概念 - 直接使用本地concepts状态，确保新添加的概念立即显示
  const contextConcepts = currentContextId ? concepts.filter(concept => concept.boundedContextId === currentContextId) : [];
  
  // 获取当前上下文内的关系（只包括该上下文内概念之间的关系） - 也使用本地relationships状态
  const contextRelationships = currentContextId ? relationships.filter(rel => {
    const sourceConcept = concepts.find(c => c.id === rel.sourceId);
    const targetConcept = concepts.find(c => c.id === rel.targetId);
    return sourceConcept?.boundedContextId === currentContextId && targetConcept?.boundedContextId === currentContextId;
  }) : [];

  // 游离态概念识别（概念设计模式）
  const getIsolatedConcepts = () => {
    if (editMode !== ProjectEditMode.CONCEPT || !currentContextId) return [];
    
    const connectedConceptIds = new Set([
      ...contextRelationships.map(r => r.sourceId),
      ...contextRelationships.map(r => r.targetId)
    ]);
    
    return contextConcepts.filter(concept => !connectedConceptIds.has(concept.id));
  };

  // 标记有未保存的更改
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // 保存项目
  const handleSaveProject = useCallback(() => {
    if (!projectData) return;

    const updatedProjectData: ProjectData = {
      ...projectData,
      boundedContexts,
      conceptDesign: editMode === ProjectEditMode.CONCEPT ? {
        concepts,
        relationships
      } : projectData.conceptDesign,
      umlDesign: editMode === ProjectEditMode.UML ? {
        concepts,
        relationships
      } : projectData.umlDesign
    };

    const result = ProjectService.saveProject(updatedProjectData);
    if (result.success) {
      setHasUnsavedChanges(false);
      console.log('项目已保存');
    } else {
      console.error('保存失败:', result.message);
    }
  }, [projectData, boundedContexts, concepts, relationships, editMode]);

  // 加载项目数据
  useEffect(() => {
    if (currentProjectId) {
      const result = ProjectService.loadProject(currentProjectId);
      if (result.success) {
        const data = result.data as ProjectData;
        setProjectData(data);
        setBoundedContexts(data.boundedContexts);
        
        // 根据项目的编辑模式加载对应的数据
        const projectEditMode = data.project.editMode || ProjectEditMode.UML;
        setEditMode(projectEditMode);
        
        if (projectEditMode === ProjectEditMode.CONCEPT) {
          setConcepts(data.conceptDesign?.concepts || []);
          setRelationships(data.conceptDesign?.relationships || []);
        } else {
          setConcepts(data.umlDesign?.concepts || []);
          setRelationships(data.umlDesign?.relationships || []);
        }
        
        setHasUnsavedChanges(false);
      }
    }
  }, [currentProjectId]);

  // 自动保存功能
  useEffect(() => {
    if (projectData && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        handleSaveProject();
      }, 2000); // 2秒后自动保存

      return () => clearTimeout(timer);
    }
  }, [handleSaveProject, projectData, hasUnsavedChanges]);

  // 项目选择处理
  const handleProjectSelect = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentView('project-editor');
  };

  // 创建新项目处理
  const handleCreateProject = () => {
    // 这个函数由ProjectManager内部处理
  };

  // 返回项目管理页面
  const handleBackToProjects = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('有未保存的更改，是否保存后退出？')) {
        handleSaveProject();
      }
    }
    setCurrentView('project-manager');
    setCurrentProjectId(null);
    setCurrentContextId(null);
    setProjectData(null);
  };

  // 进入上下文编辑模式
  const handleEnterContext = (contextId: string) => {
    setCurrentContextId(contextId);
    setCurrentView('context-editor');
    setSelectedContextId(null);
    setSelectedConceptId(null);
    setIsConnectionMode(false);
    setSourceConceptId(null);
    
    // 新上下文保持空白，不自动创建示例内容
  };

  // 返回项目编辑页面（从上下文编辑返回）
  const handleBackToProject = () => {
    setCurrentView('project-editor');
    setCurrentContextId(null);
    setSelectedConceptId(null);
    setIsConnectionMode(false);
    setSourceConceptId(null);
  };

  // 编辑模式切换处理
  const handleEditModeChange = (mode: ProjectEditMode) => {
    if (!projectData) return;
    
    // 保存当前模式的数据
    const updatedProjectData: ProjectData = {
      ...projectData,
      boundedContexts,
      conceptDesign: editMode === ProjectEditMode.CONCEPT ? {
        concepts,
        relationships
      } : projectData.conceptDesign,
      umlDesign: editMode === ProjectEditMode.UML ? {
        concepts,
        relationships
      } : projectData.umlDesign
    };
    
    // 更新项目数据
    setProjectData(updatedProjectData);
    
    // 切换编辑模式
    setEditMode(mode);
    
    // 加载目标模式的数据
    if (mode === ProjectEditMode.CONCEPT) {
      setConcepts(updatedProjectData.conceptDesign.concepts);
      setRelationships(updatedProjectData.conceptDesign.relationships);
    } else {
      setConcepts(updatedProjectData.umlDesign.concepts);
      setRelationships(updatedProjectData.umlDesign.relationships);
    }
    
    setIsConnectionMode(false);
    setSourceConceptId(null);
    markAsChanged();
    
    // 从项目数据中获取编辑模式并更新
    if (projectData?.project) {
      ProjectService.updateProjectEditMode(projectData.project.id, mode);
    }
  };

  // 连接模式切换
  const handleToggleConnectionMode = () => {
    setIsConnectionMode(!isConnectionMode);
    setSourceConceptId(null);
  };

  // 位置更新处理
  const handleContextPositionChange = (id: string, position: { x: number; y: number }) => {
    setBoundedContexts(prev => 
      prev.map(ctx => ctx.id === id ? { ...ctx, position } : ctx)
    );
    markAsChanged();
  };

  const handleConceptPositionChange = (id: string, position: { x: number; y: number }) => {
    setConcepts(prev => 
      prev.map(concept => concept.id === id ? { ...concept, position } : concept)
    );
    markAsChanged();
  };

  // 删除处理
  const handleDeleteContext = (id: string) => {
    setBoundedContexts(prev => prev.filter(ctx => ctx.id !== id));
    setConcepts(prev => prev.filter(concept => concept.boundedContextId !== id));
    markAsChanged();
  };

  const handleDeleteConcept = (id: string) => {
    setConcepts(prev => prev.filter(concept => concept.id !== id));
    setRelationships(prev => prev.filter(rel => rel.sourceId !== id && rel.targetId !== id));
    markAsChanged();
  };

  // 编辑处理
  const handleEditContext = (context: BoundedContext) => {
    setEditingItem(context);
    setModalType('context');
    setIsModalOpen(true);
  };

  const handleEditConcept = (concept: DDDConcept) => {
    setEditingItem(concept);
    setModalType('concept');
    setIsModalOpen(true);
  };

  // 添加新项目
  const handleAddContext = () => {
    setEditingItem(null);
    setModalType('context');
    setIsModalOpen(true);
  };

  const handleAddConcept = () => {
    // 在上下文编辑模式下使用当前上下文ID，否则使用选中的上下文ID
    const contextId = currentView === 'context-editor' ? currentContextId : selectedContextId;
    
    if (!contextId) {
      alert('请先选择一个边界上下文');
      return;
    }
    setEditingItem(null);
    setModalType('concept');
    setIsModalOpen(true);
  };

  // 保存编辑
  const handleSaveItem = (item: any) => {
    if (modalType === 'context') {
      if (editingItem) {
        setBoundedContexts(prev => 
          prev.map(ctx => ctx.id === editingItem.id ? { ...ctx, ...item } : ctx)
        );
      } else {
        const newContext: BoundedContext = {
          id: `bc_${Date.now()}`,
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
          ...item
        };
        setBoundedContexts(prev => [...prev, newContext]);
      }
    } else {
      // 在上下文编辑模式下使用当前上下文ID，否则使用选中的上下文ID
      const contextId = currentView === 'context-editor' ? currentContextId : selectedContextId;
      
      if (editingItem) {
        // 编辑现有概念
        setConcepts(prev => 
          prev.map(concept => concept.id === editingItem.id ? { ...concept, ...item } : concept)
        );
      } else {
        // 添加新概念
        const selectedContext = boundedContexts.find(ctx => ctx.id === contextId);
        if (selectedContext) {
          const newConcept: DDDConcept = {
            id: `c_${Date.now()}`,
            boundedContextId: contextId!,
            position: { 
              x: selectedContext.position.x + 50, 
              y: selectedContext.position.y + 50 
            },
            ...item
          };
          
          setConcepts(prev => [...prev, newConcept]);
        }
      }
    }
    markAsChanged();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // 概念点击处理（概念设计模式）
  const handleConceptClick = useCallback((conceptId: string) => {
    if (editMode === ProjectEditMode.CONCEPT && isConnectionMode) {
      if (sourceConceptId === null) {
        // 第一步：选择源概念
        setSourceConceptId(conceptId);
      } else if (sourceConceptId !== conceptId) {
        // 第二步：创建关系
        const newRelationship: DDDRelationship = {
          id: `rel_${Date.now()}`,
          sourceId: sourceConceptId,
          targetId: conceptId,
          type: connectionType,
          label: connectionType === ConceptRelationType.DEPENDENCY ? '依赖' : '协作'
        };
        
        setRelationships(prev => [...prev, newRelationship]);
        setSourceConceptId(null);
        setIsConnectionMode(false);
        markAsChanged();
      }
    } else {
      setSelectedConceptId(conceptId);
    }
  }, [editMode, isConnectionMode, sourceConceptId, connectionType]);

  // 删除关系
  const handleDeleteRelationship = (relationshipId: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== relationshipId));
    markAsChanged();
  };

  // Toolbar 组件渲染（上下文编辑模式）
  const renderContextToolbar = () => (
    <Toolbar
      onAddConcept={handleAddConcept}
      onAddContext={handleAddContext}
      editMode={editMode}
      onEditModeChange={handleEditModeChange}
      selectedConceptType={selectedConceptType}
      onConceptTypeChange={setSelectedConceptType}
      selectedRelationType={selectedRelationType}
      onRelationTypeChange={setSelectedRelationType}
      isConnectionMode={isConnectionMode}
      onToggleConnectionMode={handleToggleConnectionMode}
      connectionType={connectionType}
      onConnectionTypeChange={setConnectionType}
      onBackToProject={handleBackToProject}
      isContextEditor={true}
    />
  );

  // Toolbar 组件渲染（项目编辑模式）
  const renderProjectToolbar = () => (
    <Toolbar
      onAddConcept={handleAddConcept}
      onAddContext={handleAddContext}
      editMode={editMode}
      onEditModeChange={handleEditModeChange}
      onBackToProject={handleBackToProjects}
      isContextEditor={false}
    />
  );

  // 如果在项目管理页面
  if (currentView === 'project-manager') {
    return (
      <ProjectManager
        onProjectSelect={handleProjectSelect}
        onCreateProject={handleCreateProject}
      />
    );
  }

  // 如果在上下文编辑页面
  if (currentView === 'context-editor') {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-gray-50">
          {renderContextToolbar()}

          <ZoomableCanvas
            editMode={editMode}
            onContextDrop={() => {}} // 在上下文编辑模式下禁用上下文拖拽
            onConceptDrop={handleConceptPositionChange}
            onContextSelect={() => {}} // 在上下文编辑模式下禁用上下文选择
          >
            {/* 空状态提示 */}
            {contextConcepts.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {editMode === ProjectEditMode.CONCEPT ? '开始概念设计' : '开始UML建模'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {editMode === ProjectEditMode.CONCEPT 
                      ? '点击上方"添加概念"按钮，开始你的概念设计之旅'
                      : '点击上方"添加概念"按钮，创建你的第一个领域概念'
                    }
                  </p>
                  <div className="text-sm text-slate-500">
                    💡 提示：你可以在工具栏切换编辑模式
                  </div>
                </div>
                  </div>
            )}

            {/* 渲染概念 */}
            {contextConcepts.map(concept => (
              editMode === ProjectEditMode.CONCEPT ? (
                <ConceptDesignConcept
                  key={concept.id}
                  concept={concept}
                  isSelected={selectedConceptId === concept.id}
                  isConnectionMode={isConnectionMode}
                  isConnectionSource={sourceConceptId === concept.id}
                  isIsolated={getIsolatedConcepts().some(c => c.id === concept.id)}
                  onClick={() => handleConceptClick(concept.id)}
                  onEdit={handleEditConcept}
                  onDelete={handleDeleteConcept}
                  onPositionChange={handleConceptPositionChange}
                />
              ) : (
                <DDDConceptComponent
                  key={concept.id}
                  concept={concept}
                  isSelected={selectedConceptId === concept.id}
                  isConnectionMode={isConnectionMode}
                  isConnectionSource={sourceConceptId === concept.id}
                  onClick={() => handleConceptClick(concept.id)}
                  onEdit={handleEditConcept}
                  onDelete={handleDeleteConcept}
                  onPositionChange={handleConceptPositionChange}
                />
              )
            ))}

            {/* 渲染关系连线 */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ 
                width: '100%', 
                height: '100%',
                overflow: 'visible'
              }}
            >
              {contextRelationships.map(relationship => {
                const sourceConcept = concepts.find(c => c.id === relationship.sourceId);
                const targetConcept = concepts.find(c => c.id === relationship.targetId);
                
                if (!sourceConcept || !targetConcept) return null;
                
                return editMode === ProjectEditMode.CONCEPT ? (
                  <ConceptDesignConnectionLine
                    key={relationship.id}
                    relationship={relationship}
                    sourceConcept={sourceConcept}
                    targetConcept={targetConcept}
                    onDelete={() => handleDeleteRelationship(relationship.id)}
                  />
                ) : (
                  <DDDConnectionLine
                    key={relationship.id}
                    relationship={relationship}
                    sourceConcept={sourceConcept}
                    targetConcept={targetConcept}
                    onDelete={() => handleDeleteRelationship(relationship.id)}
                  />
                );
              })}
            </svg>
          </ZoomableCanvas>

          {/* 模态框 */}
          {isModalOpen && (
            <Modal
              type={modalType}
              item={editingItem}
              onSave={handleSaveItem}
              onClose={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
              editMode={editMode}
            />
        )}
      </div>
      </DndProvider>
    );
  }

  // 项目编辑页面（边界上下文管理）
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {renderProjectToolbar()}

        <ZoomableCanvas
          editMode={editMode}
          onContextDrop={handleContextPositionChange}
          onConceptDrop={() => {}} // 在项目编辑模式下禁用概念拖拽
          onContextSelect={setSelectedContextId}
        >
          {/* 渲染边界上下文 */}
          {boundedContexts.map((context) => (
            <DraggableContext
              key={context.id}
              context={context}
              isSelected={selectedContextId === context.id}
              onEdit={handleEditContext}
              onDelete={handleDeleteContext}
              onPositionChange={handleContextPositionChange}
              onSelect={setSelectedContextId}
              onEnterContext={handleEnterContext}
            />
          ))}
        </ZoomableCanvas>

        {/* 模态框 */}
        {isModalOpen && (
          <Modal
            type={modalType}
            item={editingItem}
            onSave={handleSaveItem}
            onClose={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}
            editMode={editMode}
          />
      )}
    </div>
    </DndProvider>
  );
}

export default App;
