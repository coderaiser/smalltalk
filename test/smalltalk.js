'use strict';

const path = require('path');
const fs = require('fs');

const test = require('tape');
const sinon = require('sinon');

global.window = {};

const smalltalk = require('..');
const fixtureDir = path.join(__dirname, 'fixture');
const readFixture = (name) => {
    return fs.readFileSync(`${fixtureDir}/${name}.html`, 'utf8');
};

const fixture = {
    alert: readFixture('alert'),
    confirm: readFixture('confirm'),
    prompt: readFixture('prompt'),
    promptPassword: readFixture('prompt.password'),
    promptNoValue: readFixture('prompt.no-value'),
};

test('smalltalk: alert: innerHTML', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.alert('title', 'hello\nworld');
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

test('smalltalk: alert: keydown: stopPropagation', (t) => {
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
    
    const [, keydown] = el.addEventListener.args.filter(([event]) => {
        return event === 'keydown';
    }).pop();
    
    const event = {
        stopPropagation: sinon.stub()
    };
    
    keydown(event);
    
    t.ok(event.stopPropagation.called, 'should call stopPropagation');
    
    after();
    t.end();
});

test('smalltalk: alert: keydown: tab: preventDefault', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok'
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
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const TAB = 9;
    
    const event = {
        keyCode: TAB,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(event.preventDefault.called, 'should call preventDefault');
    
    after();
    t.end();
});

test('smalltalk: alert: keydown: tab: active name', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok'
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
    document.activeElement = ok;
    
    smalltalk.alert('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const TAB = 9;
    
    const event = {
        keyCode: TAB,
        shiftKey: true,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(event.preventDefault.called, 'should call preventDefault');
    
    after();
    t.end();
});

test('smalltalk: alert: keydown: left: focus', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok'
    };
    
    const focus = sinon.stub();
    const ok = {
        focus,
        getAttribute: () => 'js-ok',
        addEventListener: sinon.stub(),
    };
    
    const createElement = getCreateElement(el);
    document.createElement = createElement;
    
    const querySelector = sinon.stub().returns(el);
    document.querySelector = querySelector;
    
    smalltalk.alert('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const LEFT = 37;
    
    const event = {
        keyCode: LEFT,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(focus.called, 'should call focus');
    
    after();
    t.end();
});

test('smalltalk: alert: click', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok'
    };
    
    const focus = sinon.stub();
    const ok = {
        focus,
        getAttribute: () => 'js-ok',
        addEventListener: sinon.stub(),
    };
    
    const createElement = getCreateElement(el);
    document.createElement = createElement;
    
    const querySelector = sinon.stub().returns(el);
    document.querySelector = querySelector;
    
    smalltalk.alert('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'click')
        .pop();
    
    const event = {
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(focus.called, 'should call focus');
    
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
    
    const closeButton = {
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

test('smalltalk: confirm: keydown: left: active name', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-cancel"]')
                return cancel;
            
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok'
    };
    
    const focus = sinon.stub();
    const ok = {
        focus,
        getAttribute: () => 'js-ok',
        addEventListener: sinon.stub(),
    };
    
    const cancel = {
        focus,
        getAttribute: () => 'js-cancel',
        addEventListener: sinon.stub(),
    };
    
    const createElement = getCreateElement(el);
    document.createElement = createElement;
    
    const querySelector = sinon.stub().returns(el);
    document.querySelector = querySelector;
    document.activeElement = ok;
    
    smalltalk.confirm('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const LEFT = 37;
    
    const event = {
        keyCode: LEFT,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(focus.called, 'should call focus');
    
    after();
    t.end();
});

test('smalltalk: confirm: keydown: left: active name: cancel', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-cancel"]')
                return cancel;
            
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok'
    };
    
    const focus = sinon.stub();
    const ok = {
        focus,
        getAttribute: () => 'js-ok',
        addEventListener: sinon.stub(),
    };
    
    const cancel = {
        focus,
        getAttribute: () => 'js-cancel',
        addEventListener: sinon.stub(),
    };
    
    const createElement = getCreateElement(el);
    document.createElement = createElement;
    
    const querySelector = sinon.stub().returns(el);
    document.querySelector = querySelector;
    document.activeElement = cancel;
    
    smalltalk.confirm('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const LEFT = 37;
    
    const event = {
        keyCode: LEFT,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(focus.called, 'should call focus');
    
    after();
    t.end();
});

test('smalltalk: confirm: keydown: esc: reject', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok'
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
    
    smalltalk.confirm('title', 'message')
        .catch(() => {
            t.pass('should reject');
            after();
            t.end();
        });
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const ESC = 27;
    
    const event = {
        keyCode: ESC,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
        target: el,
    };
    
    keydown(event);
});

test('smalltalk: confirm: keydown: enter', (t) => {
    before();
    
    const parentElement = {
        removeChild: sinon.stub()
    };
    
    const el = {
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok'
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
    
    smalltalk.confirm('title', 'message')
        .then(() => {
            t.pass('should resolve');
            after();
            t.end();
        });
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const ENTER = 13;
    
    const event = {
        keyCode: ENTER,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
        target: el,
    };
    
    keydown(event);
});

test('smalltalk: prompt: innerHTML', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.prompt('title', 'message', 2);
    t.equal(fixture.prompt, el.innerHTML, 'should be equal');
    
    after();
    t.end();
});

test('smalltalk: prompt: password', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.prompt('title', 'message', 2, { password: true });
    t.equal(fixture.promptPassword, el.innerHTML, 'should be equal');
    
    after();
    t.end();
});

test('smalltalk: prompt: no value', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.prompt('title', 'message');
    t.equal(fixture.promptNoValue, el.innerHTML, 'should be equal');
    
    after();
    t.end();
});

test('smalltalk: prompt: click on ok', (t) => {
    before();
    
    const dataName = (a) => `[data-name="js-${a}"]`;
    const noop = () => {};
    
    const value = 'hello';
    const input = {
        value,
        focus: noop,
        setSelectionRange: noop,
    };
    
    const ok = {
        getAttribute: () => 'js-ok',
        focus: sinon.stub(),
        addEventListener: sinon.stub(),
    };
    
    const querySelector = (a) => {
        if (a === dataName('input'))
            return input;
        
        if (a === dataName('ok'))
            return ok;
    };
    
    const el = {
        querySelector,
        parentElement: {
            removeChild: () => {}
        },
    };
    
    const createElement = getCreateElement(el);
    document.createElement = createElement;
    
    document.querySelector = () => el;
    
    smalltalk.prompt('title', 'message', value)
        .then((result) => {
            t.equal(result, value, 'should return value');
            after();
            t.end();
        });
    
    const [, close] = ok.addEventListener.args.pop();
    
    close({
        target: ok
    });
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
        activeElement: {
            getAttribute: () => ''
        },
        createElement: getCreateElement(),
        body: {
            appendChild: sinon.stub()
        }
    };
}

function after() {
    delete global.document;
}

