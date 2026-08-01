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

if [[ "$browser" == *chrome* ]]; then
    # Locate a Chrome/Chromium executable for informational purposes only.
    # Packaging only builds a ZIP and does not need the browser, so a missing
    # executable must not abort the build - notably on macOS, where Chrome is
    # installed as an app bundle and is not on the PATH.
    chrome_bin=''
    for e in 'google-chrome-stable' 'google-chrome' 'chromium-browser' 'chromium' \
             '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
             '/Applications/Chromium.app/Contents/MacOS/Chromium'
    do
      if chrome_bin="$(command -v "$e" 2>/dev/null)"; then
          printf '* Detected Chrome executable: %s\n' "$chrome_bin"
          break
      fi
    done
    [ -n "$chrome_bin" ] || \
      printf >&2 '!! Chrome executable not found (continuing; not required for packaging)\n'
fi

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
            'webpack.*' "$(basename "$artifacts_dir")/*" 'package*' 'version-sync' \
            -r "$zip_file" . && \
            printf '>> Created ZIP archive: %s\n' "$zip_file"
        ;;

    *firefox*)
        ignore_files=( \
            "${dir}/host/*" \
            "${dir}/node_modules" \
            "${dir}/src" \
            "${dir}/img/wiki/*" \
            "*.pl" \
            "version-sync" \
            "*.bak" \
            "*.sh" \
            "*.xcf" \
            "*~" \
            "${dir}/.git*" \
            "*.sw[op]" \
            "${artifacts_dir}/*" \
            "${dir}/package.sh" \
            "${dir}/webpack*" \
        )
        ignore_args=()
        for f in "${ignore_files[@]}"; do
            ignore_args+=( "--ignore-files=$f" )
        done

        printf '>> Linting Firefox manifest...\n'
        npx web-ext lint --source-dir="$dir" "${ignore_args[@]}"

        printf '>> Building Firefox package...\n'
        npx web-ext build --overwrite-dest \
            --source-dir="${dir}" \
            --artifacts-dir="${artifacts_dir}" \
            --filename="bee-${browser}-${version}.zip" \
            "${ignore_args[@]}"
        ;;
    *)
        printf >&2 'Unknown browser %s\n' "$browser"
        exit 3
esac

cp "$manifest_backup_file" manifest.json && \
  printf '* Restored manifest.json from %s\n' "$manifest_backup_file"
