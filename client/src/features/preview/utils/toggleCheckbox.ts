import type { Root as MdastRoot, ListItem, Node } from 'mdast';
import type { Root as HastRoot, Element } from 'hast';

// Remark plugin (mdast): stamps the source line number on each task list item
export const remarkCheckboxLine = () => (tree: MdastRoot) => {
  const walk = (node: Node) => {
    if (node.type === 'listItem' && node.position) {
      const li = node as ListItem & { data?: { hProperties?: Record<string, unknown> } };
      if (li.checked === null || li.checked === undefined) return;
      li.data ??= {};
      li.data.hProperties ??= {};
      li.data.hProperties['dataCheckboxLine'] = node.position.start.line;
    }
    if ('children' in node) (node.children as Node[]).forEach(walk);
  };
  walk(tree);
};

// Rehype plugin (hast): copies that line number from <li> down to its <input>
export const rehypeCheckboxLine = () => (tree: HastRoot) => {
  const walk = (node: HastRoot | Element) => {
    if (
      node.type === 'element' &&
      (node as Element).tagName === 'li' &&
      (node as Element).properties?.dataCheckboxLine !== undefined
    ) {
      const li = node as Element;
      const input = li.children.find(
        (child): child is Element =>
          child.type === 'element' && (child as Element).tagName === 'input'
      );
      if (input)
        input.properties = { ...input.properties, dataLine: li.properties.dataCheckboxLine };
    }
    if ('children' in node) (node.children as (HastRoot | Element)[]).forEach(walk);
  };
  walk(tree);
};

export const toggleCheckboxAtLine = (markdown: string, line: number): string => {
  const lines = markdown.split('\n');
  const i = line - 1; // positions are 1-indexed
  if (i < 0 || i >= lines.length) return markdown;
  lines[i] = lines[i].replace(/\[([ xX])\]/, (_, state) => `[${state.trim() ? ' ' : 'x'}]`);
  return lines.join('\n');
};
