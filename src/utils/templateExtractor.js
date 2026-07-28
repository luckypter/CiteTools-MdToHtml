/**
 * 从公众号文章 HTML 中提取排版模板特征 + 转换为 Markdown
 * 支持：粘贴 HTML 源码 / 输入 URL 自动抓取
 */
import TurndownService from 'turndown';

// ============================================================
// Turndown 配置 - 针对公众号 HTML 优化
// ============================================================
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  blankReplacement: (content, node) => {
    // 处理图片节点
    if (node.nodeName === 'IMG') {
      const alt = node.getAttribute('alt') || '';
      const src = node.getAttribute('src') || node.getAttribute('data-src') || '';
      return src ? `![${alt}](${src})` : '';
    }
    return node.isBlock ? '\n\n' : '';
  },
});

// 移除空的 span/div
turndownService.addRule('emptySpans', {
  filter: (node) => {
    if (!['SPAN', 'DIV', 'SECTION'].includes(node.nodeName)) return false;
    const text = node.textContent?.trim() || '';
    if (text) return false;
    return !node.querySelector('img, video, iframe');
  },
  replacement: () => '',
});

// 处理微信 section 标签
turndownService.addRule('wechatSection', {
  filter: (node) => node.nodeName === 'SECTION',
  replacement: (content) => {
    const trimmed = content.trim();
    return trimmed ? `\n\n${trimmed}\n\n` : '';
  },
});

// 处理图片 - 优先使用 data-src
turndownService.addRule('images', {
  filter: 'img',
  replacement: (content, node) => {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('data-src') || node.getAttribute('src') || '';
    if (!src) return '';
    return `![${alt}](${src})`;
  },
});

// 清除 style/script 标签
turndownService.addRule('removeStyles', {
  filter: (node) => node.nodeName === 'STYLE' || node.nodeName === 'SCRIPT',
  replacement: () => '',
});

// ============================================================
// URL 抓取
// ============================================================

/**
 * 通过多个 CORS 代理尝试抓取 URL
 */
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

export async function fetchURL(url) {
  const errors = [];
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyURL = proxyFn(url);
      const resp = await fetch(proxyURL, { signal: AbortSignal.timeout(15000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      if (html.length < 500) throw new Error('Response too short');
      return html;
    } catch (e) {
      errors.push(e.message);
    }
  }

  // 最后一个备选：尝试直接请求（可能被 CORS 拦截，但在某些环境下可用）
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const html = await resp.text();
      if (html.length > 500) return html;
    }
  } catch (e) {
    errors.push(e.message);
  }

  throw new Error(`所有抓取方式均失败:\n${errors.join('\n')}`);
}

// ============================================================
// 主提取函数
// ============================================================

export function extractTemplate(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. 提取标题
  const title = guessTitle(doc);

  // 2. 找到文章正文
  const articleBody = findArticleBody(doc);
  const bodyHTML = articleBody ? articleBody.innerHTML : doc.body.innerHTML;

  // 3. 清理 HTML
  const cleanHTML = cleanWechatHTML(bodyHTML);
  const cleanDoc = parser.parseFromString(`<div>${cleanHTML}</div>`, 'text/html');
  const root = cleanDoc.body.firstElementChild || cleanDoc.body;

  // 4. 收集元素统计
  const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const paragraphs = Array.from(root.querySelectorAll('p'));
  const blockquotes = Array.from(root.querySelectorAll('blockquote'));
  const images = Array.from(root.querySelectorAll('img'));
  const links = Array.from(root.querySelectorAll('a'));
  const lists = Array.from(root.querySelectorAll('ul, ol'));
  const hrs = Array.from(root.querySelectorAll('hr'));

  // 5. 分析排版特征
  const colorAnalysis = analyzeColorsEnhanced(root, bodyHTML);
  const typography = analyzeTypography(root, bodyHTML);
  const headingAnalysis = analyzeHeadingsEnhanced(headings);
  const paragraphAnalysis = analyzeParagraphsEnhanced(paragraphs);
  const quoteAnalysis = analyzeQuotes(blockquotes);
  const imageAnalysis = analyzeImages(images);

  // 6. 转换为 Markdown
  const markdown = htmlToMarkdown(cleanHTML);

  // 7. 构建预览用的 HTML（保留样式）
  const previewHTML = buildPreviewHTML(bodyHTML);

  return {
    name: title || '提取模板',
    extractedAt: new Date().toISOString(),
    url: null,
    // 颜色
    primaryColor: colorAnalysis.primary,
    accentColor: colorAnalysis.accent,
    bgColor: colorAnalysis.background,
    textColor: colorAnalysis.textColor,
    colorPalette: colorAnalysis.palette,
    // 排版
    fontFamily: typography.fontFamily,
    baseFontSize: typography.baseFontSize,
    lineHeight: typography.lineHeight,
    letterSpacing: typography.letterSpacing,
    textAlign: typography.textAlign,
    // 标题
    headingAnalysis,
    // 段落
    paragraphAnalysis,
    // 引用块
    quoteAnalysis,
    // 图片
    imageAnalysis,
    // Markdown
    markdown,
    markdownLength: markdown.length,
    // 预览 HTML
    previewHTML,
    // 统计
    elementCounts: {
      headings: headings.length,
      paragraphs: paragraphs.length,
      blockquotes: blockquotes.length,
      images: images.length,
      links: links.length,
      lists: lists.length,
      hr: hrs.length,
    },
    // 原始信息
    articleTitle: title,
    wordCount: root.textContent?.replace(/\s+/g, '').length || 0,
  };
}

