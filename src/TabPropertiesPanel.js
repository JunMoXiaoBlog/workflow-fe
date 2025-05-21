// TabPropertiesPanel.js - 完整代码
import React, { useState, useEffect } from "react";
import { Form } from "@rjsf/semantic-ui";
import validator from "@rjsf/validator-ajv8";
import { Tab, Message, Header } from "semantic-ui-react";

// 导入自定义字段和小部件
import { customFields, customWidgets } from "./components/fields/schemaLoader";
import LoopProperties from "./components/LoopProperties";
import ErrorHandlingTab from "./ErrorHandlingTab";

// 导入节点配置加载器
import NodeConfigLoader from "./NodeConfigLoader";

// 获取节点的连接信息
const getNodeConnections = (nodeId, edges) => {
  // 找到所有以这个节点为源的边
  const nodeEdges = edges.filter((edge) => edge.source === nodeId);

  // 创建连接信息映射
  const connections = {};

  nodeEdges.forEach((edge) => {
    if (edge.sourceHandle) {
      // 对于SWITCH节点
      if (edge.sourceHandle.startsWith("case-")) {
        // 提取case索引，格式为case-0, case-1等
        connections[edge.sourceHandle] = true;
      } else if (edge.sourceHandle === "default") {
        connections["default"] = true;
      }
    }
  });

  return connections;
};

// 空面板组件
const EmptyPanel = () => {
  return (
    <div className="properties-panel">
      <h3>节点属性</h3>
      <div id="properties-content">
        <p>请选择一个节点进行编辑</p>
      </div>
    </div>
  );
};

// 错误面板组件
const ErrorPanel = ({ nodeType }) => {
  return (
    <div className="properties-panel">
      <h3>节点属性</h3>
      <div id="properties-content">
        <Message negative>
          <Message.Header>配置错误</Message.Header>
          <p>未找到节点类型 "{nodeType}" 的配置信息</p>
        </Message>
      </div>
    </div>
  );
};

// 循环节点面板
const LoopNodePanel = ({ node, updateNode, nodes }) => {
  return (
    <div>
      <LoopProperties node={node} updateNode={updateNode} nodes={nodes} />
    </div>
  );
};

