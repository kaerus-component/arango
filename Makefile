NAME = arango
COMPONENT = @./node_modules/.bin/component
KARMA = @./node_modules/.bin/karma
MOCHA = @./node_modules/.bin/mocha

build: dependencies component

component: 
	@echo "Building web component"
	$(COMPONENT) build -v
	@echo "Building standalone web component"
	$(COMPONENT) build -v -n $(NAME) -s $(NAME)
	
dependencies: node_modules components

node_modules:
	@echo "Installing node dependencies"
	@npm i -d

components:
	@echo "Installing component dependencies"
	$(COMPONENT) install -v

test: test-browser test-nodejs

test-nodejs: node_modules
	@echo "Running tests for nodejs"
	$(MOCHA) --require should --reporter spec

test-browser: components component
	@echo "Running tests for browser"
	$(KARMA) start --browsers Firefox test/karma/karma.conf.js
	$(KARMA) start --browsers Chrome test/karma/karma.conf.js

distclean:
	@echo "Cleaning up build files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build


.PHONY: build
	