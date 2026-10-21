# 第5章：配置替换适配包

> 本章解释「哪些配置 key 要替换、替换成什么、为什么替换」这一层。**当前版本默认不做任何中间件替换**——需要你提供适配包。

## 5.1 为什么需要这层

本地调试的难点不是「把服务跑起来」，而是把**云上运行假设**翻译成本地可运行。典型场景（以阿里云 ECS 实例角色为例）：

| 意图 | 云上假设 | 本地替代 | 不做会怎样 |
|---|---|---|---|
| 禁用实例角色鉴权 | 实例 RAM 角色隐式提供凭据 | `ram-role` 置空 | SDK 取凭据超时/鉴权失败，服务起不来 |
| 注入 STS 临时凭据 | 实例身份自动轮换 | 用开发者 AK/SK assume role 换取临时凭据（TTL 8h） | 同上；误用长期 AK 有泄露风险 |
| 端点改公网 | 走 VPC 内网端点 | 改用公网接入点 | 本机连不上消息队列 |
| 消费组隔离 | 共享 dev 消费组 | 使用本地独立消费组 | **抢 dev 消息（安全事故）** |
| KMS 改 STS 模式 | 实例角色鉴权 | 显式 STS 凭据 | 加解密失败 |
| 调度器凭据 | 实例角色 | 显式 STS 凭据 | 调度任务失败 |

这些动作在插件里是**数据**（适配包），不是代码：不同团队、不同中间件用不同 key，换适配包即可。

## 5.2 规则从哪里来（优先级）

```
栈模板内联 middlewarePatches  >  用户适配包  >  空（不做替换）
```

- **栈模板内联**：栈描述符 JSON 里的 `middlewarePatches` 字段（第三方模板可自带规则）。
- **用户适配包**：`~/.localdebug/config/middleware-patches.json`（环境级，推荐）。
- **空**：默认栈/官方模板**不包含**任何组织规则；没有适配包时初始化不会写入任何中间件 key。

> 适配包在**初始化**时应用；「替换配置」沿用初始化后的本地配置，不会重新应用适配包。修改适配包后请重新执行一次初始化。

## 5.3 文件格式

```jsonc
{
  "schemaVersion": 1,
  "stack": "sca-dubbo-ktctl",     // 可选：仅对该栈生效；省略 = 所有栈
  "groups": {
    "common": {                    // 所有服务类型都应用
      "requires": ["..."],         // 证据门控（当前版本未生效，见 5.7）
      "mode": "inject",            // inject | override；缺省 override
      "keys": {                    // 应用源：顺序 = 写入顺序；null = 删除该键
        "your.middleware.key": "${value}"
      },
      "intents": [                 // 说明层：why / effect / risk + 引用 keys 中的路径
        { "id": "why-example", "why": "...", "effect": "...", "risk": "...", "keys": ["your.middleware.key"] }
      ]
    },
    "bff": { "mode": "inject", "keys": { "server.port": "${bffWebServerPort}" } },
    "rpc": { "mode": "inject", "keys": { "server.port": "${rpcWebServerPort}" } }
  }
}
```

字段语义：

| 字段 | 说明 |
|---|---|
| `stack` | 可选。非空时只在当前栈名匹配时应用；不匹配直接忽略（日志 info） |
| `groups` | 只应用 `common` + 当前服务类型（`bff` / `rpc`）；其他组名不会自动应用 |
| `requires` | 证据门控表达式（`dependency:` / `configKey:` / `stack:` / `class:`），**当前版本不生效** |
| `mode` | `inject`：无条件写入（键不存在也创建）；`override`：仅当目标已存在该键时写入。**缺省 `override`** |
| `keys` | 有序键值表：顺序即写入顺序；值为 `null` 表示**删除**该键（合并时移除）；字符串里的 `${name}` 从上下文取值 |
| `intents` | 仅用于说明与审计（不参与写入顺序）；`keys` 必须引用 `keys` 中真实存在的路径，否则整包校验失败被忽略 |

**`mode` 怎么选**：

- 组织环境、key 可能只存在于 nacos 而本地 yaml 没有 → 用 `inject`（强制写入本地，覆盖远端值）。
- 不确定、或希望「只覆盖已存在的键、不发明配置」→ 用 `override`（缺省）。

