import React, { useState, useEffect, useRef } from "react";
import { Table, Checkbox, Input, Button } from "semantic-ui-react";

const TrashIcon = () => (
  <svg viewBox="0 0 1024 1024" width="20" height="20">
    <path
      d="M779.3 228.2h-113v-35.4c0-34.9-28.4-63.3-63.3-63.3H425c-34.9 0-63.3 28.4-63.3 63.3v35.4h-113c-32.9 0-59.7 26.8-59.7 59.7v38.5c0 32.9 26.8 59.7 59.7 59.7h1.8v412.8c0 54.1 44 98.1 98.1 98.1h330.9c54.1 0 98.1-44 98.1-98.1V386.1h1.8c32.9 0 59.7-26.8 59.7-59.7v-38.5c-0.1-32.9-26.8-59.7-59.8-59.7z m-374.9-35.4c0-11.4 9.2-20.6 20.6-20.6h178c11.4 0 20.6 9.2 20.6 20.6v35.4H404.4v-35.4z m330.4 606c0 30.5-24.8 55.4-55.4 55.4H348.5c-30.5 0-55.4-24.8-55.4-55.4V386.1h441.7v412.7z m61.5-472.4c0 9.4-7.6 17-17 17H248.7c-9.4 0-17-7.6-17-17v-38.5c0-9.4 7.6-17 17-17h530.7c9.4 0 17 7.6 17 17v38.5z"
      fill="#2c2c2c"
    />
    <path
      d="M377.9 462.3h42.7v317.5h-42.7zM492.6 462.3h42.7v317.5h-42.7zM607.4 462.3h42.7v317.5h-42.7z"
      fill="#2c2c2c"
    />
  </svg>
);

/**
 * KVTableField - 键值对表格组件
 * 用于HTTP节点的headers和params字段等
 *
 * 功能：
 * 1. 表格形式展示键值对
 * 2. 每行包含启用复选框、键、值和删除按钮
 * 3. 当编辑键或值时自动添加新行
 * 4. 支持删除行
 */
