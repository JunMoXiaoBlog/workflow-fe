# START 节点使用说明

START 节点是工作流的起点，每个工作流必须有一个开始节点。

## 基本功能

- 标记流程的开始位置
- 可以设置流程的初始参数和变量
- 触发后续节点的执行

## 配置说明

### 基本属性

- **节点描述**: 为流程添加说明文字，便于理解
- **流程标签**: 添加标签，便于全局搜索和分类

### 异常处理

- **错误处理策略**: 当节点执行失败时的处理方式
  - 终止流程: 直接停止整个流程执行
  - 忽略错误: 继续执行后续节点
  - 重试执行: 尝试再次执行节点

- **超时时间**: 节点执行的最长等待时间，单位为毫秒
- **最大重试次数**: 设置最多重试几次
- **重试间隔**: 两次重试之间的等待时间
- **启用指数退避**: 每次重试时间间隔逐渐增加
- **失败返回值**: 节点失败时返回的默认JSON数据

### 调试功能

使用"节点调试"标签页可以测试节点的执行情况：

1. 在调试参数框中输入JSON格式的测试数据
2. 点击"运行调试"按钮
3. 在返回结果框中查看执行结果

## 最佳实践

1. 添加清晰的节点描述，说明流程的用途
2. 设置合理的标签，便于在多个流程中快速查找
3. 根据流程的重要性合理配置错误处理策略
4. 在开发阶段充分使用调试功能验证配置正确性

## 注意事项

- 每个工作流只能有一个START节点
- START节点不能有输入连接，只能有输出连接
- 设置过长的超时时间可能导致资源占用过多