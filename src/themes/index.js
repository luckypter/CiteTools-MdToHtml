// 公众号排版主题
export const themes = {
  blue: {
    id: 'blue',
    name: '蓝色系',
    desc: '清新淡雅，适合技术/知识分享',
    className: 'theme-blue',
    color: '#3a6ea5',
    bg: '#f0f5fb',
    accent: '#5e8cc4',
    fontFamily: "'Noto Serif SC', 'Songti SC', serif",
    baseFontSize: 15,
    lineHeight: '1.85',
    letterSpacing: '0.5',
    textAlign: 'left',
    h1Align: 'center',
    h1Border: '2px solid #3a6ea5',
    h2Style: {
      borderLeft: '5px solid #3a6ea5',
      paddingLeft: '12px',
      background: 'linear-gradient(90deg, rgba(58,110,165,0.08) 0%, transparent 100%)',
    },
    blockquoteStyle: {
      borderLeft: '4px solid #3a6ea5',
      background: 'rgba(58,110,165,0.05)',
    },
    imgBorderRadius: '6px',
    customCSS: `
      .preview-content h2 { color: #3a6ea5; }
      .preview-content strong { color: #3a6ea5; }
    `
  },
  deepblue: {
    id: 'deepblue',
    name: '深蓝系',
    desc: '沉稳商务，适合深度长文',
    className: 'theme-deepblue',
    color: '#1e3a5f',
    bg: '#eaf0f6',
    accent: '#2d5a8c',
    fontFamily: "'Noto Serif SC', 'Songti SC', serif",
    baseFontSize: 15,
    lineHeight: '1.85',
    letterSpacing: '0.5',
    textAlign: 'left',
    h1Align: 'center',
    h1Border: '3px solid #1e3a5f',
    h2Style: {
      color: '#1e3a5f',
      borderBottom: '2px solid #1e3a5f',
      paddingBottom: '8px',
      marginBottom: '0.8em',
    },
    blockquoteStyle: {
      borderLeft: '4px solid #1e3a5f',
      background: 'rgba(30,58,95,0.05)',
      fontStyle: 'italic',
    },
    imgBorderRadius: '6px',
    customCSS: `
      .preview-content strong { color: #1e3a5f; }
    `
  },
  sand: {
    id: 'sand',
    name: '沙滩系',
    desc: '温暖柔和，适合生活方式',
    className: 'theme-sand',
    color: '#b08968',
    bg: '#faf3eb',
    accent: '#cda682',
    fontFamily: "'Noto Serif SC', 'Songti SC', serif",
    baseFontSize: 15,
    lineHeight: '1.85',
    letterSpacing: '0.5',
    textAlign: 'left',
    h1Align: 'center',
    h1Border: 'none',
    h2Style: {
      color: '#b08968',
      textAlign: 'center',
      borderBottom: '1px dashed #cda682',
      paddingBottom: '10px',
    },
    blockquoteStyle: {
      borderLeft: '4px solid #cda682',
      background: 'rgba(176,137,104,0.06)',
      borderRadius: '0 8px 8px 0',
    },
    imgBorderRadius: '6px',
    customCSS: `
      .preview-content h1 { color: #8b6a4a; }
      .preview-content h2 { color: #b08968; }
      .preview-content strong { color: #b08968; }
    `
  },
  milktea: {
    id: 'milktea',
    name: '奶茶系',
    desc: '甜美治愈，适合情感/成长',
    className: 'theme-milktea',
    color: '#a98069',
    bg: '#f9f1ec',
    accent: '#c89f87',
    fontFamily: "'Noto Serif SC', 'Songti SC', serif",
    baseFontSize: 15,
    lineHeight: '1.85',
    letterSpacing: '0.5',
    textAlign: 'left',
    h1Align: 'center',
    h1Border: 'none',
    h2Style: {
      display: 'inline-block',
      background: '#c89f87',
      color: '#fff',
      padding: '6px 18px',
      borderRadius: '20px',
      fontSize: '1.2em',
    },
    blockquoteStyle: {
      border: '1px solid rgba(168,128,105,0.3)',
      background: 'rgba(168,128,105,0.05)',
      borderRadius: '12px',
      padding: '1em',
    },
    imgBorderRadius: '6px',
    customCSS: `
      .preview-content h1 { color: #8b6551; }
      .preview-content h3 { color: #a98069; }
      .preview-content strong { color: #a98069; }
    `
  },
  jade: {
    id: 'jade',
    name: '玉林系',
    desc: '自然静谧，适合旅行/阅读',
    className: 'theme-jade',
    color: '#5d8a72',
    bg: '#eef4f0',
    accent: '#7eaa90',
    fontFamily: "'Noto Serif SC', 'Songti SC', serif",
    baseFontSize: 15,
    lineHeight: '1.85',
    letterSpacing: '0.5',
    textAlign: 'left',
    h1Align: 'center',
    h1Border: 'none',
    h2Style: {
      color: '#5d8a72',
      borderLeft: '6px double #5d8a72',
      paddingLeft: '14px',
    },
    blockquoteStyle: {
      borderLeft: '4px solid #7eaa90',
      background: 'rgba(93,138,114,0.06)',
    },
    imgBorderRadius: '6px',
    customCSS: `
      .preview-content h1 { color: #3d6b53; }
      .preview-content strong { color: #5d8a72; }
    `
  },
  amber: {
    id: 'amber',
    name: '琥珀系',
    desc: '复古浓郁，适合历史/文化',
    className: 'theme-amber',
    color: '#b07a3d',
    bg: '#fbf3e7',
    accent: '#d19550',
    fontFamily: "'Noto Serif SC', 'Songti SC', serif",
    baseFontSize: 15,
    lineHeight: '1.85',
    letterSpacing: '0.5',
    textAlign: 'left',
    h1Align: 'center',
    h1Border: '1px solid #b07a3d',
    h2Style: {
      color: '#8b5a24',
      textAlign: 'center',
      position: 'relative',
    },
    blockquoteStyle: {
      borderLeft: '4px solid #b07a3d',
      background: 'rgba(176,122,61,0.06)',
    },
    imgBorderRadius: '6px',
    customCSS: `
      .preview-content h1 { color: #8b5a24; }
      .preview-content h2::before, .preview-content h2::after {
        content: '✦';
        margin: 0 10px;
        color: #d19550;
        font-size: 0.8em;
      }
      .preview-content strong { color: #b07a3d; }
    `
  }
};

