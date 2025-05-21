import React, { useState, useCallback, useEffect, useRef } from "react";
import { Handle, Position, NodeResizeControl, useReactFlow } from "reactflow";
import { LoopIcon, LoopStartIcon } from "./nodes";

import { generateUUID } from "../utils";

// 循环节点组件 - 支持子流程但保持原有样式
export const SubflowLoopNode = ({
  data,
  selected,
  id,
  entryIcon,
  xPos,
  yPos,
}) => {
  const { getNodes, setNodes } = useReactFlow();

  // 使用useRef减少重渲染
  const heightRef = useRef(data.config?.subflow?.height || 154);
  const widthRef = useRef(data.config?.subflow?.width || 320);
  const [height, setHeight] = useState(heightRef.current);
  const [width, setWidth] = useState(widthRef.current);

  // 设置最小尺寸
  const minHeight = 154;
  const minWidth = 320;

  // 设置边界保护距离
  const BOUNDARY_PADDING = 10; // 距离边界的保护距离

  // 是否正在调整大小
  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef(false);

  // 防止重复添加节点的标志
  const isAddingNodeRef = useRef(false);

  // 是否正在拖动标记
  const [isDragging, setIsDragging] = useState(false);

  // 节点位置参考
  const nodePosition = useRef({ x: xPos, y: yPos });

  // 边界计算值
  const [minBounds, setMinBounds] = useState({
    width: minWidth,
    height: minHeight,
  });

  // 使用useEffect，当节点位置变化时更新引用
  useEffect(() => {
    nodePosition.current = { x: xPos, y: yPos };
  }, [xPos, yPos]);

  // 当配置更新时同步尺寸
  useEffect(() => {
    if (
      data.config?.subflow?.height &&
      data.config.subflow.height !== heightRef.current
    ) {
      heightRef.current = data.config.subflow.height;
      setHeight(data.config.subflow.height);
    }
    if (
      data.config?.subflow?.width &&
      data.config.subflow.width !== widthRef.current
    ) {
      widthRef.current = data.config.subflow.width;
      setWidth(data.config.subflow.width);
    }
  }, [data.config]);

  // 添加拖动状态监听器
  useEffect(() => {
    // 检测节点何时开始拖动
    const handleDragStart = () => {
      setIsDragging(true);
    };

    // 检测节点何时停止拖动
    const handleDragEnd = () => {
      setIsDragging(false);

      // 给DOM时间更新，然后确保所有子内容可见
      setTimeout(() => {
        const subflowContainers =
          document.querySelectorAll(".loop-subflow-area");
        subflowContainers.forEach((container) => {
          container.style.visibility = "visible";
          container.style.opacity = "1";

          // 确保内部节点可见
          const childNodes = container.querySelectorAll(".react-flow__node");
          childNodes.forEach((node) => {
            node.style.visibility = "visible";
            node.style.opacity = "1";
          });
        });

        // 确保连线可见
        const edges = document.querySelectorAll(".react-flow__edge");
        edges.forEach((edge) => {
          edge.style.visibility = "visible";
          edge.style.opacity = "1";
        });
      }, 50);
    };

    // 添加事件监听
    const nodeElement = document.querySelector(
      `.react-flow__node[data-id="${id}"]`
    );
    if (nodeElement) {
      nodeElement.addEventListener("mousedown", handleDragStart);
      document.addEventListener("mouseup", handleDragEnd);
    }

    // 清理函数
    return () => {
      if (nodeElement) {
        nodeElement.removeEventListener("mousedown", handleDragStart);
      }
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [id]);

  // 获取节点头部高度和底部高度
  const headerHeight = 34;
  const footerHeight = 12;

  // 获取子节点的尺寸 - 辅助函数，考虑不同节点类型的实际尺寸
  const getNodeDimensions = useCallback(
    (node) => {
      // 根据节点类型和其他条件获取更准确的尺寸
      let nodeWidth = 220; // 默认宽度
      let nodeHeight = 80; // 默认高度

      // 检查节点是否有明确的宽高定义
      if (node.width && node.height) {
        nodeWidth = node.width;
        nodeHeight = node.height;
      } else {
        // 根据节点类型预估大小
        switch (node.type) {
          case "SWITCH":
            // 分支节点高度取决于分支数量
            const casesCount = node.data?.config?.cases?.length || 0;
            nodeHeight = 24 + (casesCount + 1) * 24;
            break;
          case "LOOP":
            // 循环节点高度包括头部、子流程区域和底部
            const subflowHeight = node.data?.config?.subflow?.height || 154;
            nodeHeight = headerHeight + subflowHeight + footerHeight;
            break;
          case "SCRIPT":
            nodeHeight = 80; // 脚本节点固定高度
            break;
          case "HTTP":
            nodeHeight = 80; // HTTP节点固定高度
            break;
          case "SQL":
            nodeHeight = 80; // SQL节点固定高度
            break;
          case "REDIS":
            nodeHeight = 80; // Redis节点固定高度
            break;
          case "SET_VARIABLE":
            nodeHeight = 80; // 变量节点固定高度
            break;
          case "END":
            nodeHeight = 70; // 结束节点可能较小
            break;
          case "START":
            nodeHeight = 34; // 开始节点高度
            break;
          // 默认使用80px高度
          default:
            nodeHeight = 80;
        }
      }

      return { width: nodeWidth, height: nodeHeight };
    },
    [headerHeight, footerHeight]
  );

  // 处理子流程区域内节点的边界检查
  const checkNodeBoundaries = useCallback(() => {
    const allNodes = getNodes();
    const subflowNodes = allNodes.filter((node) => node.parentNode === id);

    if (subflowNodes.length === 0) return minBounds;

    // 计算子节点占用的最大边界，考虑节点实际尺寸
    let maxRight = -Infinity;
    let maxBottom = -Infinity;

    subflowNodes.forEach((node) => {
      // 获取节点的精确尺寸
      const { width: nodeWidth, height: nodeHeight } = getNodeDimensions(node);

      // 计算节点的右边界和底边界
      // 加上BOUNDARY_PADDING确保节点距离容器边缘有足够空间
      const nodeRight = node.position.x + nodeWidth + BOUNDARY_PADDING;
      const nodeBottom = node.position.y + nodeHeight + BOUNDARY_PADDING;

      maxRight = Math.max(maxRight, nodeRight);
      maxBottom = Math.max(maxBottom, nodeBottom);
    });

    // 计算需要的最小尺寸，已经考虑了边界保护距离
    const requiredWidth = Math.max(minWidth, maxRight);
    const requiredHeight = Math.max(minHeight, maxBottom);

    return {
      width: requiredWidth,
      height: requiredHeight,
    };
  }, [getNodes, id, minWidth, minHeight, getNodeDimensions]);

  // 在每次渲染时更新边界计算
  useEffect(() => {
    if (!isResizing) {
      const bounds = checkNodeBoundaries();
      setMinBounds(bounds);
    }
  }, [checkNodeBoundaries, isResizing]);

  // 处理 resize 开始
  const onResizeStart = useCallback(() => {
    if (resizingRef.current) return;
    resizingRef.current = true;
    setIsResizing(true);
    document.body.classList.add("resizing-active");
  }, []);

  // 处理 resize 过程
  const onResize = useCallback(
    (event, { width: newWidth, height: newHeight }) => {
      requestAnimationFrame(() => {
        // 计算子流程内容区域的高度（减去头部和底部）
        const contentHeight = newHeight - headerHeight - footerHeight;

        // 确保不小于最小尺寸和子节点需要的尺寸
        const clampedHeight = Math.max(
          minBounds.height,
          minHeight,
          contentHeight
        );
        const clampedWidth = Math.max(minBounds.width, minWidth, newWidth);

        // 更新ref值
        heightRef.current = clampedHeight;
        widthRef.current = clampedWidth;

        // 更新状态
        setHeight(clampedHeight);
        setWidth(clampedWidth);
      });
    },
    [minBounds, minHeight, minWidth, headerHeight, footerHeight]
  );

  // 处理 resize 结束
  const onResizeEnd = useCallback(
    (event, { width: newWidth, height: newHeight }) => {
      resizingRef.current = false;
      setIsResizing(false);
      document.body.classList.remove("resizing-active");

      // 计算子流程内容区域的高度（减去头部和底部）
      const contentHeight = newHeight - headerHeight - footerHeight;

      // 确保不小于最小尺寸和子节点需要的尺寸
      const clampedHeight = Math.max(
        minBounds.height,
        minHeight,
        contentHeight
      );
      const clampedWidth = Math.max(minBounds.width, minWidth, newWidth);

      // 更新节点配置
      setTimeout(() => {
        if (data.updateNodeInternally && id) {
          data.updateNodeInternally(id, {
            config: {
              ...data.config,
              subflow: {
                ...data.config?.subflow,
                width: clampedWidth,
                height: clampedHeight,
              },
            },
          });

          // 调整节点大小后，检查并调整子节点位置，确保它们不超出边界
          repositionChildNodes(clampedWidth, clampedHeight);
        }
      }, 0);
    },
    [data, id, minBounds, minHeight, minWidth, headerHeight, footerHeight]
  );

  // 重新定位子节点，确保它们在边界内
  const repositionChildNodes = useCallback(
    (containerWidth, containerHeight) => {
      const allNodes = getNodes();
      const childNodes = allNodes.filter((node) => node.parentNode === id);

      if (childNodes.length === 0) return;

      // 创建一个标志来跟踪是否有节点被重新定位
      let hasRepositioned = false;

      // 创建更新后的节点副本
      const updatedNodes = allNodes.map((node) => {
        if (node.parentNode === id) {
          // 获取节点的精确尺寸
          const { width: nodeWidth, height: nodeHeight } =
            getNodeDimensions(node);

          // 计算边界，添加保护距离，并考虑节点自身的尺寸
          const minX = BOUNDARY_PADDING + 20;
          const minY = BOUNDARY_PADDING + 34;
          // 注意：对于底部边界，我们需要确保不超出
          const maxX = containerWidth - nodeWidth - BOUNDARY_PADDING - 20;
          const maxY = containerHeight - nodeHeight - BOUNDARY_PADDING + 34;

          // 检查并调整节点位置，确保子节点完全在边界内
          let newX = Math.min(Math.max(minX, node.position.x), maxX);
          let newY = Math.min(Math.max(minY, node.position.y), maxY);

          // 如果位置有变化，标记需要更新
          if (newX !== node.position.x || newY !== node.position.y) {
            hasRepositioned = true;
            return {
              ...node,
              position: {
                x: newX,
                y: newY,
              },
            };
          }
        }
        return node;
      });

      // 如果有节点被重新定位，更新节点
      if (hasRepositioned) {
        setNodes(updatedNodes);
      }
    },
    [getNodes, setNodes, id, getNodeDimensions]
  );

  // 计算总高度
  const totalHeight = headerHeight + height + footerHeight;
  const handlePositionY = totalHeight / 2;

  // 计算子流程区域的有效宽度
  const subflowEffectiveWidth = width - 24; // 左右各12px边距

  // 处理节点拖入子流程区域
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation(); // 修复: 确保事件不会冒泡
    event.dataTransfer.dropEffect = "move";
  }, []);

  // 注册拖动处理事件
  useEffect(() => {
    // 创建事件监听器，仅用于捕获结束事件以便更新节点位置
    const dragStopHandler = (event) => {
      if (event.detail && event.detail.parentId === id) {
        // 在拖动结束时不需要显示坐标，但可能需要处理其他逻辑
      }
    };

    // 添加自定义事件监听器
    document.addEventListener("node-drag-stop", dragStopHandler);

    // 清理函数
    return () => {
      document.removeEventListener("node-drag-stop", dragStopHandler);
    };
  }, [id]);

  // 处理节点放入子流程区域
  // 完整修改 SubflowLoopNode.js 中的 onDrop 函数

  // 处理节点放入子流程区域
  const onDrop = useCallback(
    (event) => {
      // 阻止原生事件并阻止事件冒泡，防止外层容器处理相同的事件
      event.preventDefault();
      event.stopPropagation();

      // 防止重复执行
      if (isAddingNodeRef.current) return;
      isAddingNodeRef.current = true;

      try {
        // 获取拖拽的节点类型
        const nodeType = event.dataTransfer.getData(
          "application/reactflow/type"
        );

        // 关键修复：允许所有节点类型放入循环子流程区域
        if (!nodeType) {
          console.log("没有获取到节点类型");
          isAddingNodeRef.current = false;
          return;
        }

        // 获取鼠标位置相对于子流程区域的坐标
        const {
          left,
          top,
          width: containerWidth,
          height: containerHeight,
        } = event.currentTarget.getBoundingClientRect();

        // 基于节点类型估计节点尺寸
        let nodeWidth = 220; // 默认节点宽度
        let nodeHeight;

        // 根据节点类型调整预估尺寸
        switch (nodeType) {
          case "SWITCH":
            nodeHeight = 24 + 3 * 24; // 默认有2个分支+默认分支
            break;
          case "LOOP":
            nodeHeight = headerHeight + 154 + footerHeight; // 基于最小高度
            break;
          case "SCRIPT":
            nodeHeight = 80; // 脚本节点固定高度
            break;
          case "HTTP":
            nodeHeight = 80; // HTTP节点固定高度
            break;
          case "SQL":
            nodeHeight = 80; // SQL节点固定高度
            break;
          case "REDIS":
            nodeHeight = 80; // Redis节点固定高度
            break;
          case "SET_VARIABLE":
            nodeHeight = 80; // 变量节点固定高度
            break;
          case "END":
            nodeHeight = 70; // 结束节点可能较小
            break;
          case "START":
            nodeHeight = 34; // 开始节点高度
            break;
          default:
            nodeHeight = 80; // 默认高度
        }

        // 计算放置位置，考虑边界保护距离和节点尺寸
        let x = event.clientX - left;
        let y = event.clientY - top;

        // 应用边界，使用更新后的计算公式
        const minX = BOUNDARY_PADDING + 20;
        const minY = BOUNDARY_PADDING + 34;
        const maxX = containerWidth - nodeWidth - BOUNDARY_PADDING - 20;
        const maxY = containerHeight - nodeHeight - BOUNDARY_PADDING + 34;

        // 应用边界限制
        x = Math.min(Math.max(minX, x), maxX);
        y = Math.min(Math.max(minY, y), maxY);

        const position = { x, y };

        // 创建新节点ID - 使用generateUUID函数生成独立的32位ID
        const newNodeId = generateUUID();

        // 创建新节点 - 明确设置parentNode和extent属性
        const newNode = {
          id: newNodeId,
          type: nodeType,
          position,
          parentNode: id, // 明确设置父节点ID
          extent: "parent", // 明确限制在父节点范围内
          draggable: true, // 确保可拖动
          data: {
            label: getNodeTypeLabel(nodeType),
            config: getDefaultConfig(nodeType),
            updateNodeInternally: data.updateNodeInternally,
          },
        };

        // 使用函数形式的setNodes以确保使用最新状态
        setNodes((currentNodes) => {
          // 检查是否已存在相同父节点的同类型节点在相似位置
          const isDuplicate = currentNodes.some(
            (node) =>
              node.parentNode === id &&
              node.type === nodeType &&
              Math.abs(node.position.x - position.x) < 10 &&
              Math.abs(node.position.y - position.y) < 10
          );

          if (isDuplicate) {
            isAddingNodeRef.current = false;
            return currentNodes; // 如果是重复的，不添加
          }

          // 将新节点添加到当前节点列表中
          const updatedNodes = [...currentNodes, newNode];

          // 使用计时器确保DOM更新完成，然后更新节点的父子关系
          setTimeout(() => {
            if (data.updateNodeInternally) {
              // 获取当前的所有子流程节点
              const subflowNodes = updatedNodes.filter(
                (n) => n.parentNode === id
              );

              // 更新循环节点配置，存储子节点信息
              data.updateNodeInternally(id, {
                config: {
                  ...data.config,
                  subflow: {
                    ...data.config?.subflow,
                    nodes: subflowNodes,
                  },
                },
              });
            }

            // 重置节点添加状态
            isAddingNodeRef.current = false;
          }, 50);

          return updatedNodes;
        });
      } catch (error) {
        console.error("子流程添加节点错误:", error);
        isAddingNodeRef.current = false;
      }
    },
    [id, data, setNodes, width, height, headerHeight, footerHeight]
  );

  return (
    <div
      className={`custom-node loop-node loop-container ${
        isResizing ? "resizing" : ""
      } ${isDragging ? "dragging-parent" : ""}`}
      style={{
        width: `${width}px`,
        height: `${totalHeight}px`,
        willChange:
          isResizing || isDragging ? "width, height, transform" : "transform",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* 左侧输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          top: handlePositionY,
          transform: "translate(-50%, -50%)",
          zIndex: 2000, // 确保连接点在顶层
        }}
      />

      {/* 节点头部 - 保持原始样式 */}
      <div className="node-header" style={{ zIndex: 20 }}>
        <div className="node-icon">
          <LoopIcon />
        </div>
        <div className="node-title">{data.label || "循环"}</div>
      </div>

      {/* 子流程区域 - 可拖放节点的区域 */}
      <div
        className={`loop-subflow-area ${isDragging ? "parent-dragging" : ""}`}
        style={{
          height: height,
          width: subflowEffectiveWidth,
          margin: "0 12px 12px 12px",
          backgroundColor: "#f0f0f0",
          backgroundImage: "radial-gradient(#c0c0c0 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
          position: "relative",
          overflow: "hidden", // 确保子节点不能移出区域
          boxSizing: "border-box", // 确保边框包含在宽高计算内
          zIndex: isDragging ? 1500 : 5, // 拖动时提高层级
          pointerEvents: isDragging ? "none" : "auto", // 拖动时禁用鼠标事件
          visibility: "visible", // 始终保持可见
          opacity: 1, // 始终保持不透明
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* 子流程背景点阵图案 */}
        <div className="loop-background-dots" style={{ zIndex: 1 }}></div>

        {/* 添加提示文字 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#aaa",
            fontSize: "14px",
            userSelect: "none",
            pointerEvents: "none",
            opacity: 0.6,
            textAlign: "center",
            zIndex: 2,
          }}
        >
          循环体内容区域
          <br />
          拖放节点到此处
        </div>

        {/* 添加入口点指示器 - 特别确保连接点ID为"entry-out" */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 25, // 确保在其他元素之上，但不超过边缘连线
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#3498db",
              border: "2px solid #2980b9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            {entryIcon ? (
              <LoopStartIcon />
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M8 5v14l11-7z" fill="white" />
              </svg>
            )}

            {/* 循环起始节点出口连接点 - 确保ID为"entry-out" */}
            <Handle
              type="source"
              position={Position.Right}
              id="entry-out"
              className="entry-handle entry-handle-out"
              style={{
                width: "9px",
                height: "9px",
                backgroundColor: "#4caf50",
                border: "1px solid white",
                boxShadow: "0 0 2px rgba(0, 0, 0, 0.2)",
                zIndex: 2000, // 确保在背景之上
                right: "0px",
                top: "50%",
                transform: "translate(50%, -50%)",
                pointerEvents: "all",
              }}
            />
          </div>
        </div>
      </div>

      {/* 底部白色区域 */}
      <div
        style={{
          height: footerHeight,
          width: "calc(100% - 24px)",
          backgroundColor: "white",
          margin: "0 12px 0 12px",
          borderRadius: "6px",
          position: "relative",
          zIndex: 20, // 高于子流程内容
        }}
      ></div>

      {/* 调整大小手柄视觉指示器 */}
      <div
        style={{
          position: "absolute",
          right: "4px",
          bottom: "4px",
          width: "16px",
          height: "16px",
          border: "2px solid #4c9aff",
          borderTop: "none",
          borderLeft: "none",
          borderBottomRightRadius: "6px",
          pointerEvents: "none",
          zIndex: 30, // 高于节点但低于resize控制
          opacity: 1,
          backgroundColor: "transparent",
          cursor: "nwse-resize",
        }}
      ></div>

      {/* 右侧输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ zIndex: 2000 }} // 确保连接点在顶层
      />

      {/* NodeResizeControl */}
      <NodeResizeControl
        minWidth={Math.max(minWidth, minBounds.width)}
        minHeight={Math.max(
          minHeight + headerHeight + footerHeight,
          minBounds.height + headerHeight + footerHeight
        )}
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        style={{
          position: "absolute",
          right: 4,
          bottom: 4,
          width: 20,
          height: 20,
          zIndex: 50, // 高于视觉指示器
          opacity: 0,
          cursor: "nwse-resize",
          pointerEvents: "all",
        }}
      />
    </div>
  );
};

