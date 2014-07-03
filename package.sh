#!/bin/bash -
# Package CRX archive.
# Usage ./package.sh <version>
# where <version> is a version number, e.g. 2.2

set -e -u -x

dir=$(cd $(dirname "$0"); pwd)
build_dir=$(dirname "$dir")/build
paths=('google-chrome-stable' 'google-chrome' 'chromium-browser' 'chromium')

version="$1"
#if [[ "x$1" == "x" ]]; then
	#version_line="$(grep -o '"version".*' $dir/manifest.json)"
	#version=`expr "$version_line" : '"version".*\([0-9]\+\\.[0-9]\+\)'`;
#else
	#version="$1"
#fi

crx="${build_dir}/bee-${version}.crx"

for e in $paths
do
	exe=$(command -v $e)
	[ -z "$exe" ] && continue
done

if [[ "x$exe" == "x" ]]
then
	echo >&2 "Chrome executable not found"
	exit 1
fi

$exe --pack-extension="${dir}" --pack-extension-key="${build_dir}/bee.pem"

mv "${dir}/../bee.crx" "${crx}" && echo \
	"Extension has been moved to ${crx}"

if [[ ! -z "$version" ]]; then
	sed -r -i 's%("version"\s*:\s*")[0-9\.]*%\1'$version'%g' manifest.json
	echo "Patched manifest.json"
fi

cd $dir
rm -f ${build_dir}/bee.zip
zip -x *\.git* -x *\.rope* -r ${build_dir}/bee.zip .

# vim: noet
