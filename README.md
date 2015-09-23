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

In every method of `smalltalk` last parameter *options* is optional and could be used
for preventing of handling cancel event.

```js
{
    cancel: true /* default */
}
```

## smalltalk.alert(title, message [, options])

![Alert](https://raw.githubusercontent.com/coderaiser/smalltalk/master/screen/alert.png "Alert")

```js
smalltalk.alert('Error', 'There was an error!').then(function() {
    console.log('ok');
}, function() {
    console.log('cancel');
});
```

## smalltalk.confirm(title, message [, options])

![Confirm](https://raw.githubusercontent.com/coderaiser/smalltalk/master/screen/confirm.png "Confirm")

```js
smalltalk.confirm('Question', 'Are you sure?').then(function() {
    console.log('yes');
}, function() {
    console.log('no');
});
```

## smalltalk.prompt(title, message, value [, options])

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
