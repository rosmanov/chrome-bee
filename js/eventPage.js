/**
 * Event Page (new kind of background image)
 *
 * Copyright © 2014-2018 Ruslan Osmanov <rrosmanov@gmail.com>
 */

var port = null;
var hostName = 'com.ruslan_osmanov.bee';
var currentTab = null;

function onDisconnected() {
  port = null;
  console.log('onDisconnected', arguments, arguments[0].error);
}

function onNativeMessage(message) {
  if (typeof message.text != 'undefined') {
    message.bee_editor_output = 1;
    if (currentTab) {
      chrome.tabs.sendMessage(currentTab.id, message);
    } else {
      chrome.tabs.query({active: true/*, currentWindow: true*/}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
    }
  }
}

function connect() {
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
}

chrome.commands.onCommand.addListener(function(command) {
  if (command == 'bee-editor') {
    chrome.tabs.executeScript(null, {
      file: "/js/content.js",
      allFrames: true
    });

    chrome.tabs.query({active: true/*, currentWindow: true*/}, function(tabs) {
      currentTab = tabs[0];
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == 'input') {
    connect();

    port.postMessage({text: request.bee_input, editor: request.bee_editor});
  } else if (request.method == 'bee_editor') {
    sendResponse({bee_editor: localStorage['bee-editor']});
  }
});
