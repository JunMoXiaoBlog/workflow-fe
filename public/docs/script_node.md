# SCRIPT 节点使用说明

SCRIPT 节点允许执行自定义代码，为工作流提供灵活的数据处理和转换能力。它支持多种脚本语言，可以实现复杂的业务逻辑和数据处理。

## 基本功能

- 执行自定义脚本代码
- 支持JavaScript、Python和Groovy等语言
- 处理和转换工作流数据
- 实现复杂业务逻辑和计算
- 与外部系统集成

## 配置说明

### 基本属性

- **脚本语言**: 选择执行脚本的语言
  - **JavaScript**: 默认选项，适合大多数场景
  - **Python**: 适合数据分析和科学计算
  - **Groovy**: Java生态系统集成

- **脚本代码**: 要执行的代码，根据选择的语言有不同的语法

#### JavaScript 示例

```javascript
// 在此编写脚本代码
function process(input) {
  // 访问输入数据
  const { payload, variables } = input;
  
  // 执行数据转换
  const result = {
    processed: true,
    timestamp: new Date().toISOString(),
    data: payload.data.map(item => ({
      id: item.id,
      name: item.name.toUpperCase(),
      value: item.value * 2
    }))
  };
  
  // 返回处理结果
  return result;
}
```

#### Python 示例

```python
# 在此编写脚本代码
def process(input):
    # 访问输入数据
    payload = input.get('payload', {})
    variables = input.get('variables', {})
    
    # 执行数据转换
    result = {
        "processed": True,
        "timestamp": variables.get('current_time'),
        "data": []
    }
    
    for item in payload.get('data', []):
        result['data'].append({
            "id": item.get('id'),
            "name": item.get('name', '').upper(),
            "value": item.get('value', 0) * 2
        })
    
    # 返回处理结果
    return result
```

#### Groovy 示例

```groovy
// 在此编写脚本代码
def process(input) {
    // 访问输入数据
    def payload = input.payload
    def variables = input.variables
    
    // 执行数据转换
    def result = [
        processed: true,
        timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'"),
        data: []
    ]
    
    payload.data.each { item ->
        result.data.add([
            id: item.id,
            name: item.name.toUpperCase(),
            value: item.value * 2
        ])
    }
    
    // 返回处理结果
    return result
}
```

### 异常处理

- **错误处理策略**:
  - **终止流程**: 出错时停止整个流程
  - **忽略错误**: 出错时继续，使用默认返回值
  - **重试执行**: 出错时尝试重新执行脚本

- **超时时间(毫秒)**: 脚本执行的最长等待时间
- **最大重试次数**: 选择重试策略时使用
- **重试间隔(毫秒)**: 两次重试之间的等待时间
- **启用指数退避**: 每次重试等待时间增加
- **失败返回值**: 脚本执行失败时返回的默认JSON数据

## 脚本编写指南

### 输入参数

脚本函数接收一个包含工作流数据的输入对象，通常包括：

- **payload**: 上游节点传递的主要数据
- **variables**: 工作流变量
- **context**: 执行上下文信息，包含节点ID、工作流ID等

### 返回值

脚本必须返回一个值，该值将作为节点的输出传递给下游节点：

- 推荐返回JSON对象，便于下游节点处理
- 返回值将自动序列化为JSON
- 可以返回简单值如字符串、数字或布尔值

### 错误处理

脚本中的错误处理方式：

```javascript
try {
  // 可能出错的代码
  const result = JSON.parse(input.payload.data);
  return result;
} catch (error) {
  // 处理错误
  console.error("Error processing data:", error.message);
  return {
    error: true,
    message: error.message,
    fallback: {}
  };
}
```

## 最佳实践

1. **模块化代码结构**
   - 将复杂逻辑分解为多个函数
   - 使用有意义的变量和函数名
   - 添加注释说明代码用途

2. **优化性能**
   - 避免不必要的循环和计算
   - 使用高效的数据结构和算法
   - 大型数据集处理时考虑分批处理

3. **安全处理输入**
   - 总是验证输入数据的存在性和类型
   - 使用默认值处理缺失数据
   ```javascript
   const data = input.payload?.data || [];
   const userId = input.variables?.userId || 'unknown';
   ```

4. **标准化输出格式**
   - 保持一致的返回数据结构
   - 包含元数据如处理时间、状态等
   ```javascript
   return {
     status: "success",
     timestamp: new Date().toISOString(),
     data: result,
     metrics: {
       processTime: endTime - startTime,
       itemCount: items.length
     }
   };
   ```

5. **调试技巧**
   - 使用节点调试功能测试脚本
   - 添加日志输出关键信息
   - 逐步构建复杂逻辑，确保每步正确

## 常见用例

1. **数据转换**
   - 格式转换(XML到JSON, CSV解析等)
   - 数据清洗和规范化
   - 字段映射和重命名

2. **业务规则处理**
   - 复杂条件判断
   - 多步骤验证
   - 折扣和定价计算

3. **数据聚合和统计**
   - 计算总和、平均值、