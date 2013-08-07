NAME = arango
dependencies = promise ajax urlparser base64

build: $(dependencies)
	@component build -v -n $(NAME)

$(dependencies):
	@component install kaerus-component/$@	

test: 
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec
	@./node_modules/mocha-phantomjs/bin/mocha-phantomjs test/runner.html

.PHONY: build test
	