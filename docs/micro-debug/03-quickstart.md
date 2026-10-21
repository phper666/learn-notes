# 第3章：快速开始

前提：第 1 章环境与第 2 章安装已完成。

## 3.1 添加项目

1. 打开 **LocalDebug → 项目配置**。
2. 点右上角 **＋**（添加当前项目）。加入的是 IDEA 当前打开的项目根目录。
3. 在下拉框中选择要调试的项目。
4. （可选）在「技术栈」下拉选择该项目使用的栈：默认内置栈；导入/下载的模板会出现在列表里（写入项目 `.localdebug.json` 的 `stackRef`，下次初始化生效）。

> 多模块工程：选择包含 `pom.xml`、且能定位到 `application.yaml` / `bootstrap.yaml` 的工程目录（通常是被调试服务模块或它的父工程）。

## 3.2 初始化配置

点 **▶ 初始化配置**（使用项目配置页所选技术栈；空 = 内置默认栈）。插件会：

1. **备份**：把将要修改的 `application.yaml` / `bootstrap.yaml` / `pom.xml` 备份到
   `<项目>/project_config_back/<hash>/`，并在其中写 `rollbackFilePaths.json`（原文件 ↔ 备份映射）。
2. **生成**：
   - `.localdebug.json`（项目调试配置，见第 4 章）
   - `.localdebug.audit.json`（组织前提审计 + 补丁来源，见第 6 章）
   - `.localdebug.k8sServices.json`（集群服务清单缓存）
3. **改写** `application.yaml` / `bootstrap.yaml`：注册地址、端口、路由 tag、配置中心地址等（由栈描述符决定）。
4. **按依赖模板调整 pom**（`updateDependencies` / `addDependencies`；模板为空则不调整）。
5. 向项目 `.gitignore` 追加 `.localdebug*` 与 `**/project_config_back/**`。

输出区会打印每一步。若报「缺少配置字段」，回到 **配置向导** 补齐对应字段再重试（缺什么报什么，不会写占位符字面量）。

## 3.3 替换配置

点 **↻ 替换配置**。这一步**需要能访问配置中心（nacos）**。插件会：

1. 按初始化得到的 `nacos dataId / group / namespace` 拉取应用配置（拉不到会明确报错：地址/网络/dataId/group/namespace）。
2. 替换中间件相关参数（地址、凭据、消费组等 —— 由**适配包**决定，见第 5 章）。
3. 生成：
   - `.localdebug.ktctl.cmds`：隧道命令清单（调试命令页读取）
   - `.localdebug.jvmrc.json`：各模块的 JVM 启动参数（`mainClass` + `jvmArgs`）
   - `.localdebug.pom.changeInfo.json`：pom 变更记录（回滚用）
4. 把合并后的配置写回本地 `application.yaml`。

## 3.4 启动隧道与本地应用

1. 打开 **调试命令** 页签：列表来自 `.localdebug.ktctl.cmds`，每项可「启动 / 停止」（状态实时刷新）。
2. 正常 Run/Debug 启动应用：插件通过 `JavaProgramPatcher` 读取 `.localdebug.jvmrc.json`，按 `mainClass` 匹配后**自动追加 JVM 参数与环境变量**（无需手工填 VM options）。
3. 应用会以独立 tag 注册到集群，网关/上游按 tag 把流量路由到本地实例。

## 3.5 回滚

点 **↶ 回滚配置**（有确认框）：还原 `application.yaml` / `bootstrap.yaml` / `pom.xml`（含 `target/classes` 下同名文件），并按描述符执行隧道资源清理（`recover` / `clean`）。清理命令失败只记日志、不阻断回滚。

## 3.6 产出文件速查

| 文件 | 位置 | 用途 |
|---|---|---|
| `.localdebug.json` | 项目根 | 项目调试配置（tag、JVM 参数、依赖调整、replaceConfigs） |
| `.localdebug.audit.json` | 项目根 | 组织前提审计 + 补丁来源（source/applied/skippedKeys） |
| `.localdebug.k8sServices.json` | 项目根 | 集群服务清单缓存（初始化时生成） |
| `.localdebug.ktctl.cmds` | 项目根 | 隧道命令清单（调试命令页） |
| `.localdebug.jvmrc.json` | 项目根 | JVM 启动参数（按 mainClass 对应模块） |
| `.localdebug.pom.changeInfo.json` | 项目根 | pom 变更记录（回滚） |
| `project_config_back/<hash>/` | 项目根 | 配置备份 + `rollbackFilePaths.json`（勿提交，已加入 .gitignore） |

上一章：[安装与升级](./02-install) ｜ 下一章：[配置体系](./04-configuration)
