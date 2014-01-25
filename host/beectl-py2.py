#!/usr/bin/env python2
# -*- coding: utf-8 -*-
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

from __future__ import with_statement
import json
import struct
import re
import os.path
import sys
import tempfile
import subprocess
from io import open


def which(exe):
    for dir in os.environ[u'PATH'].split(u':'):
        path = os.path.join(dir, exe)
        if os.path.exists(path):
            return path
    return False


def parse_user_config():
    filename = os.path.expanduser(u"~/.config/beectl.conf")
    if (not os.path.exists(filename)):
        return None

    conf = {}
    with open(filename) as fp:
        for line in iter(fp.readline, u''):
            c = re.split(u'[\s\=]+', line, 1)
            conf[c[0]] = c[1]

    return conf


def get_editor(conf):
    if conf and u'bee_editor' in conf:
        return conf[u'bee_editor'].strip()

    for e in [u'gedit', u'kate', u'sublime', u'gvim',
              u'qvim', u'macvim', u'emacs', u'leafpad']:
        path = which(e)
        if which(e):
            return path

    return os.getenv(u'EDITOR')


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
    text_len_bytes = sys.stdin.read(4)

    if len(text_len_bytes) == 0:
        sys.exit(0)

    text_len = struct.unpack('I', text_len_bytes)[0]

    json_text = sys.stdin.read(text_len)
    text = json.loads(json_text.decode(u'UTF-8'))

    f = tempfile.mkstemp('.txt', 'chrome_bee_')
    os.write(f[0],str(text['text']).encode('UTF-8'))
    args.append(f[1])

    subprocess.call(args)
    text = u""
    os.lseek(f[0], 0, os.SEEK_SET)
    while True:
        r = os.read(f[0], 1024)
        if not r:
            break
        text += r.decode('UTF-8')
    os.close(f[0])
    os.unlink(f[1])

    # Write message size
    response = json.dumps({'text': text})
    sys.stdout.write(struct.pack(u'I', len(response)))
    # Write message itself
    sys.stdout.write(response)
    sys.stdout.flush()

    sys.exit(0)


if __name__ == '__main__':
    main()
