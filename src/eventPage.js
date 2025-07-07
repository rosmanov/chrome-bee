/**
 * Event Page (new kind of background page)
 *
 * Copyright © 2014-2023 Ruslan Osmanov <608192+rosmanov@users.noreply.github.com>
 */
import Storage from './storage.js'
import BeeUrlPattern from './pattern.js'
import {splitCommandLine, replacePlaceholders} from './shell.js'

let port = null
const HOST_NAME = 'com.ruslan_osmanov.bee'
const PLACEHOLDER_LINE = '${line}'
const PLACEHOLDER_COLUMN = '${column}'
const CONTEXT_MENU_EVENT = 'bee-editor-menu'

function onDisconnected() {
  port = null
  console.log('onDisconnected', arguments, arguments[0].error)
  if (chrome.runtime.lastError) {
    console.log('onDisconnected runtime error', chrome.runtime.lastError)
  }
}

function onNativeMessage(message) {
  if (typeof message.text === 'undefined') {
    return
  }

  message.bee_editor_output = 1
  Storage.getTabId().then(tabId => {
    console.log('sending message to tabId', tabId)
    chrome.tabs.sendMessage(tabId, message)
  })
}

function connect() {
  port = chrome.runtime.connectNative(HOST_NAME)
  port.onMessage.addListener(onNativeMessage)
  port.onDisconnect.addListener(onDisconnected)
}

/**
 * @param {string} url
 * @param {string|undefined} urlPatternsJson
 * @return {string}
 */
function getFilenameExtension(url, urlPatternsJson) {
  let extension = ''

  if (url === '') {
    return extension
  }

  if (urlPatternsJson === undefined) {
    return extension
  }

  const rawUrlPatterns = JSON.parse(urlPatternsJson) || []
  if (!Array.isArray(rawUrlPatterns)) {
    return extension
  }
  const urlPatterns = rawUrlPatterns.map((object) => BeeUrlPattern.fromObject(object))

  for (let pattern of urlPatterns) {
    const re = new RegExp(pattern.getRegex())
    if (re.test(url)) {
      extension = pattern.getExtension()
    }
  }
  return extension
}

function triggerEditor(tab) {
  if (!tab || !tab.id) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    files: ["/dist/content.js"]
  }, () => {
    Storage.saveTabId(tab.id);
  });
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

/**
 * Create or update context menu depending on user preference.
 */
function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    Storage.getOptionValues([Storage.CONTEXT_MENU_KEY]).then(values => {
      if (values[Storage.CONTEXT_MENU_KEY] ?? true) {
        const title = chrome.i18n.getMessage("contextMenuTitle");
        chrome.contextMenus.create({
          id: CONTEXT_MENU_EVENT,
          title,
          contexts: ['editable']
        });
      }
    })
  })
}

chrome.runtime.onInstalled.addListener(updateContextMenu);
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
  if (command === 'bee-editor') {
    const p = tab ? Promise.resolve(tab) : getCurrentTab()
    p.then(triggerEditor)
  }
})

/**
 * Listen for messages from options page
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'updateContextMenu') {
    updateContextMenu();
  }
});

/* jshint unused:false*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method === 'input') {
    let requestEditor = request.bee_editor || ""
    let args = splitCommandLine(requestEditor)
    let editor = args.length ? args.shift() : ''

    const ext = request.ext || ''

    // Placeholder replacement
    const line = request.bee_cursor_line ?? 1
    const column = request.bee_cursor_column ?? 1
    const placeholders = {
      [PLACEHOLDER_LINE]: line,
      [PLACEHOLDER_COLUMN]: column
    }
    args = replacePlaceholders(args, placeholders)

    connect()

    const response = {
      editor: editor,
      args: args,
      ext: ext,
      text: request.bee_input
    };
    port.postMessage(response)
    sendResponse(response)
  } else if (request.method === 'bee_editor') {
    Storage.getOptionValues([Storage.EDITOR_KEY, Storage.URL_PATTERNS_KEY]).then(values => {
      sendResponse({
        bee_editor: values[Storage.EDITOR_KEY],
        ext: getFilenameExtension(request.url, values[Storage.URL_PATTERNS_KEY])
      })
    })
  }
  // returning true indicates that sendResponse will or may be called asynchronously
  return true
})
