# 第7章：排障手册

按「现象 → 原因 → 处理」组织。日志统一关注：

```bash
LOG=~/Library/Logs/JetBrains/IntelliJIdea2026.2/idea.log
grep com.localdebug "$LOG" | tail -50
```

## 7.1 kubectl / ktctl 报 `no route to host`

**现象**：`kubectl get ns`、ktctl 连接集群或内网地址失败；终端 `curl` 同一地址却正常。
**原因**：macOS「本地网络」权限没有授予 IDEA（见[第 1 章 1.2](./01-env)）。
**处理**：

1. 系统设置 → 隐私与安全性 → 本地网络 → IntelliJ IDEA 关掉再打开；
2. **Cmd+Q 完全退出 IDEA 后冷启**（不要点 Restart）；
3. 在 IDEA 内置 Terminal 重试 `kubectl get ns`；
4. 仍不行 → 用系统终端启动 IDEA（继承终端豁免）或清理 `uuidcache.plist`（见第 1 章）。

## 7.2 「测试连接」失败

| 报错片段 | 原因 | 处理 |
|---|---|---|
| `no route to host` | 本地网络权限 / VPN 未连 | 按 7.1 处理；确认 VPN |
| `Connection refused` | 地址/端口不对，或 context 指错集群 | 检查 kubeconfig 与 `kubectl config current-context` |
| `certificate` / `Unauthorized` | 证书过期 / 凭据失效 | 更新 kubeconfig |
| 超时 | 代理/防火墙 | 检查 IDEA HTTP Proxy 与网络 |

## 7.3 初始化失败

| 现象 | 原因 | 处理 |
|---|---|---|
| 「缺少配置字段: xxx」 | 配置向导没填齐 | 回到配置向导补齐，再初始化 |
| 「栈描述符加载失败（stackRef=X）」 | 所选栈文件缺失/非法 | 项目配置页「技术栈」改回默认，或重新导入模板 |
| 默认栈行为与以前不同 | 默认栈已换为通用 SC+Nacos | 旧项目自动沿用组织示例栈；新项目可在「技术栈」选「示例：SCA + Dubbo」 |
| 「适配包校验失败，忽略」日志 | 适配包 JSON 结构非法（`mode` / `requires` / `intent.keys` 引用不存在） | 按 [第 5 章](./05-adapter) 修正；或先移除适配包验证 |
| pom 调整失败 | 依赖模板坐标不可用 | 检查 `dependency-template.json`（写 `[]` 可关闭调整） |
| 未生成 `.localdebug.json` | 项目目录选错（不是工程根） | 重新添加正确的项目根 |

## 7.4 替换失败

| 现象 | 原因 | 处理 |
|---|---|---|
| 「nacos 配置拉取为空」 | 地址不可达 / namespace / group / dataId 不匹配 | 按错误里的 dataId/group/namespace 核对；确认能访问配置中心 |
| 「未检测到配置适配包」 | 适配包不存在 | 首次初始化时选择导入，或手动放置 `~/.localdebug/config/middleware-patches.json` |
| 写完 application.yaml 但缺少中间件替换 | 适配包未生效 / `mode=override` 且 key 不存在 | 看 audit 的 `source` 与 `skippedKeys`；组织环境建议 `mode=inject` |

## 7.5 本地应用启动失败 / 流量不到本地

- **启动参数**：`.localdebug.jvmrc.json` 里按 `mainClass` 找模块，`jvmArgs` 是否已加到 Run Configuration 的 VM options？
- **注册**：应用日志是否显示注册到配置中心成功？端口是否与 replaceConfig 一致？
- **路由**：确认网关/上游启用了 tag 路由，且请求带的 tag 与本地 `debugTag` 一致（`.localdebug.json`）。
- **非代理地址**：`jvmArgs` 生成的 `-Dhttp.nonProxyHosts` 是否覆盖了配置中心/MQ 域名，避免流量误走代理。

## 7.6 回滚

- 备份位置：`<项目>/project_config_back/<hash>/`（`rollbackFilePaths.json` 记录映射）。**不要手动删除**，否则无法回滚。
- 回滚会同时清理 `target/classes` 下的同名配置，避免编译产物继续生效。
- 回滚末尾会按描述符执行 `recover` / `clean`（清理影子资源）。**没有集群/权限时命令失败只记日志，不影响文件还原**。
- 回滚命令是异步的：看到「回滚配置成功」时命令可能仍在后台执行，稍等或看日志确认。

## 7.7 升级插件后行为异常

- 一律 **Cmd+Q 冷启**，不要用 IDE 的 Restart 按钮。
- 确认插件已加载：`idea.log` 搜 `Loaded custom plugins` 应包含 `ms-localdebug (1.0.32)`。
- 清理缓存不是首选；先看日志与 audit 文件。

## 7.8 常用日志速查

```bash
LOG=~/Library/Logs/JetBrains/IntelliJIdea2026.2/idea.log

grep com.localdebug "$LOG" | tail -50                 # 插件全部日志
grep -E "证据命中|反查命中" "$LOG" | tail -20          # 分类证据
grep -E "适配包|middlewarePatches" "$LOG" | tail -20   # 补丁适配包
grep -iE "error|exception" "$LOG" | grep com.localdebug | tail -20
```

上一章：[审计与验证](./06-audit)
