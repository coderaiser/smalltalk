'use strict';

const path = require('path');
const fs = require('fs');

require('css-modules-require-hook/preset');

const autoGlobals = require('auto-globals');
const tape = require('supertape');
const stub = require('@cloudcmd/stub');
const currify = require('currify');
const wraptile = require('wraptile');

global.window = {};

const {UPDATE_FIXTURE} = process.env;

const smalltalk = require('../lib/smalltalk');
const noop = () => {};
const isUpdateFixtures = UPDATE_FIXTURE === 'true' || UPDATE_FIXTURE === '1';
const {create} = autoGlobals;
const test = autoGlobals(tape);
const fixtureDir = path.join(__dirname, 'fixture');

const writeFixture = (name, data) => {
    return fs.writeFileSync(`${fixtureDir}/${name}.html`, data);
};

const readFixture = (name) => {
    const fn = () => fs.readFileSync(`${fixtureDir}/${name}.html`, 'utf8');
    fn.update = !isUpdateFixtures ? noop : currify(writeFixture, name);
    
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
    promptCustomLabel: readFixture('prompt-custom-label'),
    progress: readFixture('progress'),
};

test('smalltalk: alert: innerHTML', (t, {document}) => {
    const {createElement} = document;
    const el = create();
    
    createElement.returns(el);
    
    smalltalk.alert('title', 'hello\nworld');
    fixture.alert.update(el.innerHTML);
    
    t.equal(fixture.alert(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: alert: appendChild', (t, {document}) => {
    const {createElement} = document;
    const el = create();
    
    createElement.returns(el);
    
    smalltalk.alert('title', 'message');
    
    t.calledWith(document.body.appendChild, [el], 'should append el');
    t.end();
});

test('smalltalk: alert: click', (t, {document}) => {
    const {createElement} = document;
    const el = {
        ...create(),
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
    };
    
    const ok = {
        focus: stub(),
        addEventListener: stub(),
    };
    
    createElement.returns(el);
    smalltalk.alert('title', 'message');
    
    t.equal(ok.addEventListener.args.pop()[0], 'click', 'should set click listener');
    t.end();
});

test('smalltalk: alert: close: remove', (t, {document}) => {
    const parentElement = create();
    const {
        createElement,
        querySelector,
    } = document;
    
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
    };
    
    const ok = {
        getAttribute: () => 'js-ok',
        focus: stub(),
        addEventListener: stub(),
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.alert('title', 'message');
    
    const [, close] = ok.addEventListener.args.pop();
    
    close({
        target: ok,
    });
    
    t.equal(parentElement.removeChild.args.pop().pop(), el, 'should find smalltalk');
    t.end();
});

test('smalltalk: alert: keydown: stopPropagation', (t, {document}) => {
    const {
        createElement,
        querySelector,
    } = document;
    
    const parentElement = create();
    
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
    };
    
    const ok = {
        getAttribute: () => 'js-ok',
        focus: stub(),
        addEventListener: stub(),
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.alert('title', 'message');
    
    const [, keydown] = el.addEventListener.args.filter(([event]) => event === 'keydown').pop();
    
    const event = {
        stopPropagation: stub(),
    };
    
    keydown(event);
    
    t.ok(event.stopPropagation.called, 'should call stopPropagation');
    t.end();
});

test('smalltalk: alert: click: stopPropagation: called', (t, {document}) => {
    const {
        createElement,
        querySelector,
    } = document;
    
    const parentElement = create();
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
    };
    
    const ok = {
        getAttribute: () => 'js-ok',
        focus: stub(),
        addEventListener: stub(),
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.alert('title', 'message');
    
    const [, click] = el.addEventListener.args.filter((a) => {
        const [event] = a;
        return event === 'click';
    }).pop();
    
    const event = {
        stopPropagation: stub(),
    };
    
    click(event);
    
    t.ok(event.stopPropagation.called, 'should call stopPropagation');
    t.end();
});

test('smalltalk: alert: keydown: tab: preventDefault', (t, {document}) => {
    const {
        createElement,
        querySelector,
        activeElement,
    } = document;
    
    const parentElement = create();
    
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
    };
    
    activeElement.getAttribute.returns('');
    
    const ok = {
        ...create(),
        getAttribute: () => 'js-ok',
        focus: stub(),
        addEventListener: stub(),
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.alert('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const TAB = 9;
    
    const event = {
        keyCode: TAB,
        preventDefault: stub(),
        stopPropagation: stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(event.preventDefault.called, 'should call preventDefault');
    t.end();
});

test('smalltalk: alert: keydown: tab: active name', (t, {document}) => {
    const {
        createElement,
        querySelector,
        activeElement,
    } = document;
    
    const parentElement = create();
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return activeElement;
        },
        getAttribute: () => 'js-ok',
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    activeElement.getAttribute.returns('js-ok');
    
    smalltalk.alert('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const TAB = 9;
    
    const event = {
        keyCode: TAB,
        shiftKey: true,
        preventDefault: stub(),
        stopPropagation: stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(event.preventDefault.called, 'should call preventDefault');
    t.end();
});

test('smalltalk: alert: keydown: left: focus', (t) => {
    const {
        createElement,
        querySelector,
        activeElement,
    } = document;
    
    const parentElement = create();
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok',
    };
    
    const ok = {
        ...create(),
        getAttribute: () => 'js-ok',
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    activeElement.getAttribute.returns('');
    
    smalltalk.alert('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const LEFT = 37;
    
    const event = {
        keyCode: LEFT,
        preventDefault: stub(),
        stopPropagation: stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(ok.focus.called, 'should call focus');
    t.end();
});

test('smalltalk: alert: click: focus', (t, {document}) => {
    const {
        createElement,
        querySelector,
    } = document;
    
    const parentElement = create();
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok',
    };
    
    const ok = {
        ...create(),
        getAttribute: () => 'js-ok',
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.alert('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'click')
        .pop();
    
    const event = {
        preventDefault: stub(),
        stopPropagation: stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(ok.focus.called, 'should call focus');
    t.end();
});

test('smalltalk: alert: custom label', (t) => {
    const {createElement} = document;
    
    const el = {
        ...create(),
        innerHTML: '',
    };
    
    createElement.returns(el);
    
    const options = {
        buttons: {
            ok: 'Ok',
        },
    };
    
    smalltalk.alert('title', 'hello\nworld', options);
    
    fixture.alertCustomLabel.update(el.innerHTML);
    
    t.equal(fixture.alertCustomLabel(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: confirm: innerHTML', (t) => {
    const {createElement} = document;
    
    const el = create();
    
    createElement.returns(el);
    
    smalltalk.confirm('title', 'message');
    
    fixture.confirm.update(el.innerHTML);
    
    t.equal(fixture.confirm(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: confirm: click on close', (t) => {
    const el = {
        ...create(),
        parentElement: create(),
        querySelector: (a) => {
            if (a === '[data-name="js-close"]')
                return closeButton;
        },
    };
    
    const closeButton = {
        ...create(),
        getAttribute: () => 'js-close',
    };
    
    document.createElement.returns(el);
    document.querySelector.returns(el);
    
    smalltalk.confirm('title', 'message')
        .catch((e) => {
            t.ok(e, 'should reject');
            t.end();
        });
    
    const [, close] = closeButton.addEventListener.args.pop();
    
    close({
        target: closeButton,
    });
});

test('smalltalk: confirm: keydown: left: active name', (t, {document}) => {
    const parentElement = create();
    const {
        activeElement,
        createElement,
        querySelector,
    } = document;
    
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-cancel"]')
                return cancel;
            
            if (a === '[data-name="js-ok"]')
                return activeElement;
        },
        getAttribute: () => 'js-ok',
    };
    
    activeElement.getAttribute.returns('js-ok');
    
    const cancel = {
        ...create(),
        getAttribute: () => 'js-cancel',
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.confirm('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const LEFT = 37;
    
    const event = {
        keyCode: LEFT,
        preventDefault: stub(),
        stopPropagation: stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(cancel.focus.called, 'should call focus');
    t.end();
});

test('smalltalk: confirm: keydown: left: active name: cancel', (t, {document}) => {
    const parentElement = create();
    const {
        createElement,
        querySelector,
        activeElement,
    } = document;
    
    activeElement.getAttribute.returns('js-cancel');
    
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-cancel"]')
                return cancel;
            
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok',
    };
    
    const ok = {
        ...create(),
        getAttribute: () => 'js-ok',
        addEventListener: stub(),
    };
    
    const cancel = {
        ...create(),
        getAttribute: () => 'js-cancel',
        addEventListener: stub(),
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.confirm('title', 'message');
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const LEFT = 37;
    
    const event = {
        keyCode: LEFT,
        preventDefault: stub(),
        stopPropagation: stub(),
        target: el,
    };
    
    keydown(event);
    
    t.ok(ok.focus.called, 'should call focus');
    t.end();
});

test('smalltalk: confirm: keydown: esc: reject', (t, {document}) => {
    const parentElement = create();
    const {
        createElement,
        querySelector,
    } = document;
    
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok',
    };
    
    const ok = {
        ...create(),
        getAttribute: () => 'js-ok',
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.confirm('title', 'message')
        .catch((e) => {
            t.ok(e, 'should reject');
            t.end();
        });
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const ESC = 27;
    
    const event = {
        keyCode: ESC,
        preventDefault: stub(),
        stopPropagation: stub(),
        target: el,
    };
    
    keydown(event);
});

test('smalltalk: confirm: keydown: enter', (t, {document}) => {
    const parentElement = create();
    const {
        createElement,
        querySelector,
    } = document;
    
    const el = {
        ...create(),
        parentElement,
        querySelector: (a) => {
            if (a === '[data-name="js-ok"]')
                return ok;
        },
        getAttribute: () => 'js-ok',
    };
    
    const ok = {
        ...create(),
        getAttribute: () => 'js-ok',
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.confirm('title', 'message')
        .then(() => {
            t.pass('should resolve');
            t.end();
        });
    
    const [, keydown] = el.addEventListener.args
        .filter(([event]) => event === 'keydown')
        .pop();
    
    const ENTER = 13;
    
    const event = {
        keyCode: ENTER,
        preventDefault: stub(),
        stopPropagation: stub(),
        target: el,
    };
    
    keydown(event);
});

test('smalltalk: confirm: custom label', (t, {document}) => {
    const {createElement} = document;
    
    const el = create();
    
    createElement.returns(el);
    
    const options = {
        buttons: {
            ok: 'Ok',
            cancel: 'Logout',
        },
    };
    
    smalltalk.confirm('title', 'message', options);
    fixture.confirmCustomLabel.update(el.innerHTML);
    
    t.equal(fixture.confirmCustomLabel(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: prompt: innerHTML', (t, {document}) => {
    const el = create();
    const {createElement} = document;
    
    createElement.returns(el);
    
    smalltalk.prompt('title', 'message', 2);
    fixture.prompt.update(el.innerHTML);
    
    t.equal(fixture.prompt(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: prompt: password', (t, {document}) => {
    const el = create();
    const {createElement} = document;
    
    createElement.returns(el);
    
    smalltalk.prompt('title', 'message', '', {
        type: 'password',
    });
    
    fixture.promptPassword.update(el.innerHTML);
    
    t.equal(fixture.promptPassword(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: prompt: no value', (t, {document}) => {
    const el = create();
    const {createElement} = document;
    
    createElement.returns(el);
    
    smalltalk.prompt('title', 'message');
    fixture.promptNoValue.update(el.innerHTML);
    
    t.equal(fixture.promptNoValue(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: prompt: click on ok', (t, {document}) => {
    const {
        createElement,
        querySelector,
    } = document;
    
    const dataName = (a) => `[data-name="js-${a}"]`;
    
    const value = 'hello';
    const input = {
        ...create(),
        value,
    };
    
    const ok = {
        ...create(),
        getAttribute: () => 'js-ok',
    };
    
    const el = {
        ...create(),
        parentElement: create(),
        querySelector: (a) => {
            if (a === dataName('input'))
                return input;
            
            if (a === dataName('ok'))
                return ok;
        },
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.prompt('title', 'message', value)
        .then((result) => {
            t.equal(result, value, 'should return value');
            t.end();
        });
    
    const [, close] = ok.addEventListener.args.pop();
    
    close({
        target: ok,
    });
});

test('smalltalk: prompt: click on cancel', (t, {document}) => {
    const dataName = (a) => `[data-name="js-${a}"]`;
    const {
        createElement,
        querySelector,
    } = document;
    
    const value = 'hello';
    const input = {
        ...create(),
        value,
    };
    
    const cancel = {
        ...create(),
        getAttribute: () => 'js-cancel',
    };
    
    const el = {
        ...create(),
        parentElement: create(),
        querySelector: (a) => {
            if (a === dataName('input'))
                return input;
            
            if (a === dataName('cancel'))
                return cancel;
        },
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.prompt('title', 'message', value)
        .catch((e) => {
            t.ok(e, 'should reject');
            t.end();
        });
    
    const [, close] = cancel.addEventListener.args.pop();
    
    close({
        target: cancel,
    });
});

test('smalltalk: prompt: click on cancel: cancel false', (t, {document}) => {
    const dataName = (a) => `[data-name="js-${a}"]`;
    const {
        createElement,
        querySelector,
    } = document;
    
    const value = 'hello';
    const input = {
        ...create(),
        value,
    };
    
    const cancel = {
        ...create(),
        getAttribute: () => 'js-cancel',
    };
    
    const el = {
        ...create(),
        parentElement: create(),
        querySelector: (a) => {
            if (a === dataName('input'))
                return input;
            
            if (a === dataName('cancel'))
                return cancel;
        },
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    const fail = t.fail.bind(t);
    const end = t.end.bind(t);
    
    smalltalk.prompt('title', 'message', value, {cancel: false})
        .then(wraptile(fail, 'should not pass'))
        .catch(wraptile(fail, 'should not reject'))
        .then(end);
    
    const [, close] = cancel.addEventListener.args.pop();
    
    close({
        target: cancel,
    });
    
    t.pass('should do nothing');
    t.end();
});

test('smalltalk: prompt: click on cancel: options: no cancel', (t, {document}) => {
    const dataName = (a) => `[data-name="js-${a}"]`;
    const {
        createElement,
        querySelector,
    } = document;
    
    const value = 'hello';
    const input = {
        ...create(),
        value,
    };
    
    const cancel = {
        ...create(),
        getAttribute: () => 'js-cancel',
    };
    
    const el = {
        ...create(),
        parentElement: create(),
        querySelector: (a) => {
            if (a === dataName('input'))
                return input;
            
            if (a === dataName('cancel'))
                return cancel;
        },
    };
    
    createElement.returns(el);
    querySelector.returns(el);
    
    smalltalk.prompt('title', 'message', value, {})
        .catch((e) => {
            t.ok(e, 'should reject');
            t.end();
        });
    
    const [, close] = cancel.addEventListener.args.pop();
    
    close({
        target: cancel,
    });
});

test('smalltalk: prompt: custom label', (t, {document}) => {
    const el = create();
    
    document.createElement.returns(el);
    
    const options = {
        buttons: {
            ok: 'Ok',
            cancel: 'Logout',
        },
    };
    
    smalltalk.prompt('title', 'message', 2, options);
    fixture.promptCustomLabel.update();
    
    t.equal(fixture.promptCustomLabel(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: progress: innerHTML', (t, {document}) => {
    const {createElement} = document;
    const el = create();
    
    createElement.returns(el);
    
    smalltalk.progress('title', 'hello\nworld');
    fixture.progress.update(el.innerHTML);
    
    t.equal(fixture.progress(), el.innerHTML, 'should be equal');
    t.end();
});

test('smalltalk: progress: setProgress', (t, {document}) => {
    const valueEl = create();
    
    const {createElement} = document;
    const el = create();
    
    el.querySelector.returns(valueEl);
    createElement.returns(el);
    
    const progress = smalltalk.progress('title', 'hello\nworld');
    
    progress.setProgress(10);
    
    t.equal();
    t.end();
});

test('smalltalk: progress: setProgress: 100', (t, {document}) => {
    const valueEl = create();
    valueEl.parentElement = create();
    
    document.querySelector.returns(valueEl);
    
    const {createElement} = document;
    const el = create();
    
    el.querySelector.returns(valueEl);
    createElement.returns(el);
    
    const progress = smalltalk.progress('title', 'hello\nworld');
    
    progress.setProgress(100);
    
    t.equal();
    t.end();
});

test('smalltalk: progress: remove', (t, {document}) => {
    const valueEl = create();
    valueEl.parentElement = create();
    
    document.querySelector.returns(valueEl);
    
    const {createElement} = document;
    const el = create();
    const removeChild = stub();
    
    el.querySelector.returns(valueEl);
    createElement.returns(el);
    el.parentElement = {};
    el.parentElement.removeChild = removeChild;
    
    const progress = smalltalk.progress('title', 'hello\nworld');
    
    progress.remove();
    
    t.calledWith(removeChild, [el], 'should call removeChild');
    t.end();
});

