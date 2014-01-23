#!/usr/bin/env python3

import json
import struct
import re
#import io
import os.path
import sys
import tempfile


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
    if 'bee_editor' in conf:
        return ['bee_editor']

    for e in ['gedit', 'kate', 'sublime', 'gvim',
              'qvim', 'macvim', 'emacs', 'leafpad']:
        path = which(e)
        if which(e):
            return path

    return os.getenv('EDITOR')


def main():
    fp_log = open('/tmp/beectl.py.log', "a")

    conf = parse_user_config()
    bee_editor = get_editor(conf)
    fp_log.write("Conf parsed, bee_editor: " + bee_editor + "\n")
    args = []

    if not bee_editor:
        sys.exit("No editor found")

    # no-fork option for vim family
    if re.match('.*vim', bee_editor):
        args.append('-f')

    fp_log.write("bee_editor after vim check: " + bee_editor + "\n")

    # 1st 4 bytes is the message type
    text_len_bytes = sys.stdin.buffer.read(4)
    fp_log.write("text_len_bytes: %s\n" % text_len_bytes.decode('UTF-8'))

    if len(text_len_bytes) == 0:
        fp_log.write("len(text_len_bytes) == 0. Exit.\n")
        fp_log.close()
        sys.exit(0)

    fp_log.write("unpacking text_len_bytes\n")
    text_len = struct.unpack('I', text_len_bytes)[0]
    fp_log.write("text_len: %i\n" % text_len)

    json_text = sys.stdin.buffer.read(text_len)
    fp_log.write("read text: %s\n" % json_text)
    text = json.loads(json_text.decode('UTF-8'))
    fp_log.write("text: %s\n" % text['text'])

    f = tempfile.mkstemp('', 'chrome_bee_')
    os.write(f[0], bytes(text['text'], 'UTF-8'))
    fp_log.write("written text to tmp file %s\n" % f[1])
    args.append(f[1])

    os.execvp(bee_editor, args)
    response = os.read(f[0])
    #fp_log.write("response from editor: " + response + "\n")
    os.close(f[0])
    sys.unlink(f[1])

    # Write message size
    sys.stdout.buffer.write(json.dumps(struct.pack('I', len(response))))
    # Write message itself
    sys.stdout.buffer.write(response)
    sys.stdout.flush()
    fp_log.write("written response to stdout\n=============\n\n\n")
    fp_log.close()

    sys.exit(0)


def my_excepthook(type, value, tb):
    fp_log = open('/tmp/beectl.py.log', "a")
    fp_log.write("my exception hook: type: %s value: %s", {0: type, 1: value})
    fp_log.close()

    # the following line does the default (prints it to err)
    sys.__excepthook__(type, value, tb)


if __name__ == '__main__':
    #sys.excepthook = my_excepthook
    main()
