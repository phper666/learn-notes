# 技术学习经验

个人技术学习经验站，基于 [VitePress](https://vitepress.dev) + GitHub Pages 构建。

在线阅读：https://phper666.github.io/learn-notes/

## 内容

- [微服务本地 Debug](https://phper666.github.io/learn-notes/micro-debug/) — 技术学习文档
- [Playbooks 经验库](https://phper666.github.io/learn-notes/playbooks/) — 踩坑记录与可复用经验，含 AI Agent Skills（迁移自 [phper666/playbooks](https://github.com/phper666/playbooks)）

## 本地开发

```bash
npm install
npm run docs:dev    # 本地预览 http://localhost:5173
npm run docs:build  # 构建
```

## 新增内容

**新文档**：`docs/` 下新建目录，在 `docs/.vitepress/config.mts` 的 `nav` 和 `sidebar` 各加一条。

**新 Playbook**：`docs/playbooks/<分类>/xxx.md`，在 `config.mts` 的 `/playbooks/` sidebar 和 `docs/playbooks/index.md` 各加一行；如需同步 AI Skill，在 `docs/playbooks/skills/` 加对应入口页。

推送 main 分支自动发布。

## License

内容采用 [CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/) 许可。
