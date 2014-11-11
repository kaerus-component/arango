NAME = arango
PKG_VER = `cat package.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`
COM_VER = `cat component.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`
PKG_INFO = `cat package.json | grep -e '"version"' -e '"description"' -e '"logo"'`
LICENSE = `cat LICENSE`

YUIDOC_THEME = node_modules/yuidoc-bootstrap-theme
BEAUTIFY = @./node_modules/.bin/js-beautify --config ./code.json
UGLIFYJS = @./node_modules/.bin/uglifyjs
KARMA = @./node_modules/karma/bin/karma
MOCHA = @./node_modules/mocha/bin/mocha
DUO = @./node_modules/.bin/duo

LIB=$(wildcard lib/*.js)
API=$(wildcard lib/api/*.js)
TEST=$(wildcard test/*.js)

build: node_modules component
	@echo "ArangoDB for nodejs v${PKG_VER} web-component v${COM_VER}"

node_modules:
	@echo "Installing node dependencies"
	@npm i -d

component: index.js
	@echo "Building web component"
	$(DUO) $< > build/build.js 

test-component: index.js
	@echo "Building test component"
	$(DUO) $< -g Arango --copy > build/test.js

test: test-nodejs

test-nodejs: node_modules
	@echo "Running tests for nodejs"
	$(MOCHA) --require should --reporter spec

test-browser: test-component
	@echo "Running tests for browser"
	$(KARMA) start ./test/karma/karma.conf.js

docs: yuidoc.json
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

dist: component
	@echo "Beautify -> dist/$(NAME)-$(COM_VER).js"
	$(UGLIFYJS) build/build.js --beautify --preamble "${LICENSE}" -o dist/$(NAME)-$(COM_VER).js
	@echo "Uglify -> dist/build-$(COM_VER)-min.js"
	$(UGLIFYJS) dist/$(NAME)-$(COM_VER).js --preamble "${LICENSE}" --source-map dist/$(NAME)-$(COM_VER)-min.map.js -o dist/$(NAME)-$(COM_VER)-min.js
	@echo "Compress -> dist/$(NAME)-$(COM_VER)-min.js.gz"
	@gzip -9 -kf dist/$(NAME)-$(COM_VER)-min.js
	@echo "Beautify -> dist/sa-$(NAME)-$(COM_VER).js"
	$(UGLIFYJS) build/$(NAME).js --preamble "${LICENSE}" --beautify -o dist/sa-$(NAME)-$(COM_VER).js
	@echo "Uglify -> build/$(NAME)-$(COM_VER)-min.js"
	$(UGLIFYJS) dist/sa-$(NAME)-$(COM_VER).js --preamble "${LICENSE}" --source-map dist/sa-$(NAME)-$(COM_VER)-min.map.js -o dist/sa-$(NAME)-$(COM_VER)-min.js
	@echo "Compress -> dist/sa-$(NAME)-$(COM_VER)-min.js.gz"
	@gzip -9 -kf dist/sa-$(NAME)-$(COM_VER)-min.js

Release: dist
	@git tag -a $(PKG_VER) -m "v$(PKG_VER)" -f
	@echo "You may now push this release with: git push --tags"

publish:
	@npm publish

.PHONY: build
