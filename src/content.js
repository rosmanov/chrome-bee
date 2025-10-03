/* jshint strict: true */
/* globals document */
/**
 * Content script executed by 'bee-editor' command.
 * Communicates with js/eventPage.js
 *
 * Copyright © 2014-2023 Ruslan Osmanov <608192+rosmanov@users.noreply.github.com>
 */

(function () {
  'use strict';

  function findFocusedEditable() {
    let ae = document.activeElement;

    while (ae && ae.shadowRoot) {
      ae = ae.shadowRoot.activeElement;
    }

    if (!ae) {
      return null;
    }

    if (
      ae.tagName === 'TEXTAREA' ||
      ae.isContentEditable ||
      (ae.tagName === 'INPUT' && ae.type === 'text')
    ) {
      return ae;
    }

    return null;
  }

  /**
   * Returns the 0-based caret (cursor) position in the given element.
   *
   * @param {Element} el
   * @returns {number}
   */
  function getCaretPosition(el) {
    if ('selectionStart' in el) {
      return el.selectionStart;
    }

    if (document.activeElement === el) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.endContainer, range.endOffset)

        return preCaretRange.toString().length
      }
    }

    return 0
  }

  /**
   * @param {string} text The full text content
   * @param {number} caretPosition The caret (cursor) character offset in the text.
   * @returns {{ line: number, column: number }} The 1-based line and column numbers.
   */
  function getLineAndColumn(text, caretPosition) {
    if (caretPosition <= 0) {
      return { line: 1, column: 1 };
    }

    const textBeforeCaret = text.slice(0, caretPosition);
    const lines = textBeforeCaret.split('\n');

    const line = lines.length;
    const column = lines[lines.length - 1].length + 1; // 1-based column

    return { line, column };
  }

  const setText = (el, text) => {
    if ('value' in el) {
      el.value = text;

      // Fire events GitHub (React) listens for.
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.textContent = text;
      // Fire events for frameworks.
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  const ae = findFocusedEditable()

  if (ae) {
    const text = ae.value !== undefined ? ae.value : (ae.innerText || ae.textContent);
    const caretPosition = getCaretPosition(ae);
    const { line, column } = getLineAndColumn(text, caretPosition);

    // We can't access page's localStorage directly
    chrome.runtime.sendMessage({method: 'bee_editor', url: window.location.href}, function (response) {
      if (!response) {
        return;
      }

      chrome.runtime.sendMessage(
        {
          method: 'input',
          bee_input: text,
          bee_editor: response.bee_editor,
          bee_cursor_line: line,
          bee_cursor_column: column,
          ext: response.ext || ''
        },
        function (response) {
          setText(ae, response.text);
        }
      );
    });

    chrome.runtime.onMessage.addListener(function (request) {
      if (request && request.bee_editor_output !== undefined) {
        setText(ae, request.text)
      }
    });
  }
})();
