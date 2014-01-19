function save_options() {
	var editor = document.getElementById("editor").value;
	var port = document.getElementById("port").value;

	localStorage['bee_editor'] = editor;
	localStorage['bee_port'] = port;

	var save_status = document.getElementById("save_status");
	save_status.innerHTML = "Options Saved.";
	setTimeout(function() {
		save_status.innerHTML = "";
	}, 750);
}

function restore_options() {
	var editor = localStorage['bee_editor'];
	var port = localStorage['bee_port'];

	if (!editor || !port) {
		return;
	}

	document.getElementById("editor").value = editor;
	document.getElementById("port").value = port;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
