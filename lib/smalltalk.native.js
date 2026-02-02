import '../css/smalltalk.css';

export const alert = (title, message, overrides = {}) => {
    const {alert = globalThis.alert} = overrides;
    
    const promise = new Promise((resolve) => {
        alert(message);
        resolve();
    });
    
    return promise;
};

export const prompt = (title, message, value, options, overrides = {}) => {
    const {prompt = globalThis.prompt} = overrides;
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

export const confirm = (title, message, options, overrides = {}) => {
    const {confirm = globalThis.confirm} = overrides;
    
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
