# 博客小程序系统

## 一、环境要求

| 依赖           | 版本           |
| :------------- | :------------- |
| Node.js        | 18+            |
| Bun            | 1.0+           |
| SQLite         | 3+             |
| 微信开发者工具 | 最新稳定版     |
| VS Code        | 推荐使用       |

## 二、项目结构

```bash
blog
├── admin      # 后台管理端
├── backend    # 后端接口服务
└── frontend   # 微信小程序前台
```

## 三、快速开始

### 1. 初始化数据库

```bash
cd backend
bun install
bun run db:init
```

如果需要重新写入演示文章、友链和站点配置，可以执行：

```bash
bun run seed:demo
```

注意：重新初始化或写入演示数据可能会覆盖已有文章、友链和配置数据，操作前建议备份 `backend/data/sqlite.db`。

### 2. 启动后端服务

```bash
cd backend
bun run dev
```

- 后端默认地址：<http://localhost:3001>
- 文章接口示例：<http://localhost:3001/api/public/posts>
- 数据库：SQLite
- ORM：Drizzle ORM

### 3. 启动后台管理端

```bash
cd admin
npm install
npm run dev
```

- 后台管理端用于维护文章、友链、站点配置、邮件日志等内容。
- 访问地址以控制台输出为准，一般为：<http://localhost:5173>

### 4. 配置小程序前台接口地址

修改 `frontend/.env.development`：

```env
VITE_API_BASE_URL=http://localhost:3001
```

如果需要真机调试，请将 `localhost` 改为电脑局域网 IP：

```env
VITE_API_BASE_URL=http://你的电脑IPv4地址:3001
```

例如：

```env
VITE_API_BASE_URL=http://192.168.1.23:3001
```

### 5. 启动微信小程序前台

```bash
cd frontend
npm install
npm run dev:mp-weixin
```

编译完成后，使用微信开发者工具打开：

```bash
frontend/dist/dev/mp-weixin
```

### 6. 微信开发者工具设置

开发调试时建议在微信开发者工具中开启：

```text
详情 → 本地设置 → 不校验合法域名、web-view、TLS版本以及HTTPS证书
```

如果进行真机预览，需要保证手机和电脑处于同一局域网，并且手机浏览器能够访问：

```text
http://电脑IPv4地址:3001/api/public/posts
```

## 四、主要功能

### 1. 微信小程序前台

- 首页展示
- 文章列表
- 文章详情
- 归档浏览
- 友链展示
- 站点信息展示

### 2. 后台管理端

- 管理员登录
- 文章管理
- 文章封面上传
- 友链管理
- 系统配置
- 个性化信息维护
- 邮件日志查看

### 3. 后端服务

- 用户认证接口
- 文章接口
- 友链接口
- 系统配置接口
- 文件上传接口
- 邮件日志接口

## 五、注意事项

- 首次运行项目时，需要先执行 `bun run db:init` 初始化数据库。
- 小程序真机调试时不能使用 `localhost`，需要使用电脑局域网 IP。
- 修改 `.env.development` 后，需要重新执行 `npm run dev:mp-weixin`。
- 后端服务需要保持运行，否则前台和后台无法正常加载数据。
- 上传图片资源由后端统一保存，前台通过接口地址访问图片资源。
