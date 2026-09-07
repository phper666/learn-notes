# Learn Notes

个人技术学习课程站，基于 [VitePress](https://vitepress.dev) + GitHub Pages 构建。

在线阅读：https://phper666.github.io/learn-notes/

## 课程

- [微服务本地 Debug](https://phper666.github.io/learn-notes/micro-debug/)
- [DSH Hull Desktop 学习](https://phper666.github.io/learn-notes/dsh-hull-desktop/)

## 本地开发

```bash
npm install
npm run docs:dev    # 本地预览 http://localhost:5173
npm run docs:build  # 构建
```

## 新增课程

1. 在 `docs/` 下新建课程目录，如 `docs/my-course/`
2. 在 `docs/.vitepress/config.mts` 的 `nav` 和 `sidebar` 中各加一条
3. 推送到 main 分支自动发布

## License

内容采用 [CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/) 许可。
