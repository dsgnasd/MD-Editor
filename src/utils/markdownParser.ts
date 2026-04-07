import { Remarkable } from 'remarkable';

const md = new Remarkable({
  html: true,
  typographer: true,
  breaks: true,
});

// Simple autolink pre-processor to handle bare URLs
const autoLink = (text: string) => {
  // Split by code blocks, inline code, and HTML tags to avoid modifying them
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|<[^>]+>)/g);
  return parts.map(part => {
    // Skip code blocks and HTML tags
    if (/^```[\s\S]*```$/.test(part) || /^`[^`]+`$/.test(part) || /^<[^>]+>$/.test(part)) return part;
    // Replace bare URLs with markdown links
    return part.replace(/(https?:\/\/[^\s<>"')]+)/g, (match) => {
      // Remove trailing punctuation that is likely not part of the URL
      const clean = match.replace(/[.,;:!?)]+$/, '');
      const trail = match.slice(clean.length);
      return `[${clean}](${clean})${trail}`;
    });
  }).join('');
};

// Wrap the render method
const originalRender = md.render.bind(md);
md.render = function(text: string) {
  return originalRender(autoLink(text));
};

export default md;
