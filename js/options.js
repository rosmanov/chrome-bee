/* jshint strict: true, esversion: 6 */
/* globals document */
/**
 * Options Page
 *
 * Copyright © 2014-2020 Ruslan Osmanov <rrosmanov@gmail.com>
 */
'use strict'

import BeeUrlPattern from './pattern.js'
import * as Storage from './storage.js'

const URL_PATTERN_REMOVE_CLASS = 'url-regex-list_row_remove'
const URL_PATTERN_ROW_CLASS = 'url-regex-list_row'
const URL_PATTERN_REGEX_CLASS = 'url-regex-list_row_regex'
const SAVE_STATUS_SUCCESS_CLASS = 'save-status__success'
const SAVE_STATUS_ERROR_CLASS = 'save-status__error'

/**
 * @return {Node}
 * @throws Error
 */
function getUrlPatternContainer() {
    const node = document.getElementById('url-regex-list-row-container')
    if (!node) {
        throw new Error(`URL pattern container does not exist`)
    }
    return node
}

/**
 * @param {Node} form
 * @param {number} index
 * @returns {Node}
 */
function getUrlRegexInput(form, index) {
    return form.elements[`url_regex[${index}]`]
}

/**
 * @param {Node} form
 * @param {number} index
 * @returns {Node}
 */
function getUrlExtensionInput(form, index) {
    return form.elements[`url_ext[${index}]`]
}

/**
 * @param {Node} form
 * @returns {BeeUrlPattern[]}
 * @throws Error
 */
function getUrlPatterns(form) {
    let patterns = []
    const patternRows = form.querySelectorAll(`.${URL_PATTERN_REGEX_CLASS}`)

    for (let i = 0; i < patternRows.length; i++) {
        const regexInput = getUrlRegexInput(form, i)
        const extInput = getUrlExtensionInput(form, i)
        if (!(regexInput && extInput)) {
            throw new Error(`Could not find regex form controls with index ${i}`)
        }
        patterns.push(new BeeUrlPattern(extInput.value, regexInput.value))
    }

    return patterns
}

/**
 * @param {Node} container
 * @returns {Node} The new row node
 */
function addUrlPatternRow(container) {
    const index = Number(container.querySelectorAll(`.${URL_PATTERN_ROW_CLASS}`).length)
    const regexPlaceholder = chrome.i18n.getMessage('regexPlaceholder')
    const regexTitle = chrome.i18n.getMessage('regexTitle')
    const filenameExtPlaceholder = chrome.i18n.getMessage('filenameExtPlaceholder')
    const filenameExtTitle = chrome.i18n.getMessage('filenameExtTitle')
    const removeButton = chrome.i18n.getMessage('removeButton')
    const rowHtml = `
    <div class="${URL_PATTERN_ROW_CLASS}">
        <div class="${URL_PATTERN_REGEX_CLASS}">
        <input
            type="text"
            name="url_regex[${index}]"
            value=""
            size="35"
            placeholder="${regexPlaceholder}"
            title="${regexTitle}">
      </div>
      <div class="url-regex-list_row_ext">
          <input type="text"
               name="url_ext[${index}]"
               value=""
               size="9"
               placeholder="${filenameExtPlaceholder}"
               title="${filenameExtTitle}">
      </div>
      <div class="${URL_PATTERN_REMOVE_CLASS}">&#10006; ${removeButton}</div>
    </div>`

    // Firefox considers row.innerHTML = `...` as "unsafe assignment to innerHTML",
    // so we are forced to be more verbose here.
    const parser = new DOMParser()
    const parsed = parser.parseFromString(rowHtml, 'text/html')
    const row = parsed.body.querySelector(`.${URL_PATTERN_ROW_CLASS}`)

    return container.appendChild(row)
}

/**
 * @return {Node} Editor form element
 */
function getEditorElement(form) {
    return form.elements['bee-editor']
}

/**
 * @param {Node} form
 * @throws Error
 */
