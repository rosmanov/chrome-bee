#!/bin/bash -
# vim: noet ts=4 sts=4 sw=4
#
# Native messaging host setup.
# Requires root privileges
#
# Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>

if [ $(uname -s) == 'Darwin' ]
then
	manifest_dir='/Library/Google/Chrome/NativeMessagingHosts'
else
	manifest_dir='/etc/opt/chrome/native-messaging-hosts'
fi
dir=$(dirname "$0")
host_dir='/opt/osmanov/chrome/'
host_name=com.ruslan_osmanov.bee
host_file=beectl

install -D -m 0644 "${dir}/${host_name}.json" "${manifest_dir}/${host_name}.json"
install -D -m 0755 "${dir}/${host_file}" "${host_dir}/${host_file}"

echo "Native messaging host ${host_name} has been installed into $host_dir."
