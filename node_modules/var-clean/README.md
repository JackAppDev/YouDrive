# var-clean [![Build Status](https://travis-ci.org/tanhauhau/var-clean.svg?branch=master)](https://travis-ci.org/tanhauhau/var-clean)

Simple JavaScript library that clean variable

```bash
npm install var-clean
```

Usage:
----

```JavaScript
var clean = require('var-clean').clean;
clean.cleanInteger(2);  //return 2
clean.cleanInteger('2');  //return 2
clean.cleanInteger('asdf');  //return undefined

var cleanOrThrow = require('var-clean').cleanOrThrow;
cleanOrThrow.cleanInteger(2);  //return 2
cleanOrThrow.cleanInteger('2');  //return 2
cleanOrThrow.cleanInteger('asdf');  //throw Error 'Not a Number'
```

Based on the spec:
-----

### clean

value | cleanBoolean | cleanTruthy | cleanInteger | cleanPositiveInteger | cleanString | cleanOnlyString
---|---|---|---|---|---|---
`true` | `true` | `true` | `undefined` | `undefined` | `'true'` | `undefined`
`'true'` | `true` | `true` | `undefined` | `undefined` | `'true'` | `'true'`
`false` | `false` | `false` | `undefined` | `undefined` | `'false'` | `undefined`
`'false'` | `false` | `false` | `undefined` | `undefined` | `'false'` | `'false'`
`{}` | `undefined` | `true` | `undefined` | `undefined` | `undefined` | `undefined`
`{ipsum: 'lorem'}` | `undefined` | `true` | `undefined` | `undefined` | `undefined` | `undefined`
`'lorem'` | `undefined` | `true` | `undefined` | `undefined` | `'lorem'` | `'lorem'`
`''` | `undefined` | `false` | `undefined` | `undefined` | `''` | `''`
`1` | `undefined` | `true` | `1` | `1` | `'1'` | `undefined`
`0` | `undefined` | `false` | `0` | `0` | `'0'` | `undefined`
`153` | `undefined` | `true` | `153` | `153` | `'153'` | `undefined`
`'153'` | `undefined` | `true` | `153` | `153` | `'153'` | `'153'`
`-153` | `undefined` | `true` | `-153` | `undefined` | `'-153'` | `undefined`
`'-153'` | `undefined` | `true` | `-153` | `undefined` | `-'153'` | `-'153'`
`undefined` | `undefined` |  `false` |  `undefined` |  `undefined` |  `'undefined'` |  `undefined`
`null` | `undefined` |  `false` |  `undefined` |  `undefined` |  `'null'` |  `undefined`


### cleanOrThrow

value | cleanBoolean | cleanTruthy | cleanInteger | cleanPositiveInteger | cleanString | cleanOnlyString
---|---|---|---|---|---|---
`true` | `true` | `true` | `Not a Number` | `Not a Number` | `'true'` | `Not a String`
`'true'` | `true` | `true` | `Not a Number` | `Not a Number` | `'true'` | `'true'`
`false` | `false` | `false` | `undefined` | `Not a Number` | `'false'` | `Not a String`
`'false'` | `false` | `false` | `Not a Number` | `Not a Number` | `'false'` | `'false'`
`{}` | `Not a Boolean` | `true` | `Not a Number` | `Not a Number` | `Not a String` | `Not a String`
`{ipsum: 'lorem'}` | `Not a Boolean` | `true` | `Not a Number` | `Not a Number` | `Not a String` | `Not a String`
`'lorem'` | `Not a Boolean` | `true` | `Not a Number` | `Not a Number` | `'lorem'` | `'lorem'`
`''` | `Not a Boolean` | `false` | `Not a Number` | `Not a Number` | `''` | `''`
`1` | `Not a Boolean` | `true` | `1` | `1` | `'1'` | `Not a String`
`0` | `Not a Boolean` | `false` | `0` | `0` | `'0'` | `Not a String`
`153` | `Not a Boolean` | `true` | `153` | `153` | `'153'` | `Not a String`
`'153'` | `Not a Boolean` | `true` | `153` | `153` | `'153'` | `'153'`
`-153` | `Not a Boolean` | `true` | `-153` | `Negative number` | `'-153'` | `Not a String`
`'-153'` | `Not a Boolean` | `true` | `-153` | `Negative number` | `-'153'` | `-'153'`
`undefined` | `Not a Boolean` |  `false` |  `Not a Number` |  `Not a Number` |  `'undefined'` |  `Not a String`
`null` | `Not a Boolean` |  `false` |  `Not a Number` |  `Not a Number` |  `'null'` |  `Not a String`
