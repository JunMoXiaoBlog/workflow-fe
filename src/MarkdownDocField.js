// MarkdownDocField.js - 修复版本
import React, { useState, useEffect } from "react";
import { Message, Loader } from "semantic-ui-react";
import ReactMarkdown from "react-markdown";

/**
 * Markdown文档显示组件
 * 用于从指定路径加载并显示Markdown格式的文档
 */
const MarkdownDocField = (props) => {
  const { formData = {}, uiSchema = {} } = props;
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从UI Schema中获取文档路径
  const docPath = uiSchema?.["ui:options"]?.docPath || "";

  // 加载文档内容
  useEffect(() => {
    if (!docPath) {
      setIsLoading(false);
      setError("未指定文档路径");
      return;
    }

    console.log("尝试加载文档:", docPath);

    // 尝试加载文档
    setIsLoading(true);
    setError(null);

    // 从指定路径加载文档 - 修复路径问题
    fetch(docPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `无法加载文档: ${response.status} ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((text) => {
        console.log("文档加载成功, 内容长度:", text.length);
        setContent(text);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("加载文档失败:", err);
        setError(`加载文档失败: ${err.message}`);
        setIsLoading(false);

        // 设置默认内容，以防加载失败
        setContent(
          `# ${getNodeTypeFromPath(
            docPath
          )} 节点使用说明\n\n暂无详细文档，这是自动生成的默认内容。`
        );
      });
  }, [docPath]);

  // 从路径中提取节点类型名称
  const getNodeTypeFromPath = (path) => {
    const match = path.match(/\/(\w+)_node\.md$/);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    return "节点";
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Loader active inline="centered" content="正在加载文档..." />
      </div>
    );
  }

  // 如果有错误但有内容，优先显示内容
  if (content) {
    return (
      <div className="markdown-documentation" style={{ padding: "5px 0" }}>
        <ReactMarkdown>{content}</ReactMarkdown>

        {error && (
          <Message warning size="small" style={{ marginTop: "15px" }}>
            <Message.Header>注意</Message.Header>
            <p>使用默认文档内容，因为: {error}</p>
          </Message>
        )}
      </div>
    );
  }

  // 显示错误信息
  if (error) {
    return (
      <Message negative>
        <Message.Header>文档加载失败</Message.Header>
        <p>{error}</p>
        <p>文档路径: {docPath || "未指定"}</p>
      </Message>
    );
  }

  // 显示文档内容
  return (
    <div className="markdown-documentation" style={{ padding: "5px 0" }}>
      {content ? (
        <ReactMarkdown>{content}</ReactMarkdown>
      ) : (
        <Message info>
          <Message.Header>没有文档</Message.Header>
          <p>当前节点没有可用的文档内容</p>
        </Message>
      )}
    </div>
  );
};

export default MarkdownDocField;
