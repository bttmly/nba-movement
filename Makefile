.PHONY: test

test:
	./node_modules/.bin/mocha --recursive --timeout 60000 ./test/setup.js ./test

coverage:
	./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --recursive ./test/setup.js ./test

lint:
	./node_modules/.bin/eslint ./src

build:
	rm -rf ./lib
	./node_modules/.bin/babel src --out-dir lib --stage 0

demo:
	./node_modules/.bin/babel-node ./example/demo.js