NAME = arango
PKG_VER = `cat package.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`
COM_VER = `cat component.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`
PKG_INFO = `cat package.json | grep -e '"version"' -e '"description"' -e '"logo"'`
YUIDOC_THEME = node_modules/yuidoc-bootstrap-theme
COMPONENT = @./node_modules/.bin/component
BEAUTIFY = @./node_modules/.bin/js-beautify --config ./code.json
UGLIFYJS = @./node_modules/.bin/uglifyjs
KARMA = @./node_modules/karma/bin/karma
MOCHA = @./node_modules/mocha/bin/mocha
LIB=$(wildcard lib/*.js)
API=$(wildcard lib/api/*.js)
TEST=$(wildcard test/*.js)
ARANGOPORT=8529

build: node_modules component
	@echo "ArangoDB for nodejs v${PKG_VER} web-component v${COM_VER}"

node_modules:
	@echo "Installing node dependencies"
	@npm i -d

component: components
	@echo "Building web component"
	$(COMPONENT) build 
	@echo "Building standalone web component"
	$(COMPONENT) build -n $(NAME) -s $(NAME)

components:
	@echo "Installing web-component dependencies"
	$(COMPONENT) install


test: test-nodejs test-browser

test-nodejs: node_modules
	@echo "Running tests for nodejs"
	$(MOCHA) --require should --reporter spec

test-browser: components component
	@echo "Running tests for browser"
	$(KARMA) start ./test/karma/karma.conf.js

docs: components component yuidoc.json
	@echo "Generating docs"
	@yuidoc -c yuidoc.json
	@rm yuidoc.json

yuidoc.json:
	@echo "{\n\"name\":\"$(NAME)\",\n${PKG_INFO},\n" \
	"\"options\":{\n  \"paths\":\"lib\",\n" \
	"  \"outdir\":\"documentation\",\n" \
	"  \"themedir\":\"$(YUIDOC_THEME)\",\n" \
	"  \"helpers\":[\"$(YUIDOC_THEME)/helpers/helpers.js\"]\n  }\n}" > yuidoc.json

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
