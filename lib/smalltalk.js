'use strict';

require('../css/smalltalk.css');

const currify = require('currify/legacy');
const store = require('fullstore/legacy');
const createElement = require('@cloudcmd/create-element');

const keyDown = currify(keyDown_);
const remove = bind(removeEl, '.smalltalk');

const BUTTON_OK = {
    ok: 'OK'
};

const BUTTON_OK_CANCEL = {
    ok: 'OK',
    cancel: 'Cancel',
};

exports.alert = (title, msg, options) => {
    const buttons = getButtons(options) || BUTTON_OK;
    return showDialog(title, msg, '', buttons, options);
};

exports.prompt = (title, msg, value = '', options) => {
    const type = getType(options);
    const val = String(value)
        .replace(/"/g, '&quot;');
    
    const valueStr = `<input type="${ type }" value="${ val }" data-name="js-input">`;
    const buttons = getButtons(options) || BUTTON_OK_CANCEL;
    
    return showDialog(title, msg, valueStr, buttons, options);
};

exports.confirm = (title, msg, options) => {
    const buttons = getButtons(options) || BUTTON_OK_CANCEL;
    
    return showDialog(title, msg, '', buttons, options);
};

function getButtons(options = {}) {
    const {buttons} = options;
    
    if (!buttons)
      return null;
    
    return buttons;
}

function getType(options = {}) {
    const {type} = options;
    
    if (type === 'password')
        return 'password';
    
    return 'text';
}

function getTemplate(title, msg, value, buttons) {
    const encodedMsg = msg.replace(/\n/g, '<br>');
    
    return `<div class="page">
        <div data-name="js-close" class="close-button"></div>
        <header>${ title }</header>
        <div class="content-area">${ encodedMsg }${ value }</div>
        <div class="action-area">
            <div class="button-strip">
                ${parseButtons(buttons)}
            </div>
        </div>
    </div>`;
}

function parseButtons(buttons) {
    const names = Object.keys(buttons);
    const parse = currify((buttons, name, i) =>
        `<button
            tabindex=${i}
            data-name="js-${name.toLowerCase()}">
            ${buttons[name]}
        </button>`);
    
    return names
        .map(parse(buttons))
        .join('');
}

function showDialog(title, msg, value, buttons, options) {
    const ok = store();
    const cancel = store();
    
    const closeButtons = [
        'cancel',
        'close',
        'ok',
    ];
    
    const promise = new Promise((resolve, reject) => {
        const noCancel = options && options.cancel === false;
        const empty = () => {};
        
        ok(resolve);
        cancel(noCancel ? empty : reject);
    });
    
    const innerHTML = getTemplate(title, msg, value, buttons);
    
    const dialog = createElement('div', {
        innerHTML,
        className: 'smalltalk',
    });
    
    find(dialog, ['ok', 'input']).forEach((el) =>
        el.focus()
    );
    
    find(dialog, ['input']).forEach((el) => {
        el.setSelectionRange(0, value.length);
    });
    
    addListenerAll('click', dialog, closeButtons, (event) => {
        closeDialog(event.target, dialog, ok(), cancel())
    });
    
    ['click', 'contextmenu'].forEach((event) =>
        dialog.addEventListener(event, (e) => {
            e.stopPropagation();
            find(dialog, ['ok', 'input']).forEach((el) =>
                el.focus()
            )
        })
    );
    
    dialog.addEventListener('keydown', keyDown(dialog, ok(), cancel()));
    
    return promise;
}

function keyDown_(dialog, ok, cancel, event) {
    const KEY   = {
        ENTER : 13,
        ESC   : 27,
        TAB   : 9,
        LEFT  : 37,
        UP    : 38,
        RIGHT : 39,
        DOWN  : 40
    };
    
    const keyCode = event.keyCode;
    const el = event.target;
    
    const namesAll = ['ok', 'cancel', 'input'];
    const names = find(dialog, namesAll)
        .map(getDataName);
    
    switch(keyCode) {
    case KEY.ENTER:
        closeDialog(el, dialog, ok, cancel);
        event.preventDefault();
        break;
    
    case KEY.ESC:
        remove();
        cancel();
        break;
    
    case KEY.TAB:
        if (event.shiftKey)
            tab(dialog, names);
        
        tab(dialog, names);
        event.preventDefault();
        break;
    
    default:
        ['left', 'right', 'up', 'down'].filter((name) => {
            return keyCode === KEY[name.toUpperCase()];
        }).forEach(() => {
            changeButtonFocus(dialog, names);
        });
        
        break;
    }
    
    event.stopPropagation();
}

function getDataName(el) {
    return el
        .getAttribute('data-name')
        .replace('js-', '');
}

function changeButtonFocus(dialog, names) {
    const active = document.activeElement;
    const activeName = getDataName(active);
    const isButton = /ok|cancel/.test(activeName);
    const count = names.length - 1;
    const getName = (activeName) => {
        if (activeName === 'cancel')
            return 'ok';
        
        return 'cancel';
    };
    
    if (activeName === 'input' || !count || !isButton)
        return;
    
    const name = getName(activeName);
    
    find(dialog, [name]).forEach((el) => {
        el.focus();
    });
}

const getIndex = (count, index) => {
    if (index === count)
        return 0;
    
    return index + 1;
};

function tab(dialog, names) {
    const active = document.activeElement;
    const activeName = getDataName(active);
    const count = names.length - 1;
    
    const activeIndex = names.indexOf(activeName);
    const index = getIndex(count, activeIndex);
    
    const name = names[index];
    
    find(dialog, [name]).forEach((el) =>
        el.focus()
    );
}

function closeDialog(el, dialog, ok, cancel) {
    const name = el
        .getAttribute('data-name')
        .replace('js-', '');
    
    if (/close|cancel/.test(name)) {
        cancel();
        remove();
        return;
    }
    
    const value = find(dialog, ['input'])
        .reduce((value, el) => el.value, null);
    
    ok(value);
    remove();
}

function find(element, names) {
    const notEmpty = (a) => a;
    const elements = names.map((name) =>
        element.querySelector(`[data-name="js-${ name }"]`)
    ).filter(notEmpty);
    
    return elements;
}

function addListenerAll(event, parent, elements, fn) {
    find(parent, elements)
        .forEach((el) =>
            el.addEventListener(event, fn)
        );
}

function removeEl(name) {
     const el = document.querySelector(name);
     
     el.parentElement.removeChild(el);
}

function bind(fn, ...args) {
    return () => fn(...args);
}

