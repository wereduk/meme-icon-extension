.PHONY: help install dev build clean test lint type-check build-chrome build-firefox build-safari zip-chrome zip-firefox zip-all

help:
	@echo "Meme Icon Extension - Build Commands"
	@echo ""
	@echo "Setup & Development:"
	@echo "  make install       - Install dependencies"
	@echo "  make dev           - Watch mode (development)"
	@echo "  make clean         - Remove build artifacts"
	@echo ""
	@echo "Building:"
	@echo "  make build         - Build core extension"
	@echo "  make build-chrome  - Package for Chrome Web Store"
	@echo "  make build-firefox - Package for Firefox Add-ons"
	@echo "  make build-safari  - Package for Safari"
	@echo ""
	@echo "Distribution Packages:"
	@echo "  make zip-chrome    - Create chrome-extension.zip"
	@echo "  make zip-firefox   - Create firefox-extension.xpi"
	@echo "  make zip-all       - Create all distribution packages"
	@echo ""
	@echo "Quality:"
	@echo "  make test          - Run tests"
	@echo "  make test-watch    - Run tests in watch mode"
	@echo "  make lint          - Lint TypeScript"
	@echo "  make type-check    - Type check without emit"
	@echo ""
	@echo "Documentation:"
	@echo "  make index         - Regenerate INDEX.md context"

install:
	npm install

dev:
	npm run dev

build: clean
	npm run build

build-chrome: build
	npm run build:chrome

build-firefox: build
	npm run build:firefox

build-safari: build
	npm run build:safari

zip-chrome: build
	@echo "📦 Creating Chrome distribution package..."
	@cp manifests/manifest-chrome-v3.json dist/manifest.json
	@cd dist && zip -r ../chrome-extension.zip . -x "*.map" "*.DS_Store"
	@echo "✅ Created chrome-extension.zip"

zip-firefox: build
	@echo "📦 Creating Firefox distribution package..."
	@cp manifests/manifest-firefox.json dist/manifest.json
	@cd dist && zip -r ../firefox-extension.xpi . -x "*.map" "*.DS_Store"
	@echo "✅ Created firefox-extension.xpi"

zip-all: build
	@echo "📦 Creating all distribution packages..."
	@echo ""
	@echo "Building Chrome package..."
	@cp manifests/manifest-chrome-v3.json dist/manifest.json
	@cd dist && zip -r ../chrome-extension.zip . -x "*.map" "*.DS_Store"
	@echo "✅ chrome-extension.zip created"
	@echo ""
	@echo "Building Firefox package..."
	@cp manifests/manifest-firefox.json dist/manifest.json
	@cd dist && zip -r ../firefox-extension.xpi . -x "*.map" "*.DS_Store"
	@echo "✅ firefox-extension.xpi created"
	@echo ""
	@echo "🎉 All distribution packages ready!"
	@ls -lh chrome-extension.zip firefox-extension.xpi

clean:
	npm run clean
	@rm -f chrome-extension.zip firefox-extension.xpi
	@echo "🧹 Cleaned build artifacts and distribution packages"

test:
	npm run test

test-watch:
	npm run test:watch

lint:
	npm run lint

type-check:
	npm run type-check

index:
	@echo "Index file is maintained at INDEX.md"
	@echo "Update it manually as project context evolves"

.DEFAULT_GOAL := help
