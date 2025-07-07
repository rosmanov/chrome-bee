/* jshint strict: true, esversion: 6 */
/**
 * Copyright © 2014-2023 Ruslan Osmanov <608192+rosmanov@users.noreply.github.com>
 */
'use strict';

import BeeUrlPattern from './pattern.js'

const EDITOR_KEY = 'bee-editor'
const URL_PATTERNS_KEY = 'url-patterns'
const TAB_KEY = 'tab'
const CONTEXT_MENU_KEY = 'context-menu';

/**
 * @param {object} options
 * @throws Error
 */
function saveOptions(options) {
  chrome.storage.sync.set(options)
}

/**
 * @param {string} editor
 */
function saveEditor(editor) {
    saveOptions({[EDITOR_KEY]: editor})
}

/**
 * @param {bool} enable
 */
function saveContextMenu(enable) {
  saveOptions({[CONTEXT_MENU_KEY]: enable})
}

/**
 * @param {BeeUrlPattern[]} urlPatterns
 */
function saveUrlPatterns(urlPatterns) {
    saveOptions({[URL_PATTERNS_KEY]: JSON.stringify(urlPatterns)})
}

/**
 * @param {number} tab ID
 */
function saveTabId(tabId) {
    saveOptions({[TAB_KEY]: tabId})
}

/**
 * @param {string[]} keys
 * @returns Promise<object>
 */
function getOptionValues(keys) {
    return chrome.storage.sync.get(keys).then(options => {
        let result = {}
        for (const key of keys) {
            result[key] = (options && options[key] !== undefined) ? options[key] : null
        }
        return result
    })
}

/**
 * @returns Promise<string|undefined>
 */
function getEditor() {
    return getOptionValues([EDITOR_KEY]).then(values => values[EDITOR_KEY] ?? undefined)
}

/**
 * @returns Promise<bool|undefined>
 */
function isContextMenuEnabled() {
    return getOptionValues([CONTEXT_MENU_KEY]).then(values => values[CONTEXT_MENU_KEY] ?? true)
}

/**
 * @returns Promise<object[]>
 */
function getUrlPatterns() {
    return getOptionValues([URL_PATTERNS_KEY]).then(values => values[URL_PATTERNS_KEY] ?? undefined)
}

/**
 * @returns Promise<string|undefined>
 */
function getTabId() {
    return getOptionValues([TAB_KEY]).then(values => values[TAB_KEY] ?? undefined)
}

export default {
    EDITOR_KEY,
    URL_PATTERNS_KEY,
    TAB_KEY,
    CONTEXT_MENU_KEY,
    getOptionValues,
    getEditor,
    isContextMenuEnabled,
    getUrlPatterns,
    getTabId,
    saveOptions,
    saveEditor,
    saveContextMenu,
    saveUrlPatterns,
    saveTabId,
}
