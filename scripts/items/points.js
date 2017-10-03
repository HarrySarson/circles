'use strict';

var tinycolor   = require('tinycolor2');
var smoother    = require('../smoother.js');

var Item        = require('./item_base.js');
var inherit     = require('class');

var radius = 10,
    pointType = 'point',
    inherit = require('class');

var pointsBase = inherit.parent(Item).child(function(selected){
    pointsBase.superclass.call(this,selected);
    
    this._coors = [];
});


pointsBase.prototype.coor = function(i,x,y){
    if(x !== undefined && y !== undefined){
        this._coors[i].x = x;
        this._coors[i].y = y;
    }
    return this._coors[i];
};

pointsBase.prototype.back = function(){
    return this._coors[this._coors.length-1];
};

// returns undefined for empty array
pointsBase.prototype.back = function(x,y){
    return this.length > 0 ? this.coor(this.length - 1, x, y) : undefined;
};

pointsBase.prototype.add = function(x,y){
    this._coors.push({x: x, y: y});
     
    return this;
};

pointsBase.prototype.remove = function(i){
    this._coors.splice(i,1);
     
    return this;
};

pointsBase.prototype.reset = function(x,y){
    this._coors.length = 0;
     
    return this;
};

pointsBase.prototype.forEach = function(){
    return this._coors.forEach.apply(this._coors, arguments);
}

Object.defineProperty(pointsBase.prototype, 'length', {
    'enumerable': true,
    'get': function(){
        return this._coors.length;
    },
    'set': function(l){
        return this._coors.length = l
    }
});
/*
 *
 *
 *
 *  snapfunction: odd function, for all x: f(x) >= 0, sign of f(x) == sign of x.
 *                  examples are x^2, coshx, log(1+x^2)    
 */
module.exports = exports = inherit.parent(pointsBase).child(function(selected,bin,snapfunction){
    exports.superclass.call(this,selected);
    
    var self = this;
    
    this._currently_moving = false;
    this._bin = bin;
    this._oscilation_centers = [];
    this._snap = snapfunction && snapfunction.call ? 
        snapfunction : 
        function(x) { return snapfunction || 1e5; };
        
    this._adjust = smoother.underdamped(2e-2, 8e-3);
    
    this._rotation = {
        selected: false,
        timestamp: undefined,
        id: undefined,
        killtime: 5e2,
        start: function(id){
            this.selected = true;
            this.timestamp = -1;
            this.id = id;
        },
        stop: function(){
            this.selected = false;
            this.timestamp = -1;
        },
        emergency_stop: function(){
            this.selected = false;
            this.timestamp = undefined;
            this.id = undefined;
        },  
        rotate: function(time, dt){
            if(this.timestamp === -1)
            {
                this.timestamp = time;
            }
            
            
            var runtime  = time - this.timestamp,
                k        = this.killtime / 1e5;
                
            
            if( (this.selected || runtime < this.killtime) && 
                this.id < self.length ) // incase someone bins the last point
            {
                var max    = ( 3 /* rotations/second */ ) * ( 2 * Math.PI  /* radians */ ) * ( dt/1000 /* seconds */),
                    change = this.selected ? 
                                1 - 1 / ( 1 +                k*runtime ) :
                                1 - 1 / ( 1 + this.killtime * k - k*runtime );
                                
                        
                self.coor(this.id).angle += max*change;
                return true;
            }
            return false;
        }
    
    };
            
    // add event for when mouse is released, remove any binned points
    this._selected.on('mouseup', function(type, id){
        self.forEach(function(coor,i){
            if(coor.binned){
                self.remove(i)
                self._rotation.emergency_stop();
            }
                
        });
    }).on('set', function(type, id){
        if(type === pointType){
            self._rotation.start(id);
        }
    }).on('unset', function(type){
        if(type === pointType){
            self._rotation.stop();
        }
    });
});


exports.prototype.add = function(x,y){

    this._coors.push({  x: x,  y: y,
                        ox: x, oy: y, // oscilation centres
                        angle: Math.random() * 2 * Math.PI,
                        binned: false
                    });
    
     
    return this;
};


exports.itemType = pointType;
        
