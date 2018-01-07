#!/bin/bash -
# Installs native messaging host application
#
# Arguments:
# $1: Optional. Target directory.
#
# Copyright © 2014-2018 Ruslan Osmanov <rrosmanov@gmail.com>

set -e -u

# Prints an error message then exits
err()
{
  echo >&2 "Error: $@"
  exit 1
}

# Get current directory
dir=$(cd "$(dirname "$0")" && pwd)

[ $# -ne 0 ] && target_host_dir="$1"

source "$dir/vars.sh"

: ${target_host_dir:="$dir"}

save_vars_cache

# Get host app filename depending on python version
let python_version=$(python -c 'import sys; print sys.version_info.major')
case "$python_version" in
  2|3)
    source_host_file="beectl-py${python_version}.py"
    ;;
  *)
    err "Python version '$python_version' is not supported"
    ;;
esac

# Copy host app to the target path
target_host_path="$target_host_dir/$target_host_file"
install -D -m 0755 "$dir/$source_host_file" "$target_host_path" && \
  printf "Installed host application into '%s'\n" "$target_host_path"

# Copy host app manifests into browser-specific directories

target_manifest_path="$chrome_target_manifest_dir/$target_manifest_file"
install -D -m 0644 "$dir/$chrome_manifest_file" "$target_manifest_path" && \
  ./host/patch-manifest.pl "$target_manifest_path" "$target_host_path" && \
  printf "Installed Chrome manifest into '%s'\n" "$target_manifest_path"

target_manifest_path="$firefox_target_manifest_dir/$target_manifest_file"
install -D -m 0644 "$dir/$firefox_manifest_file" "$target_manifest_path" && \
  ./host/patch-manifest.pl "$target_manifest_path" "$target_host_path" && \
  printf "Installed Firefox manifest into '%s'\n" "$target_manifest_path"
