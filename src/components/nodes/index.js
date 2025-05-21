import React from "react";
import { Handle, Position } from "reactflow";

// SVG图标组件
export const StartIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const EndIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
  </svg>
);

export const HttpIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M4.5 11h-2V9H1v6h1.5v-2.5h2V15H6V9H4.5v2zm2.5-.5h1.5V15H10v-4.5h1.5V9H7v1.5zm5.5 0H14V15h1.5v-4.5H17V9h-4.5v1.5zm9-1.5H18v6h1.5v-2h2c.8 0 1.5-.7 1.5-1.5v-1c0-.8-.7-1.5-1.5-1.5zm0 2.5h-2v-1h2v1z" />
  </svg>
);

export const SqlIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-6h2v6zm4 0h-2V8h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);

export const RedisIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M17 13h2v2h-2zm0 4h2v2h-2zM1 13h2v2H1zm0 4h2v2H1zm4-4h2v2H5zm0 4h2v2H5zm4-4h2v2H9z" />
    <path d="M21 7h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2H3c-1.1 0-2 .9-2 2v11h22V9c0-1.1-.9-2-2-2zM6 5h12v2H6V5zm14 13H4v-2h16v2zm0-4H4V9h16v5z" />
  </svg>
);

export const SwitchIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M20 4v16H4V4h16m0-2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    <path d="M9.5 16V8l5.5 4-5.5 4z" />
  </svg>
);

export const LoopIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
);

export const LoopStartIcon = () => (
  <svg
    t="1747368395194"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="3654"
    width="24"
    height="24"
  >
    <path
      d="M954.058556 493.157863c-43.23264-44.004213-422.432055-429.957449-423.904593-431.429986-4.974291-4.975315-12.541641-7.496741-22.49227-7.496741-8.815783 0-15.785521 2.49789-20.711717 7.424086L66.122465 497.179456l0 8.266267c0 18.583241 6.119371 36.461423 17.232476 50.341548 10.562567 13.193487 24.000624 21.069875 35.945677 21.069875l65.450664 0 0 314.966485c0 55.979966 38.562271 75.842339 71.585385 75.842339 2.1295 0 14.32117-0.169869 90.969874-0.169869s70.608128-75.43711 70.608128-75.43711L417.91467 646.39592c0-9.287527 7.496741-16.362666 11.249205-16.362666l48.461735 0 0-40.904619-48.462758 0c-27.782763 0-52.154847 26.759457-52.154847 57.267285l0 245.477854c0 0-1.861394 34.718733-29.751604 34.718733-11.766998 0-89.919962 0.169869-90.920756 0.169869-30.67872 0-30.67872-26.297946-30.67872-34.938744L225.656925 535.952528 121.464911 535.952528c-3.078105-1.87879-11.418051-9.230222-13.795191-22.902616L508.582669 98.130971c52.142567 53.054333 362.372168 368.81081 410.150334 417.437298-0.699941 9.211802-2.52859 13.670348-3.717671 15.657608-0.86367 1.438769-1.606591 2.684132-6.225795 2.684132L804.540218 533.910009l-1.075495 355.077018c-2.52245 8.207939-13.405311 37.604456-39.892569 37.604456 0 0-40.298821 0-75.330686 0s-39.161928-21.097504-39.149649-34.718733c0.079818-84.74408 0.188288-237.419318-0.065492-246.077511-0.245593-8.330736-3.206018-21.429055-10.780531-33.213449-9.723455-15.123442-24.049742-23.454178-40.342824-23.454178l-55.19509 0 0 40.904619 55.19509 0c5.418406 0 10.094916 12.181437 10.235109 16.96437 0.222057 7.557116 0.138146 149.410891 0.048095 244.87615-0.020466 21.3871 0.603751 75.622328 80.055291 75.622328 51.746548 0 75.330686 0 75.330686 0 26.396183 0 48.812729-12.697183 64.826448-36.719296 10.906397-16.35448 14.9679-32.391734 15.395642-34.167171l1.528819-321.79603 63.466474 0c17.935488 0 32.611745-8.020674 41.328267-22.584368 6.597255-11.024078 9.80532-25.65838 9.80532-44.737924l0-8.366551L954.058556 493.157863z"
      fill="#ffffff"
      p-id="3655"
    />
  </svg>
);

export const ScriptIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
  </svg>
);

export const VariableIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M4 7v2h3v10h2V9h3V7H4zm13.8 4h-2.4l-3 9h2.1l.7-2h2.8l.7 2h2.1l-3-9zm-2.1 5.1l.9-2.7.9 2.7h-1.8z" />
  </svg>
);

// 添加一个加号图标组件
export const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
  </svg>
);

// 添加一个减号图标组件
export const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="#e74c3c" width="14" height="14">
    <path d="M19 13H5v-2h14z" />
  </svg>
);

