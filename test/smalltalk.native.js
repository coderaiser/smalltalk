'use strict';

const {
    test,
    stub,
} = require('supertape');

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
    global.alert = stub();
    
    smalltalk.alert('title', 'message').then(() => {
        t.pass('promise should have been resolved');
        t.end();
    })
        .catch((e) => {
            t.fail(`should not reject ${e.message}`);
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
    global.confirm = stub().returns(true);
    
    smalltalk.confirm('title', 'message').then(() => {
        t.pass('should resolve');
        t.end();
    })
        .catch((e) => {
            t.notOk(e, 'should not reject');
        });
});

test('smalltalk.native: confirm: result: cancel', (t) => {
    global.confirm = stub().returns(false);
    
    smalltalk.confirm('title', 'message').then(() => {
        t.fail('should not resolve');
        t.end();
    })
        .catch((e) => {
            t.ok(e, 'should reject');
        });
});

test('smalltalk.native: confirm: options: cancel', (t) => {
    global.confirm = stub().returns(false);
    
    const cancel = false;
    
    smalltalk.confirm('title', 'message', {cancel}).then(() => {
        t.fail('should not resolve');
        t.end();
    })
        .catch(() => {
            t.fail('should not reject');
        });
    
    t.pass('should do nothing');
});

test('smalltalk.native: prompt', (t) => {
    const prompt = stub();
    global.prompt = prompt;
    
    smalltalk.prompt('title', 'message', 'value');
    
    t.calledWith(prompt, ['message', 'value'], 'prompt should have been called with message');
    t.end();
});

test('smalltalk.native: prompt: result: ok', (t) => {
    global.prompt = stub().returns('hello');
    
    smalltalk.prompt('title', 'message', 'value').then((value) => {
        t.equal(value, 'hello', 'should resolve value');
        t.end();
    })
        .catch((e) => {
            t.fail(`should not reject ${e.message}`);
        });
});

test('smalltalk.native: prompt: result: cancel', (t) => {
    global.prompt = stub().returns(null);
    
    smalltalk.prompt('title', 'message', 'value').then(() => {
        t.fail('should not resolve');
        t.end();
    })
        .catch((e) => {
            t.ok(e, 'should reject');
        });
});

test('smalltalk.native: prompt: options: cancel', (t) => {
    global.prompt = stub().returns(null);
    
    smalltalk.prompt('title', 'message', 'value', {
        cancel: false,
    }).then(() => {
        t.fail('should not resolve');
        t.end();
    })
        .catch((e) => {
            t.fail(`should not reject ${e.message}`);
        });
    
    t.pass('should do nothing');
});

function reload() {
    clean();
    return require('../lib/smalltalk.native');
}

function clean() {
    delete require.cache[require.resolve('../lib/smalltalk.native')];
}
