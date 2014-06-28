/**
 * Content script executed by 'bee-editor' command.
 * Communicates with js/eventPage.js
 *
 * Copyright © 2014 Ruslan Osmanov <rrosmanov at gmail dot com>
 */

var ae = document.activeElement;

if (ae.tagName == 'TEXTAREA' || ae.contentEditable) {
	var text = ae.value != undefined ? ae.value : (ae.innerText || ae.textContent);
	var editor = null;

	// We can't access page's localStorage directly
	chrome.runtime.sendMessage({method: 'bee_editor'}, function (response) {
		if (response) {
			editor = response.bee_editor;

			chrome.runtime.sendMessage({method: 'input', bee_input: text, bee_editor: editor}, function (response) {
				if (typeof response.text != 'undefined') {
					ae.innerText = response.text;
					ae.value = respon.text;
					// Obsolete
					//ae.textContent = response.text;
				}
			});
		}
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (typeof request.bee_editor_output != 'undefined') {
		ae.innerText = request.text;
		ae.value = request.text;
		// Obsolete
		//ae.textContent = request.text;
	}
});

// vim: noet
