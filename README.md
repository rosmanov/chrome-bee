# About

*Bee* (_Browser's external editor_) is a Google Chrome (Chromium) extension for
editing form `textarea` fields with an external editor.

# Installation

## Linux and OS X

This extension requires an extra step to setup a _native messaging host_.

- Download and uncompress [the latest version](https://bitbucket.org/osmanov/chrome-bee/get/master.tar.gz).
- Launch `host/setup.sh` script with root privileges.

One way to do that in terminal:

	d=/tmp/chrome-bee
	mkdir -p $d
	cd $d
	wget -q -O - https://bitbucket.org/osmanov/chrome-bee/get/master.tar.gz | tar -xzf - --strip-components 1
	sudo ./host/setup.sh

The rest is just as simple as installing any other Chrome extension.

## Windows

Currently Windows is not supported. Pull requests are welcome though.

# Usage

Assign keyboard shortcuts in <chrome://extensions/>. Default shortcut is `<Ctrl><Shift>K`.

# License

See `LICENSE` file.

# Author

Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>
