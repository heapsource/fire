# priest.js

Currently in Development, stay tuned!

## Specifications v1.0

The specifications for version 1.0 are ready.

* [Messaging.v1.0](https://github.com/firebaseco/priest/blob/master/docs/specs/Messaging.v1.0.md)
* [Services.v1.0](https://github.com/firebaseco/priest/blob/master/docs/specs/Services.v1.0.md)
* [Transformations.v1.0](https://github.com/firebaseco/priest/blob/master/docs/specs/Transformations.v1.0.md)

## Contributing

1. Clone the Repository
2. Run the Tests
3. Read the Specifications all the specifications for the current version at docs/specs
4. Inspect the Source code at src
5. Send your patch to *johan@firebase.co*

### Collaborating

* Johan (author). Email: *johan@firebase.co*, Skype: *thepumpkin1979*

### Cloning the Repository

    git clone https://github.com/firebaseco/priest.git

### Preparing your Development Environment and running the Tests

priest depends on [vows](http://vowsjs.org/) and other development tools, you can install all of them by simply running:

     make install-dev-dependencies

Once it's finished then you can run the tests

    make run-tests

Or you can let [vows](http://vowsjs.org/) run the test automatically as you change them:

    run-tests-forever

### Cleaning your development Environment

By running `make install-dev-dependencies` you will create a bunch of crap inside node_modules that we don't really want to commit as part of your patches, so when you are ready to create the patch run the following command first:

    make remove-dev-dependencies


## Author
Johan Hernandez: johan@firebase.co

## License

Copyright (c) 2011 Firebase.co

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.