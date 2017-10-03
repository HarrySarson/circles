  var Canvas = function(el) {
      el = $(el);
      this._canvas = el.find('canvas').get(); // convert to Array of DOM elements
      this._context = this._canvas.map(function(c) {
          return c.getContext('2d');
      });
      this._parent = el;

      /* this.width, this.height are defined by reizeCanvas */
      this.resizeCanvas();
  };

  Object.defineProperty(Canvas.prototype, 'parent', {
      enumerable: true,
      configurable: true,
      get: function() {
          return this._parent;
      }
  })

  Canvas.prototype.resizeCanvas = function() {
      this._width = this._parent.width();
      this._height = this._parent.height();
      var self = this;
      this._canvas.forEach(function(canvas) {
          canvas.width = self._width;
          canvas.height = self._height;
      });
  };
  Canvas.prototype.clear = function() {
      this.canvas.forEach(function(canvas) {
          canvas.width = this.width;
          canvas.height = this.height;
      });
  };

  Canvas.prototype.addlayers = function(Canvas) {
      this._canvas = this._canvas.concat(Canvas._canvas);
      this._context = this._context.concat(Canvas._context);
  };
  Canvas.prototype.getlayer = function(i) {
      var self = this;
      return {
          get width() {
              return self._width;
          },
          get height() {
              return self._height;
          },
          get canvas() {
              return $(self._canvas[i]);
          },
          get context() {
              return self._context[i];
          },
          get parent() {
              return self._parent;
          },
          get i() {
              return i;
          }
      };
  };
  Canvas.prototype.totallayers = function() {
      return this._canvas.length;
  };

  module.exports = Canvas;