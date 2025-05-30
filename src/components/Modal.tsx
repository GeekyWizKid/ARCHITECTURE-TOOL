import React, { useEffect, useState } from 'react';
import { DDDConceptType } from '../types/DDDRelationships';
import { ProjectEditMode } from '../types/Project';

interface ModalProps {
  type: 'context' | 'concept';
  item?: any;
  onSave: (item: any) => void;
  onClose: () => void;
  editMode?: ProjectEditMode;
}

// 预定义颜色选项
const contextColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

export const Modal: React.FC<ModalProps> = ({ type, item, onSave, onClose, editMode }) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (type === 'context') {
      setFormData({
        name: item?.name || '',
        description: item?.description || '',
        color: item?.color || contextColors[0]
      });
    } else {
      setFormData({
        name: item?.name || '',
        type: item?.type || DDDConceptType.ENTITY,
        description: item?.description || '',
        properties: item?.properties || [],
        methods: item?.methods || []
      });
    }
  }, [type, item]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleSave = () => {
    if (!formData.name?.trim()) return;
    
    if (type === 'concept') {
      // 处理属性和方法的字符串转数组
      const processedData = {
        ...formData,
        properties: typeof formData.properties === 'string' 
          ? formData.properties.split(',').map((p: string) => p.trim()).filter(Boolean)
          : formData.properties,
        methods: typeof formData.methods === 'string'
          ? formData.methods.split(',').map((m: string) => m.trim()).filter(Boolean)
          : formData.methods
      };
      onSave(processedData);
    } else {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-effect rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">
          {item ? `编辑${type === 'context' ? '边界上下文' : '概念'}` : `添加${type === 'context' ? '边界上下文' : '概念'}`}
        </h2>
        
        <div className="space-y-4">
          {/* 名称字段 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              {type === 'context' ? '上下文名称' : '概念名称'} *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={`输入${type === 'context' ? '上下文' : '概念'}名称`}
              autoFocus
            />
          </div>

          {/* 概念类型字段（仅UML模式） */}
          {type === 'concept' && editMode === ProjectEditMode.UML && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">概念类型</label>
              <select
                value={formData.type || DDDConceptType.ENTITY}
                onChange={(e) => handleInputChange('type', e.target.value as DDDConceptType)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.values(DDDConceptType).map(conceptType => (
                  <option key={conceptType} value={conceptType} className="text-black">
                    {conceptType}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 颜色字段（仅上下文） */}
          {type === 'context' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">颜色</label>
              <div className="flex flex-wrap gap-2">
                {contextColors.map(color => (
                  <button
                    key={color}
                    onClick={() => handleInputChange('color', color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color ? 'border-white scale-110' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* 描述字段 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">描述</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder={`输入${type === 'context' ? '上下文' : '概念'}描述`}
            />
          </div>

          {/* 属性和方法字段（仅UML模式的概念） */}
          {type === 'concept' && editMode === ProjectEditMode.UML && (
            <>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">属性</label>
                <input
                  type="text"
                  value={Array.isArray(formData.properties) ? formData.properties.join(', ') : formData.properties || ''}
                  onChange={(e) => handleInputChange('properties', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入属性，用逗号分隔"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">方法</label>
                <input
                  type="text"
                  value={Array.isArray(formData.methods) ? formData.methods.join(', ') : formData.methods || ''}
                  onChange={(e) => handleInputChange('methods', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入方法，用逗号分隔"
                />
              </div>
            </>
          )}

          {/* 概念设计模式提示 */}
          {type === 'concept' && editMode === ProjectEditMode.CONCEPT && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-200 text-sm">
                📝 概念设计模式：专注于概念名称和描述，不需要详细的属性和方法定义
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name?.trim()}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {item ? '更新' : '创建'}
          </button>
        </div>
      </div>
    </div>
  );
}; 