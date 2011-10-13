all: run-tests

install-dev-dependencies:
	npm install vows

remove-dev-dependencies:
	npm uninstall vows

run-tests:
	node_modules/.bin/vows test/*.js

run-tests-spec:
	node_modules/.bin/vows test/*.js --spec

install-npm:
	npm install . -g
