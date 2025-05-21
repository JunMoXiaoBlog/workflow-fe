# HTTP 节点使用说明

HTTP 节点用于发送网络请求与外部API或服务进行交互，支持所有标准HTTP方法和多种数据格式。

## 基本功能

- 发送HTTP请求到指定URL
- 支持所有标准HTTP方法(GET, POST, PUT, DELETE等)
- 配置请求头和URL参数
- 处理多种请求体格式(JSON, form-data, x-www-form-urlencoded等)
- 提供认证功能和高级选项配置

## 配置说明

### 请求配置

- **请求方法**: 选择HTTP请求方法
  - GET: 获取资源
  - POST: 创建新资源
  - PUT: 更新资源
  - DELETE: 删除资源
  - PATCH: 部分更新资源
  - HEAD, OPTIONS, TRACE: 特殊请求类型

- **URL**: 请求目标地址，支持使用`#{变量}`引用工作流变量
  - 示例: `https://api.example.com/users/#{userId}`

- **HTTP请求头**: 配置HTTP请求头，如Content-Type, Authorization等
  - 使用键值对配置请求头
  - 支持引用变量: `#{token}`

- **URL查询参数**: 会被附加到URL后作为查询字符串(?key=value)
  - 同样使用键值对配置
  - 值支持变量引用

- **请求体格式**: 根据不同的请求方法和内容类型，选择合适的请求体格式
  - none: 不包含请求体(适用于GET, HEAD等)
  - form-data: 多部分表单数据，支持文件上传
  - x-www-form-urlencoded: URL编码的表单数据
  - json: JSON格式数据
  - text: 纯文本
  - javascript, html, xml: 其他格式
  - binary: 二进制数据

### 认证选项

- **启用认证**: 打开后可配置以下认证方式
  - No Auth: 不使用认证
  - API Key: 使用API密钥认证
  - Bearer Token: 使用令牌认证
  - Basic Auth: 使用用户名和密码
  - OAuth 2.0: OAuth认证
  - JWT Bearer: JWT令牌认证

### 高级选项

- **跟随重定向**: 是否自动跟随3xx重定向响应
- **验证SSL证书**: 是否验证服务器的SSL证书有效性
- **响应格式**: 预期的响应数据格式(json, text, arraybuffer, blob)

### 异常处理

- **错误处理策略**: 
  - 终止流程: 失败时停止整个流程
  - 忽略错误: 失败时继续执行，使用默认返回值
  - 重试执行: 失败时尝试重新发送请求

- **超时时间(毫秒)**: 请求的最长等待时间
- **最大重试次数**: 选择重试策略时使用
- **重试间隔(毫秒)**: 两次重试之间的等待时间
- **启用指数退避**: 每次重试等待时间增加
- **重试状态码**: 遇到这些HTTP状态码时进行重试
  - 默认: 408,429,500,502,503,504
- **失败返回值**: 请求失败时返回的默认JSON数据

## 最佳实践

1. **使用环境变量存储敏感信息**
   ```
   URL: https://api.example.com/v1
   Authorization: Bearer #{env.API_TOKEN}
   ```

2. **优化重试策略**
   - 对于幂等请求(GET, PUT)可以设置较多重试次数
   - 非幂等请求(POST)应谨慎设置重试，避免重复操作
   - 使用指数退避减轻目标服务器负担

3. **正确设置Content-Type**
   - JSON数据使用: `application/json`
   - 表单数据使用: `application/x-www-form-urlencoded`
   - 文件上传使用: `multipart/form-data`

4. **使用变量引用动态构建请求**
   ```
   URL: https://api.example.com/users/#{userId}/orders?status=#{orderStatus}
   ```

5. **处理和验证响应**
   - 验证响应状态码和数据格式
   - 在后续节点处理响应内容

## 注意事项

- GET请求不应包含请求体，尽管技术上可行
- 请求URL必须包含协议(http://或https://)
- 设置过长的超时时间可能导致工作流长时间等待
- 处理大型响应数据时可能需要额外的内存资源
- 如需调用内部微服务，确保网络策略允许HTTP节点访问目标服务
- 当使用认证信息时，尽量使用HTTPS以保证安全