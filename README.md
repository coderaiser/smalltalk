Smalltalk
====

Simple replacement of native Alert, Confirm and Prompt.

# Benefits

- `5kb` javascript
- `4kb` css
- [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) based

# Install
With help of [bower](http://bower.io "Bower").

```
bower install smalltalk
```

Or npm:

```
npm i smalltalk
```

# API

## smalltalk.alert(title, message)
```js
smalltalk.alert('Error', 'There was an error!').then(function() {
    console.log('ok');
})
```

## smalltalk.confirm(title, message)
```js
smalltalk.confirm('Question', 'Are you sure?').then(function() {
    console.log('yes');
}, function() {
    console.log('no');
})
```

## smalltalk.prompt(title, message, value)
```js
smalltalk.prompt('Question', 'How old are you?', '10').then(function(value) {
    console.log(value);
}, function() {
    console.log('cancel');
})
```

#How use?
Create `html` page:

#License
MIT
