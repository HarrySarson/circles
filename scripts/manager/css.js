var _ = require('lodash');

module.exports = exports = function(el, prop, value){   
    
    Object.defineProperties(this, {
        _ids: {
            writable: true,
            value: {}
        },
        el: {
            enumerable: true,
            value: el
        },
        prop: {
            enumerable: true,
            value: prop
        },
        value: {
            enumerable: true,
            value: value
        }
    })
};


exports.prototype.on = function(id){
    if(_.isEmpty(this._ids)){
        $(this.el).css(this.prop, this.value);
    }
    this._ids[id] = true;
    return this;
};
exports.prototype.off = function(id){
    if(id === undefined){
        $(this.el).css(this.prop, ''); // no argument then remove css regardless
    }
          
    if(this._ids.hasOwnProperty(id)){
        delete this._ids[id];
        if(_.isEmpty(this._ids)){
            $(this.el).css(this.prop, '');
        }
    }
    return this;
};