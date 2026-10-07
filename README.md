# Game Hosting · 游戏服务器托管平台

基于 React、Vite 和 Node.js 的游戏服务器托管平台原型，包含官网、用户控制台和管理后台，适合本地开发、界面演示及后续接入实际托管服务。

项目由 Figma Make 页面代码扩展而来。账号认证、用户偏好及部分管理数据已接入 SQLite；服务器启停、终端命令、插件安装、备份和定时任务等功能目前主要使用演示数据与前端交互，尚未连接真实游戏服务器或支付服务。

## 功能概览

- **官网**：首页、游戏列表、Minecraft 托管介绍、部署流程和支持文档。
- **用户账号**：注册、用户名或邮箱登录、退出、会话恢复和账号偏好保存。
- **用户控制台**：总览、实例、财务、团队管理、工单、推介计划和个人设定。
- **实例工作区**：列表与筛选、概览与终端、玩家管理、文件编辑、Minecraft 插件广场、备份、定时任务、日志和机器设定。
- **管理后台**：用户管理、余额与赠金调整、实例监控、产品与价格、节点与机房配置、客服工单、文档与系统设置。部分页面仍为本地演示。
- **界面体验**：响应式布局、主题切换、控制台导航布局和币种偏好。

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 前端 | React 18、TypeScript / TSX、React Router 7 |
| 构建与样式 | Vite 6、Tailwind CSS 4、独立 CSS 样式文件 |
| 组件与交互 | Radix UI / shadcn/ui、Lucide、Motion |
| 图表与编辑器 | Recharts、Monaco Editor |
| 后端 | Node.js 原生 HTTP 服务、better-sqlite3 |
| 数据存储 | SQLite；部分演示状态使用 localStorage 或页面内存 |

## 快速开始

### 环境要求

- Node.js 20 或更新版本。
- Windows 建议使用 **Node.js 22**，与仓库运行检查提示一致。Node.js 24+ 可以继续运行，遇到原生依赖问题时建议切换到 Node.js 22。
- npm。

在项目根目录运行：

```sh
npm ci
npm run dev
```

`npm run dev` 同时启动前端和 API 服务：

- 前端默认地址为 `http://localhost:5173`，以终端输出为准；端口被占用时 Vite 可能选择其他端口。
- 后端默认地址为 `http://127.0.0.1:8787`。
- 前端 `/api` 请求由 Vite 转发到后端。

打开首页，通过导航栏注册或登录，也可以直接访问 `/dashboard` 预览控制台。按 `Ctrl+C` 结束开发进程。

### Windows 本地启动

安装依赖后，也可以运行：

```sh
node scripts/start-local.mjs
```

脚本使用前端端口 **3000** 和后端端口 **8787**，复用已运行且通过检查的服务，等待就绪后自动打开 `http://127.0.0.1:3000/dashboard`。若端口被其他服务占用，脚本会报错。

不自动打开浏览器时运行：

```sh
node scripts/start-local.mjs --no-open
```

新启动的服务在当前终端输出日志。请保留终端窗口；按 `Ctrl+C` 停止本次脚本启动的服务，已复用的服务不受影响。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm ci` | 按锁文件安装依赖 |
| `npm run dev` | 同时启动前端和后端 |
| `npm run dev:web` | 单独启动 Vite 前端 |
| `npm run dev:api` | 单独启动 API 后端 |
| `npm run build` | 构建前端，输出到 `dist/` |
| `npm run serve` | 启动后端，并提供已有的 `dist/` 静态页面 |

当前 `package.json` 未配置独立的测试、lint 或类型检查命令。

## 页面入口

以下路径相对于正在使用的前端地址：

| 路径 | 页面 |
| --- | --- |
| `/` | 官网首页 |
| `/games` | 游戏列表 |
| `/minecraft` | Minecraft 托管介绍 |
| `/deploy` | 部署流程演示 |
| `/support` | 支持中心 |
| `/support/category/:categoryId` | 文档分类 |
| `/support/article/:articleId` | 文档详情 |
| `/dashboard` | 用户控制台 |
| `/admin` | 管理控制台，需要指定管理员用户 |
| `/admin-test` | 使用模拟数据的管理界面预览 |

用户控制台支持通过 `tab` 参数选择页面，例如 `/dashboard?tab=instances`、`/dashboard?tab=billing`、`/dashboard?tab=settings`。可用值为 `overview`、`instances`、`billing`、`team`、`tickets`、`referral` 和 `settings`。

在实例列表双击服务器或按 Enter 可打开完整详情。示例：`/dashboard?server=srv-mc-01`。

## 账号与管理权限

默认开放注册。用户名为 2–64 个字符，可包含字母、数字、下划线、连字符和英文句点，密码至少 6 个字符。登录支持用户名或邮箱。

后端启动时会尝试补齐以下演示用户，默认密码均为 `DemoPass123!`：

| 用户名 | 邮箱 |
| --- | --- |
| `aurora_ops` | `mc_admin_team@mcserver.net` |
| `rustwarden` | `new_studio@indie.co` |
| `player_one` | `player_one@gmail.com` |

已有同 UID 的账号不会被重新创建或重置密码。演示账号仅用于本地体验。

### 管理控制台

`/admin` 使用普通用户会话鉴权，仅允许 UID 为 **`586342232960`** 的用户进入，前后端均会检查。未登录用户返回首页并打开登录弹窗，普通用户返回用户控制台。

全新数据库不会自动创建此 UID 的管理员用户。如需在本地访问 `/admin`，先注册管理用账号，再使用 SQLite 工具将该账号的 `users.uid` 设置为上述值，重新登录。修改前应确认目标账号和 UID 唯一性。仅预览界面可访问 `/admin-test`。

后端还保留独立的 `/api/admin/login` 认证接口：`admins` 表为空时，会初始化邮箱 `admin@system.local`、密码 `ChangeMe123!` 的账号。这套认证与 `/admin` 的普通用户 UID 权限机制不同，`ADMIN_BOOTSTRAP_*` 配置不会赋予普通用户管理控制台权限。

## 配置

后端读取进程环境变量：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ADMIN_AUTH_PORT` | `8787` | 后端端口，监听地址固定为 `127.0.0.1` |
| `AUTH_USER_REGISTER` | 未设置时开放 | 设为 `0` 关闭用户注册 |
| `ADMIN_BOOTSTRAP_EMAIL` | `admin@system.local` | 独立管理员认证接口的初始邮箱 |
| `ADMIN_BOOTSTRAP_PASSWORD` | `ChangeMe123!` | 独立管理员认证接口的初始密码 |
| `ADMIN_BOOTSTRAP_NAME` | `Primary Admin` | 独立管理员认证接口的显示名称 |

