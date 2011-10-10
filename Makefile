all: prepare-tests

install-dev-dependencies:
	npm install vows

remove-dev-dependencies:
	npm uninstall vows

run-tests: test/*.js
	node_modules/.bin/vows test/*.js

run-tests-spec: test/*.js
	node_modules/.bin/vows test/*.js --spec

install-npm:
	npm install . -g
