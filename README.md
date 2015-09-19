Smalltalk
====

Simple [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)-based replacement of native Alert, Confirm and Prompt.

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

![Alert](https://raw.githubusercontent.com/coderaiser/smalltalk/master/screen/alert.png "Alert")

```js
smalltalk.alert('Error', 'There was an error!').then(function() {
    console.log('ok');
});
```

## smalltalk.confirm(title, message)

![Confirm](https://raw.githubusercontent.com/coderaiser/smalltalk/master/screen/confirm.png "Confirm")

```js
smalltalk.confirm('Question', 'Are you sure?').then(function() {
    console.log('yes');
}, function() {
    console.log('no');
});
```

## smalltalk.prompt(title, message, value)

![Prompt](https://raw.githubusercontent.com/coderaiser/smalltalk/master/screen/prompt.png "Prompt")

```js
smalltalk.prompt('Question', 'How old are you?', '10').then(function(value) {
    console.log(value);
}, function() {
    console.log('cancel');
});
```

#License
MIT
