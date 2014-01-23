var ae = document.activeElement;
if (ae.tagName == 'TEXTAREA') {
	console.log("content.js ae", ae);
	chrome.runtime.sendMessage({
		bee_msg: 'input',
		bee_input: ae.innerHTML
	},
	function (response) {
		console.log("content.js received", response);
		ae.innerHTML = response;
	});
}
