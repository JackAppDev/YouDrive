var   fs = require('fs'),
 Promise = require('es6-promise').Promise;

var exists = function(filepath){
    return new Promise(function(resolve, reject){
        fs.stat(filepath, function(err, stat){
            if(err) reject();
            else    resolve(stat);
        });
    });
};

exports = module.exports = exists;
