.PHONY: clean
clean:
	rm -rf .cache public

.PHONY: develop
develop: node_modules/gatsby
	npx gatsby develop -p 80

.PHONY: pretty
pretty: 
	cd .. && $(MAKE) pretty

.PHONY: format
format:
	cd .. && $(MAKE) format

.PHONY: license
license:
	cd .. && $(MAKE) license

node_modules/eslint:
	$(MAKE) install

node_modules/gatsby:
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
test-format:
	cd .. && $(MAKE) test-format

.PHONY: test-license
test-license:
	cd .. && $(MAKE) test-license

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-types
test-types: node_modules/typescript
	npm run test:types
