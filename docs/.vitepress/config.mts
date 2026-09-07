import { defineConfig } from 'vitepress'
// https://vitepress.dev/reference/site-config

export default defineConfig({
  lang: 'zh-CN',
  title: 'Learn Notes',
  description: '个人技术学习课程站',
  base: '/learn-notes/',
  markdown: {
    math: true
  },
  themeConfig: {
    nav: [
      { text: '微服务本地 Debug', link: '/micro-debug/' },
      { text: 'DSH Hull Desktop', link: '/dsh-hull-desktop/' },
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
      '/dsh-hull-desktop/': [
        {
          text: 'DSH Hull Desktop 学习',
          items: [
            { text: '课程简介', link: '/dsh-hull-desktop/' },
            { text: '第1章：快速开始', link: '/dsh-hull-desktop/01-quickstart' },
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
