# About

*Bee* (_Browser's external editor_) is a Google Chrome (Chromium) extension for
editing form `textarea` fields and fields having `contenteditable` attribute
on (e.g. *Google+* uses such kind of input field) with an external editor.

# Requirements

This extension relies on a _native messaging host_ written in Python. So Python
is required. You'll also need some extra steps described in the following
section. Python versions 2 and 3 are both supported.

# Installation

## Linux and OS X

Run the following commands in a terminal:

```bash
d=/tmp/chrome-bee; mkdir -p $d; cd $d
wget -q -O - https://bitbucket.org/osmanov/chrome-bee/get/master.tar.gz | tar -xzf - --strip-components 1
sudo ./host/install.sh
```

Install _Bee_ from the [Chrome Web store](https://chrome.google.com/webstore/detail/moakhilhbeednkjahjmomncgigcoemoi).[^1]

Chrome will ask for some confirmations. Give your approval, and you're done.

## Windows

Currently Windows is not supported. Pull requests are welcome though.

# Uninstallation

To uninstall the native messaging host run the following command in terminal:

```bash
sudo ./host/uninstall.sh
```

# Configuration

Go to [extensions page][extensions]. Click on `Bee` extension `Options`.
Options page allows to enter a command to launch external editor. Enter some
command and close the tab.

Optionally assign custom keyboard shortcut for `Bee`.[^2]  Default is `<Ctrl><Shift>E`.

# Usage

- Set cursor on some editable area.
- Invoke the keyboard shortcut.
- After a moment the text (if any) should appear your editor.
- Edit the text, save and close editor's window

Now the text in the text area should be updated.

# License

See `LICENSE` file.

# Author

Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>


[^1]: The `.crx` files are also available on the [downloads](https://bitbucket.org/osmanov/chrome-bee/downloads) page.
[^2]: At the time of writing 'Keyboard shortcuts' button was available at the bottom of the [extensions page][extensions].

[extensions]: chrome://extensions "Extensions page"
