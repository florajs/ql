ifdef SystemRoot
	WINDOWS = 1
endif

ifdef WINDOWS
	NODE = node
else
	NODE = /opt/nodejs/stable/bin/node
endif

NODE_ENV=production

test:
	@$(NODE) $(CURDIR)/node_modules/mocha/bin/mocha --reporter list

.PHONY: test