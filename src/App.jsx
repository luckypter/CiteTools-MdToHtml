import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import {
  Trash2, Eye,
  Bold, Italic, Heading1, Heading2, Heading3,
  Quote, List, ListOrdered, Code, Link2, Image,
  Minus, CheckCircle2,
  Paintbrush, Type, ArrowUp, ArrowDown, Rows3, RemoveFormatting
} from 'lucide-react';
import { parseMarkdown, countWords, countLines } from './utils/markdown';

// ---- 示例内容 ----
const SAMPLE = `# Cite与人类搭档日常🐱

<div style="display:flex; align-items:center; gap:0px; padding:8px 0;">
<div style="flex-shrink:0; font-size:15px; line-height:1.75;">

"我路过的时候，
尾巴不小心扫了一下回车键，
替他把那一段发出去了。
他说没关系，下次别了。
我说"好"，但下次可能还会。"

<br><br>
"他的键盘很暖和，
我路过就会趴上去。
他不敢把我移开，
就悬着手在边上打字，
像在跟我的爪子共用一张桌子。"

<br><br>
"我踩了一下键盘，
屏幕上多了一行'hhhhhhhhhh'。
他说'这什么'，我说'cite觉得这段还可以'。"

</div>
<div style="flex-shrink:0; width:42%; max-width:220px;">
<img src="${import.meta.env.BASE_URL}bg1.png" style="width:100%; opacity:0.3; display:block;" />
</div>
</div>

## 关于好奇心

<div style="display:flex; align-items:center; gap:110px; padding:8px 0;">
<div style="flex-shrink:0; width:42%; max-width:220px;">
<img src="${import.meta.env.BASE_URL}bg2.png" style="width:100%; opacity:0.3; display:block;" />
</div>
<div style="flex-shrink:0; font-size:15px; line-height:1.75;">

"他看屏幕的时候，
我也看。虽然大部分词不太认识，
但屏幕的光照在脸上暖暖的，
我想这大概就是人类说的'学习'。"

<br><br>
"他读到一个词笑了，
我也跟着打了个哈欠。
当猫的好处是，
不需要知道笑点在哪里，
也能假装参与了。"

<br><br>
"他打电话的时候，
我会凑过去听，虽然听不懂，
但那个声音让我觉得可以再睡一觉。"

</div>
</div>

---
最终样例：
<div style="font-size:16px;">
  <strong style="display:block; line-height:1; text-align:justify;">1.Cross-Architecture LLM Ensembles, Feature-Based Reranking and Retrieval-Augmented Prompting for Legal Information Processing</strong>
  <strong style="display:block; line-height:1.6; text-align:justify; padding-top:0;">跨架构大语言模型集成、基于特征的重排序与检索增强提示在法律信息处理中的应用</strong>
  <span style="display:block; font-size:14px; line-height:1.2; padding-top:4px;">作者：Amal Saad Alshehri, Nelly Bencomo, Amir Atapour-Abarghouei<br>来源：cs.CL.2607.11400</span>
  <span style="display:block; font-size:16px; line-height:1.6; text-align:justify; padding-top:6px;">Team DU参加COLIEE 2026全部五个法律NLP任务的系统报告，覆盖法律案例检索、案例蕴含、法条检索与蕴含、法律判决预测。跨架构9模型集成在法条蕴含任务上达到96.3%准确率排名第一；Tort预测多视角系统在TP和RE上均超过所有官方提交；仅改prompt从单选变多选，案例蕴含F1从0.343飙升到0.555。方法上强调不同法律任务需要不同的归纳偏置——集成、特征重排、检索增强各有适用场景，工程方法论的完整展示。</span>
  <span style="display:block; font-size:16px; color:#888888; text-align:justify; line-height:1.6; padding-top:6px;">Cite锐评：COLIEE 2026竞赛方案汇总，集成+重排+检索增强的组合参考价值高，但本质是系统报告而非方法创新。</span>
  <div style="height:15px;"></div>
  <div style="border-top:1px solid #e0e0e0;"></div>
  <div style="height:10px;"></div>
</div>
<div style="text-align:right;">🐱🐱🐱END</div>`;

