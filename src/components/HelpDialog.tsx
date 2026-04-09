import { createPortal } from 'react-dom';
import md from '../utils/markdownParser';

const exampleMarkdown = `# Заголовок первого уровня

## Заголовок второго уровня

### Заголовок третьего уровня

Обычный параграф текста с **жирным текстом**, *курсивом* и ***жирным курсивом***.

Также можно использовать \`inline-код\` внутри текста.

---

## Списки

### Маркированный список
- Первый элемент
- Второй элемент
  - Вложенный элемент
  - Ещё один вложенный
- Третий элемент

### Нумерованный список
1. Первый пункт
2. Второй пункт
3. Третий пункт

---

## Цитаты

> Это пример цитаты. Она может быть
> многострочной и содержать **форматирование**.

> Цитаты можно вкладывать друг в друга:
>> Вложенная цитата
>>> Ещё глубже

---

## Код

### Блок кода

\`\`\`javascript
function greet(name) {
  return \`Привет, \${name}!\`;
}

console.log(greet('Мир'));
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

---

## Ссылки и изображения

[Ссылка на Google](https://google.com)

Автоматическая ссылка: https://github.com

---

## Таблицы

| Функция | Синтаксис | Результат |
|---------|-----------|-----------|
| Жирный | \`**текст**\` | **текст** |
| Курсив | \`*текст*\` | *текст* |
| Код | \`\\\`код\\\`\` | \`код\` |
| Заголовок | \`# Текст\` | # Текст |

---

## Горизонтальная линия

Выше и ниже — горизонтальные линии.

---

*Это курсив в конце примера.*
`;

type HelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const HelpDialog = ({ open, onClose }: HelpDialogProps) => {
  const html = md.render(exampleMarkdown);

  const dialog = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-[90vw] max-w-4xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-white/10 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/5">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-zinc-100">Markdown — шпаргалка</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-4 font-mono text-xs text-stone-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {exampleMarkdown}
            </div>
            <div
              className="preview prose dark:prose-dark max-w-none text-sm bg-stone-50 dark:bg-white/5 rounded-xl p-5 text-stone-700 dark:text-zinc-300"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return open ? createPortal(dialog, document.body) : null;
};
