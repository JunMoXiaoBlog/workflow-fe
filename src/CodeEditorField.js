// CodeEditorField.js - 简化版 (不需要单独的CSS文件)
import React, { useState, useEffect, useRef } from "react";
import AceEditor from "react-ace";

// 导入必要的语言模式和主题
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-groovy";
import "ace-builds/src-noconflict/theme-github";

/**
 * 代码编辑器字段组件
 * 用于脚本节点的代码编辑，支持语法高亮和高度调整
 */
const CodeEditorField = (props) => {
  const { formData = "", onChange, uiSchema, formContext } = props;

  // 从表单上下文或UI模式中获取语言
  const language =
    formContext?.language || uiSchema?.["ui:options"]?.language || "javascript";

  // 使用ref保存编辑器实例
  const editorRef = useRef(null);

  // 初始高度和最小高度
  const initialHeight = uiSchema?.["ui:options"]?.height || "300px";
  const minHeight = 180;

  // 状态控制编辑器高度
  const [editorHeight, setEditorHeight] = useState(initialHeight);

  // 映射语言到ACE编辑器模式
  const getMode = (lang) => {
    switch (lang.toLowerCase()) {
      case "python":
        return "python";
      case "groovy":
        return "groovy";
      default:
        return "javascript";
    }
  };

  // 编辑器加载完成后的回调
  const onEditorLoad = (editor) => {
    editorRef.current = editor;

    // 调整行号颜色
    const gutter = editor.renderer.$gutterLayer.element;
    if (gutter) {
      gutter.style.backgroundColor = "#f8f9fa";
      gutter.style.color = "#aaaaaa";

      // 强制更新渲染
      editor.renderer.updateFull();
    }
  };

  // 处理大小调整
  const handleResize = (e) => {
    e.preventDefault();

    const startY = e.clientY;
    const startHeight = parseInt(editorHeight);

    const handleMouseMove = (moveEvent) => {
      const newHeight = startHeight + moveEvent.clientY - startY;
      if (newHeight >= minHeight) {
        setEditorHeight(`${newHeight}px`);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="code-editor-field"
      style={{
        border: "1px solid #dfdfe2",
        borderRadius: "6px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AceEditor
        mode={getMode(language)}
        theme="github"
        width="100%"
        height={editorHeight}
        value={formData || ""}
        onChange={onChange}
        name={`code-editor-${formContext?.nodeId || Date.now()}`}
        editorProps={{ $blockScrolling: true }}
        fontSize={14}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        onLoad={onEditorLoad}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />

      {/* 调整大小的手柄 */}
      <div
        style={{
          height: "6px",
          backgroundColor: "#f0f0f0",
          borderTop: "1px solid #dfdfe2",
          cursor: "ns-resize",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onMouseDown={handleResize}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e8e8e8")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
      >
        <div
          style={{ width: "30px", height: "2px", backgroundColor: "#ccc" }}
        ></div>
      </div>
    </div>
  );
};

export default CodeEditorField;
