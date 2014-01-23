/**
 * Event Page (new kind of background image)
 *
 * Copyright © 2014 Ruslan Osmanov <rrosmanov at gmail dot com>
 */

var port = null;
var hostName = 'com.ruslan_osmanov.bee';

function onDisconnected() {
	port = null;
}

function onNativeMessage(message) {
	if (typeof message.text != 'undefined') {
		message.bee_editor_output = 1;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, message)
		});
	}
}

function connect() {
	port = chrome.runtime.connectNative(hostName)
	port.onMessage.addListener(onNativeMessage);
	port.onDisconnect.addListener(onDisconnected);
}

chrome.commands.onCommand.addListener(function(command) {
	if (command == 'bee-editor') {
		chrome.tabs.executeScript(null, {file: "content.js"});
	}
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (typeof request.bee_input != 'undefined') {
		connect();

		port.postMessage({text: request.bee_input});
	}
});
