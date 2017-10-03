var getNumber = function(n){
    var f = parseFloat(n)
    return (!isNaN(f) && isFinite(n)) ? f : undefined;
}

var sqr = function(x) { return x*x; }

// a*x'' + b*x + c*x = 0;
var diff = function(a,b,c){
    this.a = getNumber(a);
    this.b = getNumber(b);
    this.c = getNumber(c);
    
    if(this.a === undefined || this.b === undefined || this.c === undefined)
        throw TypeError('One or more coefficients: a=' + this.a + ', b=' + this.b + ', c=' + this.c + ' are not valid');
    
    /*  
     * let p = -b/2a and q = (b/2a)^2-c/a
     *
     *
     *
     *
     *  if q == 0 then "repeated roots"
     *      x(t)  = (At+B)e^(pt);
     *      x(0)  =  B
     *      x'(t) = (A + p(At+B))e^(pt)
     *      x'(0) = (A + Bp)
     *
     *      B = x(0), A = x'(0) - Bp
     *
     *  if q > 0 then "distinct real roots"
     *      x(t)  = A*e^(k*t) + B*e^(m*t)
     *      where k = p+sqrt(q) and m = p-sqrt(q)
     *      x(0)  = A + B
     *      x'(t) = Ak*e^(k*t) + Bm*e^(m*t)
     *      x'(0) = Ak + Bm
     *      
     *      B = (x'(0) - x(0)*k)/(m - k)
     *      A = x(0) - B
     *
     *  if q < 0 then "distinct imaginary roots"
     *      x(t) = e^(pt)(Acos(kt) + Bsin(kt))
     *      where k = sqrt(-q)
     *      x(0) = A
     *      x'(t) = e^(p*t)((Ap + Bk)cos(kt) + (Bp - Ak)sin(kt))
     *      x'(0) = A*p + Bk
     *      
     *      A = x(0)
     *      B = (x'(0) - Ap)/k
     */
     
};

var solveDifferential = function(diff){
    ['a','b','c','x0','prime0'].forEach(function(val){
        diff[val] = getNumber(diff[val]);
        if(diff[val] === undefined){
            throw TypeError('Property: ' + val + ' is not a number');
        }
    });
    var rtn = {};
    var p = -0.5*diff.b/diff.a,
        q = 0.25*sqr(diff.b/diff.a)-diff.c/diff.a;
    if(q == 0){
        // repeated roots
        var B = diff.x0,
            A = diff.prime0 - B*p;
            
        rtn.eval = function(t){
            return (A*t+B)*Math.exp(p*t);
        };
        rtn.grad = function(t){
            return (A + p*(A*t+B))*Math.exp(p*t)
        };
        rtn.toString = function(){
            return '(' + A + 't + ' + B + ')e^' + p + 't';
        };
    }else if(q > 0){
        // real roots
        var sqrt = Math.sqrt(q);
        
        var k = p+sqrt,
            m = p-sqrt,
            B = (diff.prime0 - diff.x0*k)/(m - k)
            A = diff.x0 - B
         
        rtn.eval = function(t){
            return A*Math.exp(k*t) + B*Math.exp(m*t)
        };
        rtn.grad = function(t){
            return A*k*Math.exp(k*t) + B*m*Math.exp(m*t)
        };
        rtn.toString = function(){
            return A + 'e^' + k + 't + ' + B + 'e^' + m+ 't';
        };
    }else{ // q < 0
        // imaginary roots
        var sqrt = Math.sqrt(-q),
            A = diff.x0,
            B = (diff.prime0 - A*p)/sqrt;   
         
        rtn.eval = function(t){
            return Math.exp(p*t)*(A*Math.cos(sqrt*t) + B*Math.sin(sqrt*t));
        };
        rtn.grad = function(t){
            return Math.exp(p*t)*((A*p + B*sqrt)*Math.cos(sqrt*t) + (B*p - A*sqrt)*Math.sin(sqrt*t))
        };
        rtn.toString = function(){
            return 'e^' + p + 't(' + A + 'cos(' + sqrt + 't) + ' + B + 'sin(' + sqrt + 't) )';
        };
    }
    return rtn;
};

module.exports = solveDifferential;








