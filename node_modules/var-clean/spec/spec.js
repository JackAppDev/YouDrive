var lib = require('./../index.js');
var cl = lib.clean,
    ct = lib.cleanOrThrow;

var input = [true, "true", false, "false", {}, {ipsum: 'lorem'}, "lorem", "", 1, 0, 153, "153", -153, "-153"],
     bool = [true, true, false, false, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
   truthy = [true, true, false, false, true, true, true, false, true, false, true, true, true, true],
      int = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1, 0, 153, 153, -153, -153],
   posint = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1, 0, 153, 153, undefined, undefined],
      str = ["true", "true", "false", "false", undefined, undefined, "lorem", "", "1", "0", "153", "153", "-153", "-153"],
  onlystr = [undefined, "true", undefined, "false", undefined, undefined, "lorem", "", undefined, undefined, undefined, "153", undefined, "-153"];



describe("Clean", function() {
    it("boolean", function() {
        for(var i=0; i<input.length; i++){
            expect(cl.cleanBoolean(input[i])).toBe(bool[i]);
        }
    });
    it("booleanThrow", function(){
        for(var i=0; i<input.length; i++){
            if(bool[i] === undefined){
                expect(function(){ ct.cleanBoolean(input[i]) }).toThrow();
            }else{
                expect(ct.cleanBoolean(input[i])).toBe(bool[i]);
            }
        }
    });
    it("truthy", function() {
        for(var i=0; i<input.length; i++){
            expect(cl.cleanTruthy(input[i])).toBe(truthy[i]);
        }
    });
    it("truthyThrow", function(){
        for(var i=0; i<input.length; i++){
            if(truthy[i] === undefined){
                expect(function(){ ct.cleanTruthy(input[i]) }).toThrow();
            }else{
                expect(ct.cleanTruthy(input[i])).toBe(truthy[i]);
            }
        }
    });
    it("int", function(){
        for(var i=0; i<input.length; i++){
            expect(cl.cleanInteger(input[i])).toBe(int[i]);
        }
    });
    it("intThrow", function(){
        for(var i=0; i<input.length; i++){
            if(int[i] === undefined){
                expect(function(){ ct.cleanInteger(input[i]) }).toThrow();
            }else{
                expect(ct.cleanInteger(input[i])).toBe(int[i]);
            }
        }
    });
    it("posint", function(){
        for(var i=0; i<input.length; i++){
            expect(cl.cleanPositiveInteger(input[i])).toBe(posint[i]);
        }
    });
    it("posintThrow", function(){
        for(var i=0; i<input.length; i++){
            if(posint[i] === undefined){
                expect(function(){ ct.cleanPositiveInteger(input[i]) }).toThrow();
            }else{
                expect(ct.cleanPositiveInteger(input[i])).toBe(posint[i]);
            }
        }
    });
    it("string", function(){
        for(var i=0; i<input.length; i++){
            expect(cl.cleanString(input[i])).toBe(str[i]);
        }
    });
    it("stringThrow", function(){
        for(var i=0; i<input.length; i++){
            if(str[i] === undefined){
                expect(function(){ ct.cleanString(input[i]) }).toThrow();
            }else{
                expect(ct.cleanString(input[i])).toBe(str[i]);
            }
        }
    });
    it("onlystring", function(){
        for(var i=0; i<input.length; i++){
            expect(cl.cleanOnlyString(input[i])).toBe(onlystr[i]);
        }
    });
    it("onlystringThrow", function(){
        for(var i=0; i<input.length; i++){
            if(onlystr[i] === undefined){
                expect(function(){ ct.cleanOnlyString(input[i]) }).toThrow();
            }else{
                expect(ct.cleanOnlyString(input[i])).toBe(onlystr[i]);
            }
        }
    });
    it("undefined", function(){
        expect(cl.cleanBoolean(undefined)).toBe(undefined);
        expect(function(){ ct.cleanBoolean(undefined) }).toThrow();
        expect(cl.cleanTruthy(undefined)).toBe(false);
        expect(ct.cleanTruthy(undefined)).toBe(false);
        expect(cl.cleanInteger(undefined)).toBe(undefined);
        expect(function(){ ct.cleanInteger(undefined) }).toThrow();
        expect(cl.cleanPositiveInteger(undefined)).toBe(undefined);
        expect(function(){ ct.cleanPositiveInteger(undefined) }).toThrow();
        expect(cl.cleanString(undefined)).toBe('undefined');
        expect(ct.cleanString(undefined)).toBe('undefined');
        expect(cl.cleanOnlyString(undefined)).toBe(undefined);
        expect(function(){ ct.cleanOnlyString(undefined) }).toThrow();
    });
    it("null", function(){
        expect(cl.cleanBoolean(null)).toBe(undefined);
        expect(function(){ ct.cleanBoolean(null) }).toThrow();
        expect(cl.cleanTruthy(null)).toBe(false);
        expect(ct.cleanTruthy(null)).toBe(false);
        expect(cl.cleanInteger(null)).toBe(undefined);
        expect(function(){ ct.cleanInteger(null) }).toThrow();
        expect(cl.cleanPositiveInteger(null)).toBe(undefined);
        expect(function(){ ct.cleanPositiveInteger(undefined) }).toThrow();
        expect(cl.cleanString(null)).toBe('null');
        expect(ct.cleanString(null)).toBe('null');
        expect(cl.cleanOnlyString(null)).toBe(undefined);
        expect(function(){ ct.cleanOnlyString(null) }).toThrow();
    });
});
