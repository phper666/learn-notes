# 第4章：配置体系

## 4.1 五个页签的职责

| 页签 | 职责 | 写入位置 |
|---|---|---|
| 项目配置 | 项目列表、初始化/替换/回滚、audit 告警条 | 项目根 `.localdebug.*`、`project_config_back/` |
| 调试命令 | 启动/停止隧道命令（ktctl） | 读取 `.localdebug.ktctl.cmds` |
| 工具安装 | 下载/更新 kubectl、ktctl | `~/.localdebug/bin/` |
| 配置向导 | 选模板 → 填表单 → 保存平台配置 | `~/.localdebug/config/platform-configs/<栈>.json` + IDE PasswordSafe（密文） |
| 环境配置 | kubeconfig 编辑/测试连接、规则文件编辑入口 | `~/.kube/config`、`~/.localdebug/config/*.json` |

## 4.2 配置向导

- **模板**：内置默认栈（Spring Cloud Alibaba + Dubbo + kt-connect）；也可「下载模板」（模板库）或「导入模板文件」（本地 JSON）。
- **表单**：由模板里的 `formFields` 声明式渲染；必填项校验不通过不允许保存。
- **保存**：非密字段写 `~/.localdebug/config/platform-configs/<栈>.json`；密文（AK/SK 等）写 IntelliJ **PasswordSafe**；空值不会清空已有凭据。
- `tag` 字段**不在向导落盘**：它是「每项目」的覆盖项，落在项目的 `.localdebug.json` 里（见 4.3）。

保存后回到「项目配置」页执行初始化。

## 4.3 项目配置（`.localdebug.json`）

由初始化生成/维护，手工可编辑：

| 字段 | 说明 |
|---|---|
| `debugTag` | 路由 tag 覆盖项。初始化时若为空，会写入 OS 用户名并**回写落盘**（之后保持稳定，可手工改） |
| `jvmArgs` | 追加到 JVM 启动参数的基础串（`.localdebug.jvmrc.json` 会带上） |
| `updateDependencies` / `addDependencies` | 初始化时对 pom 的依赖调整（来自依赖模板） |
| `replaceConfigs` | 初始化生成：每个被替换的配置文件对应一条（服务名/命名空间/tag/nacos 坐标/端口等） |

## 4.4 环境配置

- **kubeconfig**：显示路径（默认 `~/.kube/config`），可「编辑 kubeconfig」（打开编辑器）与「测试连接」。失败时若含 `no route to host` 且是 macOS，会提示本地网络权限（见第 1 章）。
- **规则文件**：直接打开 IDEA 编辑器修改（保存即生效，下次初始化/替换使用）。

## 4.5 规则数据（组织数据出包）

插件的「组织相关」默认值都可以用用户文件覆盖（用户文件优先，损坏时回退内置并告警）：

| 文件（`~/.localdebug/config/`） | 作用 | 缺省行为 |
|---|---|---|
| `namespace-map.json` | 命名空间映射与反查 | 空表；未映射时按同名当 k8s namespace（identity） |
| `project-rules.json` | 服务类型判定规则（`bffNamespaces` / `bffPathRules` / `bffAppRules` / `excludeNamespaceContains` / `unknownNamespaceAction`） | 通用后缀启发式；证据优先 |
| `dependency-template.json` | 初始化时对 pom 的依赖调整模板 | 内置模板；写 `[]` 表示不调整 |
| `middleware-patches.json` | **配置替换适配包**（哪些 key、替换成什么、为什么） | **默认不存在 = 不做中间件替换**（见第 5 章） |

## 4.6 全局目录

```
~/.localdebug/
├── bin/                        # kubectl / ktctl
├── signal/                     # 隧道进程停止信号文件
├── config/
│   ├── config.json             # 全局配置（项目列表、工具版本/下载地址等）
│   ├── platform-configs/       # 平台配置（按栈分 section；密文在 PasswordSafe）
│   ├── stacks/                 # 用户栈描述符（可选）
│   ├── namespace-map.json      # 规则：命名空间
│   ├── project-rules.json      # 规则：服务类型
│   ├── dependency-template.json# 规则：依赖模板
│   ├── middleware-patches.json # 适配包（可选，见第 5 章）
│   └── .adapter-prompted       # 「是否已提示导入适配包」标记
└── ...
```

## 4.7 加载优先级

- 规则/配置：**用户文件 > 内置默认**；文件损坏 → 回退内置 + 日志告警，不崩。
- 适配包：**栈模板内联 > 用户适配包 > 空**（详见第 5 章）。

上一章：[快速开始](./03-quickstart) ｜ 下一章：[配置替换适配包](./05-adapter)
