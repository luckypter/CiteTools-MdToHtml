# 首席助手 Cite 工具包 — MdToHtml

将 Markdown 实时转换为公众号排版。左边编写，右边预览，一键复制到微信公众平台。

[![Static Badge](https://img.shields.io/badge/%F0%9F%90%B1-QuickStart-green?style=flat-square&logo=pipecat&label=Cite&labelColor=abcdef&color=fedcba)](https://luckypter.github.io/CiteTools-MdToHtml/)

<img width="1146" height="610" alt="d3a7d678bfda24f2dca6fafaa53ac8da" src="https://github.com/user-attachments/assets/b410aa0a-f276-4769-b3ce-9bdec919af6f" />

## 功能特性

- **实时预览**：左侧编写 Markdown，右侧同步渲染公众号样式
- **工具栏**：一键插入标题、加粗、斜体、引用、列表、链接、图片、代码块等语法
- **内联格式**：选中文字可快速设置字号、颜色、行距、段落间距
- **一键复制**：生成适配公众号的 HTML 代码，可直接粘贴至微信后台
- **样式定制**：支持自定义字号、字体颜色、行高、段前段后间距

## 技术栈

- React 18 + Vite 5
- Tailwind CSS
- marked（Markdown 解析）
- turndown（HTML 转 Markdown）
- DOMPurify（XSS 过滤）
- Lucide React（图标）

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 部署到 GitHub Pages

```bash
npm run deploy
```

## 项目结构

```
md-to-wechat/
├── public/            # 静态资源（图片等）
├── src/
│   ├── themes/        # 主题配置
│   ├── utils/         # Markdown 解析、模板提取工具
│   ├── App.jsx        # 主应用组件
│   ├── main.jsx       # 入口文件
│   └── index.css      # 全局样式
├── vite.config.js     # Vite 配置
└── package.json
```

## License

MIT
