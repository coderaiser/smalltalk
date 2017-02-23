'use strict';

const test = require('tape');
const sinon = require('sinon');

const smalltalk = require('..');

test('smalltalk: alert', (t) => {
    before();
    
    const createElement = getCreateElement();
    global.document.createElement = createElement;
    
    smalltalk.alert('title', 'message')
    t.ok(createElement.calledWith('div'), 'alert should have been called with message');
    
    after();
    t.end();
});

function getCreateElement() {
    return sinon.stub().returns({
        querySelector: sinon.stub(),
        addEventListener: sinon.stub(),
    })
}

function before() {
    global.document = {
        createElement: getCreateElement(),
        body: {
            appendChild: sinon.stub()
        }
    };
}

function after() {
    delete global.document;
}
