#!/bin/bash -
# Builds a CRX package.
# Usage: ./package.sh <version> <browser>
# where
# - <version> is a version number, e.g. 2.2.
#   If <version> is not specified, then the current version from manifest.json will be used.
# - <browser> chrome, firefox, or nothing (defaults to 'chrome')

set -x -e -u
shopt -s extglob

dir=$(cd "$(dirname "$0")"; pwd)
build_dir=$(dirname "$dir")/build

cd "$dir"

[ $# -ne 0 ] && version="$1" || \
  version=$(perl -MJSON -e '$_ = do {local $/; <STDIN>}; $_ = decode_json $_; print $_->{"version"}' < manifest.json)
printf ">> Version: %s\n" "$version"

[ $# -gt 1 ] && browser="$2"
: ${browser:=chrome}
printf ">> Browser: %s\n" "$browser"

crx="$build_dir/bee-${version}.crx"
printf ">> Target CRX: %s" "$crx"

# Find chrome executable
for e in 'google-chrome-stable' 'google-chrome' 'chromium-browser' 'chromium'
do
  exe=$(command -v $e)
  [ -n "$exe" ] && break
done
if [ -z "$exe" ]; then
  printf >&2 '!! Chrome executable not found\n'
  exit 1
fi
printf '* Detected Chrome executable: %s\n' "$exe"

manifest_backup_file=manifest.json.bak
cp manifest.json "$manifest_backup_file" && \
  printf 'Created backup for manifest.json: %s\n' "$manifest_backup_file"

"$dir/patch-manifest.pl" manifest.json "$version" "$browser" && \
  printf '* Patched manifest.json\n'

printf '>> Building CRX package...\n'
$exe --pack-extension="$dir" --pack-extension-key="$build_dir/bee.pem"
mv -v "$dir/../"?(chrome-)bee.crx "$crx" && printf ">> Built CRX package: %s\n" "$crx"

printf '>> Creating ZIP archive...\n'
zip_file="$build_dir/bee.zip"
rm -f "$zip_file"
zip -x '*~' '*.git*' '*.rope*' '*.swp' '*.bak' host/beectl "${build_dir}*" \
    '*.xcf' 'img/wiki/*' 'host/*' '*.pl' '*.sh'  \
  -r "$zip_file" . && \
  printf '>> Created ZIP archive: %s\n' "$zip_file"

cp "$manifest_backup_file" manifest.json &&
  printf '* Restored manifest.json from %s\n' "$manifest_backup_file"
