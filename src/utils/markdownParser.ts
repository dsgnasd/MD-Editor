import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({
  html: false,
  typographer: true,
  breaks: true,
  linkify: true,
});

// Add id attributes to headings for TOC navigation
const defaultHeadingOpen = md.renderer.rules.heading_open ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const nextToken = tokens[idx + 1];
  if (nextToken?.type === 'inline' && nextToken.content) {
    const id = nextToken.content
      .trim()
      .toLowerCase()
      .replace(/[^\wа-яё]+/g, '-')
      .replace(/-+$/, '');
    tokens[idx].attrSet('id', id);
  }
  return defaultHeadingOpen(tokens, idx, options, env, self);
};

// Force every anchor to open in a new tab with rel="noopener noreferrer"
// to prevent tabnabbing via user-authored markdown links.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export const renderMarkdown = (content: string): string => {
  const html = md.render(content);
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'ul', 'ol', 'li',
                   'blockquote', 'pre', 'code', 'a', 'strong', 'em', 'del', 'table',
                   'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'target', 'rel', 'id'],
    ADD_ATTR: ['rel'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload'],
  });
};

export default md;
