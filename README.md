# About

*Bee* (_Browser's External Editor_) extension allows to edit text fields with an external editor.

# Supported browsers

- **Firefox 57+**
- **Google Chrome** (**Chromium**)
- OS: **Linux**, **Windows**, and **macOS**

# Installation

## Host Application

Use either of the following native messaging host applications:

1) [BeeCtl](https://github.com/rosmanov/bee-host) written in C. For Linux, macOS and Windows.
2) A Python script shipped with this repository. For Linux and macOS (untested).

### BeeCtl

Follow [instructions on the main page of the repository](https://github.com/rosmanov/bee-host).

### Python Script

#### Requirements

- **Python** 2 or 3
- **Bash** 4.4+
- **Perl** 5

There are two types of the host application setup:

- **Local** (for the current user).
- **System-wide** (for all users). Requires `root` permissions.

#### Download the Project

```bash
mkdir -p ~/src/chrome-bee
cd ~/src/chrome-bee

wget -q -O - https://github.com/rosmanov/chrome-bee/archive/master.tar.gz | \
  tar xzvf - --strip-components 1
```

#### Run the Installation Script

Run `./host/install.sh` script from the project directory.

If the script is run on behalf of *superuser*, the host application manifests will be installed system-wide.

By default, the host application is installed into the project directory (where the project is downloaded). It is possible to set different target directory by passing its path as the first argument, e.g.:

```
./host/install.sh ~/usr/lib/chrome-bee
```
Refer to [Wiki](https://github.com/rosmanov/chrome-bee/wiki/Installing-Host-Application) for more information.

### The Browser Extension

Install _Bee_ extension from [Chrome Web store](https://chrome.google.com/webstore/) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/external-editor/). The browser will ask for some confirmations. Give your approval, and you are done.

# Uninstallation

## BeeCtl

If you followed the installation instructions, then you only need to invoke the appropriate command of your package manager. For example, on Debian-based systems, you would need to run `apt purge beectl`. 

## Python Script

To uninstall the native messaging host written in Python and the manifests, run the following command from the project directory (see "Installation" section above):

```bash
./host/uninstall.sh
```

Note, the command should be run on behalf of the same user as in the installation step.

# Configuration

Extension options page allows to enter a command for an external editor. Simply enter a command like 'gvim -f'.

Optionally assign custom keyboard shortcut for `Bee`<sup>[1](#footnote-kbd)</sup>
. Default is `<Ctrl>E`.

Refer to [Wiki](https://github.com/rosmanov/chrome-bee/wiki/Configuration) for details.

# Usage

- Set cursor on some editable area.
- Invoke the keyboard shortcut.
- After a moment, the entered text should appear in a window of the external editor.
- Edit the text, save it, and close the window.

The text in the text area should be updated.

# License

See `LICENSE` file.

Copyright © 2014-2020 Ruslan Osmanov <rrosmanov@gmail.com>

----

<p>
  <sup><a name="footnote-kbd">1</a></sup> At the time of writing, in Chrome/Chromium, "Keyboard shortcuts" button was available at the bottom of the `chrome://extensions` page. In Firefox, open `about:addons` tab, then select "Manage Extension Shortcuts" from the dropdown next to the "Manage Your Extensions" title.
</p>
