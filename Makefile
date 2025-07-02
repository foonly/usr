.PHONY: install build watch

build: install
	pnpm run build

watch: install
	pnpm run watch

install:
	pnpm i
