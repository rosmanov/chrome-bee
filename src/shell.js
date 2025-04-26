/* jshint strict: true, esversion: 6 */
/* globals document */

/**
 * Splits a command line string into an array of arguments.
 * Expands quoted strings and handles escaped quotes.
 *
 * Supports:
 * - Single quotes: 'arg1 arg2'
 * - Double quotes: "arg1 arg2"
 * - Concatenation of mixed quoted and unquoted strings: +'arg1' +"arg3"
 *
 * Does not support escaped quotes.
 */
export function splitCommandLine(input) {
    const args = [];
    let current = '';
    let i = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    while (i < input.length) {
        const char = input[i];

        if (inSingleQuote) {
            if (char === `'`) {
                inSingleQuote = false;
            } else {
                current += char;
            }
        } else if (inDoubleQuote) {
            if (char === `"`) {
                inDoubleQuote = false;
            } else {
                current += char;
            }
        } else {
            if (char === `'`) {
                inSingleQuote = true;
            } else if (char === `"`) {
                inDoubleQuote = true;
            } else if (/\s/.test(char)) {
                if (current.length > 0) {
                    args.push(current);
                    current = '';
                }
                // else skip whitespace
            } else {
                current += char;
            }
        }

        i++;
    }

    if (current.length > 0) {
        args.push(current);
    }

    return args;
}

/**
 * Replaces placeholders in the arguments with corresponding values.
 *
 * @param {string[]} args - The arguments to process.
 * @param {object} placeholders - An object mapping placeholders to their replacement values.
 * @returns {string[]} - The arguments with placeholders replaced.
 */
export function replacePlaceholders(args, placeholders) {
    return args.map(arg => {
      for (const [placeholder, value] of Object.entries(placeholders)) {
        arg = arg.split(placeholder).join(value) // replace all occurrences
      }
      return arg
    })
}
