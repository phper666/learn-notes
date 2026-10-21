# 第2章：安装与升级

## 2.1 获取安装包

插件以 zip 形式分发（插件市场可上架后改为市场安装）：

- 文件名形如 `ms-localdebug-1.0.31.zip`
- 发布页 / 构建产物 `build/distributions/` 获取

## 2.2 安装

1. `Settings → Plugins → ⚙（齿轮）→ Install Plugin from Disk…`
2. 选择 zip → 确认 → 按提示重启。
3. **重启必须用 Cmd+Q 完全退出后冷启**，不要点「Restart IDE」按钮（见第 1 章：会让 kubectl/ktctl 丢本地网络权限）。

## 2.3 验证安装

- IDEA 右侧工具窗口栏出现 **LocalDebug**（在工具窗口栏靠下位置）。
- 打开后有五个页签：**项目配置 / 调试命令 / 工具安装 / 配置向导 / 环境配置**。
- `Settings → Plugins → Installed` 里版本为 `1.0.31`。

## 2.4 升级与卸载

- **升级**：同版本覆盖安装时 IDE 会提示替换；升级后同样 Cmd+Q 冷启。
- **卸载**：`Settings → Plugins → Installed → ms-localdebug → Uninstall`，重启生效。
- 安装目录（排查残留/看 jar）：

  ```
  ~/Library/Application Support/JetBrains/IntelliJIdea2026.2/plugins/ms-localdebug/
  ```

  版本号不同目录名会随之变化（如 `IntelliJIdea2025.3`）。

## 2.5 日志位置

| 内容 | 路径 |
|---|---|
| IDEA 日志 | `~/Library/Logs/JetBrains/IntelliJIdea2026.2/idea.log` |
| 插件日志过滤 | `grep com.localdebug ~/Library/Logs/JetBrains/IntelliJIdea2026.2/idea.log` |
| 全局配置与工具 | `~/.localdebug/`（见第 4 章） |

常见日志关键词：

```bash
# 分类证据命中（serviceType 判定）
grep -E "证据命中|反查命中" ~/Library/Logs/JetBrains/IntelliJIdea2026.2/idea.log | tail -20

# 补丁适配包加载/跳过
grep -E "适配包|middlewarePatches|配置适配包" ~/Library/Logs/JetBrains/IntelliJIdea2026.2/idea.log | tail -20
```

上一章：[环境搭建](./01-env) ｜ 下一章：[快速开始](./03-quickstart)
