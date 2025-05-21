// AdvancedResizablePanel.js - 简单可靠的拖拽实现
import React, { useState, useRef, useEffect } from "react";
import TabPropertiesPanel from "./TabPropertiesPanel";
import "./resizable-panel.css";

/**
 * 可调整大小的属性面板
 * 使用简单可靠的实现确保拖拽正常工作
 */
const AdvancedResizablePanel = ({
  selectedNode,
  updateNodeProperties,
  nodes,
  edges,
  onDeleteEdge,
}) => {
  // 默认宽度和最小/最大宽度限制
  const defaultWidth = 400;
  const minWidth = 400;
  const maxWidth = 800;

  // 尝试从localStorage获取保存的宽度
  const getSavedWidth = () => {
    try {
      const savedWidth = localStorage.getItem("propertiesPanelWidth");
      return savedWidth
        ? Math.max(minWidth, parseInt(savedWidth))
        : defaultWidth;
    } catch (e) {
      return defaultWidth;
    }
  };

  // 当前面板宽度状态
  const [width, setWidth] = useState(getSavedWidth());
  // 是否正在调整大小
  const [isResizing, setIsResizing] = useState(false);

  // 处理鼠标按下事件，开始调整大小
  const handleMouseDown = (e) => {
    e.preventDefault();
    // 记录初始鼠标位置和面板宽度
    const startX = e.clientX;
    const startWidth = width;
    setIsResizing(true);

    // 处理鼠标移动
    const handleMouseMove = (moveEvent) => {
      // 计算新宽度
      const deltaX = moveEvent.clientX - startX;
      const newWidth = startWidth - deltaX;

      // 限制宽度在允许范围内
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

      // 更新宽度
      setWidth(clampedWidth);
    };

    // 处理鼠标释放
    const handleMouseUp = () => {
      setIsResizing(false);

      // 保存宽度到localStorage
      try {
        localStorage.setItem("propertiesPanelWidth", width.toString());
      } catch (e) {
        console.warn("Failed to save panel width to localStorage", e);
      }

      // 移除事件监听器
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // 添加事件监听器
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 双击重置为默认宽度
  const handleDoubleClick = () => {
    setWidth(defaultWidth);
    try {
      localStorage.setItem("propertiesPanelWidth", defaultWidth.toString());
    } catch (e) {
      console.warn("Failed to save panel width to localStorage", e);
    }
  };

  return (
    <div
      className={`resizable-properties-panel ${isResizing ? "resizing" : ""}`}
      style={{ width: `${width}px` }}
    >
      {/* 简单的拖拽手柄 */}
      <div
        className="resize-handle"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="拖动调整宽度，双击重置"
      >
        <div className="handle-line"></div>
      </div>

      {/* 面板标题 */}
      <div className="panel-header">
        <h3>节点属性</h3>
      </div>

      {/* 面板内容 */}
      <div className="panel-content">
        <TabPropertiesPanel
          selectedNode={selectedNode}
          updateNodeProperties={updateNodeProperties}
          nodes={nodes}
          edges={edges}
          onDeleteEdge={onDeleteEdge}
        />
      </div>
    </div>
  );
};

export default AdvancedResizablePanel;
