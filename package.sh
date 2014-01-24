#!/bin/bash -

dir=$(cd $(dirname "$0"); pwd)
build_dir=$(dirname "$dir")/build
paths=('google-chrome' 'chromium-browser' 'chromium')

if [[ $# > 1 ]]; then
	version=
else
	version="$1"
fi
crx="${build_dir}/bee-${version}.crx"

for e in $paths
do
	exe=$(command -v $e)

	[ -z "$exe" ] && continue
done

if [ -z "$exe" ]
then
	echo >&2 "Chrome executable not found"
	exit 1
fi

$exe --pack-extension="${dir}" --pack-extension-key="${build_dir}/bee.pem" > /dev/null

mv "${dir}/../bee.crx" "${crx}" && echo \
	"Extension has been moved to ${crx}"
