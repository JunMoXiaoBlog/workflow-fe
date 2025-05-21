import React from "react";
import {
  StartIcon,
  EndIcon,
  HttpIcon,
  SqlIcon,
  RedisIcon,
  SwitchIcon,
  LoopIcon,
  ScriptIcon,
  VariableIcon,
} from "./components/nodes";

const NodeSidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="sidebar">
      <h3>业务节点</h3>
      <div
        className="node-template node-http"
        onDragStart={(e) => onDragStart(e, "HTTP")}
        draggable
      >
        <div className="template-icon">
          <HttpIcon />
        </div>
        <span>HTTP 节点</span>
      </div>
      <div
        className="node-template node-sql"
        onDragStart={(e) => onDragStart(e, "SQL")}
        draggable
      >
        <div className="template-icon">
          <SqlIcon />
        </div>
        <span>SQL 节点</span>
      </div>
      <div
        className="node-template node-redis"
        onDragStart={(e) => onDragStart(e, "REDIS")}
        draggable
      >
        <div className="template-icon">
          <RedisIcon />
        </div>
        <span>Redis 节点</span>
      </div>
      <div
        className="node-template node-script"
        onDragStart={(e) => onDragStart(e, "SCRIPT")}
        draggable
      >
        <div className="template-icon">
          <ScriptIcon />
        </div>
        <span>脚本节点</span>
      </div>

      <h3>逻辑节点</h3>
      <div
        className="node-template node-start"
        onDragStart={(e) => onDragStart(e, "START")}
        draggable
      >
        <div className="template-icon">
          <StartIcon />
        </div>
        <span>开始节点</span>
      </div>
      <div
        className="node-template node-end"
        onDragStart={(e) => onDragStart(e, "END")}
        draggable
      >
        <div className="template-icon">
          <EndIcon />
        </div>
        <span>结束节点</span>
      </div>
      <div
        className="node-template node-switch"
        onDragStart={(e) => onDragStart(e, "SWITCH")}
        draggable
      >
        <div className="template-icon">
          <SwitchIcon />
        </div>
        <span>条件分支节点</span>
      </div>
      <div
        className="node-template loop-node"
        onDragStart={(e) => onDragStart(e, "LOOP")}
        draggable
      >
        <div className="template-icon">
          <LoopIcon />
        </div>
        <span>循环节点</span>
      </div>
      <div
        className="node-template node-variable"
        onDragStart={(e) => onDragStart(e, "SET_VARIABLE")}
        draggable
      >
        <div className="template-icon">
          <VariableIcon />
        </div>
        <span>变量赋值节点</span>
      </div>
    </div>
  );
};

export default NodeSidebar;
