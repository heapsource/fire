all: prepare-tests

install-dev-dependencies:
	npm install vows

remove-dev-dependencies:
	npm uninstall vows

run-tests:
	node_modules/.bin/vows test/*.js

run-tests-forever:
	node_modules/.bin/vows -w test/*.js