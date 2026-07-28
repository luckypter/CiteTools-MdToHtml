import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 配置 marked
marked.use({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
});

export function parseMarkdown(md) {
  const raw = marked.parse(md);
  return DOMPurify.sanitize(raw, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  });
}

export function countWords(text) {
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english = (text.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  return chinese + english + numbers;
}

export function countLines(text) {
  return text.split(/\r\n|\r|\n/).length;
}