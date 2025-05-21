// WorkflowEditor.js - 完整文件
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  useReactFlow,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";

import { Icon } from "semantic-ui-react";

// 导入子组件
import NodeSidebar from "./NodeSidebar";
import AdvancedResizablePanel from "./AdvancedResizablePanel";
import { nodeTypes } from "./components/nodes";
import LoopProperties from "./components/LoopProperties";
import { generateUUID } from "./utils";
import SimpleZoomIndicator from "./SimpleZoomIndicator";
import GridBackground from "./GridBackground";
import SubflowLoopNode from "./components/SubflowLoopNode";

import { Link } from "react-router-dom";

// 导入节点配置加载器
import NodeConfigLoader from "./NodeConfigLoader";

// 添加边界保护常量
const BOUNDARY_PADDING = 8; // 距离边界的保护距离

// 添加一些基本的流程样式 - 更小的箭头
const edgeOptions = {
  animated: true,
  style: {
    stroke: "#aaaaaa", // 修改为灰色
    strokeWidth: 1.2, // 更细的线
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#aaaaaa", // 箭头颜色也改为灰色
    width: 8, // 更小的箭头
    height: 8, // 更小的箭头
  },
};

// 设置默认视图配置
const defaultViewport = {
  x: 0,
  y: 0,
  zoom: 1, // 默认缩放为100%（从0.75改为1.0）
};

// 获取节点默认配置 - 使用NodeConfigLoader
const getDefaultConfig = (type) => {
  const defaultConfig = NodeConfigLoader.getDefaultConfig(type);
  return JSON.parse(JSON.stringify(defaultConfig));
};

// 自定义连线渲染器组件 - 用于确保连线显示
const CustomEdgeRenderer = () => {
  useEffect(() => {
    // 应用样式确保连线可见
    const applyEdgeStyles = () => {
      const edgePaths = document.querySelectorAll(".react-flow__edge-path");
      edgePaths.forEach((path) => {
        path.style.strokeWidth = "2px";
        path.style.stroke = "#aaaaaa";
        path.style.strokeOpacity = "1";
        // 通过改变属性强制更新渲染
        path.style.strokeDasharray = path.style.strokeDasharray || "none";
      });
    };

    // 初始应用并在短暂延迟后再次应用，以捕获ReactFlow内部更新
    applyEdgeStyles();
    const timer = setTimeout(applyEdgeStyles, 300);

    return () => clearTimeout(timer);
  }, []);

  return null; // 无需渲染任何内容
};

