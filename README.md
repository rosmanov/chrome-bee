# About

*Bee* (_Browser's external editor_) is a Google Chrome (Chromium) extension for
editing form `textarea` fields with an external editor.

# Requirements

This extension relies on a _native messaging host_ written in Python 3. So
you'll need Python 3 itself plus some extra steps described in the following
section.

# Installation

## Linux and OS X

- Run the following commands in a terminal:

```bash
d=/tmp/chrome-bee
mkdir -p $d
cd $d
wget -q -O - https://bitbucket.org/osmanov/chrome-bee/get/master.tar.gz | tar -xzf - --strip-components 1
sudo ./host/install.sh
```

- Download latest `.crx` file from the [downloads](https://bitbucket.org/osmanov/chrome-bee/downloads) page.
- Open folder with the downloaded file in a graphical file manager
- Open <chrome://extensions> tab in your browser
- Drag-and-drop the `.crx` file onto the <chrome://extensions> tab
- Chrome will ask for some confirmations. Give your approval, and you're done.

## Windows

Currently Windows is not supported. Pull requests are welcome though.

# Usage

Assign keyboard shortcuts in <chrome://extensions/>. Default shortcut is `<Ctrl><Shift>E`.

# License

See `LICENSE` file.

# Author

Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>
