import React, { useState } from "react";

const VariableObjectField = (props) => {
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
    <div className="form-group">
      <label>定义变量</label>

      {/* Display current variables */}
      {Object.entries(formData).map(([key, value]) => (
        <div
          key={key}
          className="variable-item"
          style={{ display: "flex", marginBottom: "8px" }}
        >
          <div style={{ flex: 2, marginRight: "8px", fontWeight: "bold" }}>
            {key}:
          </div>
          <div style={{ flex: 3 }}>{value}</div>
          <button
            onClick={() => handleRemoveVariable(key)}
            className="delete-button"
          >
            删除
          </button>
        </div>
      ))}

      {/* Add new variable */}
      <div style={{ marginTop: "10px" }}>
        <div style={{ display: "flex", marginBottom: "8px" }}>
          <input
            type="text"
            placeholder="变量名称"
            value={variableKey}
            onChange={(e) => setVariableKey(e.target.value)}
            style={{ flex: 1, marginRight: "8px" }}
          />
          <input
            type="text"
            placeholder="变量值"
            value={variableValue}
            onChange={(e) => setVariableValue(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <button onClick={handleAddVariable} className="add-full-button">
          添加变量
        </button>
      </div>
    </div>
  );
};

export default VariableObjectField;
