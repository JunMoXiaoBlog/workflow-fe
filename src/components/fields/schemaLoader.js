// schemaLoader.js - 添加KVTableField组件版本
// 注意：导入顺序很重要，React必须首先导入

import React, { useState } from "react";
import {
  Form,
  Button,
  Input,
  Segment,
  Header,
  Divider,
  List,
  Icon,
  Dropdown,
} from "semantic-ui-react";

// 导入配置加载器
import NodeConfigLoader from "../../NodeConfigLoader";
import ButtonField from "../../ButtonField"; // 请确保路径正确
import KVTableField from "../../KVTableField"; // 导入新的KVTableField组件
import CodeEditorField from "../../CodeEditorField";
import BranchConditionsField from "../../BranchConditionsField";
import MarkdownDocField from "../../MarkdownDocField";

// 变量自定义字段组件 - 使用 Semantic UI 组件
export const VariableObjectField = (props) => {
  const { formData = {}, onChange } = props;
  const [variableKey, setVariableKey] = useState("");
  const [variableValue, setVariableValue] = useState("");

  const handleAddVariable = () => {
    if (!variableKey.trim()) return;

    const updatedData = {
      ...formData,
      [variableKey]: variableValue,
    };

    onChange(updatedData);
    setVariableKey("");
    setVariableValue("");
  };

  const handleRemoveVariable = (key) => {
    const updatedData = { ...formData };
    delete updatedData[key];
    onChange(updatedData);
  };

  return (
    <div>
      <Header as="h4">定义变量</Header>

      {/* 显示当前变量 */}
      {Object.entries(formData).length > 0 && (
        <Segment>
          <List divided relaxed>
            {Object.entries(formData).map(([key, value]) => (
              <List.Item key={key}>
                <List.Content floated="right">
                  <Button
                    negative
                    size="tiny"
                    icon="trash"
                    onClick={() => handleRemoveVariable(key)}
                  />
                </List.Content>
                <List.Content>
                  <List.Header>{key}</List.Header>
                  <List.Description>{value}</List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Segment>
      )}

      {/* 添加新变量 */}
      <Segment>
        <Form>
          <Form.Group widths="equal">
            <Form.Field>
              <label>变量名称</label>
              <Input
                placeholder="变量名称"
                value={variableKey}
                onChange={(e, { value }) => setVariableKey(value)}
              />
            </Form.Field>
            <Form.Field>
              <label>变量值</label>
              <Input
                placeholder="变量值"
                value={variableValue}
                onChange={(e, { value }) => setVariableValue(value)}
              />
            </Form.Field>
          </Form.Group>
          <Button
            primary
            fluid
            icon="plus"
            content="添加变量"
            onClick={handleAddVariable}
            disabled={!variableKey.trim()}
          />
        </Form>
      </Segment>
    </div>
  );
};

// 分支条件自定义字段组件 - 使用 Semantic UI 组件
export const SwitchCasesField = (props) => {
  const { formData = [], onChange } = props;
  const [newCondition, setNewCondition] = useState("");

  const handleAddCase = () => {
    const conditionText = newCondition.trim()
      ? newCondition
      : `条件分支${formData.length + 1}`;

    const updatedCases = [
      ...formData,
      { condition: conditionText, target: "" },
    ];

    onChange(updatedCases);
    setNewCondition("");
  };

  const handleRemoveCase = (index) => {
    const updatedCases = [...formData];
    updatedCases.splice(index, 1);
    onChange(updatedCases);
  };

  const handleUpdateCase = (index, condition) => {
    const updatedCases = [...formData];
    updatedCases[index] = { ...updatedCases[index], condition };
    onChange(updatedCases);
  };

  return (
    <div>
      <Header as="h4">分支条件列表</Header>

      {formData.length > 0 && (
        <Segment>
          <List divided relaxed>
            {formData.map((caseItem, index) => (
              <List.Item key={index}>
                <List.Content floated="right">
                  <Button
                    negative
                    size="tiny"
                    icon="trash"
                    onClick={() => handleRemoveCase(index)}
                  />
                </List.Content>
                <List.Content>
                  <Input
                    fluid
                    value={caseItem.condition}
                    onChange={(e, { value }) => handleUpdateCase(index, value)}
                  />
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Segment>
      )}

      <Segment>
        <Form>
          <Form.Group>
            <Form.Field width={12}>
              <Input
                fluid
                placeholder="请输入新的分支条件..."
                value={newCondition}
                onChange={(e, { value }) => setNewCondition(value)}
              />
            </Form.Field>
            <Form.Field width={4}>
              <Button
                primary
                fluid
                icon="plus"
                content="添加"
                onClick={handleAddCase}
              />
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    </div>
  );
};

// 自定义文本字段小部件，支持自定义样式
export const CustomTextWidget = (props) => {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    onChange,
    options,
    schema,
    label,
    placeholder,
    uiSchema,
  } = props;

  // 正确获取placeholder - 检查多种可能的来源
  const effectivePlaceholder =
    placeholder || // 直接从props获取
    options?.placeholder || // 从options获取
    uiSchema?.["ui:placeholder"] || // 从uiSchema获取
    "";

  // 检查是否有自定义样式
  const customStyle = options?.customStyle || {};

  const handleChange = (e, data) => {
    onChange(data.value);
  };

  return (
    <Form.Field required={required}>
      {label && <label htmlFor={id}>{label}</label>}
      <Input
        id={id}
        value={value || ""}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        readOnly={readonly}
        onChange={handleChange}
        fluid
        style={customStyle}
      />
    </Form.Field>
  );
};

// 自定义文本区域小部件，支持自定义样式
export const CustomTextareaWidget = (props) => {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    onChange,
    options,
    schema,
    label,
    placeholder,
    uiSchema,
  } = props;

  const safeValue =
    value === null || value === undefined || typeof value === "object"
      ? ""
      : String(value);

  // 正确获取placeholder - 检查多种可能的来源
  const effectivePlaceholder =
    placeholder || // 直接从props获取
    options?.placeholder || // 从options获取
    uiSchema?.["ui:placeholder"] || // 从uiSchema获取
    "";

  // 检查是否有自定义样式
  const customStyle = options?.customStyle || {};

  // 处理变更
  const handleChange = (e, data) => {
    onChange(data.value);
  };

  // 获取行数配置，默认为5行
  const rows = options?.rows || 5;

  return (
    <Form.Field required={required}>
      {label && <label htmlFor={id}>{label}</label>}
      <Form.TextArea
        id={id}
        value={safeValue}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        readOnly={readonly}
        onChange={handleChange}
        rows={rows}
        style={customStyle}
      />
    </Form.Field>
  );
};

// 自定义选择字段小部件，修复onFocus错误
export const CustomSelectWidget = (props) => {
  const {
    id,
    options,
    value,
    required,
    disabled,
    readonly,
    onChange,
    onBlur,
    onFocus,
    label,
    placeholder,
  } = props;

  // 将枚举选项转换为Dropdown选项格式
  const dropdownOptions = options.enumOptions.map(({ value, label }) => ({
    key: value,
    text: label,
    value: value,
  }));

  // 修复：安全处理onFocus事件
  const handleFocus = () => {
    if (onFocus) {
      // 不传递可能导致undefined错误的参数
      onFocus(id, "");
    }
  };

  return (
    <Form.Field required={required}>
      {label && <label htmlFor={id}>{label}</label>}
      <Dropdown
        id={id}
        fluid
        selection
        options={dropdownOptions}
        value={value}
        placeholder={placeholder || "请选择..."}
        disabled={disabled || readonly}
        onChange={(e, { value }) => onChange(value)}
        onBlur={() => onBlur && onBlur(id, value)}
        onFocus={handleFocus}
      />
    </Form.Field>
  );
};

// 使用NodeConfigLoader提供节点配置，同时保持原有API兼容性
export const nodeSchemaConfigs = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (typeof prop === "string") {
        const nodeConfig = NodeConfigLoader.getNodeConfig(prop);
        if (nodeConfig) {
          return {
            schema: nodeConfig.schema || {},
            uiSchema: nodeConfig.uiSchema || {},
          };
        }
      }
      return undefined;
    },
    has: (target, prop) => {
      if (typeof prop === "string") {
        return NodeConfigLoader.getNodeConfig(prop) !== null;
      }
      return false;
    },
    ownKeys: () => {
      return NodeConfigLoader.getNodeTypes();
    },
  }
);

// 导出自定义字段组件和小部件
export const customFields = {
  VariableObjectField,
  SwitchCasesField,
  ButtonField, // 确保ButtonField正确注册
  KVTableField, // 添加新的KVTableField组件
  CodeEditorField,
  BranchConditionsField,
  MarkdownDocField,
};

export const customWidgets = {
  TextWidget: CustomTextWidget,
  TextareaWidget: CustomTextareaWidget,
  SelectWidget: CustomSelectWidget,
};
