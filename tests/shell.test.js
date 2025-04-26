import { splitCommandLine, replacePlaceholders } from "../src/shell";

test('parses /usr/local/bin/gvim --nofork +"call cursor(${line}, ${column})"', () => {
  const command = '/usr/local/bin/gvim --nofork +"call cursor(${line}, ${column})"';
  expect(splitCommandLine(command)).toEqual([
    '/usr/local/bin/gvim',
    '--nofork',
    '+call cursor(${line}, ${column})'
  ]);
});

test('parses empty string', () => {
  const command = ''
  expect(splitCommandLine(command)).toEqual([]);
});

test('parses single argument', () => {
  const command = 'arg1';
  expect(splitCommandLine(command)).toEqual(['arg1']);
});

test('parses single quoted argument', () => {
  const command = "'arg1'";
  expect(splitCommandLine(command)).toEqual(["arg1"]);
});

test('parses multiple spaces', () => {
  const command = 'arg1   arg2 ';
  expect(splitCommandLine(command)).toEqual(['arg1', 'arg2']);
});

test('parses single quoted argument with spaces', () => {
  const command = "'arg1 arg2'";
  expect(splitCommandLine(command)).toEqual(['arg1 arg2']);
});

test('parses concatenated mixed single and double quoted arguments', () => {
  const command = `'arg1' +\"arg2\" 'a'b"c"`;
  expect(splitCommandLine(command)).toEqual(['arg1', '+arg2', 'abc']);
});

test('does not support single quote backslash escaping', () => {
  const command = `'arg1\'`;
  expect(splitCommandLine(command)).toEqual(['arg1']);
});

test('does not support double quote backslash escaping', () => {
  const command = `"arg1\""`;
  expect(splitCommandLine(command)).toEqual(['arg1']);
});

test('unclosed single quote', () => {
  const command = `'arg1`;
  expect(splitCommandLine(command)).toEqual(['arg1']);
});

test('unclosed double quote', () => {
  const command = `"arg1`;
  expect(splitCommandLine(command)).toEqual(['arg1']);
});

test('empty placeholder replacement', () => {
  const args = ['arg1', '${line}', 'arg2', '${column}'];
  const placeholders = {};
  expect(replacePlaceholders(args, placeholders))
    .toEqual(['arg1', '${line}', 'arg2', '${column}']);
});

test('non-empty placeholder replacement', () => {
  const args = ['arg1', '${line}', 'arg2', '${column}'];
  const placeholders = {
    '${line}': 10,
    '${column}': 20
  };
  expect(replacePlaceholders(args, placeholders))
    .toEqual(['arg1', '10', 'arg2', '20']);
});

test('replaces placeholders concatenated with strings', () => {
  const args = ['arg1', '${line}abc', 'arg2', '${column}def'];
  const placeholders = {
    '${line}': 10,
    '${column}': 20
  };
  expect(replacePlaceholders(args, placeholders))
    .toEqual(['arg1', '10abc', 'arg2', '20def']);
});
