#!/usr/bin/env python2
# -*- coding: utf-8 -*-
#
# Google Chrome (Chromium) browser's Bee extension native messaging host.
#
# Path of the executable is expected on input. However, it is optional. If
# there is no executable privided on input, then the script tries to guess
# editor by iterating over a list of popular editors, such as gvim, macvim,
# qvim, gedit, kate, emacs etc.; then falls back to $EDITOR environment
# variable.
#
# When editor's subprocess is finished, the script bypasses the new text back
# to the textarea control.
#
# Copyright © 2014-2019 Ruslan Osmanov <rrosmanov at gmail dot com>

from __future__ import with_statement
import json
import struct
import re
import os.path
import sys
import tempfile
import subprocess
import shlex


def which(exe):
    for dir in os.environ[u'PATH'].split(u':'):
        path = os.path.join(dir, exe)
        if os.path.exists(path):
            return path
    return False


def get_editor(conf):
    if conf and 'editor' in conf and conf['editor']:
        return conf['editor'].strip()

    for e in ['gedit', 'kate', 'sublime', 'gvim',
              'qvim', 'macvim', 'emacs', 'leafpad']:
        path = which(e)
        if path:
            return path

    return os.getenv('EDITOR')


def main():
    # 1st 4 bytes is the message type
    text_len_bytes = sys.stdin.read(4)

    if len(text_len_bytes) == 0:
        sys.exit(0)

    text_len = struct.unpack('I', text_len_bytes)[0]

    json_text = sys.stdin.read(text_len)
    text = json.loads(json_text.decode('utf-8'))

    # Look if editor is passed in JSON
    conf = None
    if 'editor' in text:
        conf = text

    bee_editor = get_editor(conf)

    if not bee_editor:
        sys.exit("No editor found")

    if 'args' in conf:
        args = conf['args']
        args.insert(0, bee_editor)
    else:
        args = shlex.split(bee_editor)

    # no-fork option for vim family
    if re.match('.*vim', bee_editor):
        args.append('-f')

    suffix = '.txt'
    if 'ext' in text:
        suffix = '.' + text['ext']
    f = list(tempfile.mkstemp(suffix, 'chrome_bee_'))
    os.write(f[0], text['text'].encode('utf-8'))
    os.close(f[0])
    args.append(f[1])

    with open(os.devnull, 'w') as devnull:
        subprocess.call(args, stdout = devnull, stderr = devnull)
    st = os.stat(f[1])
    f[0] = os.open(f[1], os.O_RDONLY)
    r = os.read(f[0], st.st_size);
    text = r.decode('utf-8', 'replace')

    os.close(f[0])
    os.unlink(f[1])

    # Write message size
    response = json.dumps({'text': text})
    sys.stdout.write(struct.pack('I', len(response)))
    # Write message itself
    sys.stdout.write(response)
    sys.stdout.flush()

    sys.exit(0)


if __name__ == '__main__':
    main()
