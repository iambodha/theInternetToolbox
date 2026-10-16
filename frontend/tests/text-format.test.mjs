import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatText } from '../src/lib/text-format.ts';

test('case conversion handles existing identifiers, punctuation and Unicode', () => {
  for (const [input, camel, snake, kebab] of [
    ['Hello, WORLD!', 'helloWorld', 'hello_world', 'hello-world'],
    ['HTTPServer_value', 'httpServerValue', 'http_server_value', 'http-server-value'],
    ['  déjà vu  ', 'déjàVu', 'déjà_vu', 'déjà-vu'],
    ['', '', '', ''],
  ]) {
    assert.equal(formatText(input,'camelcase'),camel);
    assert.equal(formatText(input,'snakecase'),snake);
    assert.equal(formatText(input,'kebabcase'),kebab);
  }
});
test('reversing preserves emoji families and combining accents', () => {
  assert.equal(formatText('A👩‍💻e\u0301','reverse'),'e\u0301👩‍💻A');
});
test('space cleanup preserves paragraphs; line removal is explicit', () => {
  const input='  one  two\r\n\r\n three\t four ';
  assert.equal(formatText(input,'removeextraspaces'),'one two\n\nthree four');
  assert.equal(formatText(input,'removelinebreaks'),'one two three four');
});
test('line operations support CRLF and sentence punctuation', () => {
  assert.equal(formatText('one\r\ntwo','duplicatelines'),'one\none\ntwo\ntwo');
  assert.equal(formatText('One. Two! Three? Four','addlinebreaks'),'One.\nTwo!\nThree?\nFour');
});
test('letter casing and unknown operations', () => {
  assert.equal(formatText('éCOLE naïVE','titlecase'),'École Naïve');
  assert.equal(formatText('Hi','uppercase'),'HI');
  assert.equal(formatText('Hi','lowercase'),'hi');
  assert.equal(formatText('hELLO WORLD','sentencecase'),'Hello world');
  assert.throws(()=>formatText('hello','missing'), /Unknown text operation/);
});
