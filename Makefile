.PHONY: chrome firefox
all: chrome firefox
chrome: build pack-chrome
firefox: build pack-firefox

.PHONY: build build-dev
build: version-sync
	npm run build
build-dev: version-sync
	npm run build-dev

.PHONY: version-sync
version-sync:
	./version-sync

.PHONY: pack-firefox pack-chrome
pack-firefox:
	npm run pack-firefox
pack-chrome:
	npm run pack-chrome
