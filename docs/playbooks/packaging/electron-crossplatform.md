# Electron 三端打包：捆绑运行时 + 更新源一致性 + 平台 target

跨项目可复用的 Electron 桌面壳三端（macOS/Windows/Linux）打包经验。适用于 Electron 壳内嵌 CLI/服务 + 三端打包 + 自动更新的项目。

## 背景

从 macOS-only 扩展三端（macOS/Windows/Linux），需三平台打包 + 三端捆绑运行时（应用不依赖用户环境）+ 自动更新。本 playbook 是**通用原则**（不绑具体打包工具），工具写法以「注」给出。

## 决策或坑

1. **三端捆绑运行时**：electron-builder `extraResources` per-platform 映射（因为工具 `${os}` 标识与供应商 tarball 命名不同，需显式分平台写）；下载脚本参数化平台（各平台格式/目录布局全不同：mac/linux tar、win zip 且二进制在根无 bin/）。
2. **更新源配置一致性**：更新器（electron-updater）的 owner/repo 必须与打包器 publish 配置严格一致——写错会查错更新源静默失败，难排查。需配置仓库元数据字段。
3. **三平台更新 target**：mac 必须含 zip（dmg 不能用于自动更新）、win nsis、linux AppImage——各平台更新机制不同。
4. **Win/Linux 打包需对应平台环境**（nsis/AppImage 不能交叉）——单平台配置先行 + 对应平台实测，不阻塞其他平台。
5. **未签名打包**会触发平台安全警告（Gatekeeper/SmartScreen）——正式分发需签名，暂接受。
6. **产物命名禁空格**——productName 含空格时，打包器写更新元数据（latest-*.yml）的 url 会把空格转连字符，而对象存储存资产时把空格转点号 → 元数据广告名 ≠ 实际资产名 → 更新下载 404（检查元数据正常、下载必失败，极难排查）。产物文件名显式硬编码连字符命名，三处（元数据/资产/下载 URL）才一致。

> **注（electron-builder 写法）**：
> - 捆绑 node：`extraResources` per-platform 映射（`${os}` 与供应商命名差异）
> - 更新源：electron-updater `owner/repo` = electron-builder `publish` 配置
> - target：mac zip / win nsis / linux AppImage
> - **注（通用写法）**：任何「捆绑运行时 + 自动更新」的桌面壳都应：per-platform 显式配置资源、更新源与打包发布源严格一致、各平台 target 满足更新机制——这是原则不是工具特性

## 通用原则

1. **三端捆绑运行时**：打包器 per-platform 映射（注意工具 `${os}` 与供应商命名差异）+ 构建脚本参数化平台（各平台格式/布局不同）。
2. **更新源配置一致性**：更新器与打包器 publish 配置严格一致，写错静默失败难排查。
3. **三平台更新 target**：mac 必须含 zip、win nsis、linux AppImage——builder 自动生成最新元数据。
4. **Win/Linux 打包需对应平台环境**（不能交叉）——单平台配置先行 + 对应平台实测，不阻塞其他平台。
5. **未签名打包**会触发平台安全警告——正式分发需签名，暂接受。
6. **产物命名禁空格**：显式硬编码连字符产物名，保证元数据广告名 / 对象存储资产名 / 下载 URL 三处一致——空格在各环节转义规则不同（连字符/点号），不一致即更新 404。

## 适用范围

任何 Electron 桌面壳内嵌 CLI/服务 + 三端打包 + 自动更新的项目。不适用纯 Web、无自动更新需求的项目。

## 来源

出生：dsh-hull-desktop packaging 需求（2026-08-25）。通用化：2026-08-25 迁入本仓库。