const KVTableField = (props) => {
  const { formData = {}, onChange, uiSchema } = props;

  // 从UI Schema获取配置
  const options = uiSchema?.["ui:options"] || {};
  const keyPlaceholder = options.keyPlaceholder || "键名";
  const valuePlaceholder = options.valuePlaceholder || "值";
  const label = options.label || "键值对";

  // 将formData对象转换为数组格式以便在表格中使用
  // 添加enabled字段来表示该行是否启用
  const [rows, setRows] = useState([]);

  // 使用ref跟踪是否需要更新formData
  const formDataRef = useRef(formData);

  // 使用ref跟踪是否正在更新，防止循环更新
  const isUpdatingRef = useRef(false);

  // 初始化设置一个默认空行，确保即使formData为空也有一行可以填写
  useEffect(() => {
    // 立即添加一个默认行，无需等待formData
    setRows([
      {
        id: `default-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,
        key: "",
        value: "",
        enabled: true,
      },
    ]);
  }, []);

  // 只在formData变化且非空时更新rows
  useEffect(() => {
    // 避免无限循环
    if (isUpdatingRef.current) return;

    // 如果formData为空，不处理（保留默认行）
    if (Object.keys(formData).length === 0) return;

    // 深度比较新旧formData是否相同
    const formDataStr = JSON.stringify(formData);
    const prevFormDataStr = JSON.stringify(formDataRef.current);

    // 如果相同，则不需要更新
    if (formDataStr === prevFormDataStr) return;

    // 更新引用值
    formDataRef.current = formData;

    // 转换formData为rows
    const initialRows = Object.entries(formData).map(([key, value]) => ({
      id: `${key}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      key,
      value,
      enabled: true,
    }));

    // 总是确保有一个空行用于添加新条目
    if (
      initialRows.length === 0 ||
      initialRows[initialRows.length - 1].key !== ""
    ) {
      initialRows.push({
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        key: "",
        value: "",
        enabled: true,
      });
    }

    setRows(initialRows);
  }, [formData]);

  // 当rows变化时更新formData
  useEffect(() => {
    // 如果rows为空或尚未初始化，则不更新
    if (rows.length === 0) return;

    // 设置更新标志，防止无限循环
    isUpdatingRef.current = true;

    try {
      // 只有启用的非空行才会被保存到formData
      const newFormData = {};
      rows.forEach((row) => {
        if (row.enabled && row.key.trim() !== "") {
          newFormData[row.key] = row.value;
        }
      });

      // 避免不必要的更新 - 深度比较
      const newFormDataStr = JSON.stringify(newFormData);
      const currentFormDataStr = JSON.stringify(formDataRef.current);

      if (newFormDataStr !== currentFormDataStr) {
        onChange(newFormData);
        // 更新引用
        formDataRef.current = newFormData;
      }
    } finally {
      // 确保标志被重置
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [rows, onChange]);

  // 处理行变更
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    // 如果编辑的是最后一行，且键不为空，添加新行
    if (
      index === updatedRows.length - 1 &&
      field === "key" &&
      value.trim() !== ""
    ) {
      updatedRows.push({
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        key: "",
        value: "",
        enabled: true,
      });
    }

    setRows(updatedRows);
  };

  // 处理启用/禁用状态变更
  const handleEnabledChange = (index, checked) => {
    const updatedRows = [...rows];
    updatedRows[index].enabled = checked;
    setRows(updatedRows);
  };

  // 处理删除行
  const handleDeleteRow = (index) => {
    // 不允许删除最后一个空行
    if (index === rows.length - 1 && rows[index].key === "") {
      return;
    }

    const updatedRows = [...rows];
    updatedRows.splice(index, 1);

    // 确保始终有一个空行用于添加
    if (
      updatedRows.length === 0 ||
      updatedRows[updatedRows.length - 1].key !== ""
    ) {
      updatedRows.push({
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        key: "",
        value: "",
        enabled: true,
      });
    }

    setRows(updatedRows);
  };

  return (
    <div className="kv-table-field">
      <label className="field-label">{label}</label>

      <Table compact size="small" className="kv-table" celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={1} textAlign="center"></Table.HeaderCell>
            <Table.HeaderCell width={6}>Key</Table.HeaderCell>
            <Table.HeaderCell width={8}>Value</Table.HeaderCell>
            <Table.HeaderCell width={1}></Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rows.map((row, index) => (
            <Table.Row
              key={row.id}
              className={!row.enabled ? "disabled-row" : ""}
            >
              <Table.Cell
                className="checkbox-cell"
                style={{
                  padding: "0",
                  verticalAlign: "middle",
                  textAlign: "center",
                  height: "100%",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* 使用原生的input替代Semantic UI Checkbox */}
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) =>
                      handleEnabledChange(index, e.target.checked)
                    }
                    style={{
                      margin: 0,
                      padding: 0,
                      width: "16px",
                      height: "16px",
                    }}
                  />
                </div>
              </Table.Cell>
              <Table.Cell>
                <Input
                  fluid
                  transparent
                  placeholder={keyPlaceholder}
                  value={row.key}
                  onChange={(e, { value }) =>
                    handleRowChange(index, "key", value)
                  }
                  className={!row.enabled ? "disabled-input" : ""}
                />
              </Table.Cell>
              <Table.Cell>
                <Input
                  fluid
                  transparent
                  placeholder={valuePlaceholder}
                  value={row.value}
                  onChange={(e, { value }) =>
                    handleRowChange(index, "value", value)
                  }
                  className={!row.enabled ? "disabled-input" : ""}
                />
              </Table.Cell>
              <Table.Cell textAlign="center">
                <Button
                  basic
                  compact
                  size="tiny"
                  onClick={() => handleDeleteRow(index)}
                  disabled={index === rows.length - 1 && row.key === ""}
                  style={{ padding: "5px" }}
                >
                  <TrashIcon />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default KVTableField;
