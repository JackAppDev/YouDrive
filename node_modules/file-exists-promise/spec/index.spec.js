var exists = require('../index.js'),
      path = require('path'),
        fs = require('fs');

describe("Works perfectly", function(){
    it('should exists', function(done){
        exists(path.resolve(__dirname, './a.txt'))
        .then(function(stat){
            expect(true).toBe(true);
            expect(stat).not.toBeUndefined();
            expect(stat).toEqual(fs.statSync(path.resolve(__dirname, './a.txt')));
            done();
        }, function(){
            expect('should exists').toBe(false);
            done();
        });
    });

    it('should not exists', function(done){
        exists(path.resolve(__dirname, './b.txt'))
        .then(function(){
            expect('should not exists').toBe(false);
            done();
        }, function(){
            expect(true).toBe(true);
            done();
        });
    });
});
