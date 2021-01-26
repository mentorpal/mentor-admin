SHELL:=/bin/bash
DOCKER_IMAGE?=mentor-admin
DOCKER_CONTAINER=mentor-admin
DIR=$(shell pwd)
PROJECT_ROOT?=$(shell git rev-parse --show-toplevel 2> /dev/null)
PROJECT_NAME=$(shell v='$(PROJECT_ROOT)'; echo "$${v\#\#*/}")
CLIENT=$(PROJECT_ROOT)/client
BUILD=$(DIR)/build


.PHONY clean:
clean:
	rm -rf build

build/client:
	mkdir -p build
	rsync -rv \
		--exclude=.cache  \
		--exclude=.cypress-*  \
		--exclude=cypress  \
		--exclude=.env.*  \
		--exclude=node_modules  \
		--exclude=public  \
	$(CLIENT) build

build: build/client

.PHONY: dependencies-update
dependencies-update:
	npm run dependencies-update

.PHONY docker-build:
docker-build: clean build/client
	docker build \
		-t $(DOCKER_IMAGE) \
	.

.PHONY docker-run:
docker-run:
	docker run \
			-it \
			--rm \
			--name $(DOCKER_CONTAINER) \
			-e GRAPHQL_ENDPOINT="https://dev-mentor.pal3.org/graphql" \
			-p 3000:3000 \
		$(DOCKER_IMAGE) 


.PHONY docker-run-shell:
docker-run-shell:
	docker run \
			-it \
			--rm \
			--name $(DOCKER_CONTAINER) \
			-p 3000:3000 \
			--entrypoint /bin/bash \
		$(DOCKER_IMAGE) 
		

.PHONY exec-shell:
exec-shell:
	docker exec \
			-it \
		$(DOCKER_CONTAINER) \
			bash

.PHONY: format
format:
	npm run format

node_modules/eslint:
	npm ci

node_modules/prettier:
	npm ci

node_modules/typescript:
	npm ci

.PHONY: test
test:
	npm run test

.PHONY: test-all
test-all:
	$(MAKE) test-audit
	$(MAKE) test-format
	$(MAKE) test-lint
	$(MAKE) test

.PHONY: test-audit
test-audit:
	npm run test:audit

.PHONY: test-format
test-format:
	npm run test:format

.PHONY: test-lint
test-lint:
	npm run test:lint
