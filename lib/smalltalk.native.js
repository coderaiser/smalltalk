'use strict';

require('../css/smalltalk.css');

module.exports.alert = (title, message) => {
    const promise = new Promise((resolve) => {
        alert(message);
        resolve();
    });
    
    return promise;
};

module.exports.prompt = (title, message, value, options) => {
    const o = options;
    const promise = new Promise((resolve, reject) => {
        const noCancel = o && !o.cancel;
        const result = prompt(message, value);
        
        if (result !== null)
            return resolve(result);
        
        if (noCancel)
            return;
        
        reject(Error());
    });
    
    return promise;
};

module.exports.confirm = (title, message, options) => {
    const o = options;
    const noCancel = o && !o.cancel;
    const promise = new Promise((resolve, reject) => {
        const is = confirm(message);
        
        if (is)
            return resolve(Error());
        
        if (noCancel)
            return;
        
        reject(Error());
    });
    
    return promise;
};
