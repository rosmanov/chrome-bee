#!/bin/bash -
# vim: noet ts=4 sts=4 sw=4
#
# Native messaging host for the Bee Google Chrome extension
#
# Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>

# Parse user configuration
conf="$HOME/.config/beectl.conf"
if [ -f "$conf" ]
then
	OLDIFS="$IFS"
	IFS="="
	while read -r k v
	do
		case "$k" in
			bee_editor*)
				bee_editor="${v//\"/}";;
		esac
	done < "$conf"
	IFS=$OLDIFS
fi

# Guess editor
if [ -z "$bee_editor" ]
then
	popular_editors=('gedit' 'kate' 'sublime' 'gvim' 'qvim' 'emacs' 'leafpad')
	for e in ${popular_editors[@]}
	do
		path=$(command -v "$e")
		if [ $path ]; then
			echo "bee_editor assigned to $path"
			bee_editor="$path"
			break
		fi
	done
fi

# Fallback
: ${bee_editor:=$VISUAL}

log=/home/ruslan/projects/chrome/bee/log

if [ -z "${bee_editor}" ]
then
	echo >&2 "No editor found"
	exit 1
elif [ `expr match "$bee_editor" '\(.*vim\)'` ]
then
	# No-fork option for vim family
	bee_editor="$bee_editor -f"
fi

# Open temporary file with editor (assuming we run it in foreground)
tmpfile=$(mktemp -t "${0##*/}.XXXXXXXXXX")
# Skip 1st 4 bytes
read -N4 -u0 $len
echo "len = $len" >> $log
cat /dev/stdin > $tmpfile

echo $bee_editor $tmpfile >> $log
$bee_editor "$tmpfile" >/dev/null 2>&1
echo "bee editor closed sending response" >> $log

cat "$tmpfile" | tee $log 
echo "removing file $tmpfile" >> $log
rm "$tmpfile"
