import _ from 'lodash';
import $ from 'jquery';

export default class Css {
  constructor(el, prop, value) {

    this._ids = true;

    Object.defineProperties(this, {
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
    });
  }

  on(id) {
    if (_.isEmpty(this._ids)) {
      $(this.el).css(this.prop, this.value);
    }
    this._ids[id] = true;
    return this;
  }

  off(id) {
    if (id === undefined) {
      $(this.el).css(this.prop, ''); // no argument then remove css regardless
    }

    if (this._ids.hasOwnProperty(id)) {
      delete this._ids[id];
      if (_.isEmpty(this._ids)) {
        $(this.el).css(this.prop, '');
      }
    }
    return this;
  }
}
