// ButtonField.js - 依赖优化版本

import React from "react";
import { Button, Icon } from "semantic-ui-react";

/**
 * 自定义按钮字段组件，通过JSON配置生成按钮
 * 优化版本 - 移除条件表达式判断，依赖schema的dependencies机制来控制显示
 *
 * 支持配置项：
 * - label: 按钮文本
 * - action: 按钮动作类型 (debug, export, test 等)
 * - className: 自定义CSS类名
 * - color: 按钮颜色 (primary, secondary 等，支持 Semantic UI 的颜色)
 * - size: 按钮大小 (mini, tiny, small, medium, large, big, huge, massive)
 * - icon: 按钮图标名称 (如 "play", "bug" 等，支持 Semantic UI 的图标)
 * - fluid: 是否占满容器宽度 (true/false)
 * - position: 按钮位置 (bottom, top, right, left)
 * - loadingText: 加载状态下的按钮文本
 */
const ButtonField = (props) => {
  const {
    uiSchema = {},
    formData = {}, // 提供默认值避免undefined
    formContext = {},
    idSchema,
    registry,
  } = props;

  // 获取按钮配置
  const buttonConfig = uiSchema["ui:options"] || {};

  // 通过日志帮助调试
  console.log("ButtonField渲染:", {
    fieldId: idSchema?.$id,
    formData,
    buttonConfig,
    hasContext: !!formContext,
    hasActions: !!(formContext && formContext.actions),
    actionName: buttonConfig.action,
  });

  // 根据按钮类型获取处理函数
  const getActionHandler = (actionType) => {
    // 如果 formContext 中有对应的处理函数，则使用它
    if (formContext.actions && formContext.actions[actionType]) {
      return () => formContext.actions[actionType](formData);
    }

    // 默认处理函数
    return () => {
      console.log(`按钮动作 ${actionType} 被点击，但没有找到对应的处理函数`);
    };
  };

  // 检查是否处于加载状态
  const isLoading =
    formContext.loadingActions &&
    formContext.loadingActions[buttonConfig.action];

  // 构建按钮属性
  const buttonProps = {
    type: "button",
    className: buttonConfig.className,
    onClick: getActionHandler(buttonConfig.action),
    disabled: isLoading || formContext.disabled,
    loading: isLoading,
    color: buttonConfig.color || "primary",
    size: buttonConfig.size || "medium",
    fluid: buttonConfig.fluid === true,
  };

  // 生成按钮的样式，考虑定位
  const buttonStyle = {
    marginTop: "16px",
    ...(buttonConfig.style || {}),
  };

  return (
    <div
      className={`button-field-container ${buttonConfig.position || "bottom"}`}
      style={buttonStyle}
    >
      <Button {...buttonProps}>
        {buttonConfig.icon && <Icon name={buttonConfig.icon} />}
        {isLoading
          ? buttonConfig.loadingText || "处理中..."
          : buttonConfig.label}
      </Button>
    </div>
  );
};

export default ButtonField;
