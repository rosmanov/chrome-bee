#!/bin/bash
# List of targets shared between install.sh and uninstall.sh
# Copyright © 2014-2018 Ruslan Osmanov <rrosmanov@gmail.com>
set -e -u

readonly dir=$(cd "$(dirname "$0")" && pwd)
readonly vars_cache_file="$dir/vars.cache.sh"

save_vars_cache() {
  set > "$vars_cache_file" && \
    echo "Saved cache into $vars_cache_file"
}

restore_vars_cache() {
  [ -r "$vars_cache_file" ] || return
  set +o errexit
  source "$vars_cache_file" 2>/dev/null
  echo "Restored cache from $vars_cache_file"
  set -o errexit
}

lib_dir() {
  local libdir=/usr/lib

  [ \( "$(getconf LONG_BIT)" = '64' -o "$(uname -m)" = 'x86_64' \) -a -d "${libdir}64" ] && \
    libdir="${libdir}64"

  echo "$libdir"
}

# Set target_manifest_dir
kernel=$(uname -s)
case "$kernel" in
  Darwin)
    if [ $EUID == 0 ]; then
      chrome_target_manifest_dir='/Library/Google/Chrome/NativeMessagingHosts'
      firefox_target_manifest_dir='/Library/Application Support/Mozilla/NativeMessagingHosts'
    else
      chrome_target_manifest_dir="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
      firefox_target_manifest_dir="$HOME/Library/Application Support/Mozilla/NativeMessagingHosts"
    fi
    ;;
  *)
    if [ $EUID == 0 ]; then
      chrome_target_manifest_dir='/etc/opt/chrome/native-messaging-hosts'
      firefox_target_manifest_dir="$(lib_dir)/mozilla/native-messaging-hosts"
    else
      chrome_target_manifest_dir="$HOME/.config/google-chrome/NativeMessagingHosts"
      firefox_target_manifest_dir="$HOME/.mozilla/native-messaging-hosts"
    fi
    ;;
esac

if [ $EUID == 0 ]; then
  : ${target_host_dir:=/opt/osmanov/WebExtensions}
else
  : ${target_host_dir:="$dir"}
fi

target_host_file=beectl
host_name=com.ruslan_osmanov.bee

chrome_manifest_file="${host_name}.json"
firefox_manifest_file="firefox-${host_name}.json"
target_manifest_file="${host_name}.json"