// ============================================================
// HTML 清理
// ============================================================

function cleanWechatHTML(html) {
  return html
    // 移除注释
    .replace(/<!--[\s\S]*?-->/g, '')
    // 移除 script/style
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // 移除微信 mp 小程序标签
    .replace(/<mp-common-[^>]*>[\s\S]*?<\/mp-common-[^>]*>/gi, '')
    .replace(/<mp-common-[^>]*\/>/gi, '')
    .replace(/<mp-common-[^>]*>/gi, '')
    // 移除 mpa 相关标签
    .replace(/<mpa-[\w-]+[^>]*>[\s\S]*?<\/mpa-[\w-]+>/gi, '')
    .replace(/<mpa-[\w-]+[^>]*\/>/gi, '')
    // 移除音频标签
    .replace(/<oaudio[^>]*>[\s\S]*?<\/oaudio>/gi, '')
    .replace(/<oaudio[^>]*\/>/gi, '')
    // 移除 iframe（通常是小程序卡片等）
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    // 移除 SVG
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    // 处理图片：data-src → src
    .replace(/<img[^>]+data-src="([^"]*)"[^>]*>/gi, (match, src) => {
      return match.replace(/src="[^"]*"/, `src="${src}"`).replace(/data-src="[^"]*"/, '');
    })
    // 合并连续换行
    .replace(/\n{3,}/g, '\n\n');
}

// ============================================================
// 文章正文定位
// ============================================================

function findArticleBody(doc) {
  // 微信公众号特征选择器
  const selectors = [
    '#js_content',
    '.rich_media_content',
    '.rich_media_area_primary',
    '#page-content',
    'article',
    '[role="article"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content',
    'main',
  ];

  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el && (el.textContent?.trim().length || 0) > 100) return el;
  }

  // 回退：找 p 标签最多的容器
  const divs = Array.from(doc.querySelectorAll('div'));
  let best = null, maxP = 0;
  divs.forEach(div => {
    const n = div.querySelectorAll('p').length;
    if (n > maxP && n >= 3) { maxP = n; best = div; }
  });
  return best || null;
}

function guessTitle(doc) {
  // 微信公众号标题选择器
  const selectors = [
    '#activity-name',
    '.rich_media_title',
    '.article-title',
    'h1.title',
    'h1',
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    const t = el?.textContent?.trim();
    if (t && t.length > 2) return t;
  }

  const title = doc.querySelector('title');
  if (title) {
    const t = title.textContent.trim();
    // 移除常见的后缀
    return t.replace(/\s*[|_-]\s*.+$/, '').slice(0, 50);
  }

  const og = doc.querySelector('meta[property="og:title"]');
  return og?.getAttribute('content')?.slice(0, 50) || null;
}

// ============================================================
// 颜色分析（增强版）
// ============================================================

