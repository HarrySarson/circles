var Item = require('./item_base.js'),
    inherit = require('class'),
    drawBin = require('../canvas-shapes/bin.js');


module.exports = exports = inherit.parent(Item).child(function(selected, centerpos, width, height, origin) {
    exports.superclass.call(this, selected);

    this.input_centerpos = centerpos;
    this.origin = origin || {
        x: 0,
        y: 0
    }

    this.centerpos = {};
    this.width = width;
    this.height = height;
    this.angle = 0;
});



exports.prototype.clickbox = function(x, y) {

    // clickbox only if centrepos is defined (to prevent errors)
    // and also only if the bin is visible (see draw)
    if (!this.centerpos.x || !this._selected.is_type('point') || !this._selected.mousedown())
        return false;

    var dist = Item.hypot(this.centerpos.x - x, this.centerpos.y - y);

    return (Math.abs(this.centerpos.x - x) < this.width && Math.abs(this.centerpos.y - y) < this.height) ? {
            d: dist,
            type: 'bin',
            id: 0
        } :
        false;
};

exports.prototype.draw = function(ui, colors) {

    this.centerpos.x = this.origin.x * ui.width + this.input_centerpos.x;
    this.centerpos.y = this.origin.y * ui.height + this.input_centerpos.y;

    if (this._selected.is_type('point') && this._selected.id !== 0 && this._selected.mousedown()) {
        ui.context.save();

        ui.context.strokeStyle = colors.pri[1];
        ui.context.lineWidth = 2;

        drawBin(ui.context, this.centerpos.x - this.width / 2, this.centerpos.y - this.height / 2, this.width, this.height, 9, this.angle);

        ui.context.restore();
    }
};

// cb called if this is changed
exports.prototype.animate = function(mouse, data, cb) {

    if (!this.centerpos.x)
        return;

    // arrow 
    if (this._selected.is_type('point') && this._selected.mousedown()) {
        this.angle += data.deltatime / 2000; // 5e-4 rad/s
    }

};