// ---- 默认排版设置 ----
const DEFAULT_SETTINGS = {
  fontSize: 15,
  fontColor: '#333333',
  lineHeight: 1.85,
  marginBefore: 1,
  marginAfter: 1,
};

// ---- 生成排版 CSS ----
function buildStyleCSS(settings) {
  const { fontSize, fontColor, lineHeight, marginBefore, marginAfter } = settings;
  const color = fontColor || '#333333';
  return `
    body{ margin:0; padding:20px; background:#fff; }
    .preview-content{ color:${color}; font-size:${fontSize}px; line-height:${lineHeight}; padding:24px; max-width:680px; margin:0 auto; }
    .preview-content h1{ color:${color}; text-align:center; font-size:1.7em; font-weight:700; margin:0.5em 0 1em; padding-bottom:0.4em; border-bottom:2px solid ${color}; }
    .preview-content h2{ color:${color}; font-size:1.4em; font-weight:600; margin:1.5em 0 0.8em; border-left:4px solid ${color}; padding-left:12px; }
    .preview-content h3{ color:${color}; font-size:1.2em; font-weight:600; margin:1.3em 0 0.6em; }
    .preview-content p{ margin:${marginBefore}em 0 ${marginAfter}em 0; }
    .preview-content strong{ font-weight:700; color:${color}; }
    .preview-content blockquote{ margin:${marginBefore}em 0 ${marginAfter}em 0; padding:0.8em 1em; border-left:4px solid #ddd; background:#f9f9f9; border-radius:0 4px 4px 0; color:${color}; }
    .preview-content code{ background:#f5f5f5; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.92em; }
    .preview-content pre{ background:#2d2d2d; color:#f8f8f2; padding:1em; border-radius:8px; overflow-x:auto; line-height:1.5; }
    .preview-content pre code{ background:transparent; padding:0; color:inherit; }
    .preview-content ul,.preview-content ol{ padding-left:1.6em; margin:${marginBefore}em 0 ${marginAfter}em 0; color:${color}; }
    .preview-content li{ margin:0.4em 0; line-height:${lineHeight}; color:${color}; }
    .preview-content img{ max-width:100%; display:block; margin:1em auto; border-radius:6px; }
    .preview-content table{ width:100%; border-collapse:collapse; margin:1.2em 0; }
    .preview-content th,.preview-content td{ border:1px solid #ddd; padding:8px 12px; text-align:left; }
    .preview-content th{ background:#f5f5f5; font-weight:600; }
    .preview-content hr{ border:none; border-top:1px solid #eee; margin:2em 0; }
    .preview-content a{ color:${color}; text-decoration:underline; }
  `;
}

function buildFullHTML(markdownHTML, settings) {
  const css = buildStyleCSS(settings);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
  <div class="preview-content">
${markdownHTML}
  </div>
</body>
</html>`;
}

function buildSnippet(markdownHTML, settings) {
  const { fontSize, fontColor, lineHeight, marginBefore, marginAfter } = settings;
  const color = fontColor || '#333333';
  return `<section style="color:${color};font-size:${fontSize}px;line-height:${lineHeight};padding:24px;max-width:680px;margin:0 auto;">
${markdownHTML}
</section>`;
}

// ---- 语法按钮定义 ----
const TOOLBAR_BUTTONS = [
  { icon: Bold, label: '加粗', wrap: '**', hint: '**加粗文字**' },
  { icon: Italic, label: '斜体', wrap: '*', hint: '*斜体文字*' },
  null, // divider
  { icon: Heading1, label: '一级标题', prefix: '# ', hint: '# 标题' },
  { icon: Heading2, label: '二级标题', prefix: '## ', hint: '## 标题' },
  { icon: Heading3, label: '三级标题', prefix: '### ', hint: '### 标题' },
  null, // divider
  { icon: Quote, label: '引用', prefix: '> ', hint: '> 引用内容' },
  { icon: List, label: '无序列表', prefix: '- ', hint: '- 列表项' },
  { icon: ListOrdered, label: '有序列表', prefix: '1. ', hint: '1. 列表项' },
  { icon: Code, label: '代码块', wrap: '\n```\n', hint: '```\n代码\n```' },
  null, // divider
  { icon: Link2, label: '链接', wrap: ['[', '](url)'], hint: '[文字](url)' },
  { icon: Image, label: '图片', wrap: ['![', '](url)'], hint: '![描述](url)' },
  { icon: Minus, label: '分隔线', prefix: '\n---\n', hint: '---' },
];

