import React, { useState, useEffect, useMemo } from "react";
import { Form } from "@rjsf/semantic-ui";
import validator from "@rjsf/validator-ajv8";
import { Tab, Message, Header } from "semantic-ui-react";
import NodeConfigLoader from "../NodeConfigLoader";
import ErrorHandlingTab from "../ErrorHandlingTab";

import { customFields, customWidgets } from "./fields/schemaLoader";

const LoopProperties = ({ node, updateNode, nodes }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [subflowHeight, setSubflowHeight] = useState(
    node.data.config?.subflow?.height || 154
  );
  const [subflowWidth, setSubflowWidth] = useState(
    node.data.config?.subflow?.width || 320
  );
  const [loadingActions, setLoadingActions] = useState({});
  const [debugError, setDebugError] = useState(null);

  // 从配置加载器获取节点类型对应的配置
  const nodeSchema = NodeConfigLoader.getNodeSchema("LOOP");
  const nodeUiSchema = NodeConfigLoader.getNodeUiSchema("LOOP");
  const panelConfig = NodeConfigLoader.getPanelConfig("LOOP");

  // 处理子流程区域高度变化
  const handleSubflowHeightChange = (height) => {
    setSubflowHeight(height);

    // 更新节点配置
    const newConfig = {
      ...node.data.config,
      subflow: {
        ...node.data.config?.subflow,
        height,
      },
    };

    updateNode(node.id, { config: newConfig });
  };

  // 处理子流程区域宽度变化
  const handleSubflowWidthChange = (width) => {
    setSubflowWidth(width);

    // 更新节点配置
    const newConfig = {
      ...node.data.config,
      subflow: {
        ...node.data.config?.subflow,
        width,
      },
    };

    updateNode(node.id, { config: newConfig });
  };

  // 当节点配置变化时同步状态
  useEffect(() => {
    if (node.data.config?.subflow?.height) {
      setSubflowHeight(node.data.config.subflow.height);
    }
    if (node.data.config?.subflow?.width) {
      setSubflowWidth(node.data.config.subflow.width);
    }
  }, [node.data.config?.subflow?.height, node.data.config?.subflow?.width]);

  // 准备表单数据，包括节点类型和ID
  const formData = useMemo(() => {
    // 从节点获取配置数据
    const baseFormData = node.data.config || {};

    // 添加节点类型和ID
    return {
      ...baseFormData,
      nodeType: node.type,
      nodeId: node.id,
    };
  }, [node.data.config, node.type, node.id]);

  // 从schema中提取特定标签页需要的属性
  const createPanelSchema = (schema, fieldList) => {
    if (!schema || !schema.properties) {
      return { type: "object", properties: {} };
    }

    const filteredProperties = {};

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
  const createPanelUiSchema = (uiSchema, fieldList) => {
    if (!uiSchema) return {};

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

    return filteredUiSchema;
  };

  // 处理表单变更
  const handleChange = ({ formData }, panelName) => {
    // 从表单数据中移除 nodeType 和 nodeId
    const { nodeType, nodeId, ...configData } = formData;

    // 保留子流程配置
    const newConfig = {
      ...configData,
      subflow: {
        ...node.data.config?.subflow,
        height: subflowHeight,
        width: subflowWidth,
      },
    };

    updateNode(node.id, { config: newConfig });
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

      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟调试结果 - 为循环节点返回迭代信息
      const debugResult = {
        success: true,
        data: {
          mode: formData.mode,
          iterations: 5,
          ...parsedParams,
          subflow: {
            executed: true,
            totalNodeCount: node.data.config?.subflow?.nodes?.length || 0,
            executionPath: ["entry", "node1", "node2", "..."],
            iterationLog: [
              { iteration: 1, completed: true },
              { iteration: 2, completed: true },
              { iteration: 3, completed: true },
              { iteration: 4, completed: true },
              { iteration: 5, completed: true },
            ],
          },
          timestamp: new Date().toISOString(),
          nodeId: node.id,
          nodeType: node.type,
          executionId: "debug-" + Math.random().toString(36).substring(2, 11),
        },
      };

      // 更新节点属性，写入调试结果
      const { nodeType, nodeId, ...configData } = formData;

      updateNode(node.id, {
        config: {
          ...configData,
          debugResult: JSON.stringify(debugResult, null, 2),
          subflow: {
            ...node.data.config?.subflow,
            height: subflowHeight,
            width: subflowWidth,
          },
        },
      });
    } catch (error) {
      setDebugError(error.message || "调试过程中发生错误");

      // 更新节点属性，写入错误信息
      const { nodeType, nodeId, ...configData } = formData;

      updateNode(node.id, {
        config: {
          ...configData,
          debugResult: JSON.stringify(
            {
              success: false,
              error: error.message || "调试过程中发生错误",
            },
            null,
            2
          ),
          subflow: {
            ...node.data.config?.subflow,
            height: subflowHeight,
            width: subflowWidth,
          },
        },
      });
    } finally {
      // 清除加载状态
      setLoadingActions((prev) => ({ ...prev, debug: false }));
    }
  };

  // 构建动作处理函数集合
  const actions = {
    debug: handleDebug,
  };

  // 处理Tab切换
  const handleTabChange = (e, { activeIndex }) => {
    setActiveTabIndex(activeIndex);
  };

  // 如果面板配置不存在，显示基本模式
  if (!panelConfig || !nodeSchema || !nodeUiSchema) {
    return (
      <Form
        schema={{
          type: "object",
          properties: {
            mode: {
              type: "string",
              title: "循环模式",
              enum: ["WHILE", "FOR", "FOR_EACH"],
              default: "WHILE",
            },
            condition: {
              type: "string",
              title: "循环条件",
            },
            maxIterations: {
              type: "integer",
              title: "最大迭代次数",
              default: 1000,
            },
          },
        }}
        formData={formData}
        onChange={handleChange}
        validator={validator}
        liveValidate={true}
      />
    );
  }

  // 根据面板配置创建标签页
  const panes = panelConfig.tabs.map((tab) => {
    // 对于异常处理标签页，使用自定义组件
    if (tab.id === "error") {
      return {
        menuItem: tab.title,
        render: () => (
          <Tab.Pane attached={false}>
            <ErrorHandlingTab
              selectedNode={node}
              updateNodeProperties={updateNode}
            />
          </Tab.Pane>
        ),
      };
    }

    // 创建该标签页的schema和uiSchema
    const tabSchema = createPanelSchema(nodeSchema, tab.fields);
    const tabUiSchema = createPanelUiSchema(nodeUiSchema, tab.fields);

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

export default LoopProperties;
