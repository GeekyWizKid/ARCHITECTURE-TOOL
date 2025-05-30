import React, { useState, useEffect, useRef } from 'react';
import { ProjectService } from '../services/ProjectService';
import { ProjectListItem, ExportFormat, ExportOptions } from '../types/Project';

interface ProjectManagerProps {
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  onProjectSelect,
  onCreateProject
}) => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProjectForExport, setSelectedProjectForExport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'size'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新建项目表单
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    author: ''
  });

  // 导出选项
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: ExportFormat.JSON,
    includeMetadata: true,
    includePositions: true,
    minify: false
  });

  // 加载项目列表
  const loadProjects = () => {
    const projectList = ProjectService.getProjectList();
    setProjects(projectList);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // 过滤和排序项目
  const filteredAndSortedProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // 创建新项目
  const handleCreateProject = () => {
    if (!projectForm.name.trim()) return;

    const result = ProjectService.createProject(
      projectForm.name,
      projectForm.description,
      projectForm.author
    );

    if (result.success) {
      setShowCreateModal(false);
      setProjectForm({ name: '', description: '', author: '' });
      loadProjects();
      onProjectSelect(result.data.project.id);
    } else {
      alert(result.message);
    }
  };

  // 删除项目
  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (window.confirm(`确定要删除项目 "${projectName}" 吗？此操作不可撤销。`)) {
      const result = ProjectService.deleteProject(projectId);
      if (result.success) {
        loadProjects();
      } else {
        alert(result.message);
      }
    }
  };

  // 复制项目
  const handleDuplicateProject = (projectId: string, originalName: string) => {
    const newName = prompt('请输入新项目名称:', `${originalName} - 副本`);
    if (newName && newName.trim()) {
      const result = ProjectService.duplicateProject(projectId, newName.trim());
      if (result.success) {
        loadProjects();
      } else {
        alert(result.message);
      }
    }
  };

  // 导出项目
  const handleExportProject = (projectId: string) => {
    setSelectedProjectForExport(projectId);
    setShowExportModal(true);
  };

  const confirmExport = () => {
    if (!selectedProjectForExport) return;

    const result = ProjectService.exportProject(selectedProjectForExport, exportOptions);
    if (result.success) {
      setShowExportModal(false);
      setSelectedProjectForExport(null);
    } else {
      alert(result.message);
    }
  };

  // 导入项目
  const handleImportProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await ProjectService.importProject(file);
      if (result.success) {
        loadProjects();
        onProjectSelect(result.data.project.id);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }

    // 清除文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays - 1} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                DDD 架构工具
              </h1>
              <p className="text-white/70 text-lg">
                管理您的领域驱动设计项目
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleImportProject}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg hover-lift"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>导入项目</span>
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all shadow-lg hover-lift"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>新建项目</span>
              </button>
            </div>
          </div>
        </div>

        {/* 搜索和排序 */}
        <div className="glass-effect rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索项目..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'updatedAt' | 'size')}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="updatedAt" className="text-black">按修改时间</option>
                <option value="name" className="text-black">按名称</option>
                <option value="size" className="text-black">按大小</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
              >
                <svg className={`w-5 h-5 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map((project) => (
            <div key={project.id} className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleExportProject(project.id)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="导出项目"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateProject(project.id, project.name)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    title="复制项目"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="删除项目"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                <span>{formatDate(project.updatedAt)}</span>
                <span>{formatFileSize(project.size)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    <span>{project.contextCount}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{project.conceptCount}</span>
                  </span>
                </div>

                <button
                  onClick={() => onProjectSelect(project.id)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors shadow-lg hover-lift"
                >
                  打开
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? '没有找到匹配的项目' : '还没有项目'}
            </h3>
            <p className="text-white/70 mb-6">
              {searchTerm ? '尝试调整搜索条件' : '创建您的第一个DDD架构项目'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all shadow-lg hover-lift"
              >
                创建新项目
              </button>
            )}
          </div>
        )}
      </div>

      {/* 创建项目模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">创建新项目</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">项目名称 *</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入项目名称"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">项目描述</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="输入项目描述"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">作者</label>
                <input
                  type="text"
                  value={projectForm.author}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入作者名称"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!projectForm.name.trim()}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导出项目模态框 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">导出项目</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">导出格式</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as ExportFormat }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={ExportFormat.JSON} className="text-black">JSON</option>
                  <option value={ExportFormat.XML} className="text-black">XML</option>
                  <option value={ExportFormat.YAML} className="text-black">YAML</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                    className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <span className="text-white/80">包含元数据</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includePositions}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includePositions: e.target.checked }))}
                    className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <span className="text-white/80">包含位置信息</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.minify}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, minify: e.target.checked }))}
                    className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <span className="text-white/80">压缩输出</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmExport}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                导出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.xml,.yaml,.yml"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}; 