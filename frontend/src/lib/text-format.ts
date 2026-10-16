/** Pure text operations shared by the formatter and its regression tests. */
export function formatText(text: string, operation: string): string {
  const words = () => text
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
  switch (operation) {
    case 'uppercase': return text.toUpperCase();
    case 'lowercase': return text.toLowerCase();
    case 'titlecase': return text.replace(/\p{L}[\p{L}\p{M}\p{N}'’]*/gu, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
    case 'sentencecase': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'camelcase': return words().map((word, index) => index ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()).join('');
    case 'snakecase': return words().map(word => word.toLowerCase()).join('_');
    case 'kebabcase': return words().map(word => word.toLowerCase()).join('-');
    case 'reverse': return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), part => part.segment).reverse().join('');
    case 'removeextraspaces': return text.split(/\r?\n/).map(line => line.replace(/[^\S\r\n]+/g, ' ').trim()).join('\n');
    case 'removelinebreaks': return text.replace(/\s+/g, ' ').trim();
    case 'addlinebreaks': return text.replace(/([.!?])[ \t]+/g, '$1\n');
    case 'duplicatelines': return text.split(/\r?\n/).map(line => line + '\n' + line).join('\n');
    default: throw new Error(`Unknown text operation: ${operation}`);
  }
}
