import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import * as smalltalk from '../lib/smalltalk.native.js';

globalThis.window = {};

test('smalltalk.native: alert', async (t) => {
    const alert = stub();
    
    await smalltalk.alert('title', 'message', {
        alert,
    });
    
    t.calledWith(alert, ['message'], 'alert should have been called with message');
    t.end();
});

test('smalltalk.native: alert: result', async (t) => {
    const alert = stub();
    
    await smalltalk.alert('title', 'message', {
        alert,
    });
    
    t.pass('promise should have been resolved');
    t.end();
});

test('smalltalk.native: confirm', async (t) => {
    const confirm = stub().returns(false);
    
    await tryToCatch(smalltalk.confirm, 'title', 'message', null, {
        confirm,
    });
    
    t.calledWith(confirm, ['message'], 'confirm should have been called with message');
    t.end();
});

test('smalltalk.native: confirm: result: ok', (t) => {
    globalThis.confirm = stub().returns(true);
    
    smalltalk.confirm('title', 'message');
    
    t.pass('should resolve');
    t.end();
});

test('smalltalk.native: confirm: result: cancel', async (t) => {
    globalThis.confirm = stub().returns(false);
    
    const [e] = await tryToCatch(smalltalk.confirm, 'title', 'message');
    
    t.ok(e, 'should reject');
    t.end();
});

test('smalltalk.native: confirm: options: cancel', (t) => {
    globalThis.confirm = stub().returns(false);
    
    const cancel = false;
    
    smalltalk
        .confirm('title', 'message', {
            cancel,
        })
        .then(() => {
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
    
    smalltalk.prompt('title', 'message', 'value', null, {
        prompt,
    });
    
    t.calledWith(prompt, ['message', 'value'], 'prompt should have been called with message');
    t.end();
});

test('smalltalk.native: prompt: result: ok', (t) => {
    globalThis.prompt = stub().returns('hello');
    
    smalltalk
        .prompt('title', 'message', 'value')
        .then((value) => {
            t.equal(value, 'hello', 'should resolve value');
            t.end();
        })
        .catch((e) => {
            t.fail(`should not reject ${e.message}`);
        });
});

test('smalltalk.native: prompt: result: cancel', async (t) => {
    const prompt = stub().returns(null);
    
    await tryToCatch(smalltalk.prompt, 'title', 'message', 'value', null, {
        prompt,
    });
    
    t.pass('should reject');
    t.end();
});

test('smalltalk.native: prompt: options: cancel', (t) => {
    const prompt = stub().returns(null);
    
    smalltalk.prompt('title', 'message', 'value', {cancel: false}, {
        prompt,
    });
    
    t.pass('should do nothing');
    t.end();
});
