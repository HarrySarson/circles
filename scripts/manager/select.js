var Events  = require('events'),
    inherit = require('class');

    
// events emitted by object are set, unset, mouseup, mousedown
    
    
var Select = inherit.parent(Events).child(function(){ 
    Select.superclass.call(this);
    this._type = undefined;
    this.id = 0;
    
    var md = false;
    
    Object.defineProperty(this, '_mousedown', {
        'enumerable': true,
        'get': function(){
            return md;
        },
        'set': function(m){
            if( !m === md ){
                md = !!m;
                var evnt = md ? 'mousedown' : 'mouseup';
                this.emit(evnt);
            }
        }
    });
});

module.exports = Select;

Select.prototype.unselect = function(override){
    if( override || !this._mousedown ){
        this.override_type(undefined, 0);    
    }
    return this;
};
Select.prototype.is_type = function(t, i){
    return t === this._type && (i === undefined || i === this.id)
};
Select.prototype.is_unselected = function(){
    return this.is_type(undefined);
};
Select.prototype.is_selected = function(){
    return !this.is_unselected();
};

Select.prototype.type = function(t,i){
    // if this._mousedown == true lock type
    if( t !== undefined && !this._mousedown )
        this.override_type(t,i);
        
    return this._type;
};        

Select.prototype.override_type = function(t,i){
    i = i || 0;
    // if this._mousedown == true lock type
    if( t !== this._type || i !== this.id ){
        if(this._type !== undefined)
            this.emit('unset', this._type, this.id);
        
        this._type = t;
        this.id = i;
        
        if(this._type !== undefined)
            this.emit('set', this._type, this.id);
    }
    return this._type;                    
};

Select.prototype.mousedown = function(md){
    if( md === undefined ){
        return this._mousedown;
    }else{
        return this._mousedown = md;
    }
};

Select.prototype.type_set = function(t, cb){
    if(!cb){
        if(t && t.call){
            cb = t;
            t = undefined;
        }else{
            return this;
        }
    }
    this.on('set', function(type, id){
        if( t === undefined || 
            type === t)
        {
            cb(id);
        }
    });
    return this;
};
Select.prototype.type_unset = function(t, cb){
    if(!cb){
        if(t && t.call){
            cb = t;
            t = undefined;
        }else{
            return;
        }
    }
    this.on('unset', function(type, id){
        if( t === undefined || 
            type === t)
        {
            cb(id);
        }
    });
    return this;
};