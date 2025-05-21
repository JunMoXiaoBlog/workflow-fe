// 直接修改NodeConfigLoader.js - 更直接的解决方案

import nodeConfigs from "./combined-node-config.json";

/**
 * 节点配置加载器
 * 负责加载和管理节点配置，增加了对HTTP节点的特殊处理
 */
class NodeConfigLoader {
  // 存储所有节点配置
  static configs = (() => {
    // 克隆配置，避免修改原始配置
    const clonedConfigs = JSON.parse(JSON.stringify(nodeConfigs));

    // 特殊处理HTTP节点，确保form-data和x-www-form-urlencoded使用KVTableField
    if (clonedConfigs.HTTP && clonedConfigs.HTTP.uiSchema) {
      // 直接修改HTTP body字段的UI Schema
      // 这种方法绕过了ui:dependencies的复杂性

      // 1. 为form-data内容类型创建特殊的schema路径
      if (!clonedConfigs.HTTP.uiSchema["ui:dependencies"]) {
        clonedConfigs.HTTP.uiSchema["ui:dependencies"] = {};
      }

      if (!clonedConfigs.HTTP.uiSchema["ui:dependencies"].contentType) {
        clonedConfigs.HTTP.uiSchema["ui:dependencies"].contentType = {};
      }

      // 确保form-data使用KVTableField
      clonedConfigs.HTTP.uiSchema["ui:dependencies"].contentType["form-data"] =
        {
          body: {
            "ui:field": "KVTableField",
            "ui:options": {
              keyPlaceholder: "name",
              valuePlaceholder: "value",
              label: "表单字段",
            },
            "ui:title": "Form Data表单字段",
          },
        };

      // 确保x-www-form-urlencoded使用KVTableField
      clonedConfigs.HTTP.uiSchema["ui:dependencies"].contentType[
        "x-www-form-urlencoded"
      ] = {
        body: {
          "ui:field": "KVTableField",
          "ui:options": {
            keyPlaceholder: "name",
            valuePlaceholder: "value",
            label: "表单字段",
          },
          "ui:title": "URL编码表单字段",
        },
      };

      console.log(
        "已直接修改HTTP节点配置，确保form-data和x-www-form-urlencoded使用KVTableField"
      );
    }

    return clonedConfigs;
  })();

  /**
   * 获取指定节点类型的Schema配置
   * @param {string} nodeType 节点类型
   * @returns 节点Schema配置
   */
  static getNodeSchema(nodeType) {
    return (this.configs[nodeType] && this.configs[nodeType].schema) || null;
  }

  /**
   * 获取指定节点类型的UI Schema配置
   * @param {string} nodeType 节点类型
   * @returns 节点UI Schema配置
   */
  static getNodeUiSchema(nodeType) {
    // 特殊处理HTTP节点的UI Schema
    if (nodeType === "HTTP") {
      const uiSchema =
        (this.configs[nodeType] && this.configs[nodeType].uiSchema) || null;

      // 确保HTTP节点的form-data和x-www-form-urlencoded内容类型使用KVTableField
      if (
        uiSchema &&
        uiSchema["ui:dependencies"] &&
        uiSchema["ui:dependencies"].contentType
      ) {
        const contentTypeDeps = uiSchema["ui:dependencies"].contentType;

        // 确认form-data和x-www-form-urlencoded配置正确
        if (contentTypeDeps["form-data"] && contentTypeDeps["form-data"].body) {
          console.log(
            "确认HTTP节点form-data配置:",
            contentTypeDeps["form-data"].body
          );
        }

        if (
          contentTypeDeps["x-www-form-urlencoded"] &&
          contentTypeDeps["x-www-form-urlencoded"].body
        ) {
          console.log(
            "确认HTTP节点x-www-form-urlencoded配置:",
            contentTypeDeps["x-www-form-urlencoded"].body
          );
        }
      }

      return uiSchema;
    }

    // 其他节点类型正常处理
    return (this.configs[nodeType] && this.configs[nodeType].uiSchema) || null;
  }

  // 在 NodeConfigLoader 类中添加此方法
  static getNodeDocPath(nodeType) {
    // 构建文档路径 - 使用与src同级的docs目录
    return `docs/${nodeType.toLowerCase()}_node.md`;
  }

  /**
   * 获取指定节点类型的面板配置
   * @param {string} nodeType 节点类型
   * @returns 节点面板配置
   */
  static getPanelConfig(nodeType) {
    return (
      (this.configs[nodeType] && this.configs[nodeType].panelConfig) || null
    );
  }

  /**
   * 获取指定节点类型的完整配置
   * @param {string} nodeType 节点类型
   * @returns 节点完整配置
   */
  static getNodeConfig(nodeType) {
    return this.configs[nodeType] || null;
  }

  /**
   * 获取所有节点类型
   * @returns 节点类型列表
   */
  static getNodeTypes() {
    return Object.keys(this.configs);
  }

  /**
   * 获取节点类型的默认配置
   * @param {string} nodeType 节点类型
   * @returns 节点默认配置
   */
  static getDefaultConfig(nodeType) {
    const schema = this.getNodeSchema(nodeType);
    if (!schema) return {};

    const defaultConfig = {};

    // 遍历schema中的属性，提取默认值
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        // 跳过nodeType和nodeId字段
        if (key === "nodeType" || key === "nodeId") return;

        // 如果属性有默认值，使用它
        if (prop.default !== undefined) {
          defaultConfig[key] = prop.default;
        }
      });
    }

    return defaultConfig;
  }

  /**
   * 添加或更新节点配置
   * @param {string} nodeType 节点类型
   * @param {object} config 节点配置
   */
  static updateNodeConfig(nodeType, config) {
    this.configs[nodeType] = {
      ...this.configs[nodeType],
      ...config,
    };
  }

  /**
   * 特别为HTTP节点提供form-data和x-www-form-urlencoded的body配置
   * @param {string} contentType 内容类型
   * @returns 对应内容类型的body UI Schema
   */
  static getHttpBodyUiSchema(contentType) {
    if (
      contentType === "form-data" ||
      contentType === "x-www-form-urlencoded"
    ) {
      return {
        "ui:field": "KVTableField",
        "ui:options": {
          keyPlaceholder: "name",
          valuePlaceholder: "value",
          label:
            contentType === "form-data"
              ? "Form Data表单字段"
              : "URL编码表单字段",
        },
      };
    }
    return null;
  }
}

export default NodeConfigLoader;
