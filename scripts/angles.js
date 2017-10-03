exports.deg = function deg (rad, sf){
    sf = (sf === undefined) ? 3 : sf;
    return Number((rad/Math.PI*180).toPrecision(sf));
};

exports.restrict = function restrict(value, min, max){
    if(min > max){
        var c = min;
        min = max;
        max = c;
    }
    
    // scale min and max to zero and max - min
    value -= min;
    max   -= min;
         
    var quot = value / max;
    
    if(quot < 0) 
        quot -= 1;
    
    // adjust into range of zero and max-min and then scale back to range min and max
    return value - (~~quot)*max + min;
};

exports.clockwisebetween = function clockwisebetween(angle, start, end){
    angle = exports.restrict(angle, 0, 2*Math.PI);
    start = exports.restrict(start, 0, 2*Math.PI);
    end   = exports.restrict(end,   0, 2*Math.PI);
            
    var r = (start < end) ?
                (start < angle && angle < end)
            :
                (start < angle || angle < end);
    
    return r;
};