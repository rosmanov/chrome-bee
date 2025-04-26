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

  const setText = (el, text) => {
    if ('value' in el) {
      el.value = text;
    } else {
      el.textContent = text;
    }
  }

  const ae = findFocusedEditable()

  if (ae) {
    const text = ae.value !== undefined ? ae.value : (ae.innerText || ae.textContent);

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
