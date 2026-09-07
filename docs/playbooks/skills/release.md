---
name: phper666-playbook-release
---

# 发版版本策略 playbook

> AI Agent Skill 封装：`phper666-playbook-release`。供 AI 编码助手以 skill 形式加载，正文规则见下方链接文档。

## 何时用
- 设计/落地发布流程（patch/minor/major 怎么用、版本线怎么维护、分支模型怎么走）
- 排查发版问题（三档语义混乱、并发发布 tag 冲突、多端版本漂移、自动更新旧线失效）
- 发版正文/发布说明问题（release notes 丢失、被后续步骤覆盖、多步组装正文）

## 核心规则（详见 [Semver 三档版本策略](/playbooks/release/semver-strategy)、[CI 发版正文组装](/playbooks/release/release-body-overwrite)）
1. semver 三档 = 幅度不是通道：patch/minor/major 共用同一 version 字段、都从主分支发，每次只走一步
2. 版本线维护独立于档位：EOL 独立决策；旧线从旧 tag 拉 release/x.y 只发 patch，cherry-pick 回主分支
3. 发版分支自持版本：流水线支持指定目标分支，bump 读所选分支版本文件
4. 并发锁按版本线分组：同线串行异线并行
5. 多端并行同一分支，防版本漂移
6. 自动更新旧线 patch 只服务锁版用户
7. 发版正文（详见 [CI 发版正文组装](/playbooks/release/release-body-overwrite)）：同一 Release 的多步写入必须「读-合-写」或单点组装，禁止后步整段覆盖；手动说明（dispatch 参数）一路透传到最终写点；发布链末尾加正文关键内容断言

## 用法
- 用户问发版策略/版本管理 → 加载本 skill，读 [Semver 三档版本策略](/playbooks/release/semver-strategy)，按通用原则回答（不绑具体 CI 平台，按需适配）
- 用户问发版说明丢失/正文覆盖/changelog 组装 → 读 [CI 发版正文组装](/playbooks/release/release-body-overwrite)
- 具体平台写法（GitHub Actions / GitLab CI）在 playbook 的「注」里，作为参考非主规则
