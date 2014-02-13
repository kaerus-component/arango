NAME = arango
PKG_VER = `cat package.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`
COM_VER = `cat component.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`
COMPONENT = @./node_modules/.bin/component
BEAUTIFY = @./node_modules/.bin/js-beautify --config ./code.json
UGLIFYJS = @./node_modules/.bin/uglifyjs
KARMA = @./node_modules/.bin/karma
MOCHA = @./node_modules/.bin/mocha
LIB=$(wildcard lib/*.js)
API=$(wildcard lib/api/*.js)
TEST=$(wildcard test/*.js)
ARANGOPORT=8529

build: dependencies component

component: 
	@echo "Building web component"
	$(COMPONENT) build -v
	@echo "Building standalone web component"
	$(COMPONENT) build -v -n $(NAME) -s $(NAME)

dependencies: node_modules components

node_modules:
	@echo "Installing v$(PKG_VER) node dependencies"
	@npm i -d

components:
	@echo "Installing v$(COM_VER) component dependencies"
	$(COMPONENT) install -v


.PHONY: test
test:
	$(MAKE) test-browser ARANGOPORT=$(ARANGOPORT)
	$(MAKE) test-nodejs ARANGOPORT=$(ARANGOPORT)

.PHONY: test-nodejs
test-nodejs: node_modules
	@echo "(function () {if (typeof window !== 'undefined') {window.port = $(ARANGOPORT);} else {exports.port = $(ARANGOPORT);}}());"  > test/port.js
	@echo "Running tests for nodejs"
	$(MOCHA) --require should --reporter spec
	@rm test/port.js


.PHONY: test-browser
test-browser: components component
	@echo "Running tests for browser"
	@npm i karma
	@npm i karma-chai
	@npm i karma-mocha
	@echo "(function () {if (window) {window.port = $(ARANGOPORT);} else {exports.port = $(ARANGOPORT);}}());"  > test/port.js
	$(KARMA) start --browsers Firefox test/karma/karma.conf.js
	$(KARMA) start --browsers Chrome test/karma/karma.conf.js
	@rm test/port.js


docs: components component
	@echo "Generating docs"
	@yuidoc -o ./documentation lib/ -t yuidoctheme
	@cp -a yuidoctheme/layouts documentation

distclean:
	@echo "Cleaning up build files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build
	@rm -rf ./documentation

beautify: $(TEST) $(API) $(LIB)
	$(BEAUTIFY) -r $^ 

uglify: component
	$(UGLIFYJS) ./build/$(NAME).js > $(NAME)-$(COM_VER)-min.js

release: component uglify
	@cp ./build/$(NAME).js $(NAME)-$(COM_VER).js
	@git tag -a $(PKG_VER) -m "v$(PKG_VER)" -f
	@echo "You may now push this release with: git push --tags"

publish:
	@npm publish

.PHONY: build
	