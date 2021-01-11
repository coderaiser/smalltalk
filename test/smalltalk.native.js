'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');

const smalltalk = require('../lib/smalltalk.native');

global.window = {};

test('smalltalk.native: Promise', (t) => {
    global.window.Promise = null;
    reload();
    t.pass('load with no Promise support');
    t.end();
});

test('smalltalk.native: alert', (t) => {
    const alert = stub();
    global.alert = alert;
    
    smalltalk.alert('title', 'message');
    t.calledWith(alert, ['message'], 'alert should have been called with message');
    t.end();
});

test('smalltalk.native: alert: result', (t) => {
    const alert = stub();
    global.alert = alert;
    
    smalltalk.alert('title', 'message').then(() => {
        t.pass('promise should have been resolved');
        t.end();
    }).catch((e) => {
        t.fail(`should not reject ${e.message}`);
        t.end();
    });
});

test('smalltalk.native: confirm', (t) => {
    const confirm = stub().returns(false);
    global.confirm = confirm;
    
    smalltalk.confirm('title', 'message')
        .catch(() => {
            t.calledWith(confirm, ['message'], 'confirm should have been called with message');
            t.end();
        });
});

test('smalltalk.native: confirm: result: ok', (t) => {
    const confirm = stub().returns(true);
    global.confirm = confirm;
    
    smalltalk.confirm('title', 'message').then(() => {
        t.pass('should resolve');
        t.end();
    }).catch((e) => {
        t.notOk(e, 'should not reject');
        t.end();
    });
});

test('smalltalk.native: confirm: result: cancel', (t) => {
    const confirm = stub().returns(false);
    global.confirm = confirm;
    
    smalltalk.confirm('title', 'message').then(() => {
        t.fail('should not resolve');
        t.end();
    }).catch((e) => {
        t.ok(e, 'should reject');
        t.end();
    });
});

test('smalltalk.native: confirm: options: cancel', (t) => {
    const confirm = stub().returns(false);
    global.confirm = confirm;
    
    const cancel = false;
    
    smalltalk.confirm('title', 'message', {cancel}).then(() => {
        t.fail('should not resolve');
        t.end();
    }).catch(() => {
        t.fail('should not reject');
        t.end();
    });
    
    t.pass('should do nothing');
    
    t.end();
});

test('smalltalk.native: prompt', (t) => {
    const prompt = stub();
    global.prompt = prompt;
    
    smalltalk.prompt('title', 'message', 'value');
    t.calledWith(prompt, ['message', 'value'], 'prompt should have been called with message');
    t.end();
});

test('smalltalk.native: prompt: result: ok', (t) => {
    const prompt = stub().returns('hello');
    global.prompt = prompt;
    
    smalltalk.prompt('title', 'message', 'value').then((value) => {
        t.equal(value, 'hello', 'should resolve value');
        t.end();
    }).catch((e) => {
        t.fail(`should not reject ${e.message}`);
        t.end();
    });
});

test('smalltalk.native: prompt: result: cancel', (t) => {
    const prompt = stub().returns(null);
    global.prompt = prompt;
    
    smalltalk.prompt('title', 'message', 'value').then(() => {
        t.fail('should not resolve');
        t.end();
    }).catch((e) => {
        t.ok(e, 'should reject');
        t.end();
    });
});

test('smalltalk.native: prompt: options: cancel', (t) => {
    const prompt = stub().returns(null);
    global.prompt = prompt;
    
    smalltalk.prompt('title', 'message', 'value', {
        cancel: false,
    }).then(() => {
        t.fail('should not resolve');
        t.end();
    }).catch((e) => {
        t.fail(`should not reject ${e.message}`);
        t.end();
    });
    
    t.pass('should do nothing');
    t.end();
});

function reload() {
    clean();
    return require('../lib/smalltalk.native');
}

function clean() {
    delete require.cache[require.resolve('../lib/smalltalk.native')];
}
