import { defineConfig } from 'vitepress'
// https://vitepress.dev/reference/site-config

export default defineConfig({
  lang: 'zh-CN',
  title: '技术学习经验',
  description: '个人技术学习经验与可复用经验库',
  base: '/learn-notes/',
  markdown: {
    math: true
  },
  themeConfig: {
    nav: [
      { text: '微服务本地 Debug', link: '/micro-debug/' },
      { text: 'Playbooks', link: '/playbooks/' },
    ],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },
    sidebar: {
      '/micro-debug/': [
        {
          text: '微服务本地 Debug',
          items: [
            { text: '课程简介', link: '/micro-debug/' },
            { text: '第1章：环境搭建', link: '/micro-debug/01-env' },
          ]
        }
      ],
      '/playbooks/': [
        {
          text: 'Playbooks · 可复用经验',
          items: [
            { text: '总览', link: '/playbooks/' },
            {
              text: 'Debugging',
              collapsed: true,
              items: [
                { text: '高频重渲染吞点击', link: '/playbooks/debugging/rerender-swallow-clicks' },
              ]
            },
            {
              text: 'Packaging',
              collapsed: true,
              items: [
                { text: 'Electron 三端打包', link: '/playbooks/packaging/electron-crossplatform' },
                { text: 'macOS 签名与自更新', link: '/playbooks/packaging/macos-code-signing' },
                { text: '自更新链路接入顺序', link: '/playbooks/packaging/auto-update-onboarding' },
              ]
            },
            {
              text: 'Release',
              collapsed: true,
              items: [
                { text: 'Semver 三档版本策略', link: '/playbooks/release/semver-strategy' },
                { text: 'CI 发版正文组装', link: '/playbooks/release/release-body-overwrite' },
              ]
            },
            {
              text: 'Tools',
              collapsed: true,
              items: [
                { text: 'archify 架构图工具', link: '/playbooks/tools/archify' },
              ]
            },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/phper666/learn-notes' }
    ],
    editLink: {
      pattern: 'https://github.com/phper666/learn-notes/blob/main/docs/:path'
    }
  }
})
