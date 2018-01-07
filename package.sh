#!/bin/bash -
# Builds a CRX package.
# Usage ./package.sh <version> <browser>
# where
# - <version> is a version number, e.g. 2.2.
#   If <version> is not specified, then the current version from manifest.json will be used.
# - <browser> chrome, firefox, or nothing (defaults to 'chrome')

set -e -u
shopt -s extglob

dir=$(cd "$(dirname "$0")"; pwd)
build_dir=$(dirname "$dir")/build

cd "$dir"

[ $# -ne 0 ] && version="$1" || \
  version=$(perl -MJSON -e '$_ = do {local $/; <STDIN>}; $_ = decode_json $_; print $_->{"version"}' < manifest.json)
echo "Version: $version"

[ $# -gt 1 ] && browser="$2"
: ${browser:=chrome}
echo "Browser: $browser"

crx="$build_dir/bee-${version}.crx"
echo "Target CRX: $crx"

# Find chrome executable
for e in 'google-chrome-stable' 'google-chrome' 'chromium-browser' 'chromium'
do
  exe=$(command -v $e)
  [ -n "$exe" ] && break
done
if [ -z "$exe" ]; then
  echo >&2 'Chrome executable not found'
  exit 1
fi
echo "Detected Chrome executable: $exe"

manifest_backup_file=manifest.json.bak
cp manifest.json "$manifest_backup_file" && \
  echo "Created backup for manifest.json: $manifest_backup_file"

./patch-manifest.pl manifest.json "$version" "$browser" && \
  echo Patched manifest.json

echo "Building CRX package..."
$exe --pack-extension="$dir" --pack-extension-key="$build_dir/bee.pem"
mv "$dir/../"?(chrome-)bee.crx "$crx" && \
  echo "Built CRX package: $crx"

echo "Creating ZIP archive..."
zip_file="$build_dir/bee.zip"
rm -f "$zip_file"
zip -x '*~' '*.git*' '*.rope*' '*.swp' '*.bak' host/beectl "${build_dir}*" '*.xcf' 'img/wiki/*' 'host/*' '*.pl' '*.sh'  \
  -r "$zip_file" . && \
  echo "Created ZIP archive: $zip_file"

cp "$manifest_backup_file" manifest.json &&
  echo "Restored manifest.json from $manifest_backup_file"
