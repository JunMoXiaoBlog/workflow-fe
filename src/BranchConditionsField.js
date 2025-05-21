// BranchConditionsField.js
import React, { useState, useEffect } from "react";
import { Table, Button, Input } from "semantic-ui-react";

// 自定义删除图标组件
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
 * 分支条件配置组件
 * 使用表格布局展示分支条件，支持添加、编辑、删除分支
 * 显示连接状态：绿色表示已连接，灰色表示未连接
 */
const BranchConditionsField = (props) => {
  const { formData = [], onChange, uiSchema = {}, formContext = {} } = props;

  // 使用formContext中的connections获取连接状态和删除边的回调
  const connections = formContext.connections || {};
  const onDeleteBranchEdge = formContext.onDeleteBranchEdge;
  const nodeId = formContext.nodeId;

  // 添加新分支
  const addBranch = () => {
    const newIndex = formData.length + 1;
    const newBranch = {
      id: `branch-${Date.now()}`, // 生成唯一ID
      name: `case${newIndex}`,
      condition: "",
      target: "",
    };

    const updatedBranches = [...formData, newBranch];
    onChange(updatedBranches);
  };

  // 删除分支
  const deleteBranch = (index) => {
    // 首先调用回调函数删除相关的边
    if (onDeleteBranchEdge && nodeId) {
      // 将索引传递给删除边的函数
      onDeleteBranchEdge(nodeId, `case-${index}`);
    }

    const updatedBranches = [...formData];
    updatedBranches.splice(index, 1);

    // 重新编号后续分支
    for (let i = index; i < updatedBranches.length; i++) {
      updatedBranches[i].name = `case${i + 1}`;
    }

    onChange(updatedBranches);
  };

  // 更新分支条件
  const updateCondition = (index, value) => {
    const updatedBranches = [...formData];
    updatedBranches[index].condition = value;
    onChange(updatedBranches);
  };

  // 获取连接状态
  const getConnectionStatus = (branchId, index) => {
    // 检查分支ID或索引对应的连接状态
    return connections[branchId] || connections[`case-${index}`] || false;
  };

  // 获取默认分支连接状态
  const getDefaultConnectionStatus = () => {
    return connections["default"] || false;
  };

  return (
    <div
      className="branch-conditions-field"
      style={{
        marginTop: "35px",
      }}
    >
      <Table compact celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={3} textAlign="center">
              状态
            </Table.HeaderCell>
            <Table.HeaderCell width={3}>名称</Table.HeaderCell>
            <Table.HeaderCell width={10}>条件表达式</Table.HeaderCell>
            <Table.HeaderCell width={1}></Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {formData.map((branch, index) => (
            <Table.Row key={branch.id || index}>
              <Table.Cell textAlign="center">
                <div
                  className="connection-indicator"
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: getConnectionStatus(branch.id, index)
                      ? "#27ae60" // 绿色表示已连接
                      : "#bdc3c7", // 灰色表示未连接
                    display: "inline-block",
                  }}
                  title={
                    getConnectionStatus(branch.id, index) ? "已连接" : "未连接"
                  }
                />
              </Table.Cell>
              <Table.Cell>{branch.name || `case${index + 1}`}</Table.Cell>
              <Table.Cell>
                <Input
                  fluid
                  transparent
                  value={branch.condition || ""}
                  onChange={(e, { value }) => updateCondition(index, value)}
                  placeholder="输入条件表达式..."
                />
              </Table.Cell>
              <Table.Cell textAlign="center">
                <div
                  onClick={() => deleteBranch(index)}
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5px",
                  }}
                >
                  <TrashIcon />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}

          {/* 默认分支行 */}
          <Table.Row>
            <Table.Cell textAlign="center">
              <div
                className="connection-indicator"
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: getDefaultConnectionStatus()
                    ? "#27ae60" // 绿色表示已连接
                    : "#bdc3c7", // 灰色表示未连接
                  display: "inline-block",
                }}
                title={getDefaultConnectionStatus() ? "已连接" : "未连接"}
              />
            </Table.Cell>
            <Table.Cell>默认分支</Table.Cell>
            <Table.Cell colSpan="2">
              <div className="switch-default-label">
                当所有条件都不满足时执行
              </div>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      <Button
        fluid
        onClick={addBranch}
        style={{
          backgroundColor: "#f2f3f4",
          color: "#2c3e50",
          marginTop: "5px",
        }}
      >
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
        >
          <path
            d="M970.745 459.367 566.614 459.367 566.614 55.251C566.614 25.842 542.771 2 513.361 2c-29.411 0-53.253 23.841-53.253 53.251l0 404.116L55.975 459.367c-29.411 0-53.253 23.841-53.253 53.25 0 29.41 23.842 53.253 53.253 53.253l404.133 0 0 404.115c0 29.407 23.842 53.249 53.253 53.249 29.41 0 53.253-23.842 53.253-53.249L566.614 565.87l404.131 0c29.413 0 53.255-23.843 53.255-53.253C1024 483.208 1000.158 459.367 970.745 459.367z"
            fill="#272636"
          ></path>
        </svg>
        {" 添加分支"}
      </Button>
    </div>
  );
};

export default BranchConditionsField;