## 5.4 导入与迁移

- **首次初始化提示**：满足「已配置过项目 + 无适配包 + 未提示过」时，点初始化会弹一次「是否导入组织配置适配包示例？」
  - 是 → 写入 `~/.localdebug/config/middleware-patches.json`
  - 否 → 记录提示标记，不再打扰
- **想再次导入**：删除 `~/.localdebug/config/.adapter-prompted` 后重新点初始化。
- **手动安装**：把 5.5 的 JSON 保存为 `~/.localdebug/config/middleware-patches.json` 即可。
- **校验失败**：整包被忽略并在 `idea.log` 打 `WARN`（适配包校验失败，忽略），audit 的 `source` 会是 `none`。

## 5.5 示例适配包（阿里云实例角色 + churchill）

> 示例对应当前内置默认栈的配套中间件；换你自己的中间件时，把 key 换成你的 SDK 配置路径，`intents` 保留以说明「为什么」。占位符由配置向导/凭据提供者注入。

```json
{
  "schemaVersion": 1,
  "groups": {
    "common": {
      "requires": ["dependency:*:churchill-*", "configKey:churchill."],
      "mode": "inject",
      "keys": {
        "churchill.rocketmq.default-config.addr": "${mqAddr}",
        "churchill.rocketmq.default-config.ram-role": null,
        "churchill.rocketmq.default-config.access-key": "${stsAccessKey}",
        "churchill.rocketmq.default-config.secret-key": "${stsSecretKey}",
        "churchill.rocketmq.default-config.security-token": "${stsSecurityToken}",
        "churchill.rocketmq.consumers": "${mqConsumers}",
        "churchill.event.rocketmq.ramRole": null,
        "churchill.event.rocketmq.nameSrvAddr": "${mqAddr}",
        "churchill.event.rocketmq.accessKey": "${stsAccessKey}",
        "churchill.event.rocketmq.secretKey": "${stsSecretKey}",
        "churchill.event.rocketmq.securityToken": "${stsSecurityToken}",
        "churchill.scheduler.acs.ram-role": null,
        "churchill.scheduler.acs.role-arn": "${roleArn}",
        "churchill.scheduler.acs.access-key-id": "${accessKey}",
        "churchill.scheduler.acs.access-key-secret": "${secretKey}",
        "churchill.scheduler.acs.region": "cn-hangzhou",
        "churchill.scheduler.group-id": "${schedulerGroupId}",
        "churchill.scheduler.app-key": "${schedulerAppKey}",
        "churchill.scheduler.appKey": null,
        "churchill.scheduler.region": "public",
        "churchill.scheduler.endpoint": "acm.aliyun.com",
        "churchill.scheduler.namespace": "${schedulerNamespace}",
        "alicloud.kms.type": "sts_access",
        "alicloud.kms.ram-role-name": "${roleArn}",
        "alicloud.kms.access-key-id": "${accessKey}",
        "alicloud.kms.access-key-secret": "${secretKey}"
      },
      "intents": [
        {
          "id": "disable-instance-role-auth",
          "why": "云上依赖 ECS 实例 RAM 角色隐式取凭据；本地无实例元数据服务",
          "effect": "SDK 改走显式 STS 临时凭据，服务可在本地启动",
          "risk": "不替换：取凭据超时/鉴权失败，服务起不来",
          "keys": [
            "churchill.rocketmq.default-config.ram-role",
            "churchill.event.rocketmq.ramRole",
            "churchill.scheduler.acs.ram-role"
          ]
        },
        {
          "id": "inject-sts-credentials",
          "why": "本地只能用开发者 AK/SK assume role 换取临时凭据（TTL 8h）",
          "effect": "MQ/KMS/Scheduler 使用显式临时凭据",
          "risk": "不替换：鉴权失败；误用长期 AK 则有泄露风险",
          "keys": [
            "churchill.rocketmq.default-config.access-key",
            "churchill.rocketmq.default-config.secret-key",
            "churchill.rocketmq.default-config.security-token"
          ]
        },
        {
          "id": "rewrite-endpoints-to-public",
          "why": "云上走 VPC 内网端点，本机不可达",
          "effect": "MQ 地址改走公网接入点",
          "risk": "不替换：本机连不上 MQ",
          "keys": [
            "churchill.rocketmq.default-config.addr",
            "churchill.event.rocketmq.nameSrvAddr"
          ]
        },
        {
          "id": "isolate-consumer-groups",
          "why": "共享 dev 消费组会与云上实例抢消息",
          "effect": "本地使用独立消费组，避免与 dev 环境互相抢消息",
          "risk": "不替换：抢 dev 消息（安全事故）",
          "keys": ["churchill.rocketmq.consumers"]
        },
        {
          "id": "kms-sts-mode",
          "why": "云上 KMS 依赖实例角色鉴权；本地无实例元数据服务",
          "effect": "KMS 改用 STS 临时凭据访问",
          "risk": "不替换：加解密失败",
          "keys": [
            "alicloud.kms.type",
            "alicloud.kms.ram-role-name",
            "alicloud.kms.access-key-id",
            "alicloud.kms.access-key-secret"
          ]
        },
        {
          "id": "scheduler-credentials",
          "why": "调度器在云上依赖实例角色取凭据；本地无实例元数据服务",
          "effect": "调度器改用显式 STS 临时凭据",
          "risk": "不替换：调度任务失败",
          "keys": [
            "churchill.scheduler.acs.role-arn",
            "churchill.scheduler.acs.access-key-id",
            "churchill.scheduler.acs.access-key-secret",
            "churchill.scheduler.app-key"
          ]
        }
      ]
    },
    "bff": {
      "mode": "inject",
      "keys": { "server.port": "${bffWebServerPort}" }
    },
    "rpc": {
      "mode": "inject",
      "keys": { "server.port": "${rpcWebServerPort}" }
    }
  }
}
```

