/* jshint esversion: 6 */
/**
 * Event Page (new kind of background image)
 *
 * Copyright © 2014-2019 Ruslan Osmanov <rrosmanov@gmail.com>
 */
(function () {
  'use strict';

  let port = null;
  let hostName = 'com.ruslan_osmanov.bee';
  let reArgs = /("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/;
  let reSpaceOnly = /^\s*$/;
  let reTrimQuotes = /^\s*"|"*\s*$/g;

  let onDisconnected = () => {
    port = null;
    console.log('onDisconnected', arguments, arguments[0].error);
  };

  let onNativeMessage = (message) => {
    if (typeof message.text === 'undefined') {
      return;
    }

    message.bee_editor_output = 1;
    chrome.tabs.query(
      {},
      (tabs) => {
        for (let i = 0; i < tabs.length; ++i) {
          chrome.tabs.sendMessage(tabs[i].id, message);
        }
      }
    );
  };

  let connect = () => {
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
  };

  chrome.commands.onCommand.addListener((command) => {
    if (command === 'bee-editor') {
      chrome.tabs.executeScript({
        file: "/js/content.js"
      }).then(() => {
        chrome.tabs.query({}, (tabs) => currentTab = tabs[0]);
      }, (error) => console.error(error));
    }
  });

  /* jshint unused:false*/
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method === 'input') {
      let requestEditor = request.bee_editor || "";
      let args = requestEditor
        .split(reArgs)
        .reduce((a, v) => {
          if (!reSpaceOnly.test(v)) {
            a.push(v.replace(reTrimQuotes, ''));
          }
          return a;
        }, []);
      let editor = args.length ? args.shift() : '';

      connect();

      port.postMessage({
        editor: editor,
        args: args,
        text: request.bee_input
      });
    } else if (request.method === 'bee_editor') {
      sendResponse({bee_editor: localStorage['bee-editor']});
    }
  });
})();
// vim: ts=2 sts=2 sw=2 et
