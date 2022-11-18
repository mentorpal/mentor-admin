DOCKER_IMAGE?=mentor-admin
TEST_E2E_DOCKER_COMPOSE=docker-compose
TEST_E2E_IMAGE_SNAPSHOTS_PATH?=cypress/snapshots
TEST_E2E_DOCKER_IMAGE_SNAPSHOTS_PATH?=/app/$(TEST_E2E_IMAGE_SNAPSHOTS_PATH)
TEST_E2E_HOST_IMAGE_SNAPSHOTS_PATH?=$(PWD)/cypress/$(TEST_E2E_IMAGE_SNAPSHOTS_PATH)
TEST_E2E_DOCKER_FAILED_SNAPSHOT_DIFFS=$(TEST_E2E_IMAGE_SNAPSHOTS_PATH)/snapshot_failed_diffs
TEST_E2E_HOST_FAILED_SNAPSHOTS_PATH=$(TEST_E2E_HOST_IMAGE_SNAPSHOTS_PATH)/snapshot_failed_diffs
LICENSE_CONFIG?="license-config.json"

.PHONY: clean
clean:
	cd client && $(MAKE) clean

.PHONY: develop
develop:
	cd client && $(MAKE) develop

.PHONY docker-build:
docker-build:
	docker build \
		--file docker/Dockerfile \
		-t $(DOCKER_IMAGE) \
	.

node_modules/license-check-and-add:
	npm ci

node_modules/prettier:
	npm ci

.PHONY: pretty
pretty: node_modules/prettier
	npm run format

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1

.PHONY: format
format: LICENSE LICENSE_HEADER
	npm run license:fix && npm run format

.PHONY: license
license: LICENSE LICENSE_HEADER
	npm run license:fix 

.PHONY: license-deploy
license-deploy: node_modules/license-check-and-add LICENSE LICENSE_HEADER
	LICENSE_CONFIG=${LICENSE_CONFIG} npm run license:deploy

.PHONY: test
test:
	cd client && $(MAKE) test

.PHONY: test-all
test-all:
	#$(MAKE) test-audit
	$(MAKE) test-format
	$(MAKE) test-lint
	$(MAKE) test-license
	$(MAKE) test-types

.PHONY: test-audit
test-audit:
	cd client && $(MAKE) test-audit

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-lint
test-lint:
	cd client && $(MAKE) test-lint

.PHONY: test-types
test-types:
	cd client && $(MAKE) test-types

.PHONY: test-license
test-license: LICENSE LICENSE_HEADER
	npm run test:license

.PHONY: test-e2e
test-e2e:
	$(TEST_E2E_DOCKER_COMPOSE) up -d
	$(TEST_E2E_DOCKER_COMPOSE) exec cypress npx cypress run

.PHONY: test-e2e-build
test-e2e-build:
	$(TEST_E2E_DOCKER_COMPOSE) build

.PHONY: test-e2e-exec
test-e2e-exec:
	$(TEST_E2E_DOCKER_COMPOSE) exec -T cypress npx cypress run --env CYPRESS_SNAPSHOT_DIFF_DIR=$(TEST_E2E_DOCKER_FAILED_SNAPSHOT_DIFFS)

.PHONY: test-e2e-image-snapshots-clean
test-e2e-image-snapshots-clean:
	rm -rf ${TEST_E2E_HOST_IMAGE_SNAPSHOTS_PATH}

.PHONY: test-e2e-image-snapshots-copy
test-e2e-image-snapshots-copy:
	docker cp $(shell $(TEST_E2E_DOCKER_COMPOSE) ps -a -q cypress):$(TEST_E2E_DOCKER_IMAGE_SNAPSHOTS_PATH)/ $(TEST_E2E_HOST_IMAGE_SNAPSHOTS_PATH)

.PHONY: test-e2e-copy-failed_diffs
test-e2e-copy-failed_diffs:
	docker cp $(shell $(TEST_E2E_DOCKER_COMPOSE) ps -a -q cypress):app/$(TEST_E2E_DOCKER_FAILED_SNAPSHOT_DIFFS) $(TEST_E2E_HOST_FAILED_SNAPSHOTS_PATH)

.PHONY: test-e2e-exec-image-snapshots-update
test-e2e-exec-image-snapshots-update:
	$(TEST_E2E_DOCKER_COMPOSE) exec cypress npx cypress run --env updateSnapshots=true

.PHONY: test-e2e-image-snapshots-update
test-e2e-image-snapshots-update:
	$(MAKE) test-e2e-image-snapshots-clean
	$(MAKE) test-e2e-build
	$(MAKE) test-e2e-up
	$(MAKE) test-e2e-exec-image-snapshots-update
	$(MAKE) test-e2e-image-snapshots-copy

.PHONY: test-e2e-up
test-e2e-up:
	$(TEST_E2E_DOCKER_COMPOSE) up -d

.PHONY: deploy
deploy:
	cd client && \
	export GRAPHQL_ENDPOINT=https://api-dev.mentorpal.org/graphql/graphql && \
	export STAGE=dev && \
	npm run build && \
	aws s3 sync ./public/ s3://mentorpal-us-east-1-newdev-mentorpal-origin/admin && \
	aws cloudfront create-invalidation --distribution-id E6VOL8BYUVNWS --paths "/admin*"
