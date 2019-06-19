/**
 * Event Page (new kind of background image)
 *
 * Copyright © 2014-2018 Ruslan Osmanov <rrosmanov@gmail.com>
 */

let port = null;
let hostName = 'com.ruslan_osmanov.bee';
let currentTab = null;
let reArgs = /("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/;
let reSpaceOnly = /^\s*$/;
let reTrimQuotes = /^\s*"|"*\s*$/g;

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
      file: "/js/content.js"
      //allFrames: true
    }).then(function () {
        chrome.tabs.query({active: true/*, currentWindow: true*/}, function(tabs) {
          currentTab = tabs[0];
        });
    }, function (error) {
        console.error(error);
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method === 'input') {
    let args = request.bee_editor
      .split(reArgs)
      .reduce((a, v) => {
        if (!reSpaceOnly.test(v)) {
          a.push(v.replace(reTrimQuotes, ''));
        }
        return a;
      }, []);
    let editor = args.shift();

    connect();

    port.postMessage({
      editor: editor,
      args: args,
      text: request.bee_input
    });
  } else if (request.method == 'bee_editor') {
    sendResponse({bee_editor: localStorage['bee-editor']});
  }
});

// vim: ts=2 sts=2 sw=2 et
