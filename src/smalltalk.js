(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports      = SmallTalk();
    else
        global.smalltalk    = SmallTalk();
    
    function SmallTalk(callback) {
        if (!(this instanceof SmallTalk))
            return new SmallTalk(callback);
        
        let remove              = bind(removeEl, '.smalltalk');
        
        const BUTTON_OK         = ['OK'];
        const BUTTON_OK_CANCEL  = ['Cancel', 'OK'];
        
        this.alert = (title, msg, options) => {
            return showDialog(title, msg, '', BUTTON_OK, options);
        };
        
        this.prompt = (title, msg, value, options) => {
            let val         = value || '';
            let valueStr    = `<input type="text" value="${ val }" data-name="js-input">`;
            
            return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
        };
        
        this.confirm = (title, msg, options) => {
            return showDialog(title, msg, '', BUTTON_OK_CANCEL, options);
        };
        
        function getTemplate(title, msg, value, buttons) {
            if (!Array.isArray(buttons))
                throw Error('buttons should be array!');
            
            return `<div class="page">
                <div data-name="js-close" class="close-button"></div>
                <h1>${ title }</h1>
                <div class="content-area">
                    ${ msg }
                    ${ value }
                </div>
                <div class="action-area">
                    <div class="button-strip"> ${
                        buttons.map((name, i) =>
                            `<button tabindex=${ i } data-name="js-${ name.toLowerCase() }">${ name }</button>`
                        ).join('')
                    }
                    </div>
                </div>
            </div>`;
        }
        
        function showDialog(title, msg, value, buttons, options) {
            let dialog  = document.createElement('div'),
                
                closeButtons    = [
                    'cancel',
                    'close',
                    'ok'
                ],
                
                ok, cancel,
                
                promise = new Promise((resolve, reject) => {
                    let noCancel    = options && !options.cancel;
                    let empty       = () => {};
                    
                    ok      = resolve;
                    cancel  = reject;
                    
                    if (noCancel)
                        cancel = empty;
                }),
                
                tmpl    = getTemplate(title, msg, value, buttons);
                
            dialog.innerHTML = tmpl;
            dialog.className = 'smalltalk';
            
            document.body.appendChild(dialog);
            
            find(dialog, ['ok']).forEach(el =>
                el.focus()
            );
            
            find(dialog, ['input']).forEach(el =>
                el.setSelectionRange(0, value.length)
            );
            
            addListeterAll('click', dialog, closeButtons, event =>
                closeDialog(event.target, dialog, ok, cancel)
            );
            
            ['click', 'contextmenu'].forEach(event =>
                dialog.addEventListener(event, () => 
                    find(dialog, ['ok', 'input']).forEach(el =>
                        el.focus()
                    )
                )
            );
            
            dialog.addEventListener('keydown', keyDown(dialog, ok, cancel));
            
            return promise;
        }
        
        function keyDown(dialog, ok, cancel) {
            return event => {
                const ENTER = 13;
                const ESC   = 27;
                const TAB   = 9;
                
                let keyCode = event.keyCode,
                    el      = event.target;
                
                switch(keyCode) {
                case ENTER:
                    closeDialog(el, dialog, ok, cancel);
                    break;
                
                case ESC:
                    remove();
                    cancel();
                    break;
                
                case TAB:
                    let namesAll    = ['cancel', 'ok', 'input'],
                        names       = find(dialog, namesAll).map(el =>
                            el.getAttribute('data-name').replace('js-', '')
                        );
                    
                    if (event.shiftKey)
                        tab(dialog, names);
                    
                    tab(dialog, names);
                    event.preventDefault();
                    break;
                }
                
                event.stopPropagation();
            };
        }
        
        function tab(dialog, names) {
            let active      = document.activeElement,
                activeName  = active.getAttribute('data-name')
                    .replace('js-', ''),
                
                count       = names.length - 1,
                index       = names.indexOf(activeName);
            
            if (index === count)
                index = 0;
            else if (index < count)
                ++index;
            
            let name = names[index];
            
            find(dialog, [name]).forEach(el =>
                el.focus()
            );
        }
        
        function closeDialog(el, dialog, ok, cancel) {
            let value,
                name = el
                    .getAttribute('data-name')
                    .replace('js-', '');
            
            if (/close|cancel/.test(name)) {
                cancel();
            } else {
                value = find(dialog, ['input']).reduce((value, el) => {
                    return el.value;
                }, null);
                
                ok(value);
            }
            
            remove();
        }
        
        function find(element, names) {
            let elements = names.map(name =>
                element.querySelector(`[data-name="js-${ name }"]`)
            ).filter(el => 
                el
            );
            
            return elements;
        }
        
        function addListeterAll(event, parent, elements, fn) {
            find(parent, elements).forEach(el =>
                el.addEventListener(event, event =>
                    fn(event)
                )
            );
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
