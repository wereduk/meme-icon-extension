.PHONY: help install dev build clean test lint type-check build-chrome build-firefox build-safari

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

clean:
	npm run clean

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
