all: run-tests

run-tests:
	node_modules/.bin/vows test/*.js

run-tests-spec:
	node_modules/.bin/vows test/*.js --spec

install-npm:
	npm install . -g

travis: run-tests-spec
