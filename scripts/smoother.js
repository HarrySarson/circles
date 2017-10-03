var diff = require('./differential2ndOrder.js');
  
module.exports = exports = function(smoother){
    var f = function(oldValue, newValue, deltaT){
        var dist = newValue - oldValue;
          
        var eqt = diff({
            a:      smoother.a,
            b:      smoother.b,
            c:      smoother.c,
            x0:     dist,
            prime0: f.v
        }); 
        f.v = eqt.grad(deltaT);
        return newValue - eqt.eval(deltaT);
    };
    f.v = 0;
    return f;
};

var under_eval = function(t,expo,trig,x0,prime0){
    
    var A = x0,
        B = (prime0 - A*expo)/trig;  

    return Math.exp(expo*t) * (A*Math.cos(trig*t) + B*Math.sin(trig*t));
};
var under_grad = function(t,expo,trig,x0,prime0){
    
    var A = x0,
        B = (prime0 - A*expo)/trig;  
    
    return Math.exp(expo*t) * ((A*expo + B*trig)*Math.cos(trig*t) + (B*expo - A*trig)*Math.sin(trig*t))
};

exports.underdamped = function(expoCoeff,trigCoeff){
    var impl = function(){
        var dx = 0;
        return function(oldValue, newValue, deltaT){
            var x0 = newValue - oldValue;
            var dx0 = dx;
            
            dx = under_grad(deltaT, -expoCoeff, trigCoeff, x0, dx0);
            return newValue - under_eval(deltaT, -expoCoeff, trigCoeff, x0, dx0);
        };
    };
    var f = impl();
    
    var copies = {};
    f.get = function(id){
        if(copies[id]){
            return copies[id];
        }else{
            return copies[id] = impl();
        }        
    };
    
    return f;
};