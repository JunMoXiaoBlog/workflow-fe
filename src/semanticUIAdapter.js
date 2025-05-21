// semanticUIAdapter.js - 完整解决方案
import React from "react";
import Form from "@rjsf/core";
import {
  Form as SemanticForm,
  Button,
  TextArea,
  Input,
  Dropdown,
  Checkbox,
  Label,
  Message,
  Header,
  Segment,
  Divider,
} from "semantic-ui-react";

// 自定义小部件
const widgets = {
  // 文本输入框
  TextWidget: (props) => {
    const {
      id,
      value,
      required,
      disabled,
      readonly,
      onChange,
      placeholder,
      label,
      schema,
    } = props;

    // 处理变更
    const handleChange = (e, { value }) => {
      // 确保value不为undefined
      onChange(
        value === "" ? (schema.type === "number" ? undefined : "") : value
      );
    };

    return (
      <SemanticForm.Field required={required}>
        {label && <label htmlFor={id}>{label}</label>}
        <Input
          id={id}
          value={value || ""}
          placeholder={placeholder}
          disabled={disabled || readonly}
          onChange={handleChange}
          fluid
        />
      </SemanticForm.Field>
    );
  },

  // 文本区域
  TextareaWidget: (props) => {
    const {
      id,
      value,
      required,
      disabled,
      readonly,
      onChange,
      placeholder,
      label,
      options,
    } = props;
    const rows = options?.rows || 5;

    const handleChange = (e, { value }) => {
      onChange(value === "" ? "" : value);
    };

    return (
      <SemanticForm.Field required={required}>
        {label && <label htmlFor={id}>{label}</label>}
        <TextArea
          id={id}
          value={value || ""}
          placeholder={placeholder}
          disabled={disabled || readonly}
          onChange={handleChange}
          rows={rows}
        />
      </SemanticForm.Field>
    );
  },

  // 下拉选择框
  SelectWidget: (props) => {
    const {
      id,
      value,
      required,
      disabled,
      readonly,
      onChange,
      options,
      label,
      placeholder,
    } = props;
    const { enumOptions } = options;

    // 修复：处理空值情况，避免 undefined.value 错误
    const handleChange = (e, data) => {
      if (data && typeof data.value !== "undefined") {
        onChange(data.value);
      }
    };

    // 修复：处理聚焦事件，避免 undefined.value 错误
    const handleFocus = () => {
      // 不做任何操作，避免错误
    };

    const selectOptions = enumOptions.map(({ value, label }) => ({
      key: String(value), // 确保key是字符串
      value: value,
      text: label,
    }));

    return (
      <SemanticForm.Field required={required}>
        {label && <label htmlFor={id}>{label}</label>}
        <Dropdown
          id={id}
          options={selectOptions}
          value={value}
          disabled={disabled || readonly}
          onChange={handleChange}
          onFocus={handleFocus} // 添加安全的聚焦处理
          placeholder={placeholder}
          fluid
          selection
        />
      </SemanticForm.Field>
    );
  },

  // 复选框
  CheckboxWidget: (props) => {
    const { id, value, required, disabled, readonly, onChange, label } = props;

    const handleChange = (e, { checked }) => {
      onChange(checked);
    };

    return (
      <SemanticForm.Field required={required}>
        <Checkbox
          id={id}
          checked={value || false}
          disabled={disabled || readonly}
          onChange={handleChange}
          label={label}
        />
      </SemanticForm.Field>
    );
  },

  // 数字输入框
  NumberWidget: (props) => {
    const {
      id,
      value,
      required,
      disabled,
      readonly,
      onChange,
      label,
      placeholder,
      schema,
    } = props;

    const handleChange = (e, { value }) => {
      const parsed = value === "" ? undefined : Number(value);
      onChange(parsed);
    };

    return (
      <SemanticForm.Field required={required}>
        {label && <label htmlFor={id}>{label}</label>}
        <Input
          id={id}
          type="number"
          value={value || ""}
          placeholder={placeholder}
          disabled={disabled || readonly}
          onChange={handleChange}
          fluid
          min={schema.minimum}
          max={schema.maximum}
          step={schema.multipleOf || 1}
        />
      </SemanticForm.Field>
    );
  },
};

// 自定义模板
const templates = {
  FieldTemplate: (props) => {
    const { id, label, help, required, description, errors, children } = props;

    return (
      <div
        className={`field-template ${errors ? "error" : ""}`}
        style={{ marginBottom: "1rem" }}
      >
        {children}
        {errors && <Message negative content={errors} size="tiny" />}
        {description && (
          <div
            className="field-description"
            style={{ fontSize: "0.9em", color: "#666", marginTop: "0.3rem" }}
          >
            {description}
          </div>
        )}
        {help && (
          <div
            className="field-help"
            style={{
              fontSize: "0.9em",
              fontStyle: "italic",
              marginTop: "0.3rem",
            }}
          >
            {help}
          </div>
        )}
      </div>
    );
  },

  ObjectFieldTemplate: (props) => {
    const { title, description, properties, required } = props;

    return (
      <Segment>
        {title && <Header as="h4">{title}</Header>}
        {description && <p>{description}</p>}
        {properties.map((prop) => prop.content)}
      </Segment>
    );
  },

  ArrayFieldTemplate: (props) => {
    const { title, items, canAdd, onAddClick } = props;

    return (
      <Segment>
        {title && <Header as="h4">{title}</Header>}
        {items.map((item) => (
          <div key={item.key} style={{ marginBottom: "1rem" }}>
            {item.children}
            {item.hasRemove && (
              <Button
                negative
                icon="trash"
                size="tiny"
                onClick={item.onDropIndexClick(item.index)}
                style={{ marginTop: "0.5rem" }}
              />
            )}
            <Divider />
          </div>
        ))}
        {canAdd && (
          <Button primary icon="plus" content="添加" onClick={onAddClick} />
        )}
      </Segment>
    );
  },

  ButtonTemplates: {
    SubmitButton: (props) => {
      const { uiSchema } = props;

      return (
        <Button primary type="submit" disabled={props.disabled}>
          {uiSchema?.["ui:submitButtonOptions"]?.submitText || "Submit"}
        </Button>
      );
    },
  },

  ErrorListTemplate: (props) => {
    const { errors } = props;

    return (
      <Message negative>
        <Message.Header>表单错误</Message.Header>
        <Message.List>
          {errors.map((error, i) => (
            <Message.Item key={i}>{error.stack}</Message.Item>
          ))}
        </Message.List>
      </Message>
    );
  },
};

// 自定义表单组件
const SemanticUIForm = (props) => {
  return (
    <Form
      {...props}
      widgets={{ ...widgets, ...props.widgets }}
      templates={{ ...templates, ...props.templates }}
    />
  );
};

export default SemanticUIForm;
