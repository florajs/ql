ifdef SystemRoot
	WINDOWS = 1
endif

ifdef WINDOWS
	NODE = node
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Darwin)
		NODE = node
	else
		NODE = node
	endif
endif

NODE_ENV=production

test:
	@$(NODE) $(CURDIR)/node_modules/mocha/bin/mocha --reporter list

.PHONY: test