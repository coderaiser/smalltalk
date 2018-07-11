'use strict';

const path = require('path');
const fs = require('fs');

require('css-modules-require-hook/preset');

const test = require('tape');
const sinon = require('sinon');
const currify = require('currify');
const wraptile = require('wraptile');

global.window = {};

const {UPDATE_FIXTURE} = process.env;
const isUpdateFixtures = UPDATE_FIXTURE === 'true' || UPDATE_FIXTURE === '1';
const noop = () => {};

const smalltalk = require('../lib/smalltalk');
const fixtureDir = path.join(__dirname, 'fixture');

const writeFixture = (name, data) => {
    return fs.writeFileSync(`${fixtureDir}/${name}.html`, data);
};

const readFixture = (name) => {
    const fn = () => fs.readFileSync(`${fixtureDir}/${name}.html`, 'utf8');
    fn.update = !isUpdateFixtures  ? noop : currify(writeFixture, name);
    return fn;
};

const fixture = {
    alert: readFixture('alert'),
    confirm: readFixture('confirm'),
    prompt: readFixture('prompt'),
    promptPassword: readFixture('prompt-password'),
    promptNoValue: readFixture('prompt-no-value'),
    alertCustomLabel: readFixture('alert-custom-label'),
    confirmCustomLabel: readFixture('confirm-custom-label'),
    promptCustomLabel: readFixture('prompt-custom-label')
};

test('smalltalk: alert: innerHTML', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.alert('title', 'hello\nworld');
    t.equal(fixture.alert(), el.innerHTML, 'should be equal');
    fixture.alert.update(el.innerHTML);
    
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
    
    after();
    
    t.equal(querySelector.args.pop().pop(), '.smalltalk', 'should find smalltalk');
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
    
    after();
    
    t.equal(parentElement.removeChild.args.pop().pop(), el, 'should find smalltalk');
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
    after();
    
    t.ok(event.stopPropagation.called, 'should call stopPropagation');
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
    after();
    
    t.ok(event.preventDefault.called, 'should call preventDefault');
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
    after();
    
    t.ok(event.preventDefault.called, 'should call preventDefault');
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
    
    after();
    
    t.ok(focus.called, 'should call focus');
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
    after();
    
    t.ok(focus.called, 'should call focus');
    t.end();
});

test('smalltalk: alert: custom label', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    const options = {
        buttons: {
            ok: 'Ok'
        }
    };
    
    smalltalk.alert('title', 'hello\nworld', options);
    after();
    
    fixture.alertCustomLabel.update(el.innerHTML);
    
    t.equal(fixture.alertCustomLabel(), el.innerHTML, 'should be equal');
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
    
    fixture.confirm.update(el.innerHTML);
    
    after();
    
    t.equal(fixture.confirm(), el.innerHTML, 'should be equal');
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
            after();
            t.pass('should reject');
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
    after();
    
    t.ok(focus.called, 'should call focus');
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
    after();
    
    t.ok(focus.called, 'should call focus');
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
            after();
            t.pass('should reject');
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

test('smalltalk: confirm: custom label', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    const options = {
        buttons: {
            ok: 'Ok',
            cancel: 'Logout',
        }
    };
    
    smalltalk.confirm('title', 'message', options);
    after();
    fixture.confirmCustomLabel.update(el.innerHTML);
    
    t.equal(fixture.confirmCustomLabel(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: prompt: innerHTML', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    smalltalk.prompt('title', 'message', 2);
    t.equal(fixture.prompt(), el.innerHTML, 'should be equal');
    fixture.prompt.update(el.innerHTML);
    
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
    
    smalltalk.prompt('title', 'message', '', {
        type: 'password'
    });
    
    fixture.promptPassword.update(el.innerHTML);
    after();
    
    t.equal(fixture.promptPassword(), el.innerHTML, 'should be equal');
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
    after();
    fixture.promptNoValue.update(el.innerHTML);
    
    t.equal(fixture.promptNoValue(), el.innerHTML, 'should be equal');
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
            after();
            t.equal(result, value, 'should return value');
            t.end();
        });
    
    const [, close] = ok.addEventListener.args.pop();
    
    close({
        target: ok
    });
});

test('smalltalk: prompt: click on cancel', (t) => {
    before();
    
    const dataName = (a) => `[data-name="js-${a}"]`;
    const noop = () => {};
    
    const value = 'hello';
    const input = {
        value,
        focus: noop,
        setSelectionRange: noop,
    };
    
    const cancel = {
        getAttribute: () => 'js-cancel',
        focus: sinon.stub(),
        addEventListener: sinon.stub(),
    };
    
    const querySelector = (a) => {
        if (a === dataName('input'))
            return input;
        
        if (a === dataName('cancel'))
            return cancel;
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
        .catch(() => {
            after();
            t.pass('should reject');
            t.end();
        });
    
    const [, close] = cancel.addEventListener.args.pop();
    
    close({
        target: cancel
    });
});

test('smalltalk: prompt: click on cancel: cancel false', (t) => {
    before();
    
    const dataName = (a) => `[data-name="js-${a}"]`;
    const noop = () => {};
    
    const value = 'hello';
    const input = {
        value,
        focus: noop,
        setSelectionRange: noop,
    };
    
    const cancel = {
        getAttribute: () => 'js-cancel',
        focus: sinon.stub(),
        addEventListener: sinon.stub(),
    };
    
    const querySelector = (a) => {
        if (a === dataName('input'))
            return input;
        
        if (a === dataName('cancel'))
            return cancel;
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
    
    const fail = t.fail.bind(t);
    const end = t.end.bind(t);
    
    smalltalk.prompt('title', 'message', value, {cancel: false})
        .then(wraptile(fail, 'should not pass'))
        .catch(wraptile(fail, 'should not reject'))
        .then(end);
     
    const [, close] = cancel.addEventListener.args.pop();
    
    close({
        target: cancel
    });
     
     t.pass('should do nothing');
     t.end();
     
     after();
});

test('smalltalk: prompt: click on cancel: options: no cancel', (t) => {
    before();
    
    const dataName = (a) => `[data-name="js-${a}"]`;
    const noop = () => {};
    
    const value = 'hello';
    const input = {
        value,
        focus: noop,
        setSelectionRange: noop,
    };
    
    const cancel = {
        getAttribute: () => 'js-cancel',
        focus: sinon.stub(),
        addEventListener: sinon.stub(),
    };
    
    const querySelector = (a) => {
        if (a === dataName('input'))
            return input;
        
        if (a === dataName('cancel'))
            return cancel;
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
    
    smalltalk.prompt('title', 'message', value, {})
        .catch(() => {
            after();
            t.pass('should reject');
            t.end();
        });
    
    const [, close] = cancel.addEventListener.args.pop();
    
    close({
        target: cancel
    });
});

test('smalltalk: prompt: custom label', (t) => {
    before();
    
    const el = {
        innerHTML: ''
    };
    
    const createElement = getCreateElement(el);
    global.document.createElement = createElement;
    
    const options = {
        buttons: {
            ok: 'Ok',
            cancel: 'Logout',
        },
    };
    
    smalltalk.prompt('title', 'message', 2, options);
    after();
    fixture.promptCustomLabel.update();
    
    t.equal(fixture.promptCustomLabel(), el.innerHTML, 'should be equal');
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

