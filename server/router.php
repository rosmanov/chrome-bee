<?php

switch ($_SERVER['REQUEST_URI']) {
	case '/edit':
		return open_editor();
		break;
	default:
		header('HTTP/1.1 400 Bad Request', 400);
		echo '<h1>Bad request</h1>';
		return FALSE;
}

function open_editor() {
	if (!isset($_POST['cmd'])) {
		error_log("Command expected");
		return FALSE;
	}

	$filename = tempnam('/tmp', 'chrome-bee-');

	$cmd = preg_split('/[\s]+/', $_POST['cmd']);

	$executable = preg_replace('/\.\$\`\&/', '', array_shift($cmd));
	foreach ($cmd as &$part) {
		$part = escapeshellarg(preg_replace('/[\/\.\&\`\$]/', '', $part));
	}
	$cmd = $executable . ' ' . implode(' ', $cmd);
	$cmd = str_replace('%f', $filename, $_POST['cmd']);

	// Add -f option for *vim family
	$cmd = preg_replace('/^([^\s]+vim)\s/', '$1 -f ', $cmd);

	exec($cmd);
	echo file_get_contents($filename);
	unlink($filename);

	return TRUE;
}
