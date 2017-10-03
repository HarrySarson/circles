module.exports = exports = function(selected) {
    this._selected = selected;
}

exports.prototype.name = "item_base";


var sqr = function(x) {
    return x * x;
};

exports.hypot = Math.hypot || function(dx, dy) {
    return Math.sqrt(sqr(dx) + sqr(dy));
};