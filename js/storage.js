/* jshint strict: true, esversion: 6 */
/**
 * Copyright © 2014-2023 Ruslan Osmanov <608192+rosmanov@users.noreply.github.com>
 */
'use strict';

import BeeUrlPattern from './pattern.js'

const EDITOR_KEY = 'bee-editor'
const URL_PATTERNS_KEY = 'url-patterns'
const TAB_KEY = 'tab'

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
            result[key] = (options && options[key] !== undefined) ? options[key] : localStorage[key]
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
    getOptionValues,
    getEditor,
    getUrlPatterns,
    getTabId,
    saveOptions,
    saveEditor,
    saveUrlPatterns,
    saveTabId,
}
