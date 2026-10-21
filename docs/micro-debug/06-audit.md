# 第6章：审计与验证

## 6.1 审计文件

每次初始化都会生成/覆盖 `<项目>/.localdebug.audit.json`：

```jsonc
{
  "stack": "sca-dubbo-ktctl",
  "generatedAt": "2026-10-21 15:51:00",
  "prechecks": [
    { "item": "网关按 header 'tag' 改写 lb 目标到影子服务", "confirmed": false },
    { "item": "消费侧已透传 rpcAttachmentKey（如 platform-common）", "confirmed": false }
  ],
  "middlewarePatches": {
    "source": "adapter",                 // descriptor | adapter | none
    "applied": ["common", "bff", "rpc"], // 实际应用的补丁分组
    "skippedGroups": [                   // 证据门控未命中而整组跳过的分组
      { "group": "common", "why": "未命中: dependency:*:churchill-*",
        "requires": ["dependency:*:churchill-*"], "rules": ["disable-instance-role-auth"] }
    ],
    "skippedKeys": [],                   // override 模式下「目标不存在」而跳过的键
    "evidenceErrors": []                 // 证据评估失败（fail-open，按命中处理）
  }
}
```

- `prechecks`：组织前提（插件探测不到集群侧状态，只能提示确认，**不代表已验证**）。
- `middlewarePatches.source`：补丁规则来源。`none` = 没有适配包、未做中间件替换。
- `middlewarePatches.applied`：实际应用的分组（`common` / 服务类型组）。
- `skippedKeys`：`mode=override` 时目标里不存在的键（正常现象，可据此判断 key 是否写对）。
- `skippedGroups`：证据门控未命中的整组（含 `requires` 与涉及的 intent id）；外部项目看到 `common` 被跳过属正常。
- `evidenceErrors`：证据评估失败（fail-open 按命中处理）的记录；为空表示评估正常。

## 6.2 组织前提确认

- 项目配置页上方有 audit 告警条（存在未确认项时显示「N 项组织前提未确认」）。
- 点 **全部确认**：把 `prechecks` 逐条置 `confirmed=true` 并写回（仅本地记录，**不等于**组织侧真的验证过）。
- 点 **打开 audit 文件**：直接查看/编辑 JSON。

## 6.3 每轮改动的验证清单

**初始化后**

- [ ] 输出区无「缺少配置字段」/「适配包校验失败」
- [ ] `.localdebug.audit.json`：`middlewarePatches.source` 符合预期（组织环境应为 `adapter`；外部项目 `common` 被 `skippedGroups` 跳过属正常）
- [ ] `git diff` 检查 `application.yaml` / `bootstrap.yaml`：只出现预期 key
- [ ] `git status`：`.localdebug*` 与 `project_config_back/` 未进入版本控制（已自动写 `.gitignore`）

**替换后**

- [ ] 输出区无「nacos 配置拉取为空」
- [ ] 生成 `.localdebug.ktctl.cmds` / `.localdebug.jvmrc.json`
- [ ] 本地 `application.yaml` 已合并 nacos 配置（抽查中间件地址/凭据/消费组）

**调试后**

- [ ] 调试命令页对应命令为「运行中」
- [ ] 本地应用日志显示注册成功、消费组为本地独立组
- [ ] 网关/上游按 tag 路由到本地（可用接口验证）

**回滚后**

- [ ] `application.yaml` / `bootstrap.yaml` / `pom.xml` 恢复
- [ ] `project_config_back/` 未被误删（保留备份，方便再次排查）
- [ ] 隧道命令已停止/清理（失败仅日志，不阻断回滚）

## 6.4 日志证据

分类判定与补丁加载都会写 `idea.log`：

```bash
LOG=~/Library/Logs/JetBrains/IntelliJIdea2026.2/idea.log

# 服务类型证据命中（预期形如：注解 @DubboService → rpc / pom 含 org.apache.dubbo）
grep -E "证据命中|反查命中" "$LOG" | tail -20

# 适配包加载/校验/跳过
grep -E "适配包|middlewarePatches|配置适配包" "$LOG" | tail -20
```

## 6.5 冒烟测试（开发者）

仓库自带真实环境冒烟（默认跳过，需要可连集群 + nacos 的环境）：

```bash
./gradlew test --tests "*SmokeInitReplaceTest" -Dsmoke.project=<项目副本路径>
```

- 会对副本执行初始化 + 替换，产出 `<副本同级>/smoke-report.md`；
- 替换依赖真实网络，失败不会让测试判死（探索性验证）；
- 测试会临时写入/恢复 `~/.localdebug/config` 下的占位配置，避免污染真实配置。

上一章：[配置替换适配包](./05-adapter) ｜ 下一章：[排障手册](./07-troubleshooting)
