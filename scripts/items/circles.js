'use strict';

import tinycolor from 'tinycolor2';
import Item from './item_base.js';
import Points from './points.js';
import angles from '../angles.js';
import _ from 'lodash';

const complete = false;

class Circles extends Item {
  constructor(points, arrow, selected, options) {
    super(selected);

    this.centres = new Points(selected);
    this.arrow = arrow;
    this.points = points;

    this.options = {};


    if (!arrow || !selected) {
      throw new Error("insuficient number of arguments given to function Circles()")
    }

    this.clockwise = [];

    this.recalc();
  }

  recalc() {
    let theta = this.arrow.theta, lastcoor = this.points.coor(0);

    this.centres.reset();

    for (let i = 1, l = this.points.length; i < l + complete; ++i) {
      const newcoor = this.points.coor(i % l);


      if (!newcoor.binned) {
        theta = get_circle(
          lastcoor,
          newcoor,
          theta,
          this.centres
        );
        lastcoor = newcoor;
      }
    };
  }

  draw(ui, colors) {
    ui.context.save();
    ui.context.lineWidth = 3;
    ui.context.lineCap = 'round';


    const self = this;
    let lastcoor = this.points.coor(0);

    for (let i = 1, l = this.points.length, centreCount = 0; i < l + complete;
      ++i) {
      const newcoor = self.points.coor(i % self.points.length);
      if (!newcoor.binned) {
        const x0 = lastcoor.x,
              y0 = lastcoor.y,
              x1 = newcoor.x,
              y1 = newcoor.y,
              xc = this.centres.coor(centreCount).x,
              yc = this.centres.coor(centreCount).y,
              start = Math.atan2(y0 - yc,
                x0 - xc),
              end = Math.atan2(y1 - yc,
                x1 - xc),
              radius = Item.hypot(yc - y0,
                xc - x0),
              cord = Item.hypot(x0 - x1,
                y0 - y1),
              limit = 1e4 / 0,
              grad = (y1 - y0) /
              (x1 - x0);

        lastcoor = newcoor;


        ui.context.strokeStyle = colors(centreCount);


        ui.context.beginPath();

        // check radius is not too big
        if (radius < limit) {
          ui.context.arc(xc, yc, radius, start, end, self.centres.coor(centreCount).clockwise);
        } else {
          // use straight line
          if (angles.clockwisebetween(end, start, start + Math.PI) ^ self.centres.coor(centreCount).clockwise) {
            // short line
            ui.context.moveTo(x0, y0);
            ui.context.lineTo(x1, y1);
          } else {
            // long line

            ui.context.moveTo(x0 - y0 / grad, 0);
            ui.context.lineTo(x0, y0);

            ui.context.moveTo(x1, y1);
            ui.context.lineTo(x1 + (ui.height - y1) / grad, ui.height);
          }
          ui.context.fillRect(xc, yc, 10, 10);
        }
        ui.context.stroke();

        ++centreCount;
      }
    }



    ui.context.restore();
  }
}

const get_circle = function(coor0, coor1, theta, centres) {
  const dx = coor1.x - coor0.x,
        dy = coor1.y - coor0.y,
        cos = Math.cos(theta),
        sin = Math.sin(theta),
        r = (dx * dx + dy * dy) /
        (2 * (dy * cos - dx * sin)),
        xc = coor0.x - r * sin,
        yc = r * cos + coor0.y;

  const normal = Math.atan2(dy, dx);

  // determine wether the circle should be plotted clockwise or anticlockwise.
  // for the first circle if the angle of the line from the first point to the centre 
  // (normal line) is between the tangent to the circle (i.e. angle of the arrow) and the line 
  // opposite (continuation of the arrow in opposite direction ) going clockwise then the circle
  // will be plotted clockwise

  // for example if the angle of the tangent was -80deg then the first circle would be 
  // plotted clockwise if the angle of the normal line is greater
  // than -80deg and less than 100deg

  // for subsequent Circles if the previous circle was plotted clockwise then the angle of the normal 
  // line is must be between the tangent and the continuation anticlockwise and if the previous circle
  // was plotted anticlockwise then the angle of the normal line must be between anticlockwise

  const previousClockwise = centres.back() ? centres.back().clockwise : false;

  centres.add(xc, yc);
  centres.back().clockwise = !!(previousClockwise ^ angles.clockwisebetween(theta, normal, normal - Math.PI));

  // return the angle of the tanget to the next circle at the point (x1,y1)    
  return Math.atan2(coor1.y - yc, coor1.x - xc) + Math.PI / 2;
};

