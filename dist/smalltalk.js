'use strict';

(function (global) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) module.exports = SmallTalk();else global.smalltalk = SmallTalk();

    function SmallTalk(callback) {
        if (!(this instanceof SmallTalk)) return new SmallTalk(callback);

        var remove = bind(removeEl, '.smalltalk');

        var BUTTON_OK = ['OK'];
        var BUTTON_OK_CANCEL = ['Cancel', 'OK'];

        this.alert = function (title, msg, options) {
            return showDialog(title, msg, '', BUTTON_OK, options);
        };

        this.prompt = function (title, msg, value, options) {
            var val = value || '';
            var valueStr = '<input type="text" value="' + val + '" data-name="js-input">';

            return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
        };

        this.confirm = function (title, msg, options) {
            return showDialog(title, msg, '', BUTTON_OK_CANCEL, options);
        };

        function getTemplate(title, msg, value, buttons) {
            if (!Array.isArray(buttons)) throw Error('buttons should be array!');

            return '<div class="page">\n                <div data-name="js-close" class="close-button"></div>\n                <h1>' + title + '</h1>\n                <div class="content-area">\n                    ' + msg + '\n                    ' + value + '\n                </div>\n                <div class="action-area">\n                    <div class="button-strip"> ' + buttons.map(function (name, i) {
                return '<button tabindex=' + i + ' data-name="js-' + name.toLowerCase() + '">' + name + '</button>';
            }).join('') + '\n                    </div>\n                </div>\n            </div>';
        }

        function showDialog(title, msg, value, buttons, options) {
            var dialog = document.createElement('div'),
                closeButtons = ['cancel', 'close', 'ok'],
                ok = undefined,
                cancel = undefined,
                promise = new Promise(function (resolve, reject) {
                var noCancel = options && !options.cancel;
                var empty = function empty() {};

                ok = resolve;
                cancel = reject;

                if (noCancel) cancel = empty;
            }),
                tmpl = getTemplate(title, msg, value, buttons);

            dialog.innerHTML = tmpl;
            dialog.className = 'smalltalk';

            document.body.appendChild(dialog);

            find(dialog, ['ok']).forEach(function (el) {
                return el.focus();
            });

            find(dialog, ['input']).forEach(function (el) {
                return el.setSelectionRange(0, value.length);
            });

            addListeterAll('click', dialog, closeButtons, function (event) {
                return closeDialog(event.target, dialog, ok, cancel);
            });

            ['click', 'contextmenu'].forEach(function (event) {
                return dialog.addEventListener(event, function () {
                    return find(dialog, ['ok', 'input']).forEach(function (el) {
                        return el.focus();
                    });
                });
            });

            dialog.addEventListener('keydown', function (event) {
                var ENTER = 13;
                var ESC = 27;
                var TAB = 9;

                var keyCode = event.keyCode,
                    el = event.target;

                switch (keyCode) {
                    case ENTER:
                        closeDialog(el, dialog, ok, cancel);
                        break;

                    case ESC:
                        remove();
                        cancel();
                        break;

                    case TAB:
                        var namesAll = ['cancel', 'ok', 'input'],
                            names = find(dialog, namesAll).map(function (el) {
                            return el.getAttribute('data-name').replace('js-', '');
                        });

                        if (event.shiftKey) tab(dialog, names);

                        tab(dialog, names);
                        event.preventDefault();
                        break;
                }
            });

            return promise;
        }

        function tab(dialog, names) {
            var active = document.activeElement,
                activeName = active.getAttribute('data-name').replace('js-', ''),
                count = names.length - 1,
                index = names.indexOf(activeName);

            if (index === count) index = 0;else if (index < count) ++index;

            var name = names[index];

            find(dialog, [name]).forEach(function (el) {
                return el.focus();
            });
        }

        function closeDialog(el, dialog, ok, cancel) {
            var value = undefined,
                name = el.getAttribute('data-name').replace('js-', '');

            if (/close|cancel/.test(name)) {
                cancel();
            } else {
                value = find(dialog, ['input']).reduce(function (value, el) {
                    return el.value;
                }, null);

                ok(value);
            }

            remove();
        }

        function find(element, names) {
            var elements = names.map(function (name) {
                return element.querySelector('[data-name="js-' + name + '"]');
            }).filter(function (el) {
                return el;
            });

            return elements;
        }

        function addListeterAll(event, parent, elements, fn) {
            find(parent, elements).forEach(function (el) {
                return el.addEventListener(event, function (event) {
                    return fn(event);
                });
            });
        }

        function removeEl(name) {
            var el = document.querySelector(name);

            el.parentElement.removeChild(el);
        }

        function bind(fn) {
            var args = [].slice.call(arguments, 1);

            return fn.bind(null, args);
        }
    }
})(typeof window !== 'undefined' && window);