function analyzeColorsEnhanced(root, rawHTML) {
  const fgColors = {};
  const bgColors = {};

  // 1. 从内联 style 提取
  const styleColorRe = /(?:^|;)\s*(?:color|background(?:-color)?)\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/gi;
  let m;
  while ((m = styleColorRe.exec(rawHTML)) !== null) {
    const hex = normalizeColor(m[1]);
    if (!hex) continue;
    if (m[0].includes('background')) {
      bgColors[hex] = (bgColors[hex] || 0) + 1;
    } else {
      fgColors[hex] = (fgColors[hex] || 0) + 1;
    }
  }

  // 2. 从 data 属性提取
  root.querySelectorAll('*').forEach(el => {
    ['data-bgcolor', 'data-color'].forEach(attr => {
      const v = el.getAttribute(attr);
      if (v && /^#[0-9a-fA-F]{6}$/.test(v)) {
        if (attr.includes('bg')) bgColors[v.toLowerCase()] = (bgColors[v.toLowerCase()] || 0) + 1;
        else fgColors[v.toLowerCase()] = (fgColors[v.toLowerCase()] || 0) + 1;
      }
    });
  });

  // 3. 从文字颜色推断
  const textEls = root.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
  let textColorCount = {};
  textEls.forEach(el => {
    const c = el.style?.color || el.getAttribute('color');
    if (c) {
      const hex = normalizeColor(c);
      if (hex) textColorCount[hex] = (textColorCount[hex] || 0) + 1;
    }
  });

  const sortByVal = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);
  const sortedFG = sortByVal(fgColors);
  const sortedBG = sortByVal(bgColors);
  const sortedText = sortByVal(textColorCount);

  // 最常见的文字颜色作为正文色
  const textColor = sortedText[0]?.[0] || '#3a3530';
  // 排除黑色/灰色后最常见的颜色作为主色
  const accentColors = sortedFG.filter(([c]) => !isGrayOrBlack(c));
  const primary = accentColors[0]?.[0] || '#3a6ea5';
  const accent = accentColors[1]?.[0] || primary;

  return {
    primary,
    accent,
    background: sortedBG[0]?.[0] || '#ffffff',
    textColor,
    palette: sortedFG.slice(0, 6).map(([c]) => c),
  };
}

function normalizeColor(c) {
  c = c.trim().toLowerCase();
  if (c.startsWith('#')) {
    if (c.length === 4) c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    if (c.length === 7) return c;
  }
  const rgb = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) {
    return `#${hex(rgb[1])}${hex(rgb[2])}${hex(rgb[3])}`;
  }
  return null;
}

function hex(n) { return parseInt(n).toString(16).padStart(2, '0'); }

function isGrayOrBlack(c) {
  if (!c || c.length !== 7) return false;
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  // 灰度或接近黑色
  if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) return true;
  if (r < 40 && g < 40 && b < 40) return true;
  return false;
}

// ============================================================
// 排版分析
// ============================================================

