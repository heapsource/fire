# priest.js

priest.js is a programming language embedded in JSON as a set of special 'keys' which aims to make ridiculously easy the creation of Javascript objects from asynchronous sources in node.js.

The Runtime takes a JSON document and compiles it for asynchronous Javascript execution:

    JSON Document -> Deserialization -> Compilation to Javascript -> Execution

## More Info

+ [Tutorials](https://github.com/firebaseco/priest/wiki/Tutorials)

+ [Wiki](https://github.com/firebaseco/priest/wiki)

## FAQ

### Is it a replacement for Javascript in Node.js?

Definitely no. The goal of priest.js is to reuse "building blocks" so you can write node.js applications without dealing with the infamous *Javascript asynchronous spaghetti code*.

### Why JSON?

Because JSON Documents are a serialized representation of Javascript Objects. This makes it easier for the Runtime to understand and humans to edit.

### Why "priest"?

[here](http://en.wikipedia.org/wiki/Judas_Priest)... I was thinking of calling it "judas.js" but I rather keep Lady Gaga out of my mind(this is the part when you laugh).


## Cloning the Repository

    git clone https://github.com/firebaseco/priest.git


### Preparing your Development Environment and running the Tests

priest depends on [vows](http://vowsjs.org/) and other development tools, you can install all of them by simply running:

     make install-dev-dependencies

Once it's finished then you can run the tests:

    make run-tests

There is also:

    make remove-dev-dependencies

### Collaborating

* Johan (author). Email: *johan@firebase.co*, Skype: *thepumpkin1979*

## MIT License

Copyright (c) 2011 Firebase.co - http://www.firebase.co

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