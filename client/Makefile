.PHONY: clean
clean:
	rm -rf .cache public

.PHONY: develop
develop: node_modules/gatsby
	npx gatsby develop

.PHONY: format
format: node_modules/prettier
	npm run format

node_modules/eslint:
	$(MAKE) install

node_modules/gatsby:
	$(MAKE) install

node_modules/prettier:
	$(MAKE) install

node_modules/typescript:
	$(MAKE) install

PHONY: install
install:
	npm ci 

.PHONY: test
test:
	npm run test

PHONY: test-all
test-all:
	$(MAKE) test-audit
	$(MAKE) test-format
	$(MAKE) test-lint
	$(MAKE) test-types

.PHONY: test-audit
test-audit:
	npm run test:audit

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-format
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-types
test-types: node_modules/typescript
	npm run test:types
