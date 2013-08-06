NAME = arango
dependencies = promise ajax url base64

build: $(dependencies)
	@component build -v -n $(NAME)

$(dependencies):
	@component install kaerus-component/$@	

test: 
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec

.PHONY: build test
	