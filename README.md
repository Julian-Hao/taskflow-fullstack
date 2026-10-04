# TaskFlow

> 一个前后端分离的全栈任务管理应用：React + TypeScript 前端，Express + SQLite 后端，单端口部署。

<p align="left">
  <img alt="Node" src="https://img.shields.io/badge/Node.js-%E2%89%A520-339933?logo=node.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
</p>

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [API 接口](#api-接口)
- [测试](#测试)
- [Docker 部署](#docker-部署)
- [项目结构](#项目结构)
- [安全设计](#安全设计)
- [License](#license)

## 功能特性

**任务管理**

- 新建 / 编辑 / 删除任务，支持行内编辑与快捷键（`Enter` 保存、`Esc` 取消）
- 完成状态切换，采用**乐观更新**，请求失败自动回滚
- 分类（工作 / 学习 / 生活 / 个人）、优先级（高 / 中 / 低）、截止日期
- 四维筛选：状态 × 分类 × 优先级 × 关键字搜索（搜索带防抖）
- 统计面板：总数、待完成、已完成、完成率
- 截止日期语义化展示（今天 / 明天 / 昨天 / M月D日），逾期自动标红

**账号体系**

- 注册 / 登录 / 登出，会话基于 Bearer Token
- 密码使用 `scrypt` 加盐哈希存储，比对走恒定时间算法
- **数据按用户隔离**，任何跨用户读写都会被拒绝

**工程能力**

- 前端与后端全量 TypeScript，严格模式
- 分层架构：路由 → 服务 → 仓储，职责边界清晰
- 请求参数用 Zod 声明式校验，错误响应格式统一
- Vitest 单元测试 + API 集成测试（内存 SQLite，互不污染）
- ESLint + Prettier，GitHub Actions 持续集成
- 多阶段构建的 Docker 镜像，以非 root 用户运行并内置健康检查（**未经实测**，见 [Docker 部署](#docker-部署)）

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite |
| 状态管理 | Zustand |
| 后端框架 | Express 5 + TypeScript |
| 数据库 | SQLite（`better-sqlite3`，同步 API、WAL 模式） |
| 参数校验 | Zod |
| 测试 | Vitest + Testing Library + Supertest |
| 代码质量 | ESLint（flat config）+ Prettier |
| 部署 | Docker 多阶段构建 / GitHub Actions CI |

## 系统架构

```text
┌──────────────────────────────────────────────────────────────┐
│                        浏览器（SPA）                          │
│  React 组件  ←→  Zustand Store  ←→  lib/api.ts（唯一出口）    │
└───────────────────────────────┬──────────────────────────────┘
                                │  fetch  /api/**
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                     Express 应用（单进程）                     │
│                                                              │
│   routes/        authRoutes · taskRoutes      ← HTTP 层      │
│      │                                                       │
│   middleware/    requireAuth · errorHandler                  │
│      │                                                       │
│   services/      authService · taskService    ← 业务规则      │
│      │                                                       │
│   repositories/  user · session · task        ← 数据访问      │
│      │                                                       │
│   db/            better-sqlite3 + schema.sql  ← 持久化        │
└──────────────────────────────────────────────────────────────┘
```

设计要点：

- **单一职责分层**：路由层只做「解析请求 → 调用服务 → 返回响应」，不写业务规则；服务层不碰 HTTP 对象；仓储层是唯一拼接 SQL 的地方。
- **错误统一收口**：业务代码只管 `throw`，`errorHandler` 把 Zod 校验错误、`HttpError`、未知异常统一转换成 `{ error, code }`。
- **前端网络出口唯一**：所有请求都经过 `src/lib/api.ts`，token 注入与错误归一化只实现一次。
- **避免 store 循环依赖**：登录过期通过 `store/session.ts` 的事件订阅解耦。

## 快速开始

### 环境要求

- Node.js ≥ 20（推荐 22）
- npm ≥ 10

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（可选，不配则使用默认值）
cp .env.example .env

# 3. 同时启动后端（:3000）与前端（:5173）
npm run dev
```

打开 <http://localhost:5173> 即可。开发模式下 Vite 会把 `/api` 请求代理到后端。

> **⚠️ 不要把项目放在 FAT32 / exFAT 格式的磁盘上开发。**
>
> 这类文件系统不支持符号链接，而 npm 需要在 `node_modules/.bin/` 下为每个可执行文件创建符号链接。
> 在这类分区上执行 `npm install` 会直接失败，典型报错如下：
>
> ```text
> npm ERR! code ENOENT
> npm ERR! syscall rename
> npm ERR! path /path/to/taskflow/node_modules/.bin/acorn
> npm ERR! errno -2
> npm ERR! ENOENT: no such file or directory, rename
> ```
>
> 请把项目放在支持符号链接的分区上：macOS 内置磁盘（APFS）、Linux 的 ext4，或 Windows 的 NTFS。
> 外接 U 盘与移动硬盘出厂常见 FAT32 / exFAT，需要先重新格式化再使用。

### 生产模式（单端口）

```bash
npm run build   # 构建前端到 dist/，打包后端到 dist-server/
npm start       # Express 同时托管 API 与前端静态资源
```

打开 <http://localhost:3000>。

### 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 并行启动前后端开发服务 |
| `npm run build` | 构建前端与服务端 |
| `npm start` | 以生产模式启动 |
| `npm run typecheck` | 前后端类型检查 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |
| `npm test` | 运行全部测试 |
| `npm run test:coverage` | 生成覆盖率报告 |

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `NODE_ENV` | `development` | 运行环境，`production` 下隐藏错误细节 |
| `HOST` | `0.0.0.0` | 监听地址 |
| `PORT` | `3000` | 监听端口 |
| `DB_FILE` | `./data/taskflow.db` | SQLite 文件路径，`:memory:` 表示内存库 |
| `STATIC_DIR` | `./dist` | 前端构建产物目录 |
| `SESSION_TTL_HOURS` | `720` | 会话有效期（小时） |
| `SCRYPT_COST` | `16384` | 密码哈希代价参数 |

## API 接口

所有接口以 `/api` 为前缀，请求与响应均为 JSON。
需要鉴权的接口通过请求头 `Authorization: Bearer <token>` 传递凭证。

错误响应统一为：

```json
{ "error": "人类可读的提示", "code": "machine_readable_code" }
```

### 健康检查

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 返回服务状态与运行时长 |

### 认证

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | 否 | 注册并直接返回登录态 |
| `POST` | `/api/auth/login` | 否 | 登录 |
| `GET` | `/api/auth/me` | 是 | 获取当前用户 |
| `POST` | `/api/auth/logout` | 是 | 登出，使当前 token 失效 |

<details>
<summary>示例：注册</summary>

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret123"}'
```

```json
{
  "token": "3f1c…",
  "user": { "id": "9b2e…", "username": "alice", "createdAt": 1791123158758 }
}
```

</details>

### 任务

以下接口均需鉴权，且只能操作**当前用户自己**的任务。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/tasks` | 任务列表（未完成优先，其次按创建时间倒序） |
| `POST` | `/api/tasks` | 新建任务 |
| `PATCH` | `/api/tasks/:id` | 局部更新（标题 / 备注 / 分类 / 优先级 / 截止日期 / 完成状态） |
| `DELETE` | `/api/tasks/:id` | 删除任务 |

<details>
<summary>示例：新建任务</summary>

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"写项目周报","category":"工作","priority":"high","dueDate":"2026-10-05"}'
```

```json
{
  "task": {
    "id": "c62d…",
    "userId": "9b2e…",
    "title": "写项目周报",
    "notes": "",
    "category": "工作",
    "priority": "high",
    "dueDate": "2026-10-05",
    "done": false,
    "createdAt": 1791123311215,
    "updatedAt": 1791123311215
  }
}
```

</details>

### 状态码约定

| 状态码 | 含义 |
| --- | --- |
| `200` / `201` | 成功 |
| `400` | 参数校验失败（`validation_error`） |
| `401` | 未登录或凭证失效（`unauthorized` / `invalid_credentials`） |
| `404` | 资源不存在（含越权访问他人资源） |
| `409` | 用户名已被占用（`username_taken`） |
| `500` | 服务端异常（`internal_error`） |

## 测试

```bash
npm test              # 一次性运行
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告
```

测试分三层：

| 层次 | 位置 | 覆盖内容 |
| --- | --- | --- |
| 纯函数单测 | `src/__tests__/format.test.ts` | 筛选、统计、日期描述 |
| 组件测试 | `src/__tests__/TaskItem.test.tsx` | 渲染、交互回调、编辑态 |
| 服务层单测 | `server/__tests__/*Service.test.ts` | 注册登录、密码哈希、数据隔离 |
| API 集成测试 | `server/__tests__/api.test.ts` | 用 Supertest 打真实 HTTP 栈 |

服务端测试跑在 `:memory:` SQLite 上（见 `vitest.config.ts`），每个用例前清库，因此可重复执行且互不干扰。

## Docker 部署

> **⚠️ 未经实测**：编写时开发环境未安装 Docker，因此 `Dockerfile` 与 `docker-compose.yml`
> **没有经过实际构建与运行验证**，配置仅按多阶段构建的常规做法编写。首次构建若遇问题，
> 优先排查以下两点：
>
> - **原生模块编译**：`better-sqlite3` 依赖预编译二进制包（`prebuild-install`）。若目标平台没有
>   对应的预编译产物，运行阶段的 `npm ci --omit=dev` 会退化为本地编译，而运行阶段镜像**未安装**
>   `python3 / make / g++`。此时需把构建阶段安装工具链的那几行复制到运行阶段，或改用已装好
>   工具链的基础镜像。
> - **数据目录权限**：镜像内以非 root 用户 `node`（uid 1000）运行，`/app/data` 已 `chown` 给该用户。
>   使用命名卷 `taskflow-data` 时会自动继承属主；但若改为挂载宿主机目录，需自行确保该目录
>   对 uid 1000 可写，否则 SQLite 会因无法创建数据库文件而启动失败。

```bash
# 构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f taskflow

# 停止
docker compose down
```

服务暴露在 <http://localhost:3000>，SQLite 数据通过命名卷 `taskflow-data` 持久化。

也可以只用 Docker 命令：

```bash
docker build -t taskflow .
docker run -d -p 3000:3000 -v taskflow-data:/app/data --name taskflow taskflow
```

## 项目结构

```text
taskflow/
├── .github/workflows/ci.yml      # 持续集成：lint → typecheck → test → build
├── src/                          # 前端
│   ├── components/               # 视图组件
│   │   ├── AuthPanel.tsx         #   登录 / 注册
│   │   ├── AppHeader.tsx         #   顶栏
│   │   ├── StatsBar.tsx          #   统计面板
│   │   ├── TaskComposer.tsx      #   新建任务
│   │   ├── TaskToolbar.tsx       #   筛选与搜索
│   │   ├── TaskList.tsx          #   列表容器
│   │   ├── TaskItem.tsx          #   单条任务（含编辑态）
│   │   └── ToastHost.tsx         #   全局提示
│   ├── lib/
│   │   ├── api.ts                #   后端接口层（网络请求唯一出口）
│   │   └── format.ts             #   纯函数：筛选 / 统计 / 日期
│   ├── store/                    # Zustand 状态
│   │   ├── useAuthStore.ts
│   │   ├── useTaskStore.ts
│   │   ├── useToastStore.ts
│   │   └── session.ts            #   登录过期事件总线
│   ├── __tests__/                # 前端测试
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── server/                       # 后端
│   ├── routes/                   # HTTP 层
│   ├── middleware/               # 鉴权 / 错误处理
│   ├── services/                 # 业务规则
│   ├── repositories/             # 数据访问
│   ├── db/                       # 连接与建表
│   ├── lib/                      # 密码、日志、错误、校验
│   ├── __tests__/                # 后端测试
│   ├── app.ts                    # Express 装配
│   ├── config.ts                 # 集中配置
│   └── index.ts                  # 启动入口
├── Dockerfile                    # 多阶段构建
├── docker-compose.yml
├── eslint.config.js
├── vite.config.ts
├── vitest.config.ts
└── tsconfig*.json
```

## 安全设计

| 风险 | 应对 |
| --- | --- |
| 密码泄露 | 从不存明文；`scrypt` 加盐哈希（每用户独立随机盐） |
| 时序侧信道 | 密码比对使用 `crypto.timingSafeEqual` |
| 账号枚举 | 登录失败时，「密码错误」与「账号不存在」返回完全相同的提示 |
| SQL 注入 | 全部使用参数化语句；更新字段走白名单映射，不拼接用户输入 |
| 越权访问 | 每条任务查询都带 `user_id` 约束，跨用户操作统一返回 404 |
| XSS | React 默认转义；不使用 `dangerouslySetInnerHTML` |
| 请求体滥用 | `express.json` 限制 100KB |
| 敏感信息外泄 | 用户对象只暴露 `id / username / createdAt`，凭据字段不出仓储层 |

> ⚠️ 这是一个用于学习与演示的全栈项目。若要上生产，建议补充：HTTPS、登录限流与验证码、
> 会话轮换、CSRF 防护、结构化日志采集与告警。

## License

[MIT](./LICENSE)