// 自定义节点组件
export const StartNode = ({ data }) => (
  <div className="custom-node node-start">
    <div className="node-header">
      <div className="node-icon">
        <StartIcon />
      </div>
      <div className="node-title">{data.label || "开始"}</div>
    </div>
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

export const EndNode = ({ data }) => (
  <div className="custom-node node-end">
    <Handle type="target" position={Position.Left} id="left" />
    <div className="node-header">
      <div className="node-icon">
        <EndIcon />
      </div>
      <div className="node-title">{data.label || "结束"}</div>
    </div>
  </div>
);

export const HttpNode = ({ data }) => (
  <div className="custom-node node-http">
    <Handle type="target" position={Position.Left} id="left" />
    <div className="node-header">
      <div className="node-icon">
        <HttpIcon />
      </div>
      <div className="node-title">{data.label || "HTTP"}</div>
    </div>
    {data.config?.url && (
      <div className="node-content">
        {data.config.method || "GET"}: {data.config.url}
      </div>
    )}
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

export const SqlNode = ({ data }) => (
  <div className="custom-node node-sql">
    <Handle type="target" position={Position.Left} id="left" />
    <div className="node-header">
      <div className="node-icon">
        <SqlIcon />
      </div>
      <div className="node-title">{data.label || "SQL"}</div>
    </div>
    {data.config?.sql && (
      <div className="node-content">{data.config.operation || "QUERY"}</div>
    )}
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

export const RedisNode = ({ data }) => (
  <div className="custom-node node-redis">
    <Handle type="target" position={Position.Left} id="left" />
    <div className="node-header">
      <div className="node-icon">
        <RedisIcon />
      </div>
      <div className="node-title">{data.label || "Redis"}</div>
    </div>
    {data.config?.key && (
      <div className="node-content">
        {data.config.operation || "GET"}: {data.config.key}
      </div>
    )}
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

// 分支节点组件 - 修改版，使用右下角浮动按钮
export const SwitchNode = ({ data, id }) => {
  // 计算节点高度 - 基础高度加上每个case的高度
  const caseCount = data.config?.cases?.length || 0;
  const nodeHeight = 24 + (caseCount + 1) * 24 + 8; // 增加一些空间，但不为按钮保留太多位置

  // 添加分支处理函数
  const addCase = () => {
    if (!data.updateNodeInternally) return;

    const cases = [...(data.config?.cases || [])];
    const caseNum = cases.length + 1;
    cases.push({
      name: `case${caseNum}`, // 使用case+序号作为名称
      condition: "", // 条件默认为空
      target: "",
    });

    data.updateNodeInternally(id, {
      config: {
        ...data.config,
        cases,
      },
    });
  };

  // 删除分支处理函数
  const removeCase = (index) => {
    if (!data.updateNodeInternally) return;

    const cases = [...(data.config?.cases || [])];
    cases.splice(index, 1);

    data.updateNodeInternally(id, {
      config: {
        ...data.config,
        cases,
      },
    });
  };

  return (
    <div
      className="custom-node node-switch"
      style={{ height: nodeHeight, position: "relative" }}
    >
      <Handle type="target" position={Position.Left} id="left" />
      <div className="node-header">
        <div className="node-icon">
          <SwitchIcon />
        </div>
        <div className="node-title">{data.label || "分支"}</div>
      </div>

      <div className="switch-cases-container">
        <div className="switch-cases">
          {data.config?.cases?.map((caseItem, index) => (
            <div
              key={index}
              className="switch-case-row"
              style={{ position: "relative", border: "none" }}
            >
              <div className="switch-case-condition">
                {caseItem.condition || `case${index + 1}`}
              </div>
              <button
                onClick={() => removeCase(index)}
                className="delete-case-button"
              >
                <MinusIcon />
              </button>
              <Handle
                type="source"
                position={Position.Right}
                id={`case-${index}`}
                className="case-handle"
              />
            </div>
          ))}

          <div className="switch-default-row" style={{ border: "none" }}>
            <div className="switch-default-label">默认分支</div>
            <Handle
              type="source"
              position={Position.Right}
              id="default"
              className="default-handle"
            />
          </div>
        </div>
      </div>

      {/* 右下角的浮动添加按钮 */}
      <button
        onClick={addCase}
        className="switch-add-button-float"
        aria-label="添加分支"
        title="添加分支"
      ></button>
    </div>
  );
};

export const ScriptNode = ({ data }) => (
  <div className="custom-node node-script">
    <Handle type="target" position={Position.Left} id="left" />
    <div className="node-header">
      <div className="node-icon">
        <ScriptIcon />
      </div>
      <div className="node-title">{data.label || "脚本"}</div>
    </div>
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

export const SetVariableNode = ({ data }) => (
  <div className="custom-node node-variable">
    <Handle type="target" position={Position.Left} id="left" />
    <div className="node-header">
      <div className="node-icon">
        <VariableIcon />
      </div>
      <div className="node-title">{data.label || "变量"}</div>
    </div>
    {/* 变量内容区域已移除 */}
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

// 导入子流程循环节点
import SubflowLoopNode from "../SubflowLoopNode";

// 导出节点类型映射
export const nodeTypes = {
  START: StartNode,
  END: EndNode,
  HTTP: HttpNode,
  SQL: SqlNode,
  REDIS: RedisNode,
  SWITCH: SwitchNode,
  LOOP: SubflowLoopNode, // 使用新的子流程循环节点
  SCRIPT: ScriptNode,
  SET_VARIABLE: SetVariableNode,
};
