'use strict';

const path = require('path');
const fs = require('fs');

const test = require('tape');
const sinon = require('sinon');

const smalltalk = require('..');
const fixtureDir = path.join(__dirname, 'fixture');
const readFixture = (name) => {
    return fs.readFileSync(`${fixtureDir}/${name}.html`, 'utf8');
};

const fixture = {
    alert: readFixture('alert'),
    confirm: readFixture('confirm'),
    prompt: readFixture('prompt'),
};

test('smalltalk: alert: innerHTML', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.alert('title', 'message');
    t.equal(fixture.alert, el.innerHTML, 'should be equal');
    
    after();
    t.end();
});

test('smalltalk: alert: appendChild', (t) => {
    before();
    
    const el = {
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.alert('title', 'message');
    t.ok(document.body.appendChild.calledWith(el), 'should append el');
    
    after();
    t.end();
});

test('smalltalk: alert: click', (t) => {
    before();
    
    const el = {
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        }
    };
    
    const ok = {
        focus: sinon.stub(),
        addEventListener: sinon.stub(),
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.alert('title', 'message');
    t.equal(ok.addEventListener.args.pop()[0], 'click', 'should set click listener');
    
    after();
    t.end();
});

test('smalltalk: alert: close: querySelector', (t) => {
    before();
    
    const el = {
        parentElement: {
            removeChild: () => {}
        },
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        }
    };
    
    const ok = {
        getAttribute: () => 'js-ok',
        focus: sinon.stub(),
        addEventListener: sinon.stub(),
    };
    
    const createElement = getCreateElement(el);
    document.createElement = createElement;
    
    const querySelector = sinon.stub().returns(el);
    document.querySelector = querySelector;
    
    smalltalk.alert('title', 'message');
    
    const [, close] = ok.addEventListener.args.pop();
    
    close({
        target: ok
    });
    
    t.equal(querySelector.args.pop().pop(), '.smalltalk', 'should find smalltalk');
    
    after();
    t.end();
});

test('smalltalk: alert: close: remove', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        }
    };
    
    const ok = {
        getAttribute: () => 'js-ok',
        focus: sinon.stub(),
        addEventListener: sinon.stub(),
    };
    
    const createElement = getCreateElement(el);
    document.createElement = createElement;
    
    const querySelector = sinon.stub().returns(el);
    document.querySelector = querySelector;
    
    smalltalk.alert('title', 'message');
    
    const [, close] = ok.addEventListener.args.pop();
    
    close({
        target: ok
    });
    
    t.equal(parentElement.removeChild.args.pop().pop(), el, 'should find smalltalk');
    
    after();
    t.end();
});

test('smalltalk: confirm: innerHTML', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.confirm('title', 'message');
    t.equal(fixture.confirm, el.innerHTML, 'should be equal');
    
    after();
    t.end();
});

test('smalltalk: confirm: click on close', (t) => {
    before();
    
    const el = {
        parentElement: {
            removeChild: () => {}
        },
        querySelector: (a) => {
            if (a === '[data-name="js-close"]')
                return closeButton;
        }
    };
    
    const closeButton= {
        getAttribute: () => 'js-close',
        focus: sinon.stub(),
        addEventListener: sinon.stub(),
    };
    
    const createElement = getCreateElement(el);
    document.createElement = createElement;
    
    const querySelector = sinon.stub().returns(el);
    document.querySelector = querySelector;
    
    smalltalk.confirm('title', 'message')
        .catch(() => {
            t.pass('should reject');
            after();
            t.end();
        });
    
    const [, close] = closeButton.addEventListener.args.pop();
    
    close({
        target: closeButton
    });
});


test('smalltalk: prompt: innerHTML', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.prompt('title', 'message');
    t.equal(fixture.prompt, el.innerHTML, 'should be equal');
    
    after();
    t.end();
});

function getCreateElement(el = {}) {
    const querySelector = sinon.stub();
    const addEventListener = sinon.stub();
    
    if (!el.querySelector)
        el.querySelector = querySelector;
    
    if (!el.addEventListener)
        el.addEventListener = addEventListener;

    return sinon.stub().returns(el);
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

