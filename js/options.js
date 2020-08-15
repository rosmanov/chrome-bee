/* jshint strict: true, esversion: 6 */
/* globals document */
/**
 * Options Page
 *
 * Copyright © 2014-2020 Ruslan Osmanov <rrosmanov@gmail.com>
 */
'use strict';

import {BeeUrlPattern} from './pattern.js';
import {EDITOR_KEY, URL_PATTERNS_KEY} from './storage.js';

const EDITOR_FORM_ELEMENT = 'bee-editor';
const URL_PATTERN_REMOVE_CLASS = 'url-regex-list_row_remove';
const URL_PATTERN_ROW_CLASS = 'url-regex-list_row';
const URL_PATTERN_REGEX_CLASS = 'url-regex-list_row_regex';
const URL_PATTERN_EXT_CLASS = 'url-regex-list_row_ext';
const URL_PATTERN_CONTAINER_ID = 'url-regex-list-row-container';
const SAVE_STATUS_ID = 'save-status';
const SAVE_STATUS_SUCCESS_CLASS = 'save-status__success';
const SAVE_STATUS_ERROR_CLASS = 'save-status__error';
const SAVE_STATUS_SUCCESS_TEXT = 'Saved';
const SAVE_STATUS_ERROR_TEXT = 'Failed';
const SAVE_STATUS_TIMEOUT = 750;

/**
 * @return {Node}
 * @throws Error
 */
function getUrlPatternContainer() {
  const node = document.getElementById(URL_PATTERN_CONTAINER_ID);
  if (!node) {
    throw new Error(`URL pattern container ${URL_PATTERN_CONTAINER_ID} does not exist`);
  }
  return node;
}

/**
 * @param {number} index
 * @returns {string}
 */
function getUrlRegexInputName(index) {
  return `url_regex[${index}]`;
}

/**
 * @param {number} index
 * @returns {string}
 */
function getUrlExtensionInputName(index) {
  return `url_ext[${index}]`;
}

/**
 * @param {Node} form
 * @param {number} index
 * @returns {Node}
 */
function getUrlRegexInput(form, index) {
  return form.elements[getUrlRegexInputName(index)];
}

/**
 * @param {Node} form
 * @param {number} index
 * @returns {Node}
 */
function getUrlExtensionInput(form, index) {
  return form.elements[getUrlExtensionInputName(index)];
}

/**
 * @param {Node} form
 * @returns {BeeUrlPattern[]} Regular expressions mapped to file name extensions
 * @throws Error
 */
function getUrlPatterns(form) {
  let patterns = [];
  const patternRows = form.querySelectorAll(`.${URL_PATTERN_REGEX_CLASS}`);
  console.log('getUrlPatterns > patternRows', patternRows);

  for (let i = 0; i < patternRows.length; i++) {
    const regexInput = getUrlRegexInput(form, i);
    const extInput = getUrlExtensionInput(form, i);
    if (!(regexInput && extInput)) {
      throw new Error(`Could not find regex form controls with index ${i}`);
    }
    patterns.push(new BeeUrlPattern(extInput.value, regexInput.value));
  }

  return patterns;
}

/**
 * @param {Node} container
 * @returns {Node} The new row node
 */
function addUrlPatternRow(container) {
  const index = Number(container.querySelectorAll(`.${URL_PATTERN_ROW_CLASS}`).length);

  const row = document.createElement('div');
  row.className = URL_PATTERN_ROW_CLASS;
  row.innerHTML = `
            <div class="${URL_PATTERN_REGEX_CLASS}">
                <input
                    type="text"
                    name="url_regex[${index}]"
                    value=""
                    size="35"
                    placeholder="Regular expression, e.g. github.com/.*"
                    title="Regular expression">
            </div>
            <div class="${URL_PATTERN_EXT_CLASS}">
                <input type="text"
                       name="url_ext[${index}]"
                       value=""
                       size="9"
                       placeholder="Extension"
                       title="File name extension">
            </div>
            <div class="${URL_PATTERN_REMOVE_CLASS}">&#10006; Remove</div>
            `;
  container.appendChild(row);
  return row;
}

/**
 * @return {Node} Editor form element
 */
function getEditorElement(form) {
  return form.elements[EDITOR_FORM_ELEMENT];
}

/**
 * @param {Node} form
 * @throws Error
 */
function saveOptions(form) {
  localStorage[EDITOR_KEY] = getEditorElement(form).value;
  localStorage[URL_PATTERNS_KEY] = JSON.stringify(getUrlPatterns(form));
}

/**
 * @param {Node} form
 */
function restoreUrlPatternOptions(form) {
  if (localStorage[URL_PATTERNS_KEY] === undefined) {
    return;
  }

  const urlPatternContainer = getUrlPatternContainer();
  try {
    const rawUrlPatterns = JSON.parse(localStorage[URL_PATTERNS_KEY]) || [];
    if (!Array.isArray(rawUrlPatterns)) {
      return;
    }
    const urlPatterns = rawUrlPatterns.map((object) => BeeUrlPattern.fromObject(object));

    urlPatternContainer.style.display = 'none';
    for (let i = 0; i < urlPatterns.length; ++i) {
      addUrlPatternRow(urlPatternContainer);

      const regexInput = getUrlRegexInput(form, i);
      regexInput.value = urlPatterns[i].getRegex();

      const extInput = getUrlExtensionInput(form, i);
      extInput.value = urlPatterns[i].getExtension();
    }
  } catch (e) {
    console.error(`Failed parsing ${URL_PATTERNS_KEY}`, e);
    // skip
  }
  urlPatternContainer.style.display = 'block';
}

/**
 * @param {Node} form
 */
function restoreOptions(form) {
  const editor = localStorage[EDITOR_KEY];
  if (editor) {
    getEditorElement(form).value = editor;
  }

  restoreUrlPatternOptions(form);
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.forms.options;

  form.onsubmit = function (event) {
    event.preventDefault();

    const saveStatus = document.getElementById(SAVE_STATUS_ID);

    try {
      saveOptions(form);
      saveStatus.classList.add(SAVE_STATUS_SUCCESS_CLASS);
      saveStatus.innerHTML = SAVE_STATUS_SUCCESS_TEXT;

      window.setTimeout(() => {
        saveStatus.innerHTML = '';
        saveStatus.classList.remove(SAVE_STATUS_ERROR_CLASS);
        saveStatus.classList.remove(SAVE_STATUS_SUCCESS_CLASS);
      }, SAVE_STATUS_TIMEOUT);
    } catch (e) {
      saveStatus.classList.add(SAVE_STATUS_ERROR_CLASS);
      saveStatus.innerHTML = SAVE_STATUS_ERROR_TEXT;
      if (e instanceof Error) {
        saveStatus.innerHTML += ` (${e.name}) ${e.message}`;
      }
    }
  };

  const urlPatternContainer = getUrlPatternContainer();
  urlPatternContainer.addEventListener('click', function (event) {
    const target = event.target;

    if (target.className === URL_PATTERN_REMOVE_CLASS) {
      const row = target.closest(`.${URL_PATTERN_ROW_CLASS}`);
      row.parentNode.removeChild(row);
      event.stopPropagation();
      return;
    }
  });

  form.elements['add_url_pattern'].addEventListener('click', function () {
    addUrlPatternRow(urlPatternContainer);
  });

  restoreOptions(form);
});
// vim: ts=2 sts=2 sw=2 et
