// 修复 PropertiesPanel.js 确保HTTP节点的form-data和x-www-form-urlencoded使用KVTableField

import React, { useMemo, useState, useEffect } from "react";
import { Form } from "@rjsf/semantic-ui"; // 使用 Semantic UI 主题
import validator from "@rjsf/validator-ajv8";
import { Message } from "semantic-ui-react";

// 导入节点配置、自定义字段和小部件
import {
  nodeSchemaConfigs,
  customFields,
  customWidgets,
} from "./components/fields/schemaLoader";
import LoopProperties from "./components/LoopProperties";

const PropertiesPanel = ({ selectedNode, updateNodeProperties, nodes }) => {
  const [loadingActions, setLoadingActions] = useState({});
  const [debugError, setDebugError] = useState(null);
  const [formKey, setFormKey] = useState(0); // 添加key强制表单重新渲染

  // 添加调试日志以诊断问题
  console.log("PropertiesPanel渲染:", {
    selectedNode: selectedNode?.type,
    contentType: selectedNode?.data?.config?.contentType,
    hasFields: !!customFields,
    KVTableField: !!customFields.KVTableField,
    body: selectedNode?.data?.config?.body,
  });

  // 当selectedNode或contentType改变时,强制表单重新渲染
  useEffect(() => {
    if (selectedNode?.type === "HTTP") {
      setFormKey((prev) => prev + 1);
      console.log(
        "HTTP节点contentType改变:",
        selectedNode?.data?.config?.contentType
      );
    }
  }, [selectedNode?.id, selectedNode?.data?.config?.contentType]);

  if (!selectedNode) {
    return (
      <div className="properties-panel">
        <h3>节点属性</h3>
        <div id="properties-content">
          <p>请选择一个节点进行编辑</p>
        </div>
      </div>
    );
  }

  // 检查是否为子节点，获取父节点信息用于显示
  const isChildNode = Boolean(selectedNode.parentNode);
  let parentNode = null;

  if (isChildNode) {
    parentNode = nodes.find((n) => n.id === selectedNode.parentNode);
  }

  // 对于循环节点使用特殊的属性面板组件
  if (selectedNode.type === "LOOP") {
    return (
      <div>
        <LoopProperties
          node={selectedNode}
          updateNode={updateNodeProperties}
          nodes={nodes}
        />
      </div>
    );
  }

  // 获取节点类型对应的schema
  const nodeConfig = nodeSchemaConfigs[selectedNode.type] || {
    schema: {},
    uiSchema: {},
  };
  const { schema, uiSchema } = nodeConfig;

  // 记录uiSchema以检查按钮配置
  console.log(`${selectedNode.type}节点的uiSchema:`, uiSchema);

  // 特殊处理: 记录HTTP节点contentType相关的uiSchema配置
  if (selectedNode.type === "HTTP") {
    console.log(
      "HTTP节点ui:dependencies配置:",
      uiSchema["ui:dependencies"]?.contentType
    );
    const contentType = selectedNode.data.config?.contentType;
    if (contentType) {
      console.log(
        `当前contentType(${contentType})的body配置:`,
        uiSchema["ui:dependencies"]?.contentType?.[contentType]?.body
      );
    }
  }

  // 准备表单数据，包括节点类型和ID
  const formData = useMemo(() => {
    // 从节点获取配置数据
    const baseFormData = selectedNode.data.config || {};

    // 添加节点类型和ID
    return {
      ...baseFormData,
      nodeType: selectedNode.type,
      nodeId: selectedNode.id,
    };
  }, [selectedNode.data.config, selectedNode.type, selectedNode.id]);

  // 记录表单数据以检查请求体内容
  console.log(`${selectedNode.type}节点的formData:`, formData);
  if (selectedNode.type === "HTTP" && formData.contentType) {
    console.log(`HTTP节点body数据(${formData.contentType}):`, formData.body);
  }

  // 处理表单变更
  const handleChange = ({ formData: newFormData }) => {
    console.log("表单变更:", newFormData);

    // 从表单数据中移除 nodeType 和 nodeId，因为这些不应该被存储在实际配置中
    const { nodeType, nodeId, ...configData } = newFormData;

    // 检查contentType是否改变
    const contentTypeChanged =
      selectedNode.type === "HTTP" &&
      selectedNode.data.config?.contentType !== configData.contentType;

    // 特殊处理form-data和x-www-form-urlencoded
    if (selectedNode.type === "HTTP") {
      if (
        configData.contentType === "form-data" ||
        configData.contentType === "x-www-form-urlencoded"
      ) {
        // 确保body是对象类型
        if (typeof configData.body === "string") {
          try {
            // 尝试将字符串解析为对象
            configData.body = JSON.parse(configData.body);
          } catch (e) {
            // 如果解析失败，初始化为空对象
            configData.body = {};
          }
        } else if (!configData.body) {
          configData.body = {};
        }
        console.log(`转换后的${configData.contentType} body:`, configData.body);
      }
    }

    updateNodeProperties(selectedNode.id, {
      config: configData,
    });

    // 如果contentType改变，强制表单重新渲染
    if (contentTypeChanged) {
      setFormKey((prev) => prev + 1);
    }
  };

  // 处理调试按钮点击
  const handleDebug = async (formData) => {
    console.log("调试按钮被点击，formData:", formData);

    if (!formData.debug) {
      console.log("调试未启用，返回");
      return;
    }

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

      console.log("生成的调试结果:", debugResult);

      // 更新节点属性，写入调试结果
      const { nodeType, nodeId, ...configData } = formData;
      updateNodeProperties(selectedNode.id, {
        config: {
          ...configData,
          debugResult: JSON.stringify(debugResult, null, 2),
        },
      });
    } catch (error) {
      setDebugError(error.message || "调试过程中发生错误");

      // 更新节点属性，写入错误信息
      const { nodeType, nodeId, ...configData } = formData;
      updateNodeProperties(selectedNode.id, {
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
        },
      });
    } finally {
      // 清除加载状态
      setLoadingActions((prev) => ({ ...prev, debug: false }));
    }
  };

  // 预留其他可能的按钮动作处理函数
  const handleExport = (formData) => {
    console.log("导出操作", formData);
    // 实现导出功能...
  };

  const handleTest = (formData) => {
    console.log("测试操作", formData);
    // 实现测试功能...
  };

  // 构建动作处理函数集合
  const actions = {
    debug: handleDebug,
    export: handleExport,
    test: handleTest,
  };

  // 添加日志以跟踪表单渲染和动作传递
  console.log("表单将被渲染，动作:", Object.keys(actions));
  console.log("可用字段组件:", Object.keys(customFields));

  return (
    <div>
      {debugError && (
        <Message negative>
          <Message.Header>调试错误</Message.Header>
          <p>{debugError}</p>
        </Message>
      )}

      {/* 使用key来强制表单在contentType改变时重新渲染 */}
      <Form
        key={formKey}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        validator={validator}
        onChange={handleChange}
        liveValidate={true}
        showErrorList={false}
        widgets={customWidgets}
        fields={customFields}
        // 提供表单上下文，让自定义字段可以访问动作和状态
        formContext={{
          actions,
          loadingActions,
          // 添加更多上下文数据帮助调试
          contentType: formData.contentType,
          nodeType: selectedNode.type,
        }}
        // 这里添加一个ID也有助于调试
        id={`${selectedNode.type}-form-${selectedNode.id}`}
      />
    </div>
  );
};

export default PropertiesPanel;
