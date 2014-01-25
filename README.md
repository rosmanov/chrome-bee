# About

*Bee* (_Browser's external editor_) is a Google Chrome (Chromium) extension for
editing form `textarea` fields and fields having `contenteditable` attribute
on (e.g. *Google+* uses such kind of input field) with an external editor.

# Requirements

This extension relies on a _native messaging host_ written in Python. So
you'll need Python itself plus some extra steps described in the following
section. Python versions 2 and 3 are both supported.

# Installation

## Linux and OS X

1. Run the following commands in a terminal:
~~~~
d=/tmp/chrome-bee; mkdir -p $d; cd $d
wget -q -O - https://bitbucket.org/osmanov/chrome-bee/get/master.tar.gz | tar -xzf - --strip-components 1
sudo ./host/install.sh
~~~~

2. Install _Bee_ from the [Chrome Web store](https://chrome.google.com/webstore/detail/moakhilhbeednkjahjmomncgigcoemoi).
	*Alternatively*:
	- Download latest `.crx` file from the [downloads](https://bitbucket.org/osmanov/chrome-bee/downloads) page.
	- Open folder with the downloaded file in a graphical file manager
	- Open <chrome://extensions> tab in your browser
	- Drag-and-drop the `.crx` file onto the <chrome://extensions> tab
3. Chrome will ask for some confirmations. Give your approval, and you're done.

## Windows

Currently Windows is not supported. Pull requests are welcome though.

# Uninstallation

Run the following to uninstall the native messaging host previously installed
with `host/install.sh`:

```bash
sudo ./host/uninstall.sh
```

# Usage

Optionally assign preferred keyboard shortcut on the
[Extensions](chrome://extensions/) page. Default shortcut is `<Ctrl><Shift>E`.

Put editor's executable filename into: `~/.config/beectl.conf` file, e.g.:

```
bee_editor = gedit
```
or
```
bee_editor = /usr/bin/gvim -f
```

Set cursor on a `textarea` field and invoke the keyboard shortcut. After a
moment the text contained in the `textarea` should appear in editor of your
choice. Edit the text, save and close editor's window. Now the text in
`textarea` should be updated.

# License

See `LICENSE` file.

# Author

Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>
