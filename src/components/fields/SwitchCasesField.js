import React, { useState } from "react";

const SwitchCasesField = (props) => {
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
    <div className="form-group">
      <label>分支条件列表</label>

      {formData.map((caseItem, index) => (
        <div
          key={index}
          className="case-item"
          style={{ display: "flex", marginBottom: "8px", alignItems: "center" }}
        >
          <input
            type="text"
            value={caseItem.condition}
            onChange={(e) => handleUpdateCase(index, e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => handleRemoveCase(index)}
            className="delete-button"
          >
            删除
          </button>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          marginTop: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="请输入新的分支条件..."
          value={newCondition}
          onChange={(e) => setNewCondition(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={handleAddCase} className="add-button">
          添加
        </button>
      </div>
    </div>
  );
};

export default SwitchCasesField;
