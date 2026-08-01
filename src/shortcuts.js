/* jshint strict: true, esversion: 6 */
/**
 * Copyright © 2026 Ruslan Osmanov <608192+rosmanov@users.noreply.github.com>
 */

/* Keyboard shortcuts that don't work well in all environments.
 * Ex. #1: macOS implements Emacs-style shortcuts for the native text controls,
 * where Control+E moves the cursor to the end of the line, and the shortcut
 * is never propagated to this extension.
 * Ex. #2: Some browsers trigger the top menu mnemonics when Alt is pressed
 * So Alt+Shift+E might open the "Edit" item of the top menu as if just Alt+E was pressed */
const BROKEN_DEFAULTS = new Set([
  "Ctrl+E",
  "Command+E",
  "Alt+Shift+E",
  "Shift+Alt+E",
  "Command+Shift+E",
  "MacCtrl+Command+E",
  "Control+Command+E",
  "Ctrl+Shift+E",
])

export { BROKEN_DEFAULTS }
