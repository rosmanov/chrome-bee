/* jshint strict: true, esversion: 6 */
/**
 * Copyright © 2014-2020 Ruslan Osmanov <rrosmanov@gmail.com>
 */
'use strict';

import BeeUrlPattern from './pattern.js'

const EDITOR_KEY = 'bee-editor'
const URL_PATTERNS_KEY = 'url-patterns'

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
 * @param {string[]} keys
 * @param {function} callback
 */
function getOptionValues(keys, callback) {
    chrome.storage.sync.get(keys, (options) => {
        let result = {}
        for (const key of keys) {
            result[key] = (options && options[key] !== undefined) ? options[key] : localStorage[key]
        }
        callback.call(this, result)
    })
}

/**
 * @param {function} callback
 */
function getEditor(callback) {
    getOptionValues([EDITOR_KEY], (values) => callback(values ? values[EDITOR_KEY] : undefined))
}

/**
 * @param {function} callback
 */
function getUrlPatterns(callback) {
    getOptionValues([URL_PATTERNS_KEY], (values) => callback(values ? values[URL_PATTERNS_KEY] : undefined))
}

export {
    EDITOR_KEY,
    URL_PATTERNS_KEY,
    getOptionValues,
    getEditor,
    getUrlPatterns,
    saveOptions,
    saveEditor,
    saveUrlPatterns
}
