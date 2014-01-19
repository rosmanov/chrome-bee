chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);
	if (command == 'open-editor') {
		var editor = localStorage.bee_editor;
		var port = localStorage.bee_port;

		if (!editor || !port) {
			return;
		}

		console.log("editor", editor, "port", port);

	}
});
