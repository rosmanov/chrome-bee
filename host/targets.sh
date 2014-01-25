#!/bin/bash
# vim: noet ts=4 sts=4 sw=4
# List of targets shared between install.sh and uninstall.sh
# Copyright © 2014 Ruslan Osmanov <rrosmanov@gmail.com>

if [ `uname -s` == 'Darwin' ]
then
	target_manifest_dir='/Library/Google/Chrome/NativeMessagingHosts'
else
	target_manifest_dir='/etc/opt/chrome/native-messaging-hosts'
fi
target_host_dir='/opt/osmanov/chrome'
target_host_file=beectl
host_name=com.ruslan_osmanov.bee
