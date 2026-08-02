/* jshint strict: true */
/* globals document */
/**
 * Content script executed by 'bee-editor' command.
 * Communicates with js/eventPage.js
 *
 * Copyright © 2014-2023 Ruslan Osmanov <608192+rosmanov@users.noreply.github.com>
 */

(function () {
  "use strict";

  function findFocusedEditable() {
    let ae = document.activeElement;

    while (ae && ae.shadowRoot) {
      ae = ae.shadowRoot.activeElement;
    }

    if (!ae) {
      return null;
    }

    if (
      ae.tagName === "TEXTAREA" ||
      ae.isContentEditable ||
      (ae.tagName === "INPUT" && ae.type === "text")
    ) {
      return ae;
    }

    return null;
  }

  /**
   * Returns the 0-based caret (cursor) position in the given element.
   *
   * @param {Element} el
   * @returns {number}
   */
  function getCaretPosition(el) {
    if ("selectionStart" in el) {
      return el.selectionStart;
    }

    if (document.activeElement === el) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(el);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        return preCaretRange.toString().length;
      }
    }

    return 0;
  }

  /**
   * @param {string} text The full text content
   * @param {number} caretPosition The caret (cursor) character offset in the text.
   * @returns {{ line: number, column: number }} The 1-based line and column numbers.
   */
  function getLineAndColumn(text, caretPosition) {
    if (caretPosition <= 0) {
      return { line: 1, column: 1 };
    }

    const textBeforeCaret = text.slice(0, caretPosition);
    const lines = textBeforeCaret.split("\n");

    const line = lines.length;
    const column = lines[lines.length - 1].length + 1; // 1-based column

    return { line, column };
  }

  const setText = (el, text) => {
    if ("value" in el) {
      el.value = text;

      // Fire events GitHub (React) listens for.
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      el.textContent = text;
      // Fire events for frameworks.
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  function showError(message) {
    console.error("Bee error: " + message);

    if (!document || !document.body) {
      alert("Bee: " + message);
      return;
    }

    const existingToast = document.getElementById("bee-error-toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.id = "bee-error-toast";
    toast.setAttribute("role", "alert");

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      backgroundColor: "#ff4d4f",
      color: "#ffffff",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      zIndex: "2147483647",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: "14px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      opacity: "0",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      transform: "translateY(20px)",
      pointerEvents: "auto",
    });

    const icon = document.createElement("span");
    icon.textContent = "⚠️";
    toast.appendChild(icon);

    const textSpan = document.createElement("span");
    textSpan.textContent = "Bee: " + message;
    toast.appendChild(textSpan);

    const link = document.createElement("a");
    link.textContent = "Install host application";
    link.href = "https://github.com/rosmanov/chrome-bee#1-host-application";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    Object.assign(link.style, {
      color: "#ffffff",
      textDecoration: "underline",
      cursor: "pointer",
      marginLeft: "8px",
      opacity: "0.9",
    });
    toast.appendChild(link);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.setAttribute("aria-label", "Close");
    Object.assign(closeBtn.style, {
      background: "none",
      border: "none",
      color: "#ffffff",
      cursor: "pointer",
      fontSize: "12px",
      marginLeft: "10px",
      padding: "0",
      opacity: "0.7",
    });
    closeBtn.addEventListener("click", () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    });
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }

  if (typeof window.beeListenerAdded === "undefined") {
    window.beeListenerAdded = true;
    window.beeRequests = new Map();

    chrome.runtime.onMessage.addListener(function (request) {
      if (request && request.bee_editor_output !== undefined) {
        const ae = window.beeRequests.get(request.requestId);
        if (ae) {
          setText(ae, request.text);
          // Don't delete - keep the element to allow multiple updates (save, close)
        }
      } else if (request && request.bee_editor_error !== undefined) {
        showError(request.bee_editor_error);
      }
    });
  }

  const ae = findFocusedEditable();

  if (ae) {
    // Keep only the last 10 requests to prevent unbounded memory growth
    const MAX_REQUESTS = 10;
    if (window.beeRequests.size >= MAX_REQUESTS) {
      const oldestKey = window.beeRequests.keys().next().value;
      window.beeRequests.delete(oldestKey);
    }

    const text =
      ae.value !== undefined ? ae.value : ae.innerText || ae.textContent;
    const caretPosition = getCaretPosition(ae);
    const { line, column } = getLineAndColumn(text, caretPosition);
    const requestId = Math.random().toString(36).substring(2);

    window.beeRequests.set(requestId, ae);

    // We can't access page's localStorage directly
    chrome.runtime.sendMessage(
      { method: "bee_editor", url: window.location.href },
      function (response) {
        if (!response) {
          return;
        }

        chrome.runtime.sendMessage(
          {
            method: "input",
            bee_input: text,
            bee_editor: response.bee_editor,
            bee_cursor_line: line,
            bee_cursor_column: column,
            ext: response.ext || "",
            requestId: requestId,
          },
          function (response) {
            setText(ae, response.text);
          },
        );
      },
    );
  } else {
    showError(
      "No focused editable element found. Please click on a text input or textarea before launching the editor.",
    );
  }
})();
