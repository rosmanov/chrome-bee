/**
 * Content script executed by 'bee-editor' command.
 * Communicates with eventPage.js
 *
 * Copyright © 2014 Ruslan Osmanov <rrosmanov at gmail dot com>
 */

var ae = document.activeElement;

if (ae.tagName == 'TEXTAREA') {
	chrome.runtime.sendMessage({bee_input: ae.innerHTML}, function (response) {
		if (typeof response.text != 'undefined') {
			ae.innerHTML = response.text;
		}
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (typeof request.bee_editor_output != 'undefined') {
		ae.innerHTML = request.text;
	}
});
