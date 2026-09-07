---
name: phper666-playbook-packaging
---

# Electron 三端打包 playbook

> AI Agent Skill 封装：`phper666-playbook-packaging`。供 AI 编码助手以 skill 形式加载，正文规则见下方链接文档。

## 何时用
- 新项目从零接入自更新链路（接入顺序见 [runbook](/playbooks/packaging/auto-update-onboarding)）
- Electron 桌面壳三端（macOS/Windows/Linux）打包
- 排查打包问题（更新源查错静默失败、平台 target 缺失、交叉编译、未签名警告、产物名 404）
- macOS 签名与自更新（自签名证书 CI 流水线 / codesign 报错分层排障 / 无签名版本无法自更新 / 差分假回退进度条重来）

## 核心规则（详见 [Electron 三端打包](/playbooks/packaging/electron-crossplatform)、[macOS 签名与自更新](/playbooks/packaging/macos-code-signing)）
1. 三端捆绑运行时：per-platform 映射（工具 ${os} 与供应商命名差异）+ 构建脚本参数化平台
2. 更新源配置一致性：更新器与打包器 publish 配置严格一致，写错静默失败难排查
3. 三平台更新 target：mac 必须含 zip、win nsis、linux AppImage
4. Win/Linux 打包需对应平台环境（不能交叉），单平台先行 + 实测
5. 未签名打包会触发平台安全警告，正式分发需签名
6. 签名（macOS，详见 [macOS 签名与自更新](/playbooks/packaging/macos-code-signing)）：构建成功≠签名成功，必须有产物级签名门禁；自签名证书 CI 五步（临时钥匙串防自动锁+入 search list → 导入 → 显式受信 → 断言有效身份）；证书即升级生命线，签名身份切换是单向门；差分基缓存对账（下载记版本，启动对账不一致清基）+ 更新器日志必须接入应用日志

## 用法
- 用户问打包/跨平台/electron 分发 → 加载本 skill，读 [Electron 三端打包](/playbooks/packaging/electron-crossplatform)，按通用原则回答
- 用户问 macOS 签名/自签名/codesign/自更新报错 → 读 [macOS 签名与自更新](/playbooks/packaging/macos-code-signing)，按报错分层定位（NOT_TRUSTED=受信缺失 / no identity found=锁或 search list / 静默跳签=门禁缺失 / running application=存量无解）
- 工具写法（electron-builder、security 命令）在 playbook 的「注」里，作为参考非主规则
