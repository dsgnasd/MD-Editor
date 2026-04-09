export type FormatResult = { newValue: string; newStart: number; newEnd: number };

export const applyFormat = (
  value: string,
  selStart: number,
  selEnd: number,
  marker: string,
): FormatResult => {
  const len = marker.length;
  const before = value.substring(0, selStart);
  const after = value.substring(selEnd);

  if (selStart !== selEnd) {
    const selected = value.substring(selStart, selEnd);
    const hasWrap =
      before.length >= len &&
      after.length >= len &&
      before.slice(-len) === marker &&
      after.slice(0, len) === marker;

    if (hasWrap) {
      return {
        newValue: before.slice(0, -len) + selected + after.slice(len),
        newStart: before.length - len,
        newEnd: before.length - len + selected.length,
      };
    }
    return {
      newValue: before + marker + selected + marker + after,
      newStart: selStart + len,
      newEnd: selStart + len + selected.length,
    };
  }

  // No selection — toggle around cursor
  const afterCursor = value.substring(selStart);
  const beforeIdx = before.lastIndexOf(marker);
  const afterIdx = afterCursor.indexOf(marker);

  if (beforeIdx !== -1 && afterIdx !== -1) {
    const content =
      before.substring(beforeIdx + len) + afterCursor.substring(0, afterIdx);
    const newValue =
      before.substring(0, beforeIdx) + content + afterCursor.substring(afterIdx + len);
    return { newValue, newStart: beforeIdx, newEnd: beforeIdx + content.length };
  }

  const newValue = before + marker + marker + afterCursor;
  return { newValue, newStart: selStart + len, newEnd: selStart + len };
};

export type CursorEdit = { newValue: string; newSelEnd: number };

export const continueBullet = (value: string, selStart: number): CursorEdit | null => {
  const lineStart = value.lastIndexOf('\n', selStart - 1) + 1;
  const line = value.substring(lineStart, selStart);
  const match = line.match(/^(\s*)([-*+]|\d+\.)\s/);
  if (!match) return null;

  const [, indent, marker] = match;
  const nextMarker = /\d+\./.test(marker)
    ? `${parseInt(marker, 10) + 1}.`
    : marker;
  const insertion = `\n${indent}${nextMarker} `;
  return {
    newValue: value.substring(0, selStart) + insertion + value.substring(selStart),
    newSelEnd: selStart + insertion.length,
  };
};

export const indentBullet = (
  value: string,
  selStart: number,
  shiftKey: boolean,
): CursorEdit | null => {
  const lineStart = value.lastIndexOf('\n', selStart - 1) + 1;
  const line = value.substring(lineStart, selStart);
  const match = line.match(/^(\s*)([-*+]|\d+\.)\s/);
  if (!match) return null;

  const [, indent, marker] = match;
  let newIndent = indent;
  if (shiftKey) {
    if (indent.length >= 2) newIndent = indent.slice(0, -2);
    else if (indent.length === 1) newIndent = '';
    else return null;
  } else {
    if (indent.length >= 8) return null;
    newIndent = indent + '  ';
  }

  const newLine = `${newIndent}${marker} `;
  const newValue =
    value.substring(0, lineStart) + newLine + value.substring(lineStart + line.length);
  return { newValue, newSelEnd: lineStart + newLine.length };
};