function saveOptions(form) {
    Storage.saveOptions({
        [Storage.EDITOR_KEY]: getEditorElement(form).value,
        [Storage.URL_PATTERNS_KEY]: JSON.stringify(getUrlPatterns(form))
    })
}

/**
 * @param {Node} form
 */
function restoreUrlPatternOptions(form) {
    Storage.getUrlPatterns((urlPatternsJson) => {
        if (urlPatternsJson === undefined) {
            return
        }

        const urlPatternContainer = getUrlPatternContainer()
        try {
            const rawUrlPatterns = JSON.parse(urlPatternsJson) || []
            if (!Array.isArray(rawUrlPatterns)) {
                return
            }
            const urlPatterns = rawUrlPatterns.map((object) => BeeUrlPattern.fromObject(object))

            urlPatternContainer.style.display = 'none'
            for (let i = 0; i < urlPatterns.length; ++i) {
                addUrlPatternRow(urlPatternContainer)

                const regexInput = getUrlRegexInput(form, i)
                regexInput.value = urlPatterns[i].getRegex()

                const extInput = getUrlExtensionInput(form, i)
                extInput.value = urlPatterns[i].getExtension()
            }
        } catch (e) {
            console.error(`Failed parsing ${URL_PATTERNS_KEY}`, e)
            // skip
        }
        urlPatternContainer.style.display = 'block'
    })
}

/**
 * @param {Node} form
 */
function restoreOptions(form) {
    Storage.getEditor((editor) => {
        if (editor) {
            getEditorElement(form).value = editor
        }
        restoreUrlPatternOptions(form)
    })
}

/**
 * @param {Node} parentNode
 */
function i18n(parentNode) {
    const targetNodes = parentNode.querySelectorAll('[data-i18n]')
    if (!targetNodes) {
        return
    }

    const parser = new DOMParser()
    for (const node of targetNodes) {
        const key = node.dataset['i18n'] || ''
        const translation = chrome.i18n.getMessage(key)
        if (translation === '') {
            continue
        }
        if (node.nodeName === 'INPUT') {
            node.value = translation
        } else if (node.dataset['i18nHtml'] !== undefined) {
            while (node.firstChild) {
                node.removeChild(node.firstChild)
            }
            const parsed = parser.parseFromString(translation, 'text/html')
            while (parsed.body.firstChild) {
                node.appendChild(parsed.body.firstChild)
            }
        } else {
            node.textContent = translation
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    i18n(document.body)

    const form = document.forms.options

    form.onsubmit = function (event) {
        event.preventDefault()

        const saveStatus = document.getElementById('save-status')

        try {
            saveOptions(form)
            saveStatus.classList.add(SAVE_STATUS_SUCCESS_CLASS)
            saveStatus.textContent = chrome.i18n.getMessage('optionsSaved')

            window.setTimeout(() => {
                saveStatus.textContent = ''
                saveStatus.classList.remove(SAVE_STATUS_ERROR_CLASS)
                saveStatus.classList.remove(SAVE_STATUS_SUCCESS_CLASS)
            }, 750)
        } catch (e) {
            saveStatus.classList.add(SAVE_STATUS_ERROR_CLASS)
            saveStatus.textContent = chrome.i18n.getMessage('optionsSaveFailed')
            if (e instanceof Error) {
                saveStatus.textContent += ` (${e.name}) ${e.message}`
            }
        }
    }

    const urlPatternContainer = getUrlPatternContainer()
    urlPatternContainer.addEventListener('click', function (event) {
        const target = event.target

        if (target.className === URL_PATTERN_REMOVE_CLASS) {
            const row = target.closest(`.${URL_PATTERN_ROW_CLASS}`)
            row.parentNode.removeChild(row)
            event.stopPropagation()
            return
        }
    })

    form.elements['add_url_pattern'].addEventListener('click', function () {
        addUrlPatternRow(urlPatternContainer)
    })

    restoreOptions(form)
})
