// ErrorHandlingTab.js - 改进版异常处理标签页

import React, { useState, useEffect } from "react";
import { Form } from "semantic-ui-react";

/**
 * 异常处理标签页组件
 * 采用Semantic UI样式，匹配其他标签页的外观
 */
const ErrorHandlingTab = ({ selectedNode, updateNodeProperties }) => {
  // 获取当前节点配置
  const config = selectedNode?.data?.config || {};

  // 设置初始策略
  const [errorStrategy, setErrorStrategy] = useState(
    config.errorStrategy || "FAIL"
  );

  // 错误处理策略选项
  const strategyOptions = [
    { key: "FAIL", text: "终止流程", value: "FAIL" },
    { key: "IGNORE", text: "忽略错误", value: "IGNORE" },
    { key: "RETRY", text: "重试执行", value: "RETRY" },
  ];

  // 当节点变化时更新策略
  useEffect(() => {
    if (selectedNode?.data?.config?.errorStrategy) {
      setErrorStrategy(selectedNode.data.config.errorStrategy);
    }
  }, [selectedNode]);

  // 处理策略变更
  const handleStrategyChange = (e, { value }) => {
    setErrorStrategy(value);

    // 更新节点属性
    updateNodeProperties(selectedNode.id, {
      config: {
        ...config,
        errorStrategy: value,
      },
    });
  };

  // 处理字段变更
  const handleFieldChange = (field, value) => {
    updateNodeProperties(selectedNode.id, {
      config: {
        ...config,
        [field]: value,
      },
    });
  };

  // 获取字段值（带默认值）
  const getFieldValue = (field, defaultValue = "") => {
    return config[field] !== undefined ? config[field] : defaultValue;
  };

  // 使用Semantic UI Form组件包装内容，匹配其他标签页的样式
  return (
    <Form className="ui form">
      {/* 策略选择 */}
      <Form.Field>
        <label>错误处理策略</label>
        <Form.Select
          fluid
          options={strategyOptions}
          value={errorStrategy}
          onChange={handleStrategyChange}
        />
      </Form.Field>

      {/* 共用字段 - 适用于所有策略 */}
      <Form.Field>
        <label>超时时间(毫秒)</label>
        <Form.Input
          type="number"
          min="1000"
          max="300000"
          value={getFieldValue("timeout", 30000)}
          onChange={(e, { value }) =>
            handleFieldChange("timeout", Number(value))
          }
        />
      </Form.Field>

      {/* 重试策略特有字段 */}
      {errorStrategy === "RETRY" && (
        <>
          <Form.Field>
            <label>最大重试次数</label>
            <Form.Input
              type="number"
              min="1"
              max="10"
              value={getFieldValue("maxRetries", 3)}
              onChange={(e, { value }) =>
                handleFieldChange("maxRetries", Number(value))
              }
            />
          </Form.Field>

          <Form.Field>
            <label>重试间隔(毫秒)</label>
            <Form.Input
              type="number"
              min="500"
              max="60000"
              value={getFieldValue("retryInterval", 3000)}
              onChange={(e, { value }) =>
                handleFieldChange("retryInterval", Number(value))
              }
            />
          </Form.Field>

          <Form.Field>
            <Form.Checkbox
              label="启用指数退避"
              checked={getFieldValue("exponentialBackoff", true)}
              onChange={(e, { checked }) =>
                handleFieldChange("exponentialBackoff", checked)
              }
            />
          </Form.Field>
        </>
      )}

      {/* 失败返回值 - FAIL和IGNORE策略 */}
      {(errorStrategy === "FAIL" || errorStrategy === "IGNORE") && (
        <Form.Field>
          <label>失败返回值</label>
          <Form.TextArea
            rows={3}
            placeholder='输入失败时的默认返回值，例如: {"status": "error", "message": "处理失败"}'
            value={getFieldValue("fallbackResponse", "{}")}
            onChange={(e, { value }) =>
              handleFieldChange("fallbackResponse", value)
            }
          />
        </Form.Field>
      )}

      {/* 根据节点类型添加特定字段 */}
      {selectedNode?.type === "HTTP" && errorStrategy === "RETRY" && (
        <Form.Field>
          <label>重试状态码</label>
          <Form.Input
            placeholder="例如: 408,429,500,502,503,504"
            value={getFieldValue("retryStatusCodes", "408,429,500,502,503,504")}
            onChange={(e, { value }) =>
              handleFieldChange("retryStatusCodes", value)
            }
          />
          <small style={{ color: "#666" }}>多个状态码用逗号分隔</small>
        </Form.Field>
      )}
    </Form>
  );
};

export default ErrorHandlingTab;