function analyzeTypography(root, rawHTML) {
  // 字体族
  const ffMatch = rawHTML.match(/font-family\s*:\s*([^;"]+)/i);
  const fontFamily = ffMatch?.[1]?.trim() || "'Noto Serif SC', 'Songti SC', serif";

  // 基础字号
  const fsMatch = rawHTML.match(/(?:font-size|data-fontsize)\s*[=:]\s*(\d+)\s*px/gi);
  const fontSizes = [];
  if (fsMatch) {
    fsMatch.forEach(m => {
      const n = parseInt(m.match(/\d+/)?.[0]);
      if (n && n >= 12 && n <= 48) fontSizes.push(n);
    });
  }
  const baseFontSize = fontSizes.length
    ? Math.round(fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length)
    : 15;

  // 行高
  const lhMatch = rawHTML.match(/line-height\s*:\s*([\d.]+)/i);
  const lineHeight = lhMatch?.[1] || '1.85';

  // 字间距
  const lsMatch = rawHTML.match(/letter-spacing\s*:\s*([\d.]+)\s*px/i);
  const letterSpacing = lsMatch?.[1] || '0.5';

  // 对齐
  const alignMatch = rawHTML.match(/text-align\s*:\s*(center|left|right|justify)/i);
  const textAlign = alignMatch?.[1] || 'left';

  return { fontFamily, baseFontSize, lineHeight, letterSpacing, textAlign };
}

// ============================================================
// 标题样式分析
// ============================================================

function analyzeHeadingsEnhanced(headings) {
  if (!headings.length) return null;

  const result = {};

  ['H1', 'H2', 'H3'].forEach(tag => {
    const els = headings.filter(h => h.tagName === tag);
    if (!els.length) return;

    const samples = els.slice(0, 3);
    const styles = samples.map(el => {
      const s = el.style || {};
      const rawStyle = el.getAttribute('style') || '';
      return {
        fontSize: el.getAttribute('data-fontsize') || s.fontSize || '',
        color: el.getAttribute('color') || s.color || '',
        textAlign: el.getAttribute('align') || s.textAlign || '',
        backgroundColor: s.backgroundColor || '',
        borderBottom: s.borderBottom || '',
        borderLeft: s.borderLeft || '',
        padding: s.padding || '',
        margin: s.margin || '',
        fontWeight: s.fontWeight || '',
        // 检测装饰符号
        hasDecoration: /::?(before|after)/.test(rawStyle),
        rawStyle: rawStyle.slice(0, 200),
      };
    });

    // 合并多个样本
    const primary = styles[0] || {};
    result[tag.toLowerCase()] = {
      count: els.length,
      fontSize: primary.fontSize || (tag === 'H1' ? '1.7em' : tag === 'H2' ? '1.4em' : '1.2em'),
      color: primary.color || '',
      textAlign: primary.textAlign || 'center',
      hasBorderBottom: !!primary.borderBottom,
      hasBorderLeft: !!primary.borderLeft,
      hasBackground: !!primary.backgroundColor,
      fontWeight: primary.fontWeight || '700',
      hasDecoration: primary.hasDecoration,
    };
  });

  return result;
}

// ============================================================
// 段落样式分析
// ============================================================

function analyzeParagraphsEnhanced(paragraphs) {
  if (!paragraphs.length) return null;

  const samples = paragraphs.slice(0, 5);
  const styles = samples.map(p => {
    const s = p.style || {};
    return {
      fontSize: p.getAttribute('data-fontsize') || s.fontSize || '',
      lineHeight: s.lineHeight || '',
      letterSpacing: s.letterSpacing || '',
      color: s.color || '',
      textAlign: s.textAlign || '',
      margin: s.margin || '',
      padding: s.padding || '',
      textIndent: s.textIndent || '',
    };
  });

  const avg = (arr, key) => {
    const vals = arr.map(s => parseFloat(s[key])).filter(n => !isNaN(n));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  };

  return {
    count: paragraphs.length,
    fontSize: avg(styles, 'fontSize') || '15',
    lineHeight: avg(styles, 'lineHeight') || '1.85',
    letterSpacing: avg(styles, 'letterSpacing') || '0.5',
    color: styles.find(s => s.color)?.color || '',
    textAlign: styles.find(s => s.textAlign)?.textAlign || 'left',
    hasIndent: styles.some(s => s.textIndent && parseFloat(s.textIndent) > 0),
  };
}

// ============================================================
// 引用块样式分析
// ============================================================

function analyzeQuotes(quotes) {
  if (!quotes.length) return null;

  const samples = quotes.slice(0, 3);
  const styles = samples.map(q => {
    const s = q.style || {};
    return {
      borderLeft: s.borderLeft || '',
      backgroundColor: s.backgroundColor || '',
      color: s.color || '',
      fontSize: q.getAttribute('data-fontsize') || s.fontSize || '',
      padding: s.padding || '',
      margin: s.margin || '',
      borderRadius: s.borderRadius || '',
      fontStyle: s.fontStyle || '',
    };
  });

  const primary = styles[0] || {};
  return {
    count: quotes.length,
    borderLeft: primary.borderLeft || '',
    backgroundColor: primary.backgroundColor || '',
    color: primary.color || '',
    fontStyle: primary.fontStyle || 'normal',
    borderRadius: primary.borderRadius || '',
  };
}

// ============================================================
// 图片样式分析
// ============================================================

function analyzeImages(images) {
  if (!images.length) return null;

  const samples = images.slice(0, 5);
  const styles = samples.map(img => {
    const s = img.style || {};
    return {
      borderRadius: s.borderRadius || '',
      width: s.width || img.getAttribute('width') || '',
      margin: s.margin || '',
      display: s.display || '',
      boxShadow: s.boxShadow || '',
    };
  });

  const hasRound = styles.some(s => s.borderRadius && parseFloat(s.borderRadius) > 0);
  const hasShadow = styles.some(s => s.boxShadow && s.boxShadow !== 'none');

  return {
    count: images.length,
    hasRoundCorners: hasRound,
    hasShadow,
    borderRadius: styles.find(s => s.borderRadius)?.borderRadius || '0',
  };
}

// ============================================================
// HTML → Markdown
// ============================================================

function htmlToMarkdown(html) {
  try {
    let clean = html;

    // 移除外层样式标签，但保留内容结构
    clean = clean
      .replace(/<section[^>]*>/gi, '<div>')
      .replace(/<\/section>/gi, '</div>')
      .replace(/<br\s*\/?>/gi, '\n')
      // 移除大部分内联样式
      .replace(/\s*style="[^"]*"/gi, '')
      .replace(/\s*class="[^"]*"/gi, '')
      .replace(/\s*id="[^"]*"/gi, '')
      .replace(/\s*data-[\w-]+="[^"]*"/gi, '')
      // 合并多余空白
      .replace(/\n{3,}/g, '\n\n');

    let md = turndownService.turndown(clean);

    // 后处理
    md = md
      // 清理多余空行
      .replace(/\n{3,}/g, '\n\n')
      // 确保标题前后有空行
      .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
      .replace(/(#{1,6}\s[^\n]+)\n([^\n#])/g, '$1\n\n$2')
      // 确保图片前后有空行
      .replace(/([^\n])\n(!\[)/g, '$1\n\n$2')
      .replace(/(!\[[^\]]+\]\([^)]+\))\n([^\n!])/g, '$1\n\n$2')
      // 清理引用块中的空行
      .replace(/> \n> /g, '> ')
      // 首尾去空白
      .replace(/^\s+/, '')
      .replace(/\s+$/, '\n')
      .trim();

    return md;
  } catch (err) {
    console.error('Markdown 转换失败:', err);
    return '[转换失败，请检查 HTML 内容]';
  }
}

// ============================================================
// 构建预览 HTML
// ============================================================

function buildPreviewHTML(bodyHTML) {
  // 保留原始样式，构建可在预览面板展示的 HTML
  let html = bodyHTML;
  html = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    // 将 data-src 替换为 src 以便预览
    .replace(/data-src="/g, 'src="');

  return html;
}

// ============================================================
// 转换为自定义主题
// ============================================================

export function templateToTheme(template, name) {
  const t = template || {};
  const color = t.primaryColor || '#3a6ea5';
  const accent = t.accentColor || color;
  const bg = t.bgColor || '#f0f5fb';
  const fontFamily = t.fontFamily || "'Noto Serif SC', 'Songti SC', serif";
  const baseFontSize = t.baseFontSize || 15;
  const lineHeight = t.lineHeight || '1.85';
  const letterSpacing = t.letterSpacing || '0.5';
  const textAlign = t.textAlign || 'left';

  // 从标题分析中提取样式
  const h1Info = t.headingAnalysis?.h1 || {};
  const h2Info = t.headingAnalysis?.h2 || {};
  const quoteInfo = t.quoteAnalysis || {};
  const imgInfo = t.imageAnalysis || {};

  const h1Border = h1Info.hasBorderBottom
    ? `2px solid ${h1Info.color || color}`
    : h1Info.hasBorderLeft
      ? 'none'
      : `2px solid ${color}`;

  const h2Styles = {};
  if (h2Info.hasBorderLeft) {
    h2Styles.borderLeft = `5px solid ${h2Info.color || accent}`;
    h2Styles.paddingLeft = '12px';
  }
  if (h2Info.hasBorderBottom) {
    h2Styles.borderBottom = `2px solid ${h2Info.color || color}`;
    h2Styles.paddingBottom = '8px';
  }
  if (h2Info.hasBackground) {
    h2Styles.background = `${h2Info.color || accent}14`;
    h2Styles.padding = '6px 14px';
    h2Styles.borderRadius = '6px';
  }
  if (!Object.keys(h2Styles).length) {
    h2Styles.color = color;
    h2Styles.borderLeft = `5px solid ${accent}`;
    h2Styles.paddingLeft = '12px';
    h2Styles.background = `${accent}14`;
  }

  const bqStyles = {};
  if (quoteInfo.borderLeft) {
    bqStyles.borderLeft = quoteInfo.borderLeft;
  } else {
    bqStyles.borderLeft = `4px solid ${accent}`;
  }
  if (quoteInfo.backgroundColor) {
    bqStyles.background = quoteInfo.backgroundColor;
  } else {
    bqStyles.background = `${accent}0d`;
  }
  if (quoteInfo.borderRadius) {
    bqStyles.borderRadius = quoteInfo.borderRadius;
  }
  if (quoteInfo.fontStyle && quoteInfo.fontStyle !== 'normal') {
    bqStyles.fontStyle = quoteInfo.fontStyle;
  }

  const imgBorderRadius = imgInfo.hasRoundCorners
    ? (imgInfo.borderRadius || '8px')
    : '6px';

  return {
    id: `custom-${Date.now()}`,
    name: name || t.name || '自定义模板',
    desc: '从公众号文章提取',
    className: 'theme-blue',
    color,
    bg,
    accent,
    fontFamily,
    baseFontSize,
    lineHeight,
    letterSpacing,
    textAlign,
    h1Align: h1Info.textAlign || 'center',
    h1Border,
    h2Style: h2Styles,
    blockquoteStyle: bqStyles,
    imgBorderRadius,
    customCSS: `
      .preview-content h1 { color: ${h1Info.color || color}; }
      .preview-content h2 { color: ${h2Info.color || color}; }
      .preview-content h3 { color: ${accent}; }
      .preview-content strong { color: ${color}; }
      .preview-content img { border-radius: ${imgBorderRadius}; }
    `,
    isCustom: true,
  };
}
