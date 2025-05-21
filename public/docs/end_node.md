# END 节点使用说明

END 节点是工作流的终止点，标志着工作流执行的结束。每个工作流必须有一个结束节点来处理最终输出结果。

## 基本功能

- 标记工作流的结束位置
- 处理和格式化最终输出数据
- 可选择性地运行处理脚本来转换输出

## 配置说明

### 基本属性

- **启用返回处理脚本**: 开启后可以使用脚本定制输出结果格式
  - 关闭状态下，将直接返回上游节点的输出
  - 开启状态下，可使用脚本处理和转换数据

- **脚本语言**: 当启用处理脚本时可选择
  - JavaScript
  - Groovy
  - Python

- **处理脚本**: 自定义的处理逻辑，用于生成最终返回结果

默认的JavaScript处理脚本模板:
```javascript
/**
 * 结束节点处理函数
 * @param {Object} input - 输入数据，包含流程上下文和所有变量
 * @param {Object} context - 执行上下文，包含节点信息和环境变量
 * @returns {Object} - 返回值对象，包含 statusCode, headers 和 body
 */
function processEnd(input, context) {
  // 访问流程变量
  const { variables, payload } = input;
  
  // 默认成功返回
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "success",
      data: payload
    })
  };
}
```

### 异常处理

- **错误处理策略**: 
  - **终止流程**: 出错时停止整个流程执行
  - **忽略错误**: 出错时继续，使用默认返回值

- **超时时间(毫秒)**: 节点执行的最长等待时间
- **失败返回值**: A JSON对象，定义节点执行失败时的默认返回内容

### 调试功能

调试标签页允许您测试END节点的执行:

1. 在调试参数框中输入JSON格式的测试数据，模拟上游节点传入的数据
2. 点击运行调试按钮
3. 在返回结果框中查看执行结果

## 最佳实践

1. **使用处理脚本规范化输出格式**：确保工作流输出统一的结构，便于后续处理
   ```javascript
   return {
     statusCode: 200,
     headers: { "Content-Type": "application/json" },
     data: {
       code: 0,
       message: "success",
       data: result,
       timestamp: new Date().toISOString()
     }
   };
   ```

2. **进行数据验证**：在处理脚本中验证输入数据的完整性和有效性
   ```javascript
   if (!payload || !payload.requiredField) {
     return {
       statusCode: 400,
       body: JSON.stringify({
         code: 400,
         message: "Missing required data"
       })
     };
   }
   ```

3. **添加错误处理**：使用try-catch捕获处理过程中可能出现的异常
   ```javascript
   try {
     // 处理逻辑
   } catch (error) {
     return {
       statusCode: 500,
       body: JSON.stringify({
         code: 500,
         message: "Internal processing error",
         error: error.message
       })
     };
   }
   ```

## 注意事项

- 每个工作流只能有一个END节点
- END节点只能有输入连接，不能有输出连接
- 处理脚本应避免执行过于复杂的计算，如需要大量计算应在前置节点完成
- 返回的数据格式应与调用方预期保持一致
- 处理脚本超时会导致整个流程执行失败，请合理设置超时时间