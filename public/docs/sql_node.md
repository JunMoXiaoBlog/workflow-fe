# SQL 节点使用说明

SQL 节点用于执行数据库查询和操作，支持多种数据库类型和多种SQL操作，可以与数据库系统进行交互。

## 基本功能

- 连接到各种关系型数据库
- 执行SQL查询、更新、插入和删除操作
- 支持参数化查询和动态SQL
- 限制结果集大小，提高性能

## 配置说明

### 数据库连接

- **数据库类型**: 选择数据库管理系统类型
  - MySQL
  - PostgreSQL
  - Oracle
  - SQLServer
  - SQLite

- **主机地址**: 数据库服务器的主机名或IP地址
  - 本地数据库可使用`localhost`
  - 远程数据库填写服务器IP地址或域名

- **端口**: 数据库服务器端口号
  - MySQL默认: 3306
  - PostgreSQL默认: 5432
  - Oracle默认: 1521
  - SQLServer默认: 1433
  - SQLite: 无需端口，使用文件路径

- **数据库名**: 要连接的数据库名称

- **用户名**: 数据库连接的用户名

- **密码**: 数据库连接的密码

### SQL操作配置

- **操作类型**: 选择SQL操作类型
  - QUERY: 查询操作，返回数据集
  - UPDATE: 更新操作，返回影响的行数
  - INSERT: 插入操作，返回新插入的ID或行数
  - DELETE: 删除操作，返回影响的行数

- **SQL语句**: 要执行的SQL语句
  - 支持使用`#{变量}`引用工作流变量作为参数
  - 示例: `SELECT * FROM users WHERE user_id = #{userId} AND status = #{status}`

- **最大行数**: 限制QUERY操作返回的最大记录数(1-200)
  - 系统会自动添加LIMIT子句
  - 默认值: 100

### 异常处理

- **错误处理策略**:
  - 终止流程: 出错时停止整个流程
  - 忽略错误: 出错时继续，使用默认返回值
  - 重试执行: 出错时尝试重新执行SQL操作

- **超时时间(毫秒)**: SQL操作的最长等待时间
- **最大重试次数**: 选择重试策略时的重试次数
- **重试间隔(毫秒)**: 两次重试之间的等待时间
- **启用指数退避**: 每次重试等待时间增加
- **失败返回值**: 操作失败时返回的默认JSON数据

## 最佳实践

1. **使用参数化查询防止SQL注入**
   ```sql
   SELECT * FROM users WHERE username = #{username}
   ```
   而不是直接拼接:
   ```sql
   SELECT * FROM users WHERE username = '${username}'  -- 不安全
   ```

2. **优化查询性能**
   - 使用索引列进行过滤
   - 限制结果集大小，使用"最大行数"设置
   - 只选择需要的列: `SELECT id, name FROM users` 而不是 `SELECT * FROM users`

3. **实现事务控制**
   - 对于需要事务保证的多表操作，使用单个SQL节点和事务语句
   - 示例:
     ```sql
     BEGIN TRANSACTION;
     UPDATE accounts SET balance = balance - #{amount} WHERE id = #{fromAccount};
     UPDATE accounts SET balance = balance + #{amount} WHERE id = #{toAccount};
     COMMIT;
     ```

4. **分批处理大数据集**
   - 使用分页查询处理大数据集
   - 结合Loop节点迭代处理数据

5. **使用WITH子句增强可读性**
   ```sql
   WITH active_users AS (
     SELECT * FROM users WHERE status = 'active'
   )
   SELECT au.id, COUNT(o.id) as orders_count
   FROM active_users au
   LEFT JOIN orders o ON au.id = o.user_id
   GROUP BY au.id
   ```

## 注意事项

- 数据库凭证通常很敏感，应使用环境变量或密钥管理服务存储
- 长时间运行的查询可能影响工作流的整体性能，注意优化查询和设置合理的超时时间
- 对于数据修改操作(INSERT/UPDATE/DELETE)，务必确认SQL语句的正确性
- 不同数据库系统的SQL方言有差异，确保SQL语句与所选数据库类型兼容
- 当使用"最大行数"限制时，确保你的查询结果是确定性的(排序明确)
- 考虑数据库连接池的限制，避免创建过多连接
- 对于需要返回自增ID的INSERT操作，不同数据库的语法不同:
  - MySQL: `INSERT INTO... ; SELECT LAST_INSERT_ID();`
  - PostgreSQL: `INSERT INTO... RETURNING id;`
  - SQLServer: `INSERT INTO... ; SELECT SCOPE_IDENTITY();`