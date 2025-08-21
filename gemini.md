## 产品交互和技术侧标准

- 框架优先选择: React + shadcn + tailwindcss
- 产品和交互设计目标人群: 非技术人员
- 交互视觉原则:
  - 多参考苹果的设计
  - 简单高效
  - 老人机模式
  - 响应式设计
  - 剃刀原则，即只设计必要功能和展示必要的信息，避免信息过载

## gemini 协作规范  

- 当我主动尝试 git commit 时，总结好内容，直接提交，不需要咨询我

---

## 工程概述

这是一个基于 Next.js、React 和 TypeScript 构建的在线图片压缩工具。

### 技术栈

- **框架:** [Next.js](https://nextjs.org/)
- **语言:** [TypeScript](https://www.typescriptlang.org/)
- **UI 库:** [shadcn/ui](https://ui.shadcn.com/)
- **样式:** [Tailwind CSS](https://tailwindcss.com/)
- **图片压缩:** [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)

### 功能

- **图片上传:** 用户可以从本地选择图片文件。
- **图片压缩:** 在浏览器端对图片进行压缩，无需上传到服务器。
- **信息展示:** 显示原始图片和压缩后图片的大小、尺寸等信息。
- **压缩进度:** 提供压缩进度的可视化反馈。
- **结果下载:** 用户可以下载压缩后的图片。
