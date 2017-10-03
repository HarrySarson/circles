import Events from 'events';
import inherit from 'class';


// events emitted by object are set, unset, mouseup, mousedown


class Select extends Events {
  constructor() {
    Select.superclass.call(this);
    this._type = undefined;
    this.id = 0;

    let md = false;

    Object.defineProperty(this, '_mousedown', {
      'enumerable': true,
      'get': function() {
        return md;
      },
      'set': function(m) {
        if (!m === md) {
          md = !!m;
          const evnt = md ? 'mousedown' : 'mouseup';
          this.emit(evnt);
        }
      }
    });
  }

  unselect(override) {
    if (override || !this._mousedown) {
      this.override_type(undefined, 0);
    }
    return this;
  }

  is_type(t, i) {
    return t === this._type && (i === undefined || i === this.id)
  }

  is_unselected() {
    return this.is_type(undefined);
  }

  is_selected() {
    return !this.is_unselected();
  }

  type(t, i) {
    // if this._mousedown == true lock type
    if (t !== undefined && !this._mousedown)
      this.override_type(t, i);

    return this._type;
  }

  override_type(t, i) {
    i = i || 0;
    // if this._mousedown == true lock type
    if (t !== this._type || i !== this.id) {
      if (this._type !== undefined)
        this.emit('unset', this._type, this.id);

      this._type = t;
      this.id = i;

      if (this._type !== undefined)
        this.emit('set', this._type, this.id);
    }
    return this._type;
  }

  mousedown(md) {
    if (md === undefined) {
      return this._mousedown;
    } else {
      return this._mousedown = md;
    }
  }

  type_set(t, cb) {
    if (!cb) {
      if (t && t.call) {
        cb = t;
        t = undefined;
      } else {
        return this;
      }
    }
    this.on('set', function(type, id) {
      if (t === undefined ||
        type === t) {
        cb(id);
      }
    });
    return this;
  }

  type_unset(t, cb) {
    if (!cb) {
      if (t && t.call) {
        cb = t;
        t = undefined;
      } else {
        return;
      }
    }
    this.on('unset', function(type, id) {
      if (t === undefined ||
        type === t) {
        cb(id);
      }
    });
    return this;
  }
}

export default Select;
