import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderMarkdown } from '../utils/markdownParser';

describe('markdownParser', () => {
  it('should render simple markdown', () => {
    const html = renderMarkdown('# Hello World');
    expect(html).toContain('<h1');
    expect(html).toContain('Hello World');
  });

  it('should sanitize dangerous HTML', () => {
    const html = renderMarkdown('<script>alert("xss")</script>');
    expect(html).not.toContain('<script>');
  });

  it('should render bold text', () => {
    const html = renderMarkdown('**bold**');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('should render links safely', () => {
    const html = renderMarkdown('[Link](http://example.com)');
    expect(html).toContain('<a');
    expect(html).toContain('href="http://example.com"');
  });

  it('should not allow script tags', () => {
    const html = renderMarkdown('<script>alert("xss")</script>');
    expect(html).not.toContain('<script>');
  });

  it('should add target="_blank" to links', () => {
    const html = renderMarkdown('[Link](http://example.com)');
    expect(html).toContain('target="_blank"');
  });
});