// 主应用组件
const WorkflowEditor = () => {
  // 工作流名称状态
  const [workflowName, setWorkflowName] = useState("新业务流程");

  // 节点和边缘状态
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // 选中节点状态
  const [selectedNode, setSelectedNode] = useState(null);

  // 选中边状态
  const [selectedEdges, setSelectedEdges] = useState([]);

  // 添加无效连接状态
  const [invalidConnection, setInvalidConnection] = useState(null);
  const invalidConnectionTimeoutRef = useRef(null);

  // 当前处理的子流程状态
  const [activeSubflow, setActiveSubflow] = useState(null);

  // 循环节点入口图标状态
  const [loopEntryIcon, setLoopEntryIcon] = useState(true);

  // 拖拽状态参考
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // 防止重复拖放的引用标志
  const isDroppingRef = useRef(false);

  // 添加一次性CSS样式，而不是持续操作DOM
  useEffect(() => {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
      /* 关键的连线可见性修复 */
      .react-flow__edges {
        z-index: 1000 !important;
      }
      
      .react-flow__edge {
        z-index: 1000 !important;
        pointer-events: all !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      .react-flow__edge-path {
        stroke: #aaaaaa !important;
        stroke-width: 1.2px !important;
        stroke-opacity: 1 !important;
      }
      
      /* 确保节点层级低于连线 */
      .react-flow__nodes {
        z-index: 10 !important;
      }
      
      /* 确保连接点可以被点击 */
      .react-flow__handle {
        z-index: 2000 !important;
      }
      
      /* 循环节点内部区域 */
      .loop-subflow-area {
        z-index: 5 !important;
      }
      
      .loop-background-dots {
        z-index: 1 !important;
      }
      
      /* 确保处于调整大小状态的节点不会遮挡连线 */
      .loop-container.resizing {
        z-index: 20 !important;
      }
      
      /* 连接点超过一切其他元素 */
      .entry-handle-out, .react-flow__handle {
        z-index: 2000 !important;
      }
      
      /* 添加选中状态样式 */
      .react-flow__edge.selected .react-flow__edge-path {
        stroke: #1a73e8 !important; /* 选中后蓝色 */
        stroke-width: 2px !important;
      }
      
      /* 确保选中状态的边在其他边上方 */
      .react-flow__edge.selected {
        z-index: 1001 !important;
      }
    `;
    document.head.appendChild(style);

    // 应用一次性样式，但不进行持续操作
    const applyInitialStyles = () => {
      // 修复所有连线路径
      const edgePaths = document.querySelectorAll(".react-flow__edge-path");
      edgePaths.forEach((path) => {
        path.style.strokeWidth = "1.2px";
        path.style.stroke = "#aaaaaa";
        path.style.strokeOpacity = "1";
      });

      // 确保连线容器在节点上方
      const edgesContainer = document.querySelector(".react-flow__edges");
      if (edgesContainer) {
        edgesContainer.style.zIndex = "1000";
      }
    };

    // 初始应用样式
    applyInitialStyles();

    // 在短暂延迟后再次应用，以应对初始渲染后的情况
    const timeoutId = setTimeout(applyInitialStyles, 500);

    return () => {
      // 清理函数
      document.head.removeChild(style);
      clearTimeout(timeoutId);
    };
  }, []); // 只在组件挂载时执行一次

  // 加载图标 - 直接设置为true
  const loadEntryIcon = useCallback(() => {
    setLoopEntryIcon(true);
  }, []);

  // 在组件挂载时加载图标
  useEffect(() => {
    loadEntryIcon();
  }, [loadEntryIcon]);

  // 动态创建nodeTypes以传递循环入口图标
  const customNodeTypes = useMemo(
    () => ({
      START: nodeTypes.START,
      END: nodeTypes.END,
      HTTP: nodeTypes.HTTP,
      SQL: nodeTypes.SQL,
      REDIS: nodeTypes.REDIS,
      SWITCH: nodeTypes.SWITCH,
      LOOP: (props) => <SubflowLoopNode {...props} entryIcon={loopEntryIcon} />,
      SCRIPT: nodeTypes.SCRIPT,
      SET_VARIABLE: nodeTypes.SET_VARIABLE,
    }),
    [loopEntryIcon]
  );

  // 边样式计算函数
  const getEdgeStyle = useCallback(
    (edge) => {
      // 基本样式
      const style = {
        ...edgeOptions.style,
      };

      // 如果边被选中，则使用蓝色
      if (selectedEdges.includes(edge.id)) {
        style.stroke = "#1a73e8";
        style.strokeWidth = 2;
      }

      return style;
    },
    [selectedEdges]
  );

  // 显示无效连接提示
  const showInvalidConnection = (connection, message) => {
    setInvalidConnection({ ...connection, message });

    // 清除已有的超时
    if (invalidConnectionTimeoutRef.current) {
      clearTimeout(invalidConnectionTimeoutRef.current);
    }

    // 设置新的超时以清除无效连接消息
    invalidConnectionTimeoutRef.current = setTimeout(() => {
      setInvalidConnection(null);
    }, 3000);
  };

  // 更新节点内部配置
  const updateNodeInternally = useCallback(
    (nodeId, newData) => {
      console.log("Updating node internally:", nodeId, newData);

      // 确保配置数据中不包含 nodeType 和 nodeId
      if (newData.config) {
        const {
          nodeType,
          nodeId: configNodeId,
          ...configWithoutMetadata
        } = newData.config;

        // 添加调试日志，确认移除的ID
        console.log("更新节点内部 - ID检查:", {
          actualNodeId: nodeId,
          configNodeId: configNodeId, // 被移除的ID
          newConfig: configWithoutMetadata,
        });

        // 使用过滤后的配置数据
        newData.config = configWithoutMetadata;
      }

      // 使用 requestAnimationFrame 优化性能
      requestAnimationFrame(() => {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              // 深度合并配置
              let updatedConfig = { ...node.data.config };

              // 确保配置中没有nodeType和nodeId字段
              delete updatedConfig.nodeType;
              delete updatedConfig.nodeId;

              // 如果新数据包含 config
              if (newData.config) {
                // 处理常规配置属性
                Object.keys(newData.config).forEach((key) => {
                  if (key !== "subflow") {
                    updatedConfig[key] = newData.config[key];
                  }
                });

                // 单独处理 subflow，确保深度合并
                if (newData.config.subflow) {
                  updatedConfig.subflow = {
                    ...updatedConfig.subflow,
                    ...newData.config.subflow,
                  };
                }
              }

              // 创建更新后的节点数据
              const updatedData = {
                ...node.data,
                ...newData,
                config: updatedConfig,
                // 保留 updateNodeInternally 函数引用
                updateNodeInternally,
              };

              return {
                ...node,
                data: updatedData,
              };
            }
            return node;
          })
        );

        // 如果选中的节点是当前更新的节点，也更新选中状态
        if (selectedNode && selectedNode.id === nodeId) {
          setSelectedNode((prevNode) => {
            if (!prevNode) return null;

            // 深度合并配置
            let updatedConfig = { ...prevNode.data.config };

            // 确保配置中没有nodeType和nodeId字段
            delete updatedConfig.nodeType;
            delete updatedConfig.nodeId;

            // 如果新数据包含 config
            if (newData.config) {
              // 处理常规配置属性
              Object.keys(newData.config).forEach((key) => {
                if (key !== "subflow") {
                  updatedConfig[key] = newData.config[key];
                }
              });

              // 单独处理 subflow，确保深度合并
              if (newData.config.subflow) {
                updatedConfig.subflow = {
                  ...updatedConfig.subflow,
                  ...newData.config.subflow,
                };
              }
            }

            // 创建更新后的节点数据
            const updatedData = {
              ...prevNode.data,
              ...newData,
              config: updatedConfig,
              // 保留 updateNodeInternally 函数引用
              updateNodeInternally,
            };

            return {
              ...prevNode,
              data: updatedData,
            };
          });
        }
      });
    },
    [selectedNode, setNodes, setSelectedNode]
  );

  // 更新节点属性
  const updateNodeProperties = useCallback(
    (nodeId, newData) => {
      // 确保配置数据中不包含 nodeType 和 nodeId
      if (newData.config) {
        const {
          nodeType,
          nodeId: configNodeId,
          ...configData
        } = newData.config;

        // 添加调试日志，确认移除的ID
        console.log("更新节点属性 - ID检查:", {
          actualNodeId: nodeId,
          configNodeId: configNodeId, // 被移除的ID
          newConfig: configData,
        });

        // 使用过滤后的配置数据
        newData.config = configData;
      }

      // 检查是否在更新循环节点的子流程配置
      if (
        newData.config?.subflow?.nodes &&
        newData.config.subflow.nodes.length > 0
      ) {
        // 检查重复节点
        const uniqueNodes = [];
        const nodeIds = new Set();

        newData.config.subflow.nodes.forEach((node) => {
          if (!nodeIds.has(node.id)) {
            nodeIds.add(node.id);
            uniqueNodes.push(node);
          }
        });

        // 使用过滤后的唯一节点列表
        newData.config.subflow.nodes = uniqueNodes;
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
                // 保留updateNodeInternally引用
                updateNodeInternally,
              },
            };
          }
          return node;
        })
      );

      // 更新选中节点的信息
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prevNode) => {
          if (!prevNode) return null;
          return {
            ...prevNode,
            data: {
              ...prevNode.data,
              ...newData,
              updateNodeInternally,
            },
          };
        });
      }
    },
    [selectedNode, updateNodeInternally]
  );

  // 处理节点变化
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);

        // 检查节点移动是否超出父节点边界
        changes.forEach((change) => {
          if (change.type === "position" && change.dragging) {
            const node = nds.find((n) => n.id === change.id);
            if (node && node.parentNode) {
              const parentNode = nds.find((n) => n.id === node.parentNode);
              if (parentNode && parentNode.type === "LOOP") {
                // 父节点的子流程区域尺寸
                const parentWidth =
                  parentNode.data.config?.subflow?.width || 320;
                const parentHeight =
                  parentNode.data.config?.subflow?.height || 154;

                // 获取子节点的准确尺寸 - 更精确获取
                let nodeWidth = 220;
                let nodeHeight;

                // 根据节点类型调整预估尺寸
                switch (node.type) {
                  case "SWITCH":
                    // 分支节点高度取决于分支数量
                    const casesCount = node.data?.config?.cases?.length || 0;
                    nodeHeight = 24 + (casesCount + 1) * 24;
                    break;
                  case "LOOP":
                    // 循环节点高度包括头部、子流程区域和底部
                    const subflowHeight =
                      node.data?.config?.subflow?.height || 154;
                    const headerHeight = 34;
                    const footerHeight = 12;
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
                  default:
                    nodeHeight = 80; // 默认高度
                }

                // 如果节点有明确的宽高定义，使用实际尺寸
                if (node.width && node.height) {
                  nodeWidth = node.width;
                  nodeHeight = node.height;
                }

                // 计算边界，添加保护距离，并考虑节点自身的尺寸
                const minX = BOUNDARY_PADDING + 15;
                const minY = BOUNDARY_PADDING + 34;
                // 注意：对于底部边界，我们需要确保不超出
                const maxX = parentWidth - nodeWidth - BOUNDARY_PADDING - 10;
                const maxY = parentHeight - nodeHeight - BOUNDARY_PADDING + 34;

                // 检查并调整节点位置，确保子节点完全在边界内
                let correctedX = Math.max(
                  minX,
                  Math.min(maxX, change.position.x)
                );
                let correctedY = Math.max(
                  minY,
                  Math.min(maxY, change.position.y)
                );

                // 查找并更新节点位置
                const nodeIndex = newNodes.findIndex((n) => n.id === change.id);
                if (nodeIndex >= 0) {
                  newNodes[nodeIndex].position = {
                    x: correctedX,
                    y: correctedY,
                  };
                }
              }
            }
          }
        });

        return newNodes;
      });

      // 清除选择如果节点被删除
      changes.forEach((change) => {
        if (
          change.type === "remove" &&
          selectedNode &&
          selectedNode.id === change.id
        ) {
          setSelectedNode(null);
        }
      });
    },
    [selectedNode]
  );

  // 处理连接
  const onConnect = useCallback(
    (connection) => {
      console.log("连接请求:", connection);

      // 获取源节点和目标节点
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) {
        console.log("未找到源节点或目标节点，取消连接");
        return;
      }

      // 检查是否从入口点连接
      const isEntryPointConnection = connection.sourceHandle === "entry-out";

      // 获取父节点信息
      const sourceParent = sourceNode.parentNode;
      const targetParent = targetNode.parentNode;

      console.log("连接详情:", {
        sourceId: connection.source,
        sourceType: sourceNode.type,
        sourceParent,
        targetId: connection.target,
        targetType: targetNode.type,
        targetParent,
        isEntryPointConnection,
        sourceHandle: connection.sourceHandle,
      });

      // 检查连接约束条件

      // 规则1: 结束节点不能有输出连接
      if (sourceNode.type === "END") {
        showInvalidConnection(connection, "结束节点不能有输出连接");
        console.log("结束节点不能有输出连接，取消连接");
        return;
      }

      // 关键修复: 入口点连接的特殊处理
      if (isEntryPointConnection) {
        // 对于入口点连接，源节点是循环节点本身，目标节点应该是该循环节点的子节点
        // 所以要检查: 源节点ID === 目标节点的父节点
        if (connection.source === targetParent) {
          console.log("循环入口点连接到子节点，允许连接");
          // 允许连接，继续处理
        } else {
          console.log("循环入口点只能连接到同一循环内的节点，取消连接");
          showInvalidConnection(
            connection,
            "循环入口点只能连接到同一循环内的节点"
          );
          return;
        }
      }
      // 循环内节点连接循环内节点 - 允许同一循环内部的节点互相连接
      else if (sourceParent && targetParent && sourceParent === targetParent) {
        // 同一个循环内的节点可以互相连接，直接通过这个判断，不做限制
        console.log("同一循环内的节点连接，允许连接");
      }
      // 规则3: 循环外部节点不能连接到循环内部节点
      else if (!sourceParent && targetParent && !isEntryPointConnection) {
        // 注意: 这里添加 !isEntryPointConnection 避免与入口点连接规则冲突
        console.log("外部节点不能连接到循环内部节点，取消连接");
        showInvalidConnection(
          connection,
          "不允许从循环外部节点连接到循环内部节点"
        );
        return;
      }
      // 规则4: 循环内部节点不能连接到循环外部节点
      else if (sourceParent && !targetParent) {
        console.log("循环内部节点不能连接到外部节点，取消连接");
        showInvalidConnection(
          connection,
          "不允许从循环内部节点连接到循环外部节点"
        );
        return;
      }
      // 规则5: 不同循环内的节点不能相互连接
      else if (sourceParent && targetParent && sourceParent !== targetParent) {
        console.log("不同循环内的节点不能相互连接，取消连接");
        showInvalidConnection(connection, "不允许连接不同循环内的节点");
        return;
      }

      // 所有检查通过，添加边缘
      console.log("所有检查通过，添加连接");
      // 添加唯一ID便于识别
      const edgeId = `e-${connection.source}-${
        connection.target
      }-${Date.now()}`;

      setEdges((edges) =>
        addEdge(
          {
            ...connection,
            ...edgeOptions,
            id: edgeId,
          },
          edges
        )
      );

      // 如果连接是入口点到循环内节点，添加到子流程配置
      if (isEntryPointConnection && connection.source === targetParent) {
        const loopNode = nodes.find((node) => node.id === connection.source);
        if (loopNode && loopNode.type === "LOOP") {
          // 检查边是否已存在
          const newEdgeId = `e-entry-${connection.target}`;
          const existingEdges = loopNode.data.config?.subflow?.edges || [];

          // 如果边不存在，才添加
          if (
            !existingEdges.some(
              (edge) =>
                edge.source === connection.source &&
                edge.sourceHandle === "entry-out" &&
                edge.target === connection.target
            )
          ) {
            // 添加到子流程边缘
            const newEdge = {
              id: newEdgeId,
              source: connection.source,
              sourceHandle: "entry-out",
              target: connection.target,
              targetHandle: connection.targetHandle,
              ...edgeOptions,
            };

            const updatedSubflowEdges = [...existingEdges, newEdge];

            // 更新循环节点配置
            console.log("更新循环节点子流程边缘配置 - 入口点连接");
            updateNodeProperties(loopNode.id, {
              config: {
                ...loopNode.data.config,
                subflow: {
                  ...loopNode.data.config?.subflow,
                  edges: updatedSubflowEdges,
                },
              },
            });
          }
        }
      }
      // 如果连接是在同一循环内的节点之间，更新循环节点的子流程配置
      else if (sourceParent && targetParent && sourceParent === targetParent) {
        // 在相同循环节点内部的连接，更新循环节点配置
        const loopNode = nodes.find((node) => node.id === sourceParent);
        if (loopNode && loopNode.type === "LOOP") {
          // 检查边是否已存在
          const newEdgeId = `e-${connection.source}-${connection.target}`;
          const existingEdges = loopNode.data.config?.subflow?.edges || [];

          // 如果边不存在，才添加
          if (
            !existingEdges.some(
              (edge) =>
                edge.source === connection.source &&
                edge.target === connection.target
            )
          ) {
            // 添加到子流程边缘
            const newEdge = {
              id: newEdgeId,
              source: connection.source,
              target: connection.target,
              sourceHandle: connection.sourceHandle,
              targetHandle: connection.targetHandle,
              ...edgeOptions,
            };

            const updatedSubflowEdges = [...existingEdges, newEdge];

            // 更新循环节点配置
            console.log("更新循环节点子流程边缘配置 - 内部节点连接");
            updateNodeProperties(loopNode.id, {
              config: {
                ...loopNode.data.config,
                subflow: {
                  ...loopNode.data.config?.subflow,
                  edges: updatedSubflowEdges,
                },
              },
            });
          }
        }
      }

      // 连接成功后强制应用样式以确保边缘可见
      setTimeout(() => {
        // 找到所有边缘路径元素并应用样式
        const edgePaths = document.querySelectorAll(".react-flow__edge-path");
        edgePaths.forEach((path) => {
          path.style.strokeWidth = "1.2px";
          path.style.stroke = "#aaaaaa";
          path.style.strokeOpacity = "1";

          // 通过改变一个属性来强制更新渲染
          const currentStrokeDasharray = path.style.strokeDasharray;
          path.style.strokeDasharray = currentStrokeDasharray || "none";
        });

        // 确保边缘容器在正确的层级
        const edgesContainer = document.querySelector(".react-flow__edges");
        if (edgesContainer) {
          edgesContainer.style.zIndex = "1000";
        }
      }, 50);
    },
    [nodes, updateNodeProperties]
  );

  // 处理边缘变更
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // 处理边缘点击
  const onEdgeClick = useCallback((event, edge) => {
    // 设置被点击的边为选中状态
    setSelectedEdges([edge.id]);

    // 阻止事件冒泡，避免触发画布点击事件
    event.stopPropagation();
  }, []);

  // 处理节点点击
  const onNodeClick = useCallback(
    (event, node) => {
      // Add updateNodeInternally function to the node data
      const nodeWithUpdater = {
        ...node,
        data: {
          ...node.data,
          updateNodeInternally,
        },
      };

      // Always set the clicked node as selected, regardless of whether it's a child or parent
      setSelectedNode(nodeWithUpdater);
    },
    [updateNodeInternally]
  );

  // 处理节点拖动
  const onNodeDrag = useCallback((event, node) => {
    // 在拖动时添加标记类，可用于CSS选择器优化渲染
    document
      .querySelectorAll(`.react-flow__node[data-id="${node.id}"]`)
      .forEach((el) => {
        el.classList.add("dragging");
      });

    // 发布节点拖动事件，用于在SubflowLoopNode中捕获和显示坐标
    if (node.parentNode) {
      const customEvent = new CustomEvent("node-drag", {
        detail: {
          nodeId: node.id,
          parentId: node.parentNode,
          position: node.position,
          type: node.type,
        },
      });
      document.dispatchEvent(customEvent);
    }
  }, []);

  // 处理节点拖动开始
  const onNodeDragStart = useCallback((event, node) => {
    // 发布节点拖动开始事件
    if (node.parentNode) {
      const customEvent = new CustomEvent("node-drag-start", {
        detail: {
          nodeId: node.id,
          parentId: node.parentNode,
          position: node.position,
          type: node.type,
        },
      });
      document.dispatchEvent(customEvent);
    }
  }, []);

  // 处理节点拖动结束
  const onNodeDragStop = useCallback((event, node) => {
    // 停止拖动时移除标记类
    document.querySelectorAll(".react-flow__node.dragging").forEach((el) => {
      el.classList.remove("dragging");
    });

    // 发布节点拖动结束事件
    if (node.parentNode) {
      const customEvent = new CustomEvent("node-drag-stop", {
        detail: {
          nodeId: node.id,
          parentId: node.parentNode,
          position: node.position,
          type: node.type,
        },
      });
      document.dispatchEvent(customEvent);
    }
  }, []);

  // 处理背景点击
  const onPaneClick = () => {
    setSelectedNode(null);
    // 清除线条选中状态
    setSelectedEdges([]);
    // 取消活动子流程
    setActiveSubflow(null);
  };

  // 处理背景拖拽完成
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // 处理拖拽释放
  const onDrop = useCallback(
    (event) => {
      // 检查是否来自子流程区域的事件冒泡，如果是则忽略
      const isSubflowDrop = event.target.closest(".loop-subflow-area");
      if (isSubflowDrop) {
        return;
      }

      // 防止重复处理同一事件
      if (isDroppingRef.current) return;
      isDroppingRef.current = true;

      event.preventDefault();

      // 获取拖拽数据
      const nodeType = event.dataTransfer.getData("application/reactflow/type");
      if (!nodeType) {
        isDroppingRef.current = false;
        return;
      }

      // 获取拖拽位置
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 创建唯一ID，避免ID冲突 - 使用独立的32位字符串
      const uniqueId = generateUUID();

      // 创建新节点
      const newNode = {
        id: uniqueId,
        type: nodeType,
        position,
        // 明确设置为非子节点
        parentNode: null,
        draggable: true,
        data: {
          label: getNodeTypeDisplayName(nodeType),
          config: getDefaultConfig(nodeType),
          // 添加updateNodeInternally函数到节点数据
          updateNodeInternally,
        },
      };

      // 创建节点前的约束检查
      if (
        nodeType === "START" &&
        nodes.some((node) => node.type === "START" && !node.parentNode)
      ) {
        alert("流程中只能有一个开始节点!");
        isDroppingRef.current = false;
        return;
      }

      if (
        nodeType === "END" &&
        nodes.some((node) => node.type === "END" && !node.parentNode)
      ) {
        alert("流程中只能有一个结束节点!");
        isDroppingRef.current = false;
        return;
      }

      // 添加新节点
      setNodes((nds) => nds.concat(newNode));

      // 自动选择新创建的节点
      setSelectedNode(newNode);

      // 使用setTimeout重置标志，确保当前事件循环结束后再重置
      setTimeout(() => {
        isDroppingRef.current = false;
      }, 100);
    },
    [reactFlowInstance, nodes, updateNodeInternally]
  );

  // 获取节点类型显示名称
  const getNodeTypeDisplayName = (type) => {
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
  };

  // 保存工作流
  const saveWorkflow = () => {
    // 移除节点数据中的函数引用，以便正确序列化
    const cleanNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        updateNodeInternally: undefined, // 移除函数引用
      },
    }));

    const workflow = {
      name: workflowName,
      version: 1,
      nodes: cleanNodes,
      edges: edges,
    };

    alert("流程已准备好保存!");
    console.log("工作流数据:", workflow);
    document.getElementById("workflow-json").value = JSON.stringify(
      workflow,
      null,
      2
    );
  };

  // 加载工作流
  const loadWorkflow = () => {
    try {
      const jsonContent = document.getElementById("workflow-json").value;
      if (!jsonContent) {
        alert("请先导出或输入JSON");
        return;
      }

      const workflow = JSON.parse(jsonContent);
      setWorkflowName(workflow.name || "新业务流程");

      // 添加updateNodeInternally函数到所有节点
      const nodesWithUpdater = (workflow.nodes || []).map((node) => ({
        ...node,
        data: {
          ...node.data,
          updateNodeInternally,
        },
      }));

      setNodes(nodesWithUpdater);
      setEdges(workflow.edges || []);
      alert("工作流加载成功!");
    } catch (e) {
      alert("JSON格式错误: " + e.message);
    }
  };

  // 清空工作区
  const clearWorkspace = () => {
    if (window.confirm("确定要清空工作区吗？所有未保存的内容将丢失。")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setActiveSubflow(null);
      document.getElementById("workflow-json").value = "";
    }
  };

  // 验证工作流
  const validateWorkflow = () => {
    const errors = [];

    // 检查开始节点
    const startNodes = nodes.filter(
      (node) => node.type === "START" && !node.parentNode
    );
    if (startNodes.length === 0) {
      errors.push("流程缺少开始节点");
    } else if (startNodes.length > 1) {
      errors.push("流程有多个开始节点");
    }

    // 检查结束节点
    const endNodes = nodes.filter(
      (node) => node.type === "END" && !node.parentNode
    );
    if (endNodes.length === 0) {
      errors.push("流程缺少结束节点");
    } else if (endNodes.length > 1) {
      errors.push("流程有多个结束节点");
    }

    // 检查悬空节点（无输入无输出）
    nodes
      .filter((node) => !node.parentNode)
      .forEach((node) => {
        if (node.type !== "START" && node.type !== "END") {
          const incomingEdges = edges.filter((edge) => edge.target === node.id);
          const outgoingEdges = edges.filter((edge) => edge.source === node.id);

          if (incomingEdges.length === 0 && outgoingEdges.length === 0) {
            errors.push(
              `节点"${node.data.label}"(${node.id})悬空，未连接到流程中`
            );
          }
        }
      });

    // 显示验证结果
    if (errors.length === 0) {
      alert("✓ 验证通过：工作流符合所有约束条件。");
    } else {
      alert("✗ 验证失败，请修复以下问题：\n\n" + errors.join("\n"));
    }
  };

  // 处理删除分支边的函数
  const handleDeleteEdge = (nodeId, sourceHandle) => {
    // 找到所有以该节点为源且使用指定sourceHandle的边
    const edgesToDelete = edges.filter(
      (edge) => edge.source === nodeId && edge.sourceHandle === sourceHandle
    );

    if (edgesToDelete.length > 0) {
      // 过滤掉要删除的边
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !(edge.source === nodeId && edge.sourceHandle === sourceHandle)
        )
      );
    }
  };

  // 初始化时处理
  const onInit = (instance) => {
    setReactFlowInstance(instance);

    // 设置默认缩放为100%
    instance.setViewport({
      x: 0,
      y: 0,
      zoom: 1,
    });
  };

  return (
    <div className="workflow-editor">
      <Link to="/flows" className="toolbar-button">
        <Icon name="arrow left" /> 返回列表
      </Link>
      {/* 工具栏 */}
      <div className="toolbar">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="输入流程名称"
          className="workflow-name-input"
        />
        <button onClick={saveWorkflow} className="toolbar-button">
          保存流程
        </button>
        <button onClick={loadWorkflow} className="toolbar-button">
          加载流程
        </button>
        <button onClick={clearWorkspace} className="toolbar-button warning">
          清空工作区
        </button>
        <button onClick={validateWorkflow} className="toolbar-button primary">
          验证工作流
        </button>
      </div>

      {/* 主容器 */}
      <div className="container">
        {/* 侧边栏 */}
        <NodeSidebar />

        {/* 工作流区域 */}
        <div className="workflow-area" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDrag={onNodeDrag}
            onNodeDragStart={onNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={customNodeTypes}
            defaultEdgeOptions={edgeOptions}
            edgesFocusable={true}
            defaultViewport={defaultViewport}
            minZoom={0.2}
            maxZoom={2}
            fitView={false}
            fitViewOptions={{ padding: 0.2 }}
            snapToGrid={false}
            nodesDraggable={true}
            elementsSelectable={true}
            proOptions={{
              hideAttribution: true,
              elevateEdgesOnSelect: true,
            }}
            style={{ zIndex: 0 }}
            className="alternate-dots-flow edge-priority-flow"
          >
            <CustomEdgeRenderer />
            <Controls
              showZoom={true}
              showFitView={true}
              showLock={true}
              position="bottom-left"
              style={{ left: 10, bottom: 10 }}
            />
            <MiniMap
              style={{ right: 10, bottom: 10 }}
              className="workflow-minimap"
              nodeColor={(node) => {
                switch (node.type) {
                  case "START":
                    return "#27ae60";
                  case "END":
                    return "#e74c3c";
                  case "HTTP":
                    return "#3498db";
                  case "SQL":
                    return "#f39c12";
                  case "REDIS":
                    return "#9b59b6";
                  case "SWITCH":
                    return "#1abc9c";
                  case "LOOP":
                    return "#3498db";
                  case "SCRIPT":
                    return "#34495e";
                  case "SET_VARIABLE":
                    return "#f1c40f";
                  default:
                    return "#ccc";
                }
              }}
              maskColor="rgba(255, 255, 255, 0.8)"
            />
            <GridBackground size={16} color="#c0c0c0" bgColor="#f0f0f0" />
          </ReactFlow>
          {reactFlowInstance && (
            <SimpleZoomIndicator reactFlowInstance={reactFlowInstance} />
          )}

          {/* 无效连接提示 */}
          {invalidConnection && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#f44336",
                color: "white",
                padding: "10px 20px",
                borderRadius: "4px",
                zIndex: 1000,
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <strong>连接限制：</strong> {invalidConnection.message}
            </div>
          )}
        </div>

        {/* 属性面板 */}
        <AdvancedResizablePanel
          selectedNode={selectedNode}
          updateNodeProperties={updateNodeProperties}
          nodes={nodes}
          edges={edges}
          onDeleteEdge={handleDeleteEdge}
        />
      </div>

      {/* JSON显示 */}
      <div id="json-display">
        <h3>流程JSON</h3>
        <textarea id="workflow-json"></textarea>
      </div>
    </div>
  );
};

// 导出为 ReactFlowProvider 包装的组件
export default () => (
  <ReactFlowProvider>
    <WorkflowEditor />
  </ReactFlowProvider>
);