// 获取默认节点标签
function getNodeTypeLabel(type) {
  switch (type) {
    case "START":
      return "开始";
    case "END":
      return "结束";
    case "HTTP":
      return "HTTP";
    case "SQL":
      return "SQL";
    case "REDIS":
      return "Redis";
    case "SCRIPT":
      return "脚本";
    case "SWITCH":
      return "分支";
    case "LOOP":
      return "循环";
    case "SET_VARIABLE":
      return "变量";
    default:
      return type;
  }
}

// 获取节点默认配置
function getDefaultConfig(type) {
  const defaultConfigs = {
    START: {},
    END: {},
    HTTP: {
      url: "",
      method: "GET",
      headers: {},
      body: "",
      timeout: 30000,
    },
    SQL: {
      dataSourceCode: "",
      operation: "QUERY",
      sql: "",
      params: [],
    },
    REDIS: {
      dataSourceCode: "",
      operation: "GET",
      key: "",
      expire: 3600,
    },
    SCRIPT: {
      language: "javascript",
      code: "// 在此编写脚本代码\nfunction process(input) {\n  // 处理输入数据\n  return input;\n}",
    },
    SWITCH: {
      expression: "#{payload}",
      cases: [],
      default: "",
    },
    LOOP: {
      mode: "WHILE",
      condition: "#{index < 10}",
      initialization: "#{index = 0}",
      maxIterations: 1000,
      subflow: {
        height: 154,
        width: 320,
        nodes: [],
        edges: [],
      },
    },
    SET_VARIABLE: {
      variables: {},
    },
  };

  return JSON.parse(JSON.stringify(defaultConfigs[type] || {}));
}

export default SubflowLoopNode;
