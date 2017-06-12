# file-exists-promise

[![Build Status](https://travis-ci.org/tanhauhau/file-exists-promise.svg?branch=master)](https://travis-ci.org/tanhauhau/file-exists-promise)
[![npm version](https://badge.fury.io/js/file-exists-promise.svg)](https://badge.fury.io/js/file-exists-promise)
[![Dependency status](https://david-dm.org/tanhauhau/file-exists-promise.svg)](https://david-dm.org)
[![Downloads](https://img.shields.io/npm/dt/file-exists-promise.svg)](https://www.npmjs.com/package/file-exists-promise)
[![Donate](https://img.shields.io/gratipay/user/tanhauhau.svg)](https://gratipay.com/~tanhauhau/)

> fs.exists with ES6 Promise that is not deprecated
>
> This is the implementation using [fs.statsSync](https://nodejs.org/api/fs.html#fs_fs_statsync_path) to check whether the file exists instead of the deprecated [fs.existsSync](https://nodejs.org/api/fs.html#fs_fs_existssync_path).
>


# Installation

```bash
$ npm install --save file-exists-promise
```

## Usage

```javascript
var fileExists = require('file-exists-promise'),
      path = require('path');

      fileExists(path.resolve(__dirname, './file.txt'))
      .then(function(stat){
          console.log('yeah it exists!');
          console.log('and the stat of the file --> ' + stat);
      })
      .catch(function(){
          console.log('oh no... it does not exist');
      });
```

# License
MIT
