# Bee: Browser's External Editor Extension

**Bee** allows you to edit text fields in your browser using an external editor.

There are two steps required before using this extension:

1. Install a host application.
2. Configure the extension in your browser.

> [!IMPORTANT]  
> Both steps are required. Be sure to assign a keyboard shortcut to invoke the external editor.

---

## Supported Browsers

- Firefox 57+
- Google Chrome
- Chromium

**Supported Operating Systems:** Linux, Windows, and macOS.

---

## Installation

### 1. Host Application

Use one of the following native messaging host applications:

1. [**BeeCtl**](https://github.com/rosmanov/bee-host) – written in C. Supports Linux, macOS, and Windows.
2. A **Python script** included in this repository – for Linux and macOS.

#### BeeCtl

Follow the instructions provided in the [BeeCtl repository](https://github.com/rosmanov/bee-host).

#### Python Script

**Requirements:**

- Python 2 or 3
- Bash 4.4+
- Perl 5

You can install the host application either:

- **Locally** (for the current user), or  
- **System-wide** (for all users; requires `root` permissions)

**To download the project:**

```bash
mkdir -p ~/src/chrome-bee
cd ~/src/chrome-bee

wget -q -O - https://github.com/rosmanov/chrome-bee/archive/master.tar.gz | \
  tar xzvf - --strip-components 1
```

**To run the installation script**:

From the project directory, execute:
```bash
./host/install.sh
```

- If run as a superuser, the host application manifests will be installed system-wide.
- By default, the application installs into the project directory.
- 
To specify a different installation path:
```bash
./host/install.sh ~/usr/lib/chrome-bee
```
See the [Wiki](https://github.com/rosmanov/chrome-bee/wiki/Installing-Host-Application) for more information.

### 2. Browser Extension

Install the Bee extension from:
- [Chrome Web store](https://chrome.google.com/webstore/)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/external-editor/)

The browser will prompt for confirmation—approve it to complete the installation.

## Uninstallation

### BeeCtl

Use your system’s package manager.
For example, on Debian-based systems:
```bash
sudo apt purge beectl
```

### Python Script

From the project directory, run:
```bash
./host/uninstall.sh
```

> [!NOTE]
> Run this command as the same user who performed the installation.

## Configuration

Open the extension’s options page to specify the command for launching an external editor.

Example:
```bash
gvim -f
```

You should also assign a custom keyboard shortcut to invoke Bee[^1]. The default shortcut is `<Ctrl>E`.

See the [Configuration Wiki](https://github.com/rosmanov/chrome-bee/wiki/Configuration) for full details.

## Usage

1. Place the cursor in an editable field.
2. Press the configured keyboard shortcut.
3. The external editor window will open with the current text.
4. Edit, save, and close the editor.

The updated text will appear in the original text field.

## Troubleshooting

### Nothing Happens After Pressing the Keyboard Shortcut

If pressing the keyboard shortcut does not open your editor:

- Make sure you have completed **both steps** of the installation:
  1. Host application is installed and running.
  2. The browser extension is installed and properly configured.
- Ensure the external editor command in the extension options is correct (e.g., `gvim -f`, `code --wait`, `emacsclient -c -n`).
- Verify the keyboard shortcut is assigned correctly:
  - In Chrome/Chromium: go to `chrome://extensions/shortcuts`.
  - In Firefox: open `about:addons`, then click the gear icon → "Manage Extension Shortcuts".
- Check browser console logs (Developer Tools → Console tab) for error messages.
- Restart the browser and try again.
- If using the Python host, make sure all dependencies (Python, Bash, Perl) are installed and available in the `PATH`.

On Windows, you might need to specify the path to the editor in double quotes, if the path contains spaces, e.g.:
```
"C:\Users\ruslan.osmanov\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd" --wait
```

> [!NOTE]
> Note the `--wait` option in the command above. It makes VS Code wait until the file is closed before returning control to the browser. This is important for the extension to work correctly.


---

### Firefox 138.0.3+ on macOS Silently Drops Native Host Connections

This is a known issue in newer versions of Firefox on macOS where it may silently drop connections to the native messaging host.

#### Suggested Solutions:

1. **Reset the local Firefox profile state**:
   - Quit Firefox completely.
   - Delete the following files from your Firefox profile directory:
     ```bash
     rm ~/Library/Application\ Support/Firefox/Profiles/<your-profile-id>/SiteSecurityServiceState.bin
     rm ~/Library/Application\ Support/Firefox/Profiles/<your-profile-id>/permissions.sqlite
     rm ~/Library/Application\ Support/Firefox/Profiles/<your-profile-id>/content-prefs.sqlite
     ```
   - Restart Firefox.

2. **Remove the quarantine attribute from host files**:  
macOS may block the execution of downloaded files until they are explicitly trusted. Run:
```bash
xattr -rd com.apple.quarantine /path/to/chrome-bee
```
> [!NOTE]
> You might need to run it as an administrator (e.g., using `sudo`).
3. **Reinstall the extension and host application**:
    -	Uninstall the extension from Firefox.
    -	Delete and reinstall the host application.
    - Reinstall the extension from https://addons.mozilla.org/.
4. **Check Console.app logs**:
    - Open Console.app and filter logs with Bee or native messaging.
    - Look for sandboxing or permission-related errors.
5. **Test with a new Firefox profile**:
    - To rule out profile-specific corruption, temporarily create a fresh Firefox profile via `about:profiles` and install the extension there.

## License

See `LICENSE` file.

© 2014-2025 Ruslan Osmanov
<608192+rosmanov@users.noreply.github.com>

[^1]: At the time of writing:
    - In Chrome/Chromium, click the "Keyboard shortcuts" button at the bottom of chrome://extensions  
    - In Firefox, open the `about:addons`, then select "Manage Extension Shortcuts" from the dropdown next to the "Manage Your Extensions".  