## 5.6 写你自己的适配包

1. **列假设**：你的框架/中间件在云上依赖哪些隐式条件？（实例角色、内网端点、共享消费组、固定 region、专属 namespace…）
2. **找 key**：对应到你的 SDK 配置项（Spring 项目可查依赖 jar 里的 `META-INF/spring-configuration-metadata.json`）。
3. **写 `keys`**：值可以是字面量、`null`（删除键）、或 `${placeholder}`。
4. **写 `intents`**：每个 key 都尽量归到一条意图里（why / effect / risk），方便后人 review 与排障。
5. **验证**：JSON 合法、`intent.keys` ⊆ `keys`、`mode` 合法；保存后重新初始化，看 audit 的 `source`。

常用占位符（来自平台配置/凭据/端口上下文）：

| 占位符 | 来源 |
|---|---|
| `${mqAddr}` / `${mqConsumers}` | 配置向导（平台配置 section） |
| `${stsAccessKey}` / `${stsSecretKey}` / `${stsSecurityToken}` | 凭据提供者（aliyun-sts） |
| `${accessKey}` / `${secretKey}` / `${roleArn}` | 配置向导（长期 AK/角色 ARN，用于 assume role 等） |
| `${schedulerGroupId}` / `${schedulerAppKey}` / `${schedulerNamespace}` | 配置向导 |
| `${bffWebServerPort}` / `${rpcWebServerPort}` | 端口分配器 |

占位符解析为空 → 初始化会「缺什么报什么」并中止（不会写入 `${...}` 字面量）。

## 5.7 当前版本限制

- **`requires` 未生效**：字段会被解析和校验，但当前版本不做证据判定（下一版启用：按 pom 依赖/配置 key 证据决定是否应用整组）。
- **无按项目选栈**：初始化/替换/回滚统一使用内置默认栈。
- **无 UI 编辑**：适配包按 JSON 编辑；模板内联规则也没有表单入口。
- 适配包**只在初始化时应用**；修改后需重新初始化。

## 5.8 验证是否生效

1. 初始化输出区无「未检测到配置适配包」提示。
2. `<项目>/.localdebug.audit.json` 中：

   ```json
   "middlewarePatches": { "source": "adapter", "applied": ["common", "bff", "rpc"], "skippedKeys": [] }
   ```

3. 对比初始化前后的 `application.yaml` / `bootstrap.yaml`：应出现适配包 `keys` 里的配置。
4. 日志：`grep -E "适配包|middlewarePatches" ~/Library/Logs/JetBrains/IntelliJIdea2026.2/idea.log | tail`

上一章：[配置体系](./04-configuration) ｜ 下一章：[审计与验证](./06-audit)
