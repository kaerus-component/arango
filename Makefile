NAME = arango

build: dependencies component

component: 
	@echo "Building web component"
	@component build -v
	@echo "Building standalone web component"
	@component build -v -n $(NAME) -s $(NAME)
	
dependencies: node_modules components

node_modules:
	@echo "Installing node dependencies"
	@npm i -d

components:
	@echo "Installing component dependencies"
	@component install -v

test: build
	@echo "Running tests for nodejs"
	@./node_modules/.bin/mocha --require should --reporter spec
	@echo "Running tests for browser"
	@./node_modules/mocha-phantomjs/bin/mocha-phantomjs test/runner.html

distclean:
	@echo "Cleaning up build files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build


.PHONY: build
	