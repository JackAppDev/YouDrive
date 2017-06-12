'use strict';
module.exports = {
	clean: {
        cleanBoolean: function(value){
            if(value === true || value === 'true'){
                return true;
            }else if(value === false || value === 'false'){
                return false;
            }
            return undefined;
        },
        cleanTruthy: function(value){
            if(value === true || value === 'true'){
                return true;
            }else if(value === false || value === 'false'){
                return false;
            }
            return !!value;
        },
        cleanInteger: function(value){
            if(/^[-]?\d+$/.test(value)){
                return Number(value);
            }
            return undefined;
        },
        cleanPositiveInteger: function(value){
            if(/^[-]?\d+$/.test(value)){
                var v;
                if((v = Number(value)) >= 0){
                    return v;
                }
            }
            return undefined;
        },
        cleanString: function(value){
            var v;
            if((v = String(value)) !== '[object Object]'){
                return v;
            }
            return undefined;
        },
        cleanOnlyString: function(value){
            if(typeof value === 'string'){
                return value;
            }
            return undefined;
        }
    },
    cleanOrThrow: {
        cleanBoolean: function(value){
            if(value === true || value === 'true'){
                return true;
            }else if(value === false || value === 'false'){
                return false;
            }
            throw new Error("Not a Boolean");
        },
        cleanTruthy: function(value){
            if(value === true || value === 'true'){
                return true;
            }else if(value === false || value === 'false'){
                return false;
            }
            return !!value;
        },
        cleanInteger: function(value){
            if(/^[-]?\d+$/.test(value)){
                return Number(value);
            }
            throw new Error("Not a Number");
        },
        cleanPositiveInteger: function(value){
            if(/^[-]?\d+$/.test(value)){
                var v;
                if((v = Number(value)) >= 0){
                    return v;
                }else{
                    throw new Error("Negative number");
                }
            }
            throw new Error("Not a Number");
        },
        cleanString: function(value){
            var v;
            if((v = String(value)) !== '[object Object]'){
                return v;
            }
            throw new Error("Not a String");
        },
        cleanOnlyString: function(value){
            if(typeof value === 'string'){
                return value;
            }
            throw new Error("Not a String")
        }
    }
};
