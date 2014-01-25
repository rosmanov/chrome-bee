/**
 * Content script executed by 'bee-editor' command.
 * Communicates with eventPage.js
 *
 * Copyright © 2014 Ruslan Osmanov <rrosmanov at gmail dot com>
 */

var ae = document.activeElement;

if (ae.tagName == 'TEXTAREA' || ae.contentEditable) {
	var text = ae.innerText || ae.textContent;

	chrome.runtime.sendMessage({bee_input: text}, function (response) {
		if (typeof response.text != 'undefined') {
			ae.innerText = response.text;
			// Obsolete
			//ae.textContent = response.text;
		}
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (typeof request.bee_editor_output != 'undefined') {
		ae.innerText = request.text;
		// Obsolete
		//ae.textContent = request.text;
	}
});
