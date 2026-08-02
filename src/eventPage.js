/* jshint strict: true, esversion: 6 */
/**
 * Event Page (new kind of background page)
 *
 * Copyright © 2014-2026 Ruslan Osmanov <608192+rosmanov@users.noreply.github.com>
 */

"use strict";

import Storage from "./storage.js";
import BeeUrlPattern from "./pattern.js";
import { splitCommandLine, replacePlaceholders } from "./shell.js";

const HOST_NAME = "com.ruslan_osmanov.bee";
const PLACEHOLDER_LINE = "${line}";
const PLACEHOLDER_COLUMN = "${column}";
const CONTEXT_MENU_EVENT = "bee-editor-menu";
const BEE_EDITOR_COMMAND = "bee-editor";

/**
 * @param {string} url
 * @param {string|undefined} urlPatternsJson
 * @return {string}
 */
function getFilenameExtension(url, urlPatternsJson) {
  let extension = "";

  if (url === "") {
    return extension;
  }

  if (urlPatternsJson === undefined) {
    return extension;
  }

  const rawUrlPatterns = JSON.parse(urlPatternsJson) || [];
  if (!Array.isArray(rawUrlPatterns)) {
    return extension;
  }
  const urlPatterns = rawUrlPatterns.map((object) =>
    BeeUrlPattern.fromObject(object),
  );

  for (let pattern of urlPatterns) {
    const re = new RegExp(pattern.getRegex());
    if (re.test(url)) {
      extension = pattern.getExtension();
    }
  }
  return extension;
}

function triggerEditor(tab) {
  if (!tab || !tab.id) return;

  chrome.scripting
    .executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["/dist/content.js"],
    })
    .catch((error) => {
      /* Surface injection failures instead of failing silently, which is how the
       keyboard-shortcut regression (issue #35) stayed hidden. */
      console.warn("Bee: failed to inject content script", error);
    });
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function removeAllContextMenus() {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      const error = chrome.runtime.lastError;
      if (error) {
        // Log the error but resolve anyway so we don't break the creation flow
        console.warn("Bee: contextMenus.removeAll warning/error:", error.message || error);
      }
      resolve();
    });
  });
}

/**
 * Create or update context menu depending on user preference.
 */
async function updateContextMenu() {
  try {
    await removeAllContextMenus();

    const values = await Storage.getOptionValues([Storage.CONTEXT_MENU_KEY]);
    if (values[Storage.CONTEXT_MENU_KEY] ?? true) {
      const title = chrome.i18n.getMessage("contextMenuTitle");
      chrome.contextMenus.create({
        id: CONTEXT_MENU_EVENT,
        title,
        contexts: ["editable"],
      });
    }
  } catch (error) {
    console.error("Bee: Failed to update context menu.", error);
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  updateContextMenu();
});
chrome.runtime.onStartup?.addListener?.(updateContextMenu); // Defensive for older browsers

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_EVENT) {
    const p = tab ? Promise.resolve(tab) : getCurrentTab();
    p.then(triggerEditor);
  }
});

/**
 * @param {string} command
 * @param {chrome.tabs.Tab|undefined} tab Can be undefined in Firefox
 */
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === BEE_EDITOR_COMMAND) {
    const p = tab ? Promise.resolve(tab) : getCurrentTab();
    p.then(triggerEditor);
  }
});

/**
 * Listen for messages from options page
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "updateContextMenu") {
    updateContextMenu();
  }
});

/* jshint unused:false*/
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method === "input") {
    let requestEditor = request.bee_editor || "";
    let args = splitCommandLine(requestEditor);
    let editor = args.length ? args.shift() : "";

    const ext = request.ext || "";

    // Placeholder replacement
    const line = request.bee_cursor_line ?? 1;
    const column = request.bee_cursor_column ?? 1;
    const placeholders = {
      [PLACEHOLDER_LINE]: line,
      [PLACEHOLDER_COLUMN]: column,
    };
    args = replacePlaceholders(args, placeholders);

    const tabId = sender.tab.id;
    const requestId = request.requestId;

    console.log("Connecting to native host");
    const port = chrome.runtime.connectNative(HOST_NAME);
    console.log("Connected?");

    let hostSentOutput = false;

    port.onMessage.addListener((message) => {
      if (typeof message.text === "undefined") {
        return;
      }

      hostSentOutput = true;

      message.bee_editor_output = 1;
      message.requestId = requestId;
      chrome.tabs.sendMessage(tabId, message);
    });

    port.onDisconnect.addListener(() => {
      if (!hostSentOutput) {
        let errorMessage = "Failed to start the native messaging host.";

        if (chrome.runtime.lastError) {
          errorMessage = chrome.runtime.lastError.message;
        }

        chrome.tabs.sendMessage(tabId, {
          bee_editor_error: errorMessage,
          requestId,
        });
      }
    });

    const response = {
      editor: editor,
      args: args,
      ext: ext,
      text: request.bee_input,
    };
    port.postMessage(response);
    sendResponse(response);
    return false;
  } else if (request.method === "bee_editor") {
    Storage.getOptionValues([
      Storage.EDITOR_KEY,
      Storage.URL_PATTERNS_KEY,
    ]).then((values) => {
      sendResponse({
        bee_editor: values[Storage.EDITOR_KEY],
        ext: getFilenameExtension(
          request.url,
          values[Storage.URL_PATTERNS_KEY],
        ),
      });
    });
    return true;
  }
  // returning true indicates that sendResponse will or may be called asynchronously
  return false;
});

export { BEE_EDITOR_COMMAND };
