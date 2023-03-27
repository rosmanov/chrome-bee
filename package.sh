#!/bin/bash -
# Builds a ZIP package.
# Usage: ./package.sh <version> <browser>
# where
# - <version> is a version number, e.g. 2.2.
#   If <version> is not specified, then the current version from manifest.json will be used.
# - <browser> chrome, firefox, or nothing (defaults to 'chrome')

set -e -u
shopt -s extglob

dir=$(cd "$(dirname "$0")"; pwd)
build_dir=$(dirname "$dir")/build
artifacts_dir="${dir}/web-ext-artifacts"

mkdir -p "$artifacts_dir"

cd "$dir"

[ $# -ne 0 ] && version="$1" || \
  version=$(perl -MJSON -e '$_ = do {local $/; <STDIN>}; $_ = decode_json $_; print $_->{"version"}' < manifest.json)
printf ">> Version: %s\n" "$version"

[ $# -gt 1 ] && browser="$2"
: ${browser:=chrome}
printf ">> Browser: %s\n" "$browser"

# Find chrome executable
for e in 'google-chrome-stable' 'google-chrome' 'chromium-browser' 'chromium'
do
  chrome_bin=$(command -v $e)
  [ -n "$chrome_bin" ] && break
done
if [ -z "$chrome_bin" ]; then
  printf >&2 '!! Chrome executable not found\n'
  exit 1
fi
printf '* Detected Chrome executable: %s\n' "$chrome_bin"

manifest_backup_file=manifest.json.bak
cp manifest.json "$manifest_backup_file" && \
  printf 'Created backup for manifest.json: %s\n' "$manifest_backup_file"

"$dir/patch-manifest.pl" manifest.json "$version" "$browser" && \
  printf '* Patched manifest.json\n'

case "$browser" in
    *chrome*)
        printf '>> Creating ZIP archive...\n'
        zip_file="$artifacts_dir/bee-${browser}-${version}.zip"
        rm -f "$zip_file"
        zip -x '*~' '*.git*' '*.rope*' '*.swp' '*.bak' host/beectl "${build_dir}*" \
            '*.xcf' 'img/wiki/*' 'host/*' '*.pl' '*.sh' 'host/*' 'node_modules/*' 'src/*' '.*' \
            'webpack.*' "$(basename "$artifacts_dir")/*" 'package*' \
            -r "$zip_file" . && \
            printf '>> Created ZIP archive: %s\n' "$zip_file"
        ;;

    *firefox*)
        printf '>> Linting Firefox manifest...\n'
        web-ext lint

        printf '>> Building Firefox package...\n'
        web-ext build --overwrite-dest \
            --source-dir="${dir}" \
            --artifacts-dir="${artifacts_dir}" \
            --filename="bee-web-ext-${browser}-${version}.zip" \
            --ignore-files="${dir}/host/*" \
            --ignore-files="${dir}/node_modules" \
            --ignore-files="${dir}/src" \
            --ignore-files="${dir}/img/wiki/*" \
            --ignore-files="*.pl" \
            --ignore-files="*.bak" \
            --ignore-files="*.sh" \
            --ignore-files="*.xcf" \
            --ignore-files="*~" \
            --ignore-files="${dir}/.git*" \
            --ignore-files="*.sw[op]" \
            --ignore-files="${artifacts_dir}/*" \
            --ignore-files="${dir}/package*" \
            --ignore-files="${dir}/webpack*" \
        ;;
    *)
        printf >&2 'Unknown browser %s\n' "$browser"
        exit 3
esac

cp "$manifest_backup_file" manifest.json && \
  printf '* Restored manifest.json from %s\n' "$manifest_backup_file"
