import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({
  html: false,
  typographer: true,
  breaks: true,
  linkify: true,
});

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
    ALLOWED_ATTR: ['href', 'title', 'class', 'target', 'rel'],
    ADD_ATTR: ['rel'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload'],
  });
};

export default md;
