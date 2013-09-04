NAME = arango
TARGET = ./build

all: build

build: dependencies standalone
	@echo "Building component "
	@component build -v -o $(TARGET)

standalone: 
	@echo "Building standalone version"
	@component build -v -o $(TARGET) -n $(NAME)

dependencies:
	@component install -v	

test: node_modules
	@echo "Running tests for nodejs"
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec
	@echo "Running tests for browser"
	@./node_modules/mocha-phantomjs/bin/mocha-phantomjs test/runner.html

node_modules:
	@npm i -d

distclean:
	@echo "Cleaning upp files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build


.PHONY: all test
	