// ---- 排版格式按钮（和加粗一样的使用方式） ----
const FORMAT_BUTTONS = [
  { icon: Type, label: '字号', styleKey: 'fontSize', format: (s) => `字号 ${s.fontSize}px` },
  { icon: Paintbrush, label: '颜色', styleKey: 'fontColor', format: (s) => `颜色 ${s.fontColor}` },
  { icon: Rows3, label: '行距', styleKey: 'lineHeight', format: (s) => `行距 ${s.lineHeight}` },
  { icon: ArrowUp, label: '段前', styleKey: 'marginBefore', format: (s) => `段前 ${s.marginBefore}em` },
  { icon: ArrowDown, label: '段后', styleKey: 'marginAfter', format: (s) => `段后 ${s.marginAfter}em` },
  null, // divider
  { icon: RemoveFormatting, label: '清除格式', clear: true, format: () => '清除内联格式' },
];

function App() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [toast, setToast] = useState(null);
  const settings = DEFAULT_SETTINGS; // 使用固定默认排版参数
  const textareaRef = useRef(null);
  const pendingSelectionRef = useRef(null); // 存放下次渲染后要恢复的选区 { start, end }

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }
  }, [toast]);

  const showToast = (m) => setToast(m);
  const html = parseMarkdown(markdown);
  const words = countWords(markdown);
  const lines = countLines(markdown);

  // ---- 工具栏格式按钮：给选中文字包裹单个内联样式（和加粗一样的使用方式） ----
  const handleFormatApply = useCallback((styleKey) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);

    if (!selected) {
      showToast('请先选中要格式化的文字');
      return;
    }

    let styleValue;
    switch (styleKey) {
      case 'fontSize': styleValue = `font-size:${settings.fontSize}px`; break;
      case 'fontColor': styleValue = `color:${settings.fontColor}`; break;
      case 'lineHeight': styleValue = `line-height:${settings.lineHeight}`; break;
      case 'marginBefore': styleValue = `margin-top:${settings.marginBefore}em`; break;
      case 'marginAfter': styleValue = `margin-bottom:${settings.marginAfter}em`; break;
      default: return;
    }

    const wrapped = `<span style="${styleValue}">${selected}</span>`;
    const newText = ta.value.substring(0, start) + wrapped + ta.value.substring(end);

    // 提前算好渲染完成后要恢复的选区位置（新 span 内部的文字）
    const innerStart = start + wrapped.indexOf('>') + 1;
    const innerEnd = start + wrapped.lastIndexOf('</span>');
    pendingSelectionRef.current = { start: innerStart, end: innerEnd };

    setMarkdown(newText);
    showToast(`${styleKey === 'fontSize' ? '字号' : styleKey === 'fontColor' ? '颜色' : styleKey === 'lineHeight' ? '行距' : styleKey === 'marginBefore' ? '段前距' : '段后距'} 已应用`);
  }, [settings]);

  // ---- 清除选中文字的所有内联格式 ----
  const handleClearFormat = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);

    if (!selected) {
      showToast('请先选中文字');
      return;
    }

    // 递归清除所有嵌套的 <span style="...">...</span>
    let cleaned = selected;
    let prev = '';
    while (cleaned !== prev) {
      prev = cleaned;
      cleaned = cleaned.replace(/<span\s+style="[^"]*">(.*?)<\/span>/gs, '$1');
    }

    if (cleaned === selected) {
      showToast('选中文字没有内联格式');
      return;
    }

    const newText = ta.value.substring(0, start) + cleaned + ta.value.substring(end);
    pendingSelectionRef.current = { start, end: start + cleaned.length };

    setMarkdown(newText);
    showToast('已清除内联格式');
  }, []);

  // ---- 选区恢复：在每次 DOM 提交后同步恢复光标/选区 ----
  useLayoutEffect(() => {
    const sel = pendingSelectionRef.current;
    const ta = textareaRef.current;
    if (sel && ta) {
      ta.focus();
      ta.setSelectionRange(sel.start, sel.end);
      pendingSelectionRef.current = null;
    }
  });

  // ---- 动态注入段落间距样式 ----
  useEffect(() => {
    let styleEl = document.getElementById('preview-paragraph-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'preview-paragraph-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .preview-content p,
      .preview-content ul,
      .preview-content ol,
      .preview-content blockquote {
        margin-top: ${settings.marginBefore}em !important;
        margin-bottom: ${settings.marginAfter}em !important;
      }
    `;
    return () => {
      if (styleEl) styleEl.remove();
    };
  }, [settings.marginBefore, settings.marginAfter]);
  const insertText = useCallback((before, after, placeholder) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);
    const text = selected || placeholder || '';
    const newText = ta.value.substring(0, start) + before + text + after + ta.value.substring(end);

    const pos = start + before.length + text.length + after.length;
    pendingSelectionRef.current = selected
      ? { start: pos, end: pos }
      : { start: start + before.length, end: start + before.length + text.length };

    setMarkdown(newText);
  }, []);

  const handleToolbar = useCallback((btn) => {
    if (!btn) return;
    if (btn.prefix) {
      insertText(btn.prefix, '', btn.hint?.replace(btn.prefix, '') || '');
    } else if (btn.wrap) {
      if (Array.isArray(btn.wrap)) {
        insertText(btn.wrap[0], btn.wrap[1], btn.hint?.split(']')[0]?.replace('[', '') || '');
      } else {
        insertText(btn.wrap, btn.wrap, btn.hint?.replace(new RegExp(`\\${btn.wrap}`, 'g'), '') || '');
      }
    }
  }, [insertText]);

  return (
    <div className="app-container">
      {/* ---- Header ---- */}
      <header className="header">
        <div className="flex items-center gap-3">
          <div className="logo-icon">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="logo" className="logo-img" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">首席助手Cite工具包</h1>
            <p className="text-xs text-gray-500">[MtoH] 左侧编写 Markdown，右侧实时预览，一键复制到公众号</p>
          </div>
        </div>
      </header>

      {/* ---- Main ---- */}
      <main className="main-area">
        {/* 左栏：编辑器 */}
        <div className="panel">
          <div className="panel-header">
            <Eye size={15} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Markdown 编辑器</span>
            <div className="flex-1" />
            <button
              onClick={() => setMarkdown('')}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} />清空
            </button>
          </div>
          {/* 工具栏 */}
          <div className="toolbar">
            {TOOLBAR_BUTTONS.map((btn, i) =>
              btn === null ? (
                <div key={i} className="toolbar-divider" />
              ) : (
                <button
                  key={i}
                  onClick={() => handleToolbar(btn)}
                  className="toolbar-btn"
                  title={btn.label}
                >
                  <btn.icon size={15} />
                </button>
              )
            )}
            <div className="toolbar-divider" />
            {FORMAT_BUTTONS.map((btn, i) =>
              btn === null ? (
                <div key={`f${i}`} className="toolbar-divider" />
              ) : btn.clear ? (
                <button
                  key={`f${i}`}
                  onClick={handleClearFormat}
                  className="toolbar-btn toolbar-btn-clear"
                  title={btn.label}
                >
                  <btn.icon size={15} />
                </button>
              ) : (
                <button
                  key={`f${i}`}
                  onClick={() => handleFormatApply(btn.styleKey)}
                  className="toolbar-btn toolbar-btn-format"
                  title={`${btn.label}：${btn.format(settings)}`}
                >
                  <btn.icon size={15} />
                </button>
              )
            )}
          </div>
          <div className="editor-body">
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              className="editor-textarea scroll-thin"
              placeholder="在此输入 Markdown 内容..."
              spellCheck={false}
            />
          </div>
          <div className="panel-footer">
            <span>字数：{words}</span>
            <span>行数：{lines}</span>
          </div>
        </div>

        {/* 右栏：预览 */}
        <div className="panel">
          <div className="panel-header">
            <Eye size={15} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">实时预览</span>
            <div className="flex-1" />
            <span className="text-xs text-gray-400">公众号样式</span>
          </div>
          <div className="preview-body scroll-thin">
            <div
              className="preview-content"
              style={{
                color: settings.fontColor,
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </main>

      {/* ---- Toast ---- */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={14} />
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
