import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editor } from '../components/Editor';

describe('Editor', () => {
  it('should render textarea', () => {
    render(<Editor value="" onChange={() => {}} fontSize={16} onCopied={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display placeholder when empty', () => {
    render(<Editor value="" onChange={() => {}} fontSize={16} onCopied={() => {}} />);
    expect(screen.getByPlaceholderText(/write your markdown/i)).toBeInTheDocument();
  });

  it('should render content', () => {
    const content = '# Hello World';
    render(<Editor value={content} onChange={() => {}} fontSize={16} onCopied={() => {}} />);
    expect(screen.getByDisplayValue(content)).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const handleChange = vi.fn();
    render(<Editor value="" onChange={handleChange} fontSize={16} onCopied={() => {}} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new content' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
});