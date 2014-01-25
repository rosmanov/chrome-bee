#!/bin/bash -
# vim: noet ts=4 sts=4 sw=4
#
# Native messaging host setup.
# Requires root privileges
#
# Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>

set -e -u

function _msg()
{
	echo ">> $1"
}

function _err()
{
	echo 1>&2 "!! ERROR: $1"
	exit 1
}

dir=`dirname "$0"`
host_name=com.ruslan_osmanov.bee

source $dir/targets.sh

if [[ `command -v python` ]]
then
	python_version=`python -V 2>&1`
	python_version=${python_version//[^0-9\.]/}
	if [[ "$python_version" =~ ^3\.* ]]
	then
		source_host_file=beectl-py3.py
	elif [[ "$python_version" =~ ^2\.* ]]
	then
		source_host_file=beectl-py2.py
	else
		_err "Python version >= 2 not found"
	fi
else
	_err "Python version >= 2 not found"
fi
_msg "Source host file: $source_host_file"

install -D -m 0644 "${dir}/${host_name}.json" "${target_manifest_dir}/${host_name}.json"
install -D -m 0755 "${dir}/${source_host_file}" "${target_host_dir}/${target_host_file}"

_msg "No errors detected. Native messaging host ${host_name} has been installed into $target_host_dir"
