chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);

	if (command == 'bee-editor') {
		chrome.tabs.executeScript(null, {file: "content.js"});
	}
});