exports.prototype.draw = function(ui,colors){             
    var self = this,
        anyPointSelected = self._selected.is_type(pointType),
        selectedId = self._selected.id;
    
    ui.context.save();
    
    ui.context.lineWidth = 1;
    ui.context.lineCap = 'round';
    
    // crosses
    var drawCross = function(coor,color){
        var angle = coor.angle,
        
            cos   = radius * Math.cos(angle),
            sin   = radius * Math.sin(angle);
            
        ui.context.beginPath();
        
        ui.context.moveTo(Math.round(coor.x - cos), Math.round(coor.y - sin));
        ui.context.lineTo(Math.round(coor.x + cos), Math.round(coor.y + sin));
         
        ui.context.moveTo(Math.round(coor.x + sin), Math.round(coor.y - cos));
        ui.context.lineTo(Math.round(coor.x - sin), Math.round(coor.y + cos)); 
        
        ui.context.strokeStyle = color;
        
        ui.context.stroke();
            
    };
    
    var max = {
        x: ui.width,
        y: ui.height
    };   
    
    this.forEach(function(coor,i){
    
        if(coor.binned)
            return;
    
        // plot cross (special color if mouse over)
        if(anyPointSelected){
            if(selectedId === i){
                ui.context.lineWidth = 2;
                drawCross(coor, colors.sec1[3]);
                ui.context.lineWidth = 1;
            }else{
                drawCross(coor, colors.sec1[1]);
                
                ['x','y'].forEach(function(q){
                    var opac = self._snap( coor[q] - self.coor(selectedId)[q] );
                    
                    opac *= opac*0.8;
                    
                    if(opac > 1e-3){
                        ui.context.save();
                        ui.context.beginPath();
                        
                        var c = { x: 0, y: 0};
                        c[q] = coor[q]; 
                        ui.context.moveTo(c.x,c.y);
                        
                        c = { x: ui.width, y: ui.height};
                        c[q] = coor[q]; ;
                        ui.context.lineTo(c.x,c.y);
                        
                        ui.context.strokeStyle = tinycolor(colors.sec1[2]).setAlpha(opac);
                        ui.context.setLineDash([5,5,2,10,2,5]);
                        
                        ui.context.stroke();
                        ui.context.restore();
                    }
                });                
            }
            
        }else{
            drawCross(coor, colors.sec1[1]);
        }
        
    });
        
     
    // circles
    ui.context.beginPath(); 
    self.forEach(function(coor){
        if(!coor.binned)
        {
            ui.context.moveTo(coor.x + radius,coor.y);
            ui.context.arc(coor.x, coor.y, radius, 0, 2*Math.PI);
        }
    });
    ui.context.strokeStyle = colors.sec1[1];
    ui.context.stroke();
    ui.context.fillStyle = tinycolor(colors.sec1[1]).setAlpha(0.1);
    ui.context.fill();
    
    // draw darker circle for selected triangle over light circle
    if(anyPointSelected && !self.coor(selectedId).binned){
        ui.context.beginPath(); 
        ui.context.arc(self.coor(selectedId).x, self.coor(selectedId).y, radius, 0, 2*Math.PI);
        ui.context.strokeStyle = colors.sec1[3];
        ui.context.lineWidth = 2;
        ui.context.stroke();
        ui.context.lineWidth = 1;
    }
    
    ui.context.restore();
};

// called as if part of prototype
var transform = function(func, thispoint, ignore){
    
    // x'      = x( 1 - exp( -u(x) ) )
    // transform by (x0,x0) to move snap position to inline with the other point
    // x' - x0 = ( x - x0 )( 1 - exp( -u( x - x0 ) ) )
    // x' - x0 = ( x - x0 ) + ( x0 - x ) * -exp( - u( x - x0 ) )
    // x'      = x - ( x - x0 ) * exp( - u( x - x0 ) )
    // x'      = x - f(x - x0), where f(x) = x * exp( - u(x) )
    
    // therefore for each coordinate add this value to x, value is usualy very small so has no effect
    
    var f = function(x){
        return Math.exp( - func(x) ); 
    };
    
    var newpoint = { x: thispoint.x, y: thispoint.y };
    
    var snapTheshold = 30;
    
    for(var i = 0; i < this.length; ++i){
        if(ignore !== i || ignore === undefined){
            var xsnap = func(newpoint.x - this.coor(i).x),
                ysnap = func(newpoint.y - this.coor(i).y);
            
            newpoint.x = this.coor(i).x*xsnap + newpoint.x*( 1 - xsnap );
            
            newpoint.y = this.coor(i).y*ysnap + newpoint.y*( 1 - ysnap );
        }
    }
    
    return newpoint;
}
 
exports.prototype.clickbox = function(x,y){

    
    var mindist, nearestpoint;
    
    this.forEach(function(coor,i){
    
        var distfrompoint = Item.hypot(x - coor.x, y - coor.y);
        
        if(mindist == undefined || distfrompoint < mindist){
            mindist = distfrompoint;
            nearestpoint = i;
        };
    });
    
    return (mindist !== undefined && mindist < radius*2) ? 
            { d: mindist, type: pointType, id: nearestpoint } : false;
};

    
// cb called if this is changed
exports.prototype.animate = function(mouse, data, cb){
    var call = function(){};
    var self = this;
    
    (function(){
        if(this._selected.is_type(pointType)){
            var i = this._selected.id;
            if(this._selected.mousedown()){
                
                if( i !== 0 && // can not bin first point
                    this._bin)
                {   
                    // if point moved to the bin, tell circles not to generate a circle for it                    
                    this.coor(i).binned = !!this._bin.clickbox(this.coor(i).x,this.coor(i).y);  
                }
                
                // transform mouse coordinates to provide snapping to other points
                // and set the new oscilation centre of the point, 
                
                var oc = transform.call(this, this._snap, mouse, i);
                this.coor(i).ox = oc.x;
                this.coor(i).oy = oc.y;
            }
            
            call = cb;
        }
    }).call(this);
    
    if(this._rotation.rotate(data.time, data.deltatime))
    {
        cb();
    }
        
    for(var i = 0, len = this.length; i < len; ++i){
        var coor = this.coor(i),
            x    = this._adjust.get('x' + i)(coor.x, coor.ox, data.deltatime),
            y    = this._adjust.get('y' + i)(coor.y, coor.oy, data.deltatime);
        
        if((coor.x-x)*(coor.x-x) + (coor.y-y)*(coor.y-y) > 1e-4){
            // smoother
            this.coor(i,x,y);
            
            call = cb;
        }
    };
    
    call();
};