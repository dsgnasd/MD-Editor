import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  typographer: true,
  breaks: true,
  linkify: true,
});

export default md;