// 标准节点面板
const StandardNodePanel = ({
  selectedNode,
  updateNodeProperties,
  allNodes,
  allEdges,
  onDeleteEdge,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [loadingActions, setLoadingActions] = useState({});
  const [debugError, setDebugError] = useState(null);
  const [nodeDataJson, setNodeDataJson] = useState("{}");
  const [formKey, setFormKey] = useState(0);

  // 从配置加载器获取节点类型对应的配置
  const nodeSchema = NodeConfigLoader.getNodeSchema(selectedNode.type);
  const nodeUiSchema = NodeConfigLoader.getNodeUiSchema(selectedNode.type);
  const panelConfig = NodeConfigLoader.getPanelConfig(selectedNode.type);

  // 获取节点连接状态
  const connections = getNodeConnections(selectedNode.id, allEdges || []);

  // 处理删除分支边的回调
  const handleDeleteBranchEdge = (nodeId, sourceHandle) => {
    if (onDeleteEdge) {
      onDeleteEdge(nodeId, sourceHandle);
    }
  };

  // 如果没有找到配置，显示错误信息
  if (!nodeSchema || !nodeUiSchema || !panelConfig) {
    return <ErrorPanel nodeType={selectedNode.type} />;
  }

  // 准备表单数据
  const baseFormData = selectedNode.data.config || {};
  const formData = {
    ...baseFormData,
    nodeType: selectedNode.type,
    nodeId: selectedNode.id,
  };

  // 更新节点JSON数据
  useEffect(() => {
    try {
      // 创建节点数据的JSON表示，排除内部实现细节
      const nodeDataForJson = {
        id: selectedNode.id,
        type: selectedNode.type,
        label: selectedNode.data.label,
        config: { ...selectedNode.data.config },
      };

      // 删除不需要在JSON中显示的内部属性
      if (nodeDataForJson.config) {
        delete nodeDataForJson.config.nodeJsonData;
        delete nodeDataForJson.config.debugResult;
      }

      // 格式化JSON字符串
      const jsonStr = JSON.stringify(nodeDataForJson, null, 2);
      setNodeDataJson(jsonStr);

      // 更新节点属性中的nodeJsonData字段
      if (formData.nodeJsonData !== jsonStr) {
        updateNodeProperties(selectedNode.id, {
          config: {
            ...selectedNode.data.config,
            nodeJsonData: jsonStr,
          },
        });
      }
    } catch (error) {
      console.error("创建节点JSON数据时出错:", error);
    }
  }, [selectedNode, updateNodeProperties]);

  // 当内容类型变化时重新渲染表单
  useEffect(() => {
    if (
      selectedNode.type === "HTTP" &&
      selectedNode.data?.config?.contentType
    ) {
      setFormKey((prev) => prev + 1);
    }
  }, [selectedNode.id, selectedNode.data?.config?.contentType]);

  // 从schema中提取特定标签页需要的属性
  const createPanelSchema = (schema, fieldList, tabId) => {
    if (!schema || !schema.properties) {
      return { type: "object", properties: {} };
    }

    const filteredProperties = {};

    // 特殊处理文档标签页
    if (tabId === "docs") {
      filteredProperties.documentation = {
        type: "string",
        title: "文档",
        default: "",
      };
      return {
        type: "object",
        properties: filteredProperties,
      };
    }

    // 添加标签页中指定的字段
    fieldList.forEach((field) => {
      if (schema.properties[field]) {
        filteredProperties[field] = schema.properties[field];
      }
    });

    // 处理dependencies
    const dependencies = {};
    if (schema.dependencies) {
      Object.keys(schema.dependencies).forEach((key) => {
        if (fieldList.includes(key)) {
          dependencies[key] = schema.dependencies[key];
        }
      });
    }

    return {
      ...schema,
      properties: filteredProperties,
      required: (schema.required || []).filter((prop) =>
        fieldList.includes(prop)
      ),
      dependencies:
        Object.keys(dependencies).length > 0 ? dependencies : undefined,
    };
  };

  // 从uiSchema中提取特定标签页需要的配置
  const createPanelUiSchema = (uiSchema, fieldList, tabId, nodeType) => {
    if (!uiSchema) return {};

    // 特殊处理文档标签页
    if (tabId === "docs") {
      // 获取节点文档路径
      const docPath = NodeConfigLoader.getNodeDocPath(nodeType);
      return {
        documentation: {
          "ui:field": "MarkdownDocField",
          "ui:options": {
            docPath,
          },
        },
        // 添加这一行来隐藏提交按钮
        "ui:submitButtonOptions": {
          norender: true,
        },
      };
    }

    const filteredUiSchema = {};

    // 复制全局UI配置
    Object.keys(uiSchema).forEach((key) => {
      if (key.startsWith("ui:")) {
        filteredUiSchema[key] = uiSchema[key];
      }
    });

    // 只复制指定字段的UI配置
    fieldList.forEach((field) => {
      if (uiSchema[field]) {
        filteredUiSchema[field] = uiSchema[field];
      }
    });

    // 处理contentType的特殊依赖
    if (
      fieldList.includes("contentType") &&
      uiSchema["ui:dependencies"]?.contentType
    ) {
      if (!filteredUiSchema["ui:dependencies"]) {
        filteredUiSchema["ui:dependencies"] = {};
      }
      filteredUiSchema["ui:dependencies"].contentType =
        uiSchema["ui:dependencies"].contentType;
    }

    return filteredUiSchema;
  };

  // 处理表单变更
  const handleChange = ({ formData: newFormData }, panelName) => {
    // 从表单数据中移除不需要存储的字段
    const { nodeJsonData, ...configData } = newFormData;

    // 特殊处理HTTP节点的form-data和x-www-form-urlencoded请求体
    if (selectedNode.type === "HTTP") {
      if (
        configData.contentType === "form-data" ||
        configData.contentType === "x-www-form-urlencoded"
      ) {
        // 确保body是对象类型
        if (
          typeof configData.body === "string" &&
          configData.body.trim() !== ""
        ) {
          try {
            // 尝试将字符串解析为对象
            configData.body = JSON.parse(configData.body);
          } catch (e) {
            console.warn("无法解析body字符串为对象:", configData.body);
            // 如果无法解析，使用空对象
            configData.body = {};
          }
        } else if (!configData.body || typeof configData.body !== "object") {
          configData.body = {};
        }
      }

      // 检查内容类型是否变更
      const contentTypeChanged =
        selectedNode.data.config?.contentType !== configData.contentType;
      if (contentTypeChanged) {
        // 内容类型变更，在下一个执行周期重新渲染表单
        setTimeout(() => setFormKey((prev) => prev + 1), 0);
      }
    }

    // 合并当前节点的配置与新的表单数据
    const currentConfig = selectedNode.data.config || {};
    const updatedConfig = { ...currentConfig, ...configData };

    updateNodeProperties(selectedNode.id, {
      config: updatedConfig,
    });
  };

  // 处理调试按钮点击
  const handleDebug = async (formData) => {
    // 设置正在加载的动作
    setLoadingActions((prev) => ({ ...prev, debug: true }));
    setDebugError(null);

    try {
      // 模拟调试API调用
      const debugParams = formData.debugParams || "{}";
      let parsedParams;

      try {
        parsedParams = JSON.parse(debugParams);
      } catch (e) {
        throw new Error("调试参数必须是有效的JSON格式");
      }

      // 这里实际项目中应该是一个API调用
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 根据节点类型生成不同的模拟调试结果
      let debugResult;

      switch (selectedNode.type) {
        case "HTTP":
          debugResult = {
            success: true,
            data: {
              statusCode: 200,
              headers: {
                "content-type": "application/json",
              },
              body: {
                message: "操作成功",
                data: parsedParams,
              },
              executionTime: 120,
              timestamp: new Date().toISOString(),
              nodeId: selectedNode.id,
            },
          };
          break;

        case "SQL":
          debugResult = {
            success: true,
            data: {
              results: [
                { id: 1, name: "示例数据1" },
                { id: 2, name: "示例数据2" },
              ],
              affectedRows: 2,
              executionTime: 85,
              timestamp: new Date().toISOString(),
              nodeId: selectedNode.id,
            },
          };
          break;

        case "REDIS":
          debugResult = {
            success: true,
            data: {
              result: formData.operation === "GET" ? "缓存数据示例" : "OK",
              executionTime: 15,
              timestamp: new Date().toISOString(),
              nodeId: selectedNode.id,
            },
          };
          break;

        case "SWITCH":
          debugResult = {
            success: true,
            data: {
              evaluatedExpression: formData.expression,
              result: "条件分支1",
              selectedPath: "分支1",
              timestamp: new Date().toISOString(),
              nodeId: selectedNode.id,
            },
          };
          break;

        case "SCRIPT":
          debugResult = {
            success: true,
            data: {
              result: { processedData: "脚本执行结果" },
              executionTime: 45,
              timestamp: new Date().toISOString(),
              nodeId: selectedNode.id,
            },
          };
          break;

        case "SET_VARIABLE":
          debugResult = {
            success: true,
            data: {
              variables: formData.variables || {},
              context: "变量设置完成",
              timestamp: new Date().toISOString(),
              nodeId: selectedNode.id,
            },
          };
          break;

        case "START":
          debugResult = {
            success: true,
            data: {
              flowStarted: true,
              initialPayload: parsedParams,
              timestamp: new Date().toISOString(),
              nodeId: selectedNode.id,
              sessionId: "debug-" + Math.random().toString(36).substring(2, 11),
            },
          };
          break;

        default:
          debugResult = {
            success: true,
            data: {
              result: "节点执行完成",
              params: parsedParams,
              timestamp: new Date().toISOString(),
              nodeId: selectedNode.id,
            },
          };
      }

      // 更新节点属性，写入调试结果
      const { nodeJsonData, ...configData } = formData;

      // 合并当前节点的配置与调试结果
      const currentConfig = selectedNode.data.config || {};
      const updatedConfig = {
        ...currentConfig,
        ...configData,
        debugResult: JSON.stringify(debugResult, null, 2),
      };

      updateNodeProperties(selectedNode.id, {
        config: updatedConfig,
      });
    } catch (error) {
      setDebugError(error.message || "调试过程中发生错误");

      // 更新节点属性，写入错误信息
      const { nodeJsonData, ...configData } = formData;

      // 合并当前节点的配置与错误信息
      const currentConfig = selectedNode.data.config || {};
      const updatedConfig = {
        ...currentConfig,
        ...configData,
        debugResult: JSON.stringify(
          {
            success: false,
            error: error.message || "调试过程中发生错误",
          },
          null,
          2
        ),
      };

      updateNodeProperties(selectedNode.id, {
        config: updatedConfig,
      });
    } finally {
      // 清除加载状态
      setLoadingActions((prev) => ({ ...prev, debug: false }));
    }
  };

  // 构建动作处理函数集合
  const actions = {
    debug: handleDebug,
    export: () => console.log("导出操作"),
    test: () => console.log("测试操作"),
  };

  // 处理Tab切换
  const handleTabChange = (e, { activeIndex }) => {
    setActiveTabIndex(activeIndex);
  };

  // 根据面板配置创建标签页
  const panes = panelConfig.tabs.map((tab) => {
    // 对于异常处理标签页，使用自定义组件
    if (tab.id === "error") {
      return {
        menuItem: tab.title,
        render: () => (
          <Tab.Pane attached={false}>
            <ErrorHandlingTab
              selectedNode={selectedNode}
              updateNodeProperties={updateNodeProperties}
            />
          </Tab.Pane>
        ),
      };
    }

    // 创建该标签页的schema和uiSchema
    const tabSchema = createPanelSchema(nodeSchema, tab.fields, tab.id);
    const tabUiSchema = createPanelUiSchema(
      nodeUiSchema,
      tab.fields,
      tab.id,
      selectedNode.type
    );

    // 使用tab.id和formKey生成唯一的表单key
    const tabFormKey = `${selectedNode.type}-${tab.id}-${formKey}`;

    return {
      menuItem: tab.title,
      render: () => (
        <Tab.Pane attached={false}>
          {tab.id === "debug" && debugError && (
            <Message negative>
              <Message.Header>调试错误</Message.Header>
              <p>{debugError}</p>
            </Message>
          )}
          <Form
            key={tabFormKey}
            schema={tabSchema}
            uiSchema={tabUiSchema}
            formData={formData}
            validator={validator}
            onChange={(formData) => handleChange(formData, tab.id)}
            liveValidate={true}
            showErrorList={false}
            widgets={customWidgets}
            fields={customFields}
            formContext={{
              actions,
              loadingActions,
              language: formData.language,
              contentType: formData.contentType,
              nodeType: selectedNode.type,
              connections: connections, // 添加连接信息
              onDeleteBranchEdge: handleDeleteBranchEdge, // 添加删除边的回调
              nodeId: selectedNode.id, // 传递节点ID
            }}
          />
        </Tab.Pane>
      ),
    };
  });

  return (
    <div className="tab-properties-panel">
      <Tab
        panes={panes}
        activeIndex={activeTabIndex}
        onTabChange={handleTabChange}
        menu={{ secondary: true, pointing: true }}
      />
    </div>
  );
};

// 获取节点类型显示名称
const getNodeTypeDisplayName = (type) => {
  switch (type) {
    case "START":
      return "开始节点";
    case "END":
      return "结束节点";
    case "HTTP":
      return "HTTP节点";
    case "SQL":
      return "SQL节点";
    case "REDIS":
      return "Redis节点";
    case "SCRIPT":
      return "脚本节点";
    case "SWITCH":
      return "分支节点";
    case "LOOP":
      return "循环节点";
    case "SET_VARIABLE":
      return "变量节点";
    default:
      return `${type}节点`;
  }
};

/**
 * 主面板组件 - 根据节点类型选择不同的面板组件
 */
const TabPropertiesPanel = ({
  selectedNode,
  updateNodeProperties,
  nodes,
  edges,
  onDeleteEdge,
}) => {
  // 没有选中节点的情况
  if (!selectedNode) {
    return <EmptyPanel />;
  }

  // 循环节点使用特殊的面板
  if (selectedNode.type === "LOOP") {
    return (
      <LoopNodePanel
        node={selectedNode}
        updateNode={updateNodeProperties}
        nodes={nodes}
      />
    );
  }

  // 其他节点类型使用标准面板
  return (
    <StandardNodePanel
      selectedNode={selectedNode}
      updateNodeProperties={updateNodeProperties}
      allNodes={nodes}
      allEdges={edges}
      onDeleteEdge={onDeleteEdge}
    />
  );
};

export default TabPropertiesPanel;
