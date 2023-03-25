#!/bin/bash -
#
# Uninstall native messaging host
#
# Copyright © 2014-2018 Ruslan Osmanov <608192+rosmanov@users.noreply.github.com>

set -e -u

dir=$(cd "$(dirname "$0")" && pwd)

source "$dir/vars.sh"

restore_vars_cache

readonly files=( \
  "$target_host_dir/$target_host_file" \
  "$chrome_target_manifest_dir/$target_manifest_file" \
  "$firefox_target_manifest_dir/$target_manifest_file" \
  )

printf 'Removing %s\n' "${files[*]}"
rm -f "${files[@]}"
