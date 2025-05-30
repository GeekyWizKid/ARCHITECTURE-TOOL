import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ProjectEditMode } from '../types/Project';

interface ZoomableCanvasProps {
  children: React.ReactNode;
  className?: string;
  editMode?: ProjectEditMode;
  onContextDrop?: (id: string, position: { x: number; y: number }) => void;
  onConceptDrop?: (id: string, position: { x: number; y: number }) => void;
  onContextSelect?: (contextId: string | null) => void;
}

export const ZoomableCanvas: React.FC<ZoomableCanvasProps> = ({ 
  children, 
  className = '', 
  editMode = ProjectEditMode.UML,
  onContextDrop,
  onConceptDrop,
  onContextSelect
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 缩放和平移状态
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  
  // 画布大小状态
  const [canvasSize, setCanvasSize] = useState({ width: 2000, height: 1500 });

  const [{ isOver }, drop] = useDrop({
    accept: ['context', 'concept'],
    drop: (item: any, monitor) => {
      if (!canvasRef.current) return { name: 'Canvas' };
      
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return { name: 'Canvas' };
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      // 考虑缩放和平移的位置转换
      const position = {
        x: (clientOffset.x - canvasRect.left - pan.x) / zoom,
        y: (clientOffset.y - canvasRect.top - pan.y) / zoom
      };
      
      // 根据拖拽项类型调用不同的回调
      if (item.type === 'context' && onContextDrop) {
        onContextDrop(item.id, position);
      } else if (item.type === 'concept' && onConceptDrop) {
        onConceptDrop(item.id, position);
      }
      
      return { name: 'Canvas', position };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // 处理鼠标滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // 只有在按住Ctrl键时才进行缩放
    if (!e.ctrlKey) {
      return; // 允许正常的页面滚动
    }
    
    e.preventDefault(); // 阻止默认的缩放行为
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // 获取鼠标位置相对于画布的坐标
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 缩放因子
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * zoomFactor));
    
    // 计算新的平移偏移，使缩放以鼠标位置为中心
    const newPan = {
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom)
    };
    
    setZoom(newZoom);
    setPan(newPan);
  }, [zoom, pan]);

  // 处理鼠标按下开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 检查是否点击在概念元素上
    const target = e.target as Element;
    const isConceptElement = target.closest('[data-concept-id]') || 
                           target.closest('.concept-component') ||
                           target.closest('button') ||
                           target.closest('input') ||
                           target.closest('textarea');
    
    // 如果不是点击在概念元素上，则开始拖拽
    if (!isConceptElement) {
      setIsPanning(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y
      };
      
      // 取消选择
      if (onContextSelect) {
        onContextSelect(null);
      }
    }
  }, [pan.x, pan.y, onContextSelect]);

  // 处理双击重置视图
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // 检查是否点击在概念元素上
    const target = e.target as Element;
    const isConceptElement = target.closest('[data-concept-id]') || 
                           target.closest('.concept-component') ||
                           target.closest('button') ||
                           target.closest('input') ||
                           target.closest('textarea');
    
    // 如果不是点击在概念元素上，则重置视图
    if (!isConceptElement) {
      resetView();
    }
  }, []);

  // 全局鼠标事件处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning || !dragStartRef.current) return;
      
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      
      // 考虑缩放因子，确保视觉移动与鼠标移动1:1对应
      // 因为transform是translate then scale，需要除以zoom补偿
      setPan({
        x: dragStartRef.current.panX + deltaX / zoom,
        y: dragStartRef.current.panY + deltaY / zoom
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      dragStartRef.current = null;
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, zoom]);

  // 重置视图
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 缩放到指定级别
  const zoomTo = (level: number) => {
    const newZoom = Math.max(0.1, Math.min(3, level));
    setZoom(newZoom);
  };

  // 适应内容大小
  const fitToContent = () => {
    if (!contentRef.current || !canvasRef.current) return;
    
    const content = contentRef.current;
    const canvas = canvasRef.current;
    
    // 获取内容边界
    const elements = content.children;
    if (elements.length === 0) return;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      
      const x = rect.left - contentRect.left;
      const y = rect.top - contentRect.top;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + rect.width);
      maxY = Math.max(maxY, y + rect.height);
    }
    
    const contentWidth = maxX - minX + 200; // 添加边距
    const contentHeight = maxY - minY + 200;
    const canvasRect = canvas.getBoundingClientRect();
    
    const scaleX = canvasRect.width / contentWidth;
    const scaleY = canvasRect.height / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1);
    
    setZoom(newZoom);
    setPan({
      x: (canvasRect.width - contentWidth * newZoom) / 2 - minX * newZoom,
      y: (canvasRect.height - contentHeight * newZoom) / 2 - minY * newZoom
    });
  };

  // 根据内容动态调整画布大小
  useEffect(() => {
    if (!contentRef.current) return;
    
    const updateCanvasSize = () => {
      const content = contentRef.current;
      if (!content) return;
      
      // 获取所有子元素的边界
      const elements = content.children;
      if (elements.length === 0) {
        setCanvasSize({ width: 3000, height: 2000 });
        return;
      }
      
      let minX = 0, minY = 0, maxX = 3000, maxY = 2000;
      
      // 遍历所有元素，从style属性获取逻辑位置
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        
        // 跳过SVG元素（连线）和非绝对定位元素
        if (element.tagName === 'svg' || !element.style.left) {
          continue;
        }
        
        // 从style.left和style.top获取位置
        const elementX = parseFloat(element.style.left.replace('px', '')) || 0;
        const elementY = parseFloat(element.style.top.replace('px', '')) || 0;
        
        // 获取元素实际尺寸
        const elementWidth = element.offsetWidth || 200;
        const elementHeight = element.offsetHeight || 120;
        
        // 更新边界（只在元素超出当前边界时扩展）
        minX = Math.min(minX, elementX - 300);
        minY = Math.min(minY, elementY - 300);
        maxX = Math.max(maxX, elementX + elementWidth + 300);
        maxY = Math.max(maxY, elementY + elementHeight + 300);
      }
      
      // 检查SVG连线的边界
      const svgElement = content.querySelector('svg');
      if (svgElement) {
        const lines = svgElement.querySelectorAll('line, path');
        lines.forEach(line => {
          if (line.tagName === 'line') {
            const x1 = parseFloat(line.getAttribute('x1') || '0');
            const y1 = parseFloat(line.getAttribute('y1') || '0');
            const x2 = parseFloat(line.getAttribute('x2') || '0');
            const y2 = parseFloat(line.getAttribute('y2') || '0');
            
            minX = Math.min(minX, x1 - 100, x2 - 100);
            minY = Math.min(minY, y1 - 100, y2 - 100);
            maxX = Math.max(maxX, x1 + 100, x2 + 100);
            maxY = Math.max(maxY, y1 + 100, y2 + 100);
          }
        });
      }
      
      // 计算所需的画布大小
      const requiredWidth = maxX - minX;
      const requiredHeight = maxY - minY;
      
      // 设置最小尺寸和最大尺寸限制
      const newWidth = Math.max(3000, Math.min(12000, requiredWidth));
      const newHeight = Math.max(2000, Math.min(8000, requiredHeight));
      
      // 只在尺寸变化超过阈值时才更新（减少不必要的重新渲染）
      const threshold = 200;
      if (Math.abs(newWidth - canvasSize.width) > threshold || 
          Math.abs(newHeight - canvasSize.height) > threshold) {
        console.log('Canvas size update:', { 
          from: canvasSize, 
          to: { width: newWidth, height: newHeight },
          elementCount: elements.length,
          bounds: { minX, minY, maxX, maxY }
        });
        
        setCanvasSize({ 
          width: newWidth, 
          height: newHeight 
        });
      }
    };
    
    // 延迟初始更新，确保DOM已经完全渲染
    const timer = setTimeout(updateCanvasSize, 100);
    
    // 监听内容变化 - 添加防抖
    let updateTimer: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      // 防抖：清除之前的定时器，延迟更新
      clearTimeout(updateTimer);
      updateTimer = setTimeout(updateCanvasSize, 300);
    });
    
    const content = contentRef.current;
    if (content) {
      observer.observe(content, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['style'] // 只监听style属性变化，减少不必要的触发
      });
    }
    
    // 监听窗口大小变化 - 添加防抖
    const handleResize = () => {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(updateCanvasSize, 300);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(updateTimer);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [children]);

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否有输入框处于焦点状态
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            resetView();
            break;
          case '=':
          case '+':
            e.preventDefault();
            setZoom(prev => Math.min(3, prev * 1.2));
            break;
          case '-':
            e.preventDefault();
            setZoom(prev => Math.max(0.1, prev / 1.2));
            break;
          case '1':
            e.preventDefault();
            fitToContent();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  drop(canvasRef);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 工具栏 */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-lg px-3 py-2 text-sm font-medium text-slate-700">
          缩放: {Math.round(zoom * 100)}%
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-lg flex">
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev / 1.2))}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all border-r border-slate-200/60"
            title="缩小 (Ctrl + -)"
          >
            －
          </button>
          <button
            onClick={() => zoomTo(1)}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all border-r border-slate-200/60"
            title="100% (Ctrl + 0)"
          >
            100%
          </button>
          <button
            onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all"
            title="放大 (Ctrl + +)"
          >
            ＋
          </button>
        </div>
        <button
          onClick={resetView}
          className="bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all"
          title="重置视图 (Ctrl + 0)"
        >
          重置视图
        </button>
        <button
          onClick={fitToContent}
          className="bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all"
          title="适应内容 (Ctrl + 1)"
        >
          适应内容
        </button>
      </div>
      
      {/* 编辑模式指示器 */}
      <div className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-lg text-sm font-medium text-slate-700">
        {editMode === ProjectEditMode.CONCEPT ? '🎨 概念设计模式' : '📐 UML模式'}
      </div>

      {/* 画布容器 */}
      <div
        ref={canvasRef}
        className={`w-full h-full cursor-grab ${isPanning ? 'cursor-grabbing' : ''} ${className}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* 可缩放的内容容器 */}
        <div
          ref={contentRef}
          className="origin-top-left relative"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* 网格背景 */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
              `,
              backgroundSize: `${20 / zoom}px ${20 / zoom}px`
            }}
          />
          
          {/* 内容区域 */}
          <div>
            {children}
          </div>
        </div>

        {/* 拖拽提示 */}
        {isOver && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-400/60 bg-blue-400/10 rounded-xl flex items-center justify-center pointer-events-none z-40">
            <div className="text-blue-600 font-medium text-lg bg-white/90 px-4 py-2 rounded-lg shadow-lg">释放以放置元素</div>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="absolute bottom-4 left-4 z-50 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-lg px-4 py-3 text-xs text-slate-600 max-w-xs">
        <div className="font-semibold mb-2 text-slate-700">📖 操作说明</div>
        <div className="space-y-1 text-slate-600">
          <div>• 🖱️ Ctrl + 滚轮：缩放</div>
          <div>• ✋ 拖拽画布：平移视图</div>
          <div>• 👆 双击画布：重置视图</div>
          <div>• ⌨️ Ctrl + 0：重置视图</div>
          <div>• ⌨️ Ctrl + +/-：缩放</div>
          <div>• ⌨️ Ctrl + 1：适应内容</div>
        </div>
      </div>
    </div>
  );
}; 