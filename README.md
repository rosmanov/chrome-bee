# About

*Bee* (_Browser's External Editor_) extension allows to edit text fields with an external editor.

# Supported browsers

- **Firefox 57+**
- **Google Chrome** (**Chromium**)
- OS **Linux**, or **Mac OS ****X**

# Requirements

- **Python** 2 or 3
- **Bash** 4.4+
- **Perl** 5

# Installation

## Host Application

There are two types of the host application setup:

- **Local** (for the current user).
- **System-wide** (for all users). Requires `root` permissions.

### Download the Project

```bash
wget -q -O - https://github.com/rosmanov/chrome-bee/archive/master.tar.gz | \
  tar xzvf - --strip-components 1
```

### Run the Installation Script

Run `./host/install.sh` script from the project directory.

If the script is run on behalf of *superuser*, the host application manifests will be installed system-wide.

By default, the host application is installed into the project directory (where the project is downloaded). It is possible to set different target directory by passing its path as the first argument, e.g.:

```
./host/install.sh ~/usr/lib/chrome-bee
```
### Install the Browser Extension

Install _Bee_ extension from [Chrome Web store](https://chrome.google.com/webstore/) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/). The browser will ask for some confirmations. Give your approval, and you are done.

# Uninstallation

To uninstall the native messaging host and its manifests, run the following command from the project directory (see "Installation" section above):

```bash
./host/uninstall.sh
```

Note, the command should be run on behalf of the same user as in the installation step.

# Configuration

Extension options page allows to enter a command for an external editor. Simply enter a command like 'gvim -f'.

Optionally assign custom keyboard shortcut for `Bee`<sup>[1](#footnote-kbd)</sup>
. Default is `<Ctrl>E`.

# Usage

- Set cursor on some editable area.
- Invoke the keyboard shortcut.
- After a moment, the entered text should appear in a window of the external editor.
- Edit the text, save it, and close the window.

The text in the text area should be updated.

# License

See `LICENSE` file.

Copyright © 2014-2018 Ruslan Osmanov <rrosmanov@gmail.com>

----

<p>
  <sup><a name="footnote-kbd">1</a></sup> At the time of writing "Keyboard shortcuts" button was available at the bottom of the `chrome://extensions` page.
</p>
