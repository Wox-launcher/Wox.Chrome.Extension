.PHONY: clean build install help

ZIP := wox-chrome-extension.zip

help:
	@echo "Available commands:"
	@echo "  make clean      - Remove build artifacts and node_modules"
	@echo "  make build      - Build the extension and package dist/ into $(ZIP)"
	@echo "  make install    - Install dependencies"

clean:
	npm run clean
	npm exec -- rimraf $(ZIP)

install: clean
	npm install

# Build the extension, then zip the dist/ directory contents into a
# Chrome Web Store-ready package. The zip stores files at the archive root
# (dist/ contents, not dist/ itself) so it loads correctly as an unpacked
# extension when extracted.
build: install
	npm run build
	npm run package