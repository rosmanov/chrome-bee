# Changelog

All notable changes to this project are documented in this file.

## 3.5.1 - 2026-07-02

### Fixed

- **Keyboard shortcut did not launch the editor (issue #35).** The default
  shortcut was `Ctrl+E` / `Cmd+E`, which the browser and macOS intercept before
  it reaches the extension: `Ctrl+E` focuses the search bar (and moves the caret
  to the end of the line in a focused text field on macOS), and `Cmd+E` is "Use
  Selection for Find" on macOS. The default is now a combination that is not
  intercepted:
  - Windows/Linux: `Alt+Shift+E`
  - macOS (Firefox): `Control+Command+E`
  - macOS (Chrome): `Command+Shift+E` where available; users may need to reassign
    it manually.
- Content-script injection failures are now logged instead of failing silently,
  which had hidden the shortcut regression above.

### Changed

- On update, Firefox users whose shortcut is still the old default are migrated
  automatically to the new default. Chrome does not allow extensions to change
  shortcuts programmatically, so Chrome users who upgrade must reassign the
  shortcut manually on `chrome://extensions/shortcuts` (see the README).

### Notes for maintainers

- `./package.sh` (via `npm run pack-chrome`) no longer aborts when a Chrome
  executable is not on the `PATH`; the check is informational only and Chrome is
  not required to build the package. This makes packaging work on macOS.
