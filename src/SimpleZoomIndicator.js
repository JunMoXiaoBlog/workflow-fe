import React, { useState, useEffect } from "react";

// 简单的缩放指示器组件
const SimpleZoomIndicator = ({ reactFlowInstance }) => {
  const [zoom, setZoom] = useState(100); // 默认值为100%（从75%改为100%）

  useEffect(() => {
    // 仅在 reactFlowInstance 存在时执行
    if (!reactFlowInstance) return;

    // 初始化时更新缩放值
    const currentZoom = reactFlowInstance.getZoom();
    setZoom(Math.round(currentZoom * 100));

    // 创建一个监听函数来获取viewport变化
    const onViewportChange = () => {
      const currentZoom = reactFlowInstance.getZoom();
      setZoom(Math.round(currentZoom * 100));
    };

    // 添加一个事件监听器来检测鼠标滚轮事件，这会影响缩放
    const handleWheel = () => {
      // 延迟一点点执行，确保缩放已经完成
      setTimeout(() => {
        const currentZoom = reactFlowInstance.getZoom();
        setZoom(Math.round(currentZoom * 100));
      }, 10);
    };

    // 为窗口添加事件监听器
    window.addEventListener("wheel", handleWheel);

    // 如果用户使用控制按钮缩放，我们需要定期检查缩放值
    const intervalId = setInterval(() => {
      if (reactFlowInstance) {
        const currentZoom = reactFlowInstance.getZoom();
        const roundedZoom = Math.round(currentZoom * 100);
        if (roundedZoom !== zoom) {
          setZoom(roundedZoom);
        }
      }
    }, 200); // 200ms 间隔，足够频繁但不会造成性能问题

    // 清理函数
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearInterval(intervalId);
    };
  }, [reactFlowInstance, zoom]);

  if (!reactFlowInstance) return null;

  return <div className="simple-zoom-indicator">{zoom}%</div>;
};

export default SimpleZoomIndicator;
