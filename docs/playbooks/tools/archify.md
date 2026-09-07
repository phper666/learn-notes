# archify — 可验证的架构/流程图生成工具

> 工具登记：本地直接用，搭配 skills 但不被 skills 直接引入（松耦合）。

## 用途

- **技术方案配图**（tech-design 出方案时生成架构/时序/流程图）
- **流程可视化**（工作流/审批门/CI-CD 图）
- **架构文档**（组件/服务/云边界/基础设施图）

## 仓库

- https://github.com/tt-a1i/archify（24.4k stars, MIT, 活跃维护）
- 基于 Cocoon-AI/architecture-diagram-generator（v1.0）演进

## 依赖

- node >= 18（实测 v24 可用）

## 本地安装

```bash
mkdir -p ~/tools && cd ~/tools
git clone --depth 1 https://github.com/tt-a1i/archify.git
cd archify/archify && npm install --no-audit --no-fund
```

安装后路径：`~/tools/archify/archify/`（bin/archify.mjs 所在目录）

## 5 种图类型

| 类型 | 用途 |
|:---|:---|
| `architecture` | 组件/服务/云边界/基础设施 |
| `workflow` | 流程/审批门/工具调用/CI-CD |
| `sequence` | API 调用链/请求生命周期 |
| `dataflow` | 管道/ETL/血统/消费者 |
| `lifecycle` | 状态机/重试/等待/终止态 |

## 用法（工作流）

1. 选类型（architecture/workflow/sequence/dataflow/lifecycle）
2. 写类型化 JSON（参考 `~/tools/archify/archify/examples/` 的示例）
3. **validate 校验**（质量门禁）：
   ```bash
   node bin/archify.mjs validate <type> <input.json> --quality showcase --json
   ```
   showcase 要求 9 项 artifact checks 全过、0 组合错误、0 警告
4. **deliver 渲染 HTML**：
   ```bash
   node bin/archify.mjs deliver <type> <input.json> <output.html> --quality showcase --json
   ```
5. 失败 → 只改诊断的 subject + 从 supportedFixes 选，重跑；连续两轮不改善就停

> 也接受 Mermaid 输入（flowchart/sequenceDiagram/stateDiagram）→ 转 JSON IR（保留语义不抄样式）。

## 实测（2026-08-28）

- validate architecture 示例：9/9 检查通过，ok: true ✅
- deliver 渲染：产出 712K HTML 含 SVG ✅
- 工具真实可用（有 bin 命令 + 验证器 + 86 个测试，非纯 prompt skill）

## 搭配方式

- **skills 不直接引入 archify**——ai-workflow-skills 保持纯净（不依赖外部工具）
- **本地直接用**：做技术方案/流程可视化/架构文档时，AI 读本登记 → 调 `~/tools/archify/archify/bin/archify.mjs`
- 产出图放对应文档目录（如 docs/design/ 技术方案配图）

## 注意

- 依赖 node 环境（非纯 skill，是要装的工具）
- 学习成本：JSON IR + validate/deliver 流程
- 登记原则：实测可用才登记（防「描述好实际空」的工具）
