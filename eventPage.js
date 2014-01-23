chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);

	if (command == 'bee-editor') {
		chrome.tabs.executeScript(null, {file: "content.js"});
	}
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("onMessage, request", request);
	if (request.bee_msg == 'input') {
		chrome.runtime.sendNativeMessage(
			'com.ruslan_osmanov.bee',
			{text: request.bee_input},
			function (response) {
				console.log("eventPage.js received", response);
				sendResponse(response);
			}
		);
	}
});
