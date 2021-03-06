import tinycolor from 'tinycolor2';
import smoother, {underdamped} from '../smoother.js';
import Item from './item_base.js';
import CSS_Manager from '../manager/css.js';
import $ from 'jquery';


const arrowlength = 0.15
,     pointlength = 0.1
,     pointangle = Math.PI / 7.5
,     arrowType = 'arrow'
;


class Arrow extends Item {
  constructor(coor, theta, selected) {
    Arrow.superclass.call(this, selected);

    this.theta = theta;
    this._adjust = underdamped(4.5e-3, 2e-2);

    const mouse = {
      x: Math.cos(this.theta),
      y: Math.sin(this.theta)
    };

    this._$notice =
      this._arrowLength =
      this._hide_degrees = false;

    const self = this;

    Object.defineProperties(this, {
      'mouse_rel': {
        enumerable: true,
        get: function() {
          return mouse;
        }
      }
    });
    Object.defineProperties(this, {
      'end': {
        enumerable: true,
        get: function() {
          return coor;
        }
      }
    });
  }

  clickbox(x, y) {
    if (!this._arrowLength)
      return;

    const arrowside = this._arrowLength * pointlength / Math.cos(pointangle);
    const arrowwidth = arrowside * Math.sin(pointangle) + 6; // add extra from line width

    const tipdelta = {
      x: this._arrowLength * Math.cos(this.theta),
      y: this._arrowLength * Math.sin(this.theta)
    };
    const mousedelta = {
      x: x - this.end.x,
      y: y - this.end.y
    };

    const distfrompoint = Item.hypot(mousedelta.x - tipdelta.x, mousedelta.y - tipdelta.y);

    //http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
    // d = |m.n|/|n| where m is pos vector of mouse and n is a vector normal to the line
    //                      i.e. n = (tip.x,-tip.y), |n| = sqrt(tip.x^2 + tip.y^2) = length of line  

    const distfromline = Math.abs(tipdelta.x * mousedelta.y + mousedelta.x * (-tipdelta.y)) /
      this._arrowLength;

    const tip_dot_mouse = mousedelta.x * tipdelta.x + mousedelta.y * tipdelta.y;

    const frac = tip_dot_mouse / this._arrowLength / this._arrowLength;

    return (distfrompoint <= arrowside || (distfromline <= arrowwidth && frac > 0 && frac < 1)) ? {
        d: distfrompoint,
        type: arrowType,
        id: 0
      } :
      false;
  }

  draw(ui, colors) {
    const self = this;
    if (!this._$notice) {
      this._$notice = $('<div class="notice angle"></div>').appendTo(ui.parent);
      this._selected.type_set(arrowType, function() {
        self._hide_degrees.off();
      }).type_unset(arrowType, function() {
        self._hide_degrees.on();
      });
      this._hide_degrees = new CSS_Manager(this._$notice, 'display', 'none').on();
    }


    this._arrowLength = arrowlength * Item.hypot(ui.width, ui.height);
    const arrowside = this._arrowLength * pointlength / Math.cos(pointangle);

    ui.context.lineWidth = 3;
    ui.context.lineCap = 'round';
    ui.context.lineJoin = 'round';
    ui.context.strokeStyle = colors.sec1[this._selected.is_type(arrowType) ? (this._selected.mousedown() ? 0 : 2) : 3];

    if (this._selected.is_type(arrowType)) {
      const fidled_theta = Math.abs(this.theta) < 0.05 * Math.PI / 180 ? '0' : (-this.theta / Math.PI * 180).toFixed(1);
      this._$notice.text(fidled_theta);
      this._$notice.css(
        'transform', 'translate(' + (this.end.x + this._arrowLength * pointlength * 1.2 * Math.cos(this.theta / 2)) + 'px, ' +
        (this.end.y + this._arrowLength * pointlength * 1.2 * Math.sin(this.theta / 2) - this._$notice.height() / 2) + 'px)'
      );


      ui.context.lineWidth = 3;
      ui.context.lineCap = 'round';
      ui.context.lineJoin = 'round';
      ui.context.strokeStyle = colors.sec1[this._selected.is_type(arrowType) ? (this._selected.mousedown() ? 0 : 2) : 3];

      if (this._selected.is_type(arrowType)) {
        const a = 20 /*this._arrowLength*pointlength*/, b = a / (3 + 0.25);
        // plot angle
        ui.context.save();

        ui.context.beginPath()
        ui.context.arc(this.end.x, this.end.y, a, this.theta, 0, this.theta > 0);
        ui.context.stroke();

        ui.context.lineTo(this.end.x, this.end.y);

        ui.context.closePath();
        ui.context.fillStyle = tinycolor(colors.pri[4]).setAlpha(1);
        ui.context.fill();

        ui.context.beginPath();
        ui.context.moveTo(this.end.x, this.end.y);
        ui.context.lineTo(this.end.x + a * 1.5, this.end.y);
        ui.context.setLineDash([4, b - 4]);
        ui.context.lineCap = 'butt';
        ui.context.stroke();

        ui.context.restore();
      }
    }


    ui.context.save();


    ui.context.beginPath();
    ui.context.moveTo(this.end.x, this.end.y);
    ui.context.lineTo(Math.round(this.end.x + this._arrowLength * Math.cos(this.theta)),
      Math.round(this.end.y + this._arrowLength * Math.sin(this.theta)));
    ui.context.lineTo(Math.round(this.end.x + this._arrowLength * Math.cos(this.theta) - arrowside * Math.cos(pointangle - this.theta)),
      Math.round(this.end.y + this._arrowLength * Math.sin(this.theta) + arrowside * Math.sin(pointangle - this.theta)));

    ui.context.lineTo(Math.round(this.end.x + this._arrowLength * Math.cos(this.theta) - arrowside * Math.cos(pointangle + this.theta)),
      Math.round(this.end.y + this._arrowLength * Math.sin(this.theta) - arrowside * Math.sin(pointangle + this.theta)));


    ui.context.lineTo(Math.round(this.end.x + this._arrowLength * Math.cos(this.theta)),
      Math.round(this.end.y + this._arrowLength * Math.sin(this.theta)));

    ui.context.stroke();

    ui.context.restore();
  }

  // cb called if this is changed
  animate(mouse, data, cb) {

    // arrow 
    if (this._selected.is_type('arrow') && this._selected.mousedown()) {
      this.mouse_rel.x = mouse.x - this.end.x;
      this.mouse_rel.y = mouse.y - this.end.y;
    }

    const newtheta = Math.atan2(this.mouse_rel.y, this.mouse_rel.x);

    // handle switch from negative to postive theta,
    // shm engine gets confused
    if (this.theta - newtheta > Math.PI)
      this.theta -= 2 * Math.PI;
    else if (this.theta - newtheta < -Math.PI)
      this.theta += 2 * Math.PI;
    const newadjusted = this._adjust(this.theta, newtheta, data.deltatime);

    if (Math.abs(newadjusted - this.theta) > 3.3e-4) {
      // smoother
      this.theta = newadjusted;

      cb();
    }
  }
}
