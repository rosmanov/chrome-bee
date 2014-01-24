#!/usr/bin/env python3
#
# Google Chrome (Chromium) browser's Bee extension native messaging host.
#
# User can specify path to desired external editor in ~/.config/beectl.conf
# file, e.g.:
#
#   bee_editor = /usr/bin/gedit
#
# Otherwise the script tries to guess editor by iterating over list of popular
# editors, such as gvim, macvim, qvim, gedit, kate, emacs etc.; then falls back
# to $EDITOR environment variable.
#
# When editor's subprocess is finished, the script bypasses the new text back
# to the textarea control.
#
# Copyright © 2014 Ruslan Osmanov <rrosmanov at gmail dot com>

import json
import struct
import re
import os.path
import sys
import tempfile
import subprocess


def which(exe):
    for dir in os.environ['PATH'].split(':'):
        path = os.path.join(dir, exe)
        if os.path.exists(path):
            return path
    return False


def parse_user_config():
    filename = os.path.expanduser("~/.config/beectl.conf")
    if (not os.path.exists(filename)):
        return None

    conf = {}
    with open(filename) as fp:
        for line in iter(fp.readline, ''):
            c = re.split('[\s\=]+', line, 1)
            conf[c[0]] = c[1]

    return conf


def get_editor(conf):
    if conf and 'bee_editor' in conf:
        return conf['bee_editor']

    for e in ['gedit', 'kate', 'sublime', 'gvim',
              'qvim', 'macvim', 'emacs', 'leafpad']:
        path = which(e)
        if which(e):
            return path

    return os.getenv('EDITOR')


def main():
    conf = parse_user_config()
    bee_editor = get_editor(conf)

    if not bee_editor:
        sys.exit("No editor found")

    args = re.split('\s+', bee_editor)

    # no-fork option for vim family
    if re.match('.*vim', bee_editor):
        args.append('-f')

    # 1st 4 bytes is the message type
    text_len_bytes = sys.stdin.buffer.read(4)

    if len(text_len_bytes) == 0:
        sys.exit(0)

    text_len = struct.unpack('I', text_len_bytes)[0]

    json_text = sys.stdin.buffer.read(text_len)
    text = json.loads(json_text.decode('UTF-8'))

    f = tempfile.mkstemp('', 'chrome_bee_')
    os.write(f[0], bytes(text['text'], 'UTF-8'))
    args.append(f[1])

    subprocess.call(args);
    text = ""
    os.lseek(f[0], 0, os.SEEK_SET)
    while True:
        r = os.read(f[0], 1024)
        if not r:
            break
        text += r.decode('UTF-8');
    os.close(f[0])
    os.unlink(f[1])

    # Write message size
    response = json.dumps({"text": text})
    sys.stdout.buffer.write(struct.pack('I', len(response)))
    # Write message itself
    sys.stdout.write(response)
    sys.stdout.flush()

    sys.exit(0)


if __name__ == '__main__':
    main()
