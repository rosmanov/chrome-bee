/**
 * Options Page
 *
 * Copyright © 2014-2018 Ruslan Osmanov <rrosmanov@gmail.com>
 */
function save_options() {
  var editor_input = document.getElementById('bee-editor');
  localStorage['bee-editor'] = editor_input.value;
}

function restore_options() {
  var editor = localStorage['bee-editor'];
  if (!editor) {
    return;
  }

  var editor_input = document.getElementById('bee-editor');
  editor_input.value = editor;
}

function choose_editor_callback(entry) {
  console.log("choose_editor_callback", "entry", entry);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#bee-editor').addEventListener('blur', save_options);
