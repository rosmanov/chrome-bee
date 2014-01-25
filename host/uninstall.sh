#!/bin/bash -
# vim: noet ts=4 sts=4 sw=4
#
# Uninstall native messaging host
# Requires root privileges
#
# Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>

set -e -u -x

dir=`dirname "$0"`

source $dir/targets.sh

rm -f "${target_manifest_dir}/${host_name}.json" \
	"${target_host_dir}/${target_host_file}"