PowerShell 示例，关闭注册后启动：

```powershell
$env:AUTH_USER_REGISTER = "0"
npm run dev
```

`ADMIN_BOOTSTRAP_*` 仅在 `admins` 表为空时生效，不会修改已有账号。后端当前不会自动读取 `.env.local`，请在终端或进程管理器中设置环境变量。

修改后端端口时，还需同步修改 `vite.config.ts` 的 `/api` 代理目标。Windows 本地启动脚本固定使用后端端口 8787。

## 构建与运行构建产物

```sh
npm run build
npm run serve
```

构建完成后访问 `http://127.0.0.1:8787`。同一个 Node.js 服务提供 API 和 `dist/` 静态页面，并将页面路由回退到 `index.html`，支持直接打开 `/dashboard` 等地址。

`npm run serve` 不会自动构建前端；修改前端后需要重新构建。服务仅监听本机，部署到外部环境时需配置反向代理，并持久化 `data/` 目录。默认账号与演示数据需要按实际部署需求处理。

## 数据与演示范围

- 数据库为 `data/admin-auth.sqlite`，后端首次启动自动创建目录与数据表，并补齐部分演示数据。
- 用户、会话、账号偏好、用户管理资料及部分实例、交易、工单、推介、节点数据存入 SQLite。
- 用户控制台的服务器指标、团队、工单等页面仍含演示数据；服务器操作与定时任务不执行真实远程命令。
- 备份演示下载的 ZIP 仅包含演示元数据，或返回用户上传的文件，不包含真实服务器世界存档。
- 插件安装状态和部分通知偏好保存在当前浏览器；仅保存在页面内存的状态可能在刷新后恢复默认值。
- `data/`、`node_modules/`、`dist/` 和 `.env.local` 已被 Git 忽略。数据库采用 WAL 模式，备份时应保留一致的 SQLite 数据。

## 项目结构

```text
game_hosting/
├── src/
│   ├── main.tsx                    # 前端入口
│   ├── app/
│   │   ├── routes.tsx              # 路由与页面懒加载
│   │   ├── components/             # 导航、布局与通用 UI
│   │   ├── config/                 # 控制台导航配置
│   │   ├── context/                # 登录状态与控制台偏好
│   │   ├── hooks/                  # 通用 Hooks
│   │   ├── lib/                    # API 请求、认证与币种工具
│   │   └── pages/                  # 官网、用户与管理后台页面
│   └── styles/                     # 全局与各页面样式
├── server/
│   ├── auth-server.mjs             # HTTP API、SQLite 与静态页面服务
│   ├── dev.mjs                     # 前后端开发进程启动器
│   └── check-node.mjs              # Node.js 环境提示
├── scripts/                        # Windows 启动与演示数据维护
├── public/                         # 静态图片与素材说明
├── guidelines/                     # 设计与功能约定
├── output/design/                  # 设计参考、对比截图与验收记录
├── data/                           # 本地数据库（运行时生成）
├── dist/                           # 前端构建产物（构建时生成）
├── vite.config.ts                  # 构建配置、路径别名与 API 代理
└── AGENTS.md                       # 仓库协作与提交约定
```

## 常见问题

- **页面能打开，但登录或 API 请求失败**：确认后端已启动。`npm run dev:web` 仅启动前端，可改用 `npm run dev`，或在另一终端运行 `npm run dev:api`。
- **`better-sqlite3` 加载失败**：检查 Node.js 版本是否与安装依赖时一致。Windows 可切换到 Node.js 22 后重新运行 `npm ci`。
- **8787 端口被占用**：确认占用进程；Windows 本地脚本可复用符合检查的服务。自定义后端端口时需同步修改 Vite 代理。
- **`npm run serve` 提示缺少构建产物**：先运行 `npm run build`。
- **登录后无法进入 `/admin`**：检查普通用户 UID 是否为 `586342232960`；独立管理员接口账号不能直接用于此页面鉴权。
- **刷新后演示操作消失**：部分功能只保存页面内存状态，持久化范围见“数据与演示范围”。

## 设计与素材来源

原始设计：[Design Cloud Gaming Homepage（Figma）](https://www.figma.com/design/qJEbkDOKFebMFckAaCL4PP/Design-Cloud-Gaming-Homepage)。

第三方组件与图片许可见 [ATTRIBUTIONS.md](./ATTRIBUTIONS.md)，部分素材目录另附 README。仓库协作与中文提交要求见 [AGENTS.md](./AGENTS.md)。
