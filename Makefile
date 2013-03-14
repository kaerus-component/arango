NAME = arango
dependencies = promise ajax url base64

build: $(dependencies)
	@component build -v -n $(NAME)

$(dependencies):
	@component install kaerus-component/$@	

.PHONY: build
	