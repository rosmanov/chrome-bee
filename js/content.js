/* jshint strict: true */
/* globals document */
/**
 * Content script executed by 'bee-editor' command.
 * Communicates with js/eventPage.js
 *
 * Copyright © 2014-2019 Ruslan Osmanov <rrosmanov@gmail.com>
 */

(function () {
    'use strict';

    var ae = document.activeElement;

    if (ae.tagName === 'TEXTAREA' ||
        ae.isContentEditable ||
        (ae.tagName === 'INPUT' && ae.type === 'text')) {
        var text = ae.value !== undefined ? ae.value : (ae.innerText || ae.textContent);

        // We can't access page's localStorage directly
        chrome.runtime.sendMessage({method: 'bee_editor'}, function (response) {
            if (!response) {
                return;
            }

            chrome.runtime.sendMessage(
                {
                    method: 'input',
                    bee_input: text,
                    bee_editor: response.bee_editor
                },
                function (response) {
                    if (response && response.text !== undefined) {
                        ae.innerText = response.text;
                        ae.value = response.text;
                    }
                }
            );
        });

        chrome.runtime.onMessage.addListener(function(request) {
            if (request && request.bee_editor_output !== undefined) {
                ae.innerText = request.text;
                ae.value = request.text;
            }
        });
    }
})();
