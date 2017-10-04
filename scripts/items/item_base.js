
export default class ItemBase {

  constructor (selected) {
    this._selected = selected;
  }

  get name()  { "item_base" };

}

const sqr = function(x) {
  return x * x;
};

ItemBase.hypot = Math.hypot || function(dx, dy) {
  return Math.sqrt(sqr(dx) + sqr(dy));
};