export const defaultTheme = themes.blue;

export function buildThemeCSS(theme) {
  const h2 = theme.h2Style || {};
  const bq = theme.blockquoteStyle || {};
  const fs = theme.baseFontSize || 15;
  const lh = theme.lineHeight || '1.85';
  const ls = theme.letterSpacing || '0.5';
  const ta = theme.textAlign || 'left';
  const ff = theme.fontFamily || "'Noto Serif SC', 'Songti SC', serif";
  const imgRadius = theme.imgBorderRadius || '6px';

  const toCSS = (obj) =>
    Object.entries(obj)
      .map(([k, v]) => {
        if (v === undefined || v === null) return '';
        const cssKey = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        return `${cssKey}: ${v};`;
      })
      .join('\n        ');

  return `
    .preview-content {
      color: #3a3530;
      background: ${theme.bg};
      padding: 24px;
      border-radius: 8px;
      font-family: ${ff};
      font-size: ${fs}px;
      line-height: ${lh};
      letter-spacing: ${ls}px;
      text-align: ${ta};
    }
    .preview-content h1 {
      text-align: ${theme.h1Align || 'center'};
      border-bottom: ${theme.h1Border || '2px solid currentColor'};
      color: ${theme.color};
      padding-bottom: 0.4em;
      font-size: 1.7em;
      font-weight: 700;
      margin: 0.5em 0 1em;
    }
    .preview-content h2 {
      ${toCSS(h2)}
      font-size: 1.4em;
      font-weight: 600;
      margin: 1.5em 0 0.8em;
    }
    .preview-content h3 {
      font-size: 1.2em;
      font-weight: 600;
      margin: 1.3em 0 0.6em;
      color: ${theme.color};
    }
    .preview-content p {
      margin: 1em 0;
      line-height: ${lh};
    }
    .preview-content strong {
      font-weight: 700;
    }
    .preview-content blockquote {
      ${toCSS(bq)}
      margin: 1.2em 0;
      padding: 0.8em 1em;
    }
    .preview-content code {
      background: rgba(0,0,0,0.06);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.92em;
    }
    .preview-content pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 1em;
      border-radius: 8px;
      overflow-x: auto;
      line-height: 1.5;
    }
    .preview-content pre code {
      background: transparent;
      padding: 0;
      color: inherit;
    }
    .preview-content ul, .preview-content ol {
      padding-left: 1.6em;
      margin: 1em 0;
    }
    .preview-content li {
      margin: 0.4em 0;
      line-height: 1.8;
    }
    .preview-content img {
      max-width: 100%;
      display: block;
      margin: 1em auto;
      border-radius: ${imgRadius};
    }
    .preview-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
    }
    .preview-content th, .preview-content td {
      border: 1px solid rgba(0,0,0,0.15);
      padding: 8px 12px;
      text-align: left;
    }
    .preview-content th {
      background: ${theme.accent}22;
      font-weight: 600;
    }
    .preview-content hr {
      border: none;
      border-top: 1px dashed rgba(0,0,0,0.15);
      margin: 2em 0;
    }
    .preview-content a {
      color: ${theme.color};
      text-decoration: underline;
    }
    ${theme.customCSS || ''}
  `;
}

export function buildFullHTML(markdownHTML, theme) {
  const css = buildThemeCSS(theme);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 20px; background: #f5f5f5; }
    ${css}
  </style>
</head>
<body>
  <div class="preview-content">
${markdownHTML}
  </div>
</body>
</html>`;
}

export function buildSnippet(markdownHTML, theme) {
  return `<div class="preview-content" style="background:${theme.bg};color:#3a3530;font-family:'Noto Serif SC','Songti SC',serif;font-size:15px;line-height:1.85;padding:24px;border-radius:8px;">
${markdownHTML}
</div>
<style>
${buildThemeCSS(theme)}
</style>`;
}
