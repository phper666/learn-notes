# 第1章：环境搭建

本章把「本地调试微服务」所需的机器环境准备好。**macOS 本地网络权限**是最高频的坑，务必先过一遍。

## 1.1 前置条件

| 项 | 要求 | 检查方式 |
|---|---|---|
| 操作系统 | macOS（本文以 macOS 为例；Windows/Linux 路径不同） | `uname -a` |
| IntelliJ IDEA | 2023.1+（实测 2026.2） | 关于 IDEA 查看版本 |
| JDK | 17+（IDEA 自带 JBR 即可） | `java -version` |
| kubectl | 可连目标集群（插件可代装） | `kubectl version` |
| ktctl | kt-connect 客户端（插件可代装） | `ktctl --version` |
| kubeconfig | `~/.kube/config` 可访问目标集群 | `kubectl get ns` |

## 1.2 macOS 本地网络权限（必读）

**症状**：kubectl / ktctl 连接局域网或集群内地址时报 `no route to host`（`EHOSTUNREACH`），但同一台机器用终端 `curl` 访问同一地址却正常。看起来「配置没问题」，实际是**权限**问题。

**原理**：第三方二进制（kubectl/ktctl 等）由未获「本地网络」授权的 App（如 IDEA）启动时，连接局域网地址会被系统拦截；Apple 自带二进制（`/usr/bin/curl`、`nc`、`python3`）豁免，所以终端能通、IDE 里不通，极具误导性。仅影响局域网/内网地址，互联网访问不受影响。

**快速判别**：在同一个终端里执行

```bash
/usr/bin/curl -svk https://<内网IP>:<端口>/    # 通
kubectl version                               # 报 no route to host
```

两者结果不一致 = 本地网络权限问题。

**修复步骤**：

1. 打开「系统设置 → 隐私与安全性 → 本地网络」，确认 **IntelliJ IDEA 已打开**；若已打开，先关掉再打开（off → on）刷新授权。
2. **完全退出 IDEA（Cmd+Q）后重新启动**。
   > 不要点 IDEA 自带的「Restart IDE」按钮：已知会把子进程的权限弄丢（JetBrains YouTrack: IJPL-258343）。装插件/升级后同理，一律 Cmd+Q 冷启。
3. 重新在 IDEA 内置 Terminal 里执行 `kubectl get ns` 验证。

**仍然不通时的恢复顺序**（从轻到重）：

1. 重复上面的 off→on + Cmd+Q 冷启（最常见，10 秒级恢复）。
2. 退出 IDEA，从**系统终端**直接启动，让子进程继承终端的豁免：

   ```bash
   "$HOME/Applications/IntelliJ IDEA.app/Contents/MacOS/idea"
   ```

   （`open -a` 无效；保持该终端窗口开着。）
3. 高级：清理权限身份缓存（**会要求管理员权限，操作前先备份**）：

   ```bash
   sudo cp /Library/Preferences/com.apple.networkextension.uuidcache.plist ~/uuidcache.plist.bak
   sudo rm /Library/Preferences/com.apple.networkextension.uuidcache.plist
   sudo killall -9 nehelper
   ```

   然后在 IDEA 内置 Terminal 重跑 kubectl，按弹窗重新允许。**不要删除** `com.apple.networkextension.plist`（授权存储本体）。
4. 终极方案：更换安装方式（Toolbox ↔ dmg），参考 JetBrains KB SUPPORT-A-564。

> 重启/系统升级后权限偶发失效属已知问题；按上面第 1 步恢复即可。

## 1.3 准备 kubeconfig

- 默认路径：`~/.kube/config`
- 多集群用 context 区分，确认当前 context 指向要调试的集群：

```bash
kubectl config current-context
kubectl get ns        # 能列出来说明权限与网络都 OK
```

- 插件内「环境配置」页可以直接编辑 kubeconfig、点「测试连接」。

## 1.4 安装 kubectl / ktctl

推荐用插件「工具安装」页安装，避免 PATH / 版本问题：

1. 打开工具窗口 **LocalDebug → 工具安装**。
2. 选择版本（下拉可手输），安装地址模板支持 `{version}` 占位符；下载失败可改模板或点「恢复默认」。
3. 点「安装/更新 kubectl」「安装/更新 ktctl」。安装目录：`~/.localdebug/bin`。
4. 状态徽章会显示「已安装 · 版本」；路径行可点击打开所在目录。

> 下载走 IDEA 的代理设置；`github.com` 直连不稳定时可换成镜像地址模板。插件在启动命令时会把 `~/.localdebug/bin` 前置到 PATH。

## 1.5 网络与代理

- IDEA 的 HTTP 代理设置会被工具下载沿用（`Settings → Appearance & Behavior → System Settings → HTTP Proxy`）。
- 模板库从 jsDelivr 拉取（备用 fastly）；下载失败优先检查代理与 DNS。

## 1.6 检查清单

- [ ] macOS「本地网络」已授权 IDEA，且用 Cmd+Q 冷启验证过
- [ ] `kubectl get ns` 在 IDEA 内置 Terminal 可正常返回
- [ ] `ktctl --version` 正常
- [ ] kubeconfig 当前 context 指向目标集群
- [ ] 工具安装页两个工具均为「已安装」
- [ ] IDEA 已安装 `ms-localdebug` 插件（见第 2 章）

下一章：[安装与升级](./02